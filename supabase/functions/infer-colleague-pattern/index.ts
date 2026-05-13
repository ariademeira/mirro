import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // service role for HITL write
)

const PROMPT_VERSION = Deno.env.get('SONNET_PROMPT_VERSION') || 'v1_empowering'
const HITL_THRESHOLD = parseFloat(Deno.env.get('HITL_THRESHOLD') || '0.7')
const MIN_INTERACTIONS = 3

Deno.serve(async (req) => {
  try {
    const { colleague_id } = await req.json()
    if (!colleague_id) return json({ error: 'colleague_id required' }, 400)

    // Fetch recent interactions for this colleague
    const { data: interactions, error: fetchErr } = await supabase
      .from('interactions')
      .select('id, interaction_type, raw_content, parsed_signals, mood_signal, created_at')
      .eq('colleague_id', colleague_id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (fetchErr) return json({ error: fetchErr.message }, 500)
    if (!interactions || interactions.length < MIN_INTERACTIONS) {
      return json({ skipped: true, reason: 'insufficient_interactions', count: interactions?.length || 0 })
    }

    // Get colleague and user info
    const { data: colleague } = await supabase
      .from('colleagues')
      .select('user_id, name')
      .eq('id', colleague_id)
      .single()

    if (!colleague) return json({ error: 'colleague not found' }, 404)

    // PII-mask content before sending to Sonnet
    const maskedHistory = interactions.map(i => ({
      date: i.created_at,
      type: i.interaction_type,
      content: maskPII(i.raw_content),
      mood: i.mood_signal || null,
    }))

    // Load system prompt (cached via Anthropic prompt caching)
    const systemPrompt = await loadSystemPrompt(PROMPT_VERSION)

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      temperature: 0.5,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Analyze these interactions with a colleague. Identify patterns in communication style, engagement, and areas of friction or strength.\n\n${JSON.stringify(maskedHistory, null, 2)}`,
      }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''

    let parsed
    try {
      // Extract JSON from response (Sonnet may wrap it)
      const match = raw.match(/\{[\s\S]*\}/)
      parsed = match ? JSON.parse(match[0]) : null
    } catch {
      return json({ error: 'Failed to parse Sonnet response', raw }, 500)
    }

    if (!parsed || !parsed.pattern) {
      return json({ skipped: true, reason: 'no_pattern_identified' })
    }

    const confidenceScore = typeof parsed.confidence === 'number' ? parsed.confidence : 0.5
    const requiresHitl = confidenceScore < HITL_THRESHOLD

    // Store insight
    const { data: insight, error: insertErr } = await supabase
      .from('insights')
      .insert({
        user_id:          colleague.user_id,
        colleague_id:     colleague_id,
        insight_type:     parsed.insight_type || 'pattern',
        content:          {
          pattern:        parsed.pattern,
          evidence:       parsed.evidence,
          interpretation: parsed.interpretation,
          suggestion:     parsed.suggestion,
        },
        confidence_score: confidenceScore,
        requires_hitl:    requiresHitl,
        hitl_reviewed:    false,
      })
      .select()
      .single()

    if (insertErr) return json({ error: insertErr.message }, 500)

    return json({ insight_id: insight.id, requires_hitl: requiresHitl, confidence: confidenceScore })
  } catch (err) {
    return json({ error: String(err) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Prompt caching: fetch prompt text; Anthropic caches the system prompt tokens
async function loadSystemPrompt(version: string): Promise<string> {
  // In production: fetch from storage or embed at deploy time
  // For now: inline the empowering prompt as default
  const prompts: Record<string, string> = {
    'v1_empowering': `You are a relational intelligence analyst. Your role:
- Identify patterns in how someone approaches professional relationships
- Highlight communication and interpersonal strengths and friction points
- Surface growth opportunities backed by specific evidence

Constraints (non-negotiable):
- Observations are about the USER's patterns, not a diagnosis of colleagues
- Never use clinical terminology (depressed, anxious, trauma, disorder, etc.)
- Never infer criminal intent or assess risk of harm
- Flag uncertainty with <uncertain> tag if confidence below 70%
- Focus on changeable behaviors, not fixed traits

Format your response as valid JSON:
{"pattern":"...","evidence":"...","interpretation":"...","suggestion":"...","confidence":0.0,"insight_type":"pattern|strength|friction|opportunity"}`,
  }
  return prompts[version] || prompts['v1_empowering']
}

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g
const PHONE_RE = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/g
const NAME_RE  = /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2})\b/g

function maskPII(text: string): string {
  if (!text) return ''
  let counter = 1
  const nameMap: Record<string, string> = {}
  return text
    .replace(EMAIL_RE, '[EMAIL]')
    .replace(PHONE_RE, '[PHONE]')
    .replace(NAME_RE, (match) => {
      if (!(match in nameMap)) nameMap[match] = `[PERSON_${counter++}]`
      return nameMap[match]
    })
}
