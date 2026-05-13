import { supabase } from '../supabase'
import { checkFreeTierLimit } from '../freemium'

export async function getColleagues() {
  const { data, error } = await supabase
    .from('colleagues')
    .select('*')
    .order('last_interaction', { ascending: false, nullsFirst: false })
  if (error) throw error
  return data
}

export async function getColleague(id) {
  const { data, error } = await supabase
    .from('colleagues')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createColleague({ name, role, department }) {
  const { data: { user } } = await supabase.auth.getUser()

  const gate = await checkFreeTierLimit(user.id, 'maxColleagues')
  if (!gate.allowed) return { error: gate }

  const { data, error } = await supabase
    .from('colleagues')
    .insert({ name, role: role || null, department: department || null })
    .select()
    .single()
  if (error) throw error
  return { data }
}

export async function updateColleague(id, updates) {
  const { data, error } = await supabase
    .from('colleagues')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteColleague(id) {
  const { error } = await supabase.from('colleagues').delete().eq('id', id)
  if (error) throw error
}
