import { supabase } from '../supabase'
import { maskPII } from '../pii'
import { checkFreeTierLimit } from '../freemium'

export async function getInteractions({ colleagueId, days } = {}) {
  let query = supabase
    .from('interactions')
    .select('*, colleagues(name)')
    .order('created_at', { ascending: false })

  if (colleagueId) query = query.eq('colleague_id', colleagueId)
  if (days) {
    const since = new Date()
    since.setDate(since.getDate() - days)
    query = query.gte('created_at', since.toISOString())
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function logInteraction({ colleagueId, interactionType, rawContent, source = 'paste', moodSignal }) {
  const { data: { user } } = await supabase.auth.getUser()

  const gate = await checkFreeTierLimit(user.id, 'maxInteractionsPerDay')
  if (!gate.allowed) return { error: gate }

  // Parse basic signals client-side; Sonnet inference runs async via edge function
  const parsedSignals = parseSignals(rawContent, interactionType)

  const { data, error } = await supabase
    .from('interactions')
    .insert({
      colleague_id: colleagueId || null,
      interaction_type: interactionType,
      source,
      raw_content: rawContent,
      parsed_signals: parsedSignals,
      mood_signal: moodSignal || null,
    })
    .select()
    .single()

  if (error) throw error

  // Trigger async Sonnet inference if colleague has enough data
  if (colleagueId) {
    triggerInference(colleagueId).catch(console.error)
  }

  return { data }
}

export async function getInteraction(id) {
  const { data, error } = await supabase
    .from('interactions')
    .select('*, colleagues(name)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function deleteInteraction(id) {
  const { error } = await supabase.from('interactions').delete().eq('id', id)
  if (error) throw error
}

// Lightweight client-side signal extraction; full inference via Sonnet edge function
function parseSignals(content, type) {
  if (!content) return {}
  const wordCount = content.trim().split(/\s+/).length
  const maskedContent = maskPII(content)
  return {
    word_count: wordCount,
    masked_preview: maskedContent.slice(0, 200),
    interaction_type: type,
    parsed_at: new Date().toISOString(),
  }
}

async function triggerInference(colleagueId) {
  // Calls Supabase Edge Function for async Sonnet inference
  // Edge function checks interaction count (min 3) before running
  const { error } = await supabase.functions.invoke('infer-colleague-pattern', {
    body: { colleague_id: colleagueId },
  })
  if (error) console.error('Inference trigger failed:', error)
}
