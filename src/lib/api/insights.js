import { supabase } from '../supabase'
import { checkFreeTierLimit } from '../freemium'
import { hitlThreshold } from '../../config'

export async function getInsights({ colleagueId, type, days } = {}) {
  const { data: { user } } = await supabase.auth.getUser()

  const gate = await checkFreeTierLimit(user.id, 'maxInsightsPerDay')
  if (!gate.allowed) return { error: gate, data: null }

  let query = supabase
    .from('insights')
    .select('*, colleagues(name)')
    .order('created_at', { ascending: false })

  if (colleagueId) query = query.eq('colleague_id', colleagueId)
  if (type)        query = query.eq('insight_type', type)
  if (days) {
    const since = new Date()
    since.setDate(since.getDate() - days)
    query = query.gte('created_at', since.toISOString())
  }

  const { data, error } = await query
  if (error) throw error
  return { data }
}

export async function getInsight(id) {
  const { data, error } = await supabase
    .from('insights')
    .select('*, colleagues(name)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function dismissInsight(id) {
  const { error } = await supabase
    .from('insights')
    .update({ dismissed: true, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// ── HITL review (admin only; RLS enforces admin role) ─────────────────────────
export async function getHITLQueue() {
  const { data, error } = await supabase
    .from('insights')
    .select('*, colleagues(name), user_profiles(email)')
    .eq('requires_hitl', true)
    .eq('hitl_reviewed', false)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function resolveHITL(id, { approved, notes }) {
  const { data, error } = await supabase
    .from('insights')
    .update({
      hitl_reviewed: true,
      hitl_approved: approved,
      hitl_notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
