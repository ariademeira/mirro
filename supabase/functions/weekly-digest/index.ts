import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Triggered by cron job (pg_cron or Supabase scheduled functions)
Deno.serve(async (req) => {
  const { user_id } = await req.json().catch(() => ({}))

  try {
    const users = user_id
      ? [{ id: user_id }]
      : await getAllActiveUsers()

    const results = []
    for (const user of users) {
      try {
        const result = await generateDigest(user.id)
        results.push({ user_id: user.id, ...result })
      } catch (err) {
        results.push({ user_id: user.id, error: String(err) })
      }
    }

    return json({ processed: results.length, results })
  } catch (err) {
    return json({ error: String(err) }, 500)
  }
})

async function generateDigest(userId: string) {
  const since = new Date()
  since.setDate(since.getDate() - 7)

  // Get week's interactions
  const { data: interactions } = await supabase
    .from('interactions')
    .select('id, interaction_type, raw_content, mood_signal, created_at, colleagues(name)')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })

  if (!interactions || interactions.length < 3) {
    return { skipped: true, reason: 'insufficient_interactions' }
  }

  // Get existing high-confidence insights from the week
  const { data: insights } = await supabase
    .from('insights')
    .select('content, confidence_score, insight_type')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())
    .eq('requires_hitl', false)
    .gte('confidence_score', 0.6)
    .order('confidence_score', { ascending: false })
    .limit(5)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    temperature: 0.4,
    system: `You are writing a weekly reflection summary for a professional.
Summarize 2-3 key patterns from their week.
Focus on the USER's behaviors, not their colleagues.
Use empowering language. Keep each point brief and actionable.
Format as JSON: {"summary": "...", "patterns": [{"title": "...", "detail": "...", "action": "..."}]}`,
    messages: [{
      role: 'user',
      content: `Week summary: ${interactions.length} interactions logged.\n\nKey insights this week:\n${JSON.stringify(insights?.map(i => i.content), null, 2)}\n\nGenerate a weekly digest.`,
    }],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) return { skipped: true, reason: 'parse_failed' }

  const digest = JSON.parse(match[0])

  // Log digest delivery (for tracking open rates later)
  await supabase.from('interactions').insert({
    user_id: userId,
    interaction_type: 'morning_reflection', // reuse type; digest logged as system interaction
    source: 'paste',
    raw_content: `Weekly digest generated: ${digest.summary || ''}`,
    parsed_signals: { digest, generated_at: new Date().toISOString() },
  })

  return { digest, interaction_count: interactions.length }
}

async function getAllActiveUsers() {
  const { data } = await supabase
    .from('user_profiles')
    .select('id')
    .limit(1000)
  return data || []
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
