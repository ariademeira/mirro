import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Check, Sun, ArrowRight } from 'lucide-react'
import { getInteractions, logInteraction } from '../lib/api/interactions'
import { Button, Badge } from '../components/ui'

const MOOD_OPTIONS = [
  { value: 'open',    label: 'Energized', icon: '⚡', color: '#10B981' },
  { value: 'steady',  label: 'Neutral',   icon: '〰️',  color: '#94A3B8' },
  { value: 'tense',   label: 'Drained',   icon: '🪫', color: '#F59E0B' },
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
  const [notes, setNotes] = useState('')
  const [mood, setMood] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getInteractions({ days: 1 }).then(all => {
      const today = new Date(); today.setHours(0, 0, 0, 0)
      setTodayInteractions(
        all.filter(i =>
          new Date(i.created_at) >= today &&
          !['morning_reflection', 'evening_reflection'].includes(i.interaction_type)
        )
      )
    }).catch(console.error)
  }, [])

  function toggleTag(value) {
    setSelectedTags(prev => prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value])
  }

  function skip() {
    if (onComplete) onComplete()
    else navigate('/dashboard')
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const tagSuffix = selectedTags.length > 0 ? `\n\nOutcomes: ${selectedTags.join(', ')}` : ''
      await logInteraction({
        interactionType: 'evening_reflection',
        rawContent: (notes || 'Evening reflection.') + tagSuffix,
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
    <div className="min-h-screen bg-ritual-evening flex flex-col">
      {/* Topbar */}
      <div className="flex items-center justify-between px-8 py-5">
        <span className="font-semibold text-slate-900" style={{ fontSize: 17, letterSpacing: '-0.03em' }}>mirro</span>
        <div className="flex items-center gap-4 text-caption font-mono text-slate-400">
          <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
          <button onClick={skip} className="btn-tertiary text-caption">Skip tonight</button>
        </div>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-5 text-indigo-500">
            <Moon size={18} strokeWidth={1.75} />
            <span className="text-micro uppercase tracking-widest font-mono">Evening reflection</span>
          </div>

          <h1 className="text-display-xl text-slate-900 mb-2">How did today land?</h1>
          <p className="text-body-lg text-slate-500 mb-8 leading-relaxed max-w-md">
            Reflecting now — even briefly — helps Mirro notice what actually happens, not just what you planned.
          </p>

          {/* Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">

            {/* Today's recap */}
            {todayInteractions.length > 0 && (
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50">
                <p className="text-caption font-medium text-slate-500 uppercase tracking-wider font-mono mb-3">Today's interactions</p>
                <div className="space-y-1.5">
                  {todayInteractions.map(i => (
                    <div key={i.id} className="flex items-center gap-2 text-body-sm text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      <span className="font-medium">{i.colleagues?.name || 'General'}</span>
                      <span className="text-slate-400">—</span>
                      <Badge variant="neutral">{i.interaction_type.replace('_', ' ')}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main textarea */}
            <div className="px-5 pt-5 pb-2">
              <textarea
                className="w-full min-h-32 resize-none border-none outline-none text-body-sm text-slate-900 placeholder:text-slate-400 leading-relaxed bg-transparent"
                placeholder="What actually happened? What worked, what didn't…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {/* Outcome tags */}
            <div className="px-5 py-4 border-t border-slate-200">
              <p className="text-caption font-medium text-slate-500 uppercase tracking-wider font-mono mb-3">Outcomes</p>
              <div className="flex gap-2 flex-wrap">
                {OUTCOME_TAGS.map(tag => (
                  <button
                    key={tag.value}
                    type="button"
                    title={tag.description}
                    onClick={() => toggleTag(tag.value)}
                    aria-pressed={selectedTags.includes(tag.value)}
                    className={`px-3 py-1.5 rounded-md text-body-sm font-medium border transition-colors duration-fast ${
                      selectedTags.includes(tag.value)
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood + actions */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200 bg-slate-50 gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-caption text-slate-500 font-medium">End-of-day mood</span>
                <div className="flex gap-1.5">
                  {MOOD_OPTIONS.map(m => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMood(prev => prev === m.value ? null : m.value)}
                      aria-pressed={mood === m.value}
                      title={m.label}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-body-sm transition-colors duration-fast ${
                        mood === m.value
                          ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-base" aria-hidden>{m.icon}</span>
                      <span className="text-micro">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Button icon={Check} onClick={handleSubmit} loading={loading}>Close the day</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
