import { supabase } from './supabase'
import { freeTierConfig } from '../config'

export async function checkFreeTierLimit(userId, limitType) {
  const { data: user, error } = await supabase
    .from('user_profiles')
    .select('tier')
    .eq('id', userId)
    .single()

  if (error || !user) return { allowed: true } // fail open during dev
  if (user.tier === 'premium') return { allowed: true }

  const limit = freeTierConfig[limitType]
  if (limit === undefined) return { allowed: true }

  const used = await getUsageToday(userId, limitType)

  if (used >= limit) {
    return {
      allowed: false,
      reason: `You've reached your daily limit for this feature.`,
      upgradeUrl: '/settings/upgrade',
    }
  }
  return { allowed: true }
}

async function getUsageToday(userId, limitType) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (limitType === 'maxInteractionsPerDay') {
    const { count } = await supabase
      .from('interactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())
    return count || 0
  }

  if (limitType === 'maxInsightsPerDay') {
    const { count } = await supabase
      .from('insights')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())
    return count || 0
  }

  if (limitType === 'maxColleagues') {
    const { count } = await supabase
      .from('colleagues')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    return count || 0
  }

  return 0
}
