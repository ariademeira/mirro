import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MessageSquare, Calendar, Mail, Eye, Check, Zap } from 'lucide-react'
import { logInteraction } from '../lib/api/interactions'
import { getColleagues } from '../lib/api/colleagues'
import FreemiumGate from '../components/FreemiumGate'
import { Button, Select, Card, Avatar } from '../components/ui'

const TYPES = [
  { value: 'conversation', label: 'Conversation', icon: MessageSquare },
  { value: 'meeting',      label: 'Meeting',      icon: Calendar      },
  { value: 'email',        label: 'Email',        icon: Mail          },
  { value: 'feedback',     label: 'Feedback',     icon: Eye           },
  { value: 'conflict',     label: 'Conflict',     icon: Zap           },
]

const MOODS = [
  { value: 'energized', label: 'Energized', emoji: '⚡' },
  { value: 'neutral',   label: 'Neutral',   emoji: '😐' },
  { value: 'drained',   label: 'Drained',   emoji: '😴' },
]

const TONES = [
  { value: 'positive',      label: 'Positive',      color: 'bg-green-50 border-green-400 text-green-700' },
  { value: 'collaborative', label: 'Collaborative', color: 'bg-blue-50 border-blue-400 text-blue-700' },
  { value: 'neutral',       label: 'Neutral',       color: 'bg-slate-50 border-slate-300 text-slate-600' },
  { value: 'tense',         label: 'Tense',         color: 'bg-amber-50 border-amber-400 text-amber-700' },
  { value: 'difficult',     label: 'Difficult',     color: 'bg-red-50 border-red-400 text-red-700' },
]

const MAX_CHARS = 5000
const MAX_NOTES = 1000

export default function InteractionLogger() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedColleague = searchParams.get('colleague')

  const [colleagues, setColleagues] = useState([])
  const [colleagueId, setColleagueId] = useState(preselectedColleague || '')
  const [interactionType, setType] = useState('conversation')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('neutral')
  const [tone, setTone] = useState('neutral')
  const [internalComments, setInternalComments] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [gateReason, setGateReason] = useState(null)

  useEffect(() => {
    getColleagues().then(setColleagues).catch(console.error)
  }, [])

  const selectedColleague = colleagues.find(c => c.id === colleagueId)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await logInteraction({
        colleagueId: colleagueId || null,
        interactionType,
        rawContent: content.trim(),
        source: 'paste',
        mood,
        tone,
        internalComments: internalComments.trim() || undefined,
      })
      if (result.error) { setGateReason(result.error.reason); return }
      navigate(colleagueId ? `/colleagues/${colleagueId}` : '/dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {gateReason && <FreemiumGate reason={gateReason} onDismiss={() => setGateReason(null)} />}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-micro text-slate-400 uppercase tracking-widest font-mono mb-1.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-h1 text-slate-900">Log an interaction</h1>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-tertiary" onClick={() => navigate(-1)}>Cancel</button>
            <Button icon={Check} loading={loading} disabled={!content.trim()} onClick={handleSubmit}>Save</Button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {/* Main form card */}
          <Card padding={false} className="overflow-hidden">
            {/* Colleague + type row */}
            <div className="flex items-center gap-6 px-5 py-4 border-b border-slate-200 flex-wrap">
              <div className="flex items-center gap-2.5">
                <span className="text-body-sm font-medium text-slate-500">With</span>
                <div className="flex items-center gap-2">
                  {selectedColleague && <Avatar name={selectedColleague.name} size={22} />}
                  <select
                    value={colleagueId}
                    onChange={e => setColleagueId(e.target.value)}
                    className="text-body-sm text-slate-900 bg-transparent border-none outline-none cursor-pointer font-medium pr-1"
                    aria-label="Select colleague"
                  >
                    <option value="">— General reflection —</option>
                    {colleagues.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-body-sm font-medium text-slate-500">Type</span>
                <div className="flex gap-1.5">
                  {TYPES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setType(value)}
                      aria-pressed={interactionType === value}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-caption font-medium border transition-colors duration-fast ${
                        interactionType === value
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                      }`}
                    >
                      <Icon size={13} strokeWidth={1.75} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Big textarea */}
            <div className="px-5 pt-4 pb-2">
              <textarea
                className="w-full min-h-48 border-none outline-none resize-none text-body-sm text-slate-900 leading-relaxed placeholder:text-slate-400 bg-transparent"
                placeholder="Paste a conversation, email, meeting notes, or describe what happened…"
                value={content}
                onChange={e => setContent(e.target.value.slice(0, MAX_CHARS))}
                autoFocus
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
              {error && <p className="text-caption text-danger-600" role="alert">{error}</p>}
              <span className={`text-caption font-mono ml-auto ${content.length > MAX_CHARS * 0.9 ? 'text-amber-500' : 'text-slate-400'}`}>
                {content.length} / {MAX_CHARS}
              </span>
            </div>
          </Card>

          {/* Mood + Tone */}
          <Card className="space-y-4">
            {/* Mood */}
            <div>
              <p className="text-body-sm font-medium text-slate-700 mb-2">How did you feel?</p>
              <div className="flex gap-2">
                {MOODS.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMood(value)}
                    aria-pressed={mood === value}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border-2 text-caption font-medium transition-colors duration-fast ${
                      mood === value
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span>{emoji}</span> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <p className="text-body-sm font-medium text-slate-700 mb-2">What was the tone?</p>
              <div className="flex flex-wrap gap-2">
                {TONES.map(({ value, label, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTone(value)}
                    aria-pressed={tone === value}
                    className={`px-3 py-1.5 rounded-md text-caption font-medium border-2 transition-colors duration-fast ${
                      tone === value ? color : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Internal notes (expandable) */}
          <div>
            <button
              type="button"
              onClick={() => setShowNotes(n => !n)}
              className="text-body-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
            >
              <span className={`transition-transform duration-fast ${showNotes ? 'rotate-90' : ''}`}>▶</span>
              {showNotes ? 'Hide' : 'Add'} private notes
            </button>

            {showNotes && (
              <div className="mt-3">
                <textarea
                  className="w-full min-h-24 input resize-none text-body-sm leading-relaxed"
                  placeholder="Private reflections — not shared with anyone. What patterns do you notice? How do you want to approach this person next time?"
                  value={internalComments}
                  onChange={e => setInternalComments(e.target.value.slice(0, MAX_NOTES))}
                />
                <p className={`text-caption font-mono mt-1 ${internalComments.length > MAX_NOTES * 0.9 ? 'text-amber-500' : 'text-slate-400'}`}>
                  {internalComments.length} / {MAX_NOTES}
                </p>
              </div>
            )}
          </div>

          <p className="text-caption text-slate-400 text-center">
            Mirro analyses patterns over time — the more context you provide, the better.
          </p>
        </div>
      </div>
    </>
  )
}
