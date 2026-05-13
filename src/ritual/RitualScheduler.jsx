import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ritualDefaults } from '../config'

export default function RitualScheduler() {
  const [settings, setSettings] = useState({
    morningPromptTime:     ritualDefaults.morningPromptTime,
    eveningReflectionTime: ritualDefaults.eveningReflectionTime,
    digestDay:             ritualDefaults.digestDay,
    digestTime:            ritualDefaults.digestTime,
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('user_profiles').select('settings').eq('id', user.id).single()
      if (data?.settings?.ritual) {
        setSettings(prev => ({ ...prev, ...data.settings.ritual }))
      }
    })
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('user_profiles')
        .update({ settings: { ritual: settings }, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Save ritual settings error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <h2>Ritual timing</h2>
      <p className="text-sm text-gray-500">Adjust when you prefer to do your daily check-ins.</p>

      <div className="card space-y-4">
        <Field label="Morning prompt" id="morning-time" type="time" value={settings.morningPromptTime}
          onChange={v => setSettings(s => ({ ...s, morningPromptTime: v }))} />
        <Field label="Evening reflection" id="evening-time" type="time" value={settings.eveningReflectionTime}
          onChange={v => setSettings(s => ({ ...s, eveningReflectionTime: v }))} />

        <div>
          <label htmlFor="digest-day" className="block text-sm font-medium text-gray-700 mb-1">Weekly digest day</label>
          <select id="digest-day" className="input" value={settings.digestDay}
            onChange={e => setSettings(s => ({ ...s, digestDay: e.target.value }))}>
            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <Field label="Digest time" id="digest-time" type="time" value={settings.digestTime}
          onChange={v => setSettings(s => ({ ...s, digestTime: v }))} />
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {saved ? 'Saved!' : loading ? 'Saving…' : 'Save timing'}
      </button>
    </form>
  )
}

function Field({ label, id, type, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input id={id} type={type} className="input w-auto" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}
