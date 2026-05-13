import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getInteractions, logInteraction } from '../lib/api/interactions'
import PasteInput from '../components/PasteInput'

const MOOD_OPTIONS = [
  { value: 'energized', label: 'Energized', emoji: '⚡' },
  { value: 'neutral',   label: 'Neutral',   emoji: '〰️' },
  { value: 'drained',   label: 'Drained',   emoji: '🪫' },
]

const OUTCOME_TAGS = [
  { value: 'win',        label: 'Win',        description: 'Something went well' },
  { value: 'learning',   label: 'Learning',   description: 'A useful insight' },
  { value: 'unresolved', label: 'Unresolved', description: 'Still needs attention' },
  { value: 'growth',     label: 'Growth',     description: 'A stretch moment' },
]

export default function EveningReflection({ onComplete }) {
  const navigate = useNavigate()
  const [todayInteractions, setTodayInteractions] = useState([])
  const [outcomes, setOutcomes] = useState('')
  const [mood, setMood] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getInteractions({ days: 1 }).then(all => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      setTodayInteractions(all.filter(i => new Date(i.created_at) >= today))
    }).catch(console.error)
  }, [])

  function toggleTag(value) {
    setSelectedTags(prev =>
      prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
    )
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const tagSuffix = selectedTags.length > 0
        ? `\n\nOutcomes: ${selectedTags.join(', ')}`
        : ''
      await logInteraction({
        interactionType: 'evening_reflection',
        rawContent: (outcomes || 'Evening reflection.') + tagSuffix,
        source: 'paste',
        moodSignal: mood,
      })
      if (onComplete) onComplete()
      else navigate('/dashboard')
    } catch (err) {
      console.error('Evening reflection error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card space-y-6">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Evening reflection</p>
          <h1>How did today go?</h1>
        </div>

        {todayInteractions.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Interactions you logged today:</p>
            <ul className="space-y-1">
              {todayInteractions.map(i => (
                <li key={i.id} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  {i.colleagues?.name || 'General'} —{' '}
                  <span className="text-gray-400 capitalize">{i.interaction_type.replace('_', ' ')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Outcome tags */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">How would you tag today? <span className="text-gray-400 font-normal">(optional)</span></p>
          <div className="flex flex-wrap gap-2">
            {OUTCOME_TAGS.map(tag => (
              <button
                key={tag.value}
                type="button"
                title={tag.description}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedTags.includes(tag.value)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
                onClick={() => toggleTag(tag.value)}
                aria-pressed={selectedTags.includes(tag.value)}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <PasteInput
          value={outcomes}
          onChange={setOutcomes}
          placeholder="Any outcomes, wins, or things to remember from today…"
          rows={4}
          label="Outcomes from today"
          hint="Optional, but useful for pattern tracking."
          id="evening-outcomes"
        />

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">How are you feeling now?</p>
          <div className="flex gap-2">
            {MOOD_OPTIONS.map(m => (
              <button
                key={m.value}
                type="button"
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg border text-sm transition-colors ${
                  mood === m.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
                onClick={() => setMood(prev => prev === m.value ? null : m.value)}
                aria-pressed={mood === m.value}
              >
                <span className="text-lg" aria-hidden>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button className="btn-ghost flex-1" onClick={() => { if (onComplete) onComplete(); else navigate('/dashboard') }}>
            Skip
          </button>
          <button className="btn-primary flex-1" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : 'Save & close'}
          </button>
        </div>
      </div>
    </div>
  )
}
