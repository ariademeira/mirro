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

export async function createColleague({ name, role, department, title, email, phone, company, notes, photo_url }) {
  const { data: { user } } = await supabase.auth.getUser()

  const gate = await checkFreeTierLimit(user.id, 'maxColleagues')
  if (!gate.allowed) return { error: gate }

  const { data, error } = await supabase
    .from('colleagues')
    .insert({
      name,
      role: role || null,
      department: department || null,
      title: title || null,
      email: email || null,
      phone: phone || null,
      company: company || null,
      notes: notes || null,
      photo_url: photo_url || null,
    })
    .select()
    .single()
  if (error) throw error
  return { data }
}

export async function uploadColleaguePhoto(colleagueId, file) {
  const ext = file.name.split('.').pop()
  const path = `colleague-photos/${colleagueId}-${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
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
