import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, Check } from 'lucide-react'
import { getColleagues } from '../lib/api/colleagues'
import { logInteraction } from '../lib/api/interactions'
import { Button, Avatar } from '../components/ui'

const PROMPTS = [
  "Who are you thinking about or concerned about today?",
  "Who do you need to align with this week?",
  "Where do you expect friction today?",
  "Who's on your radar and why?",
]

const MOODS = [
  { value: 'open',   label: 'Open',   icon: '🙂', color: '#10B981' },
  { value: 'steady', label: 'Steady', icon: '😐', color: '#94A3B8' },
  { value: 'tense',  label: 'Tense',  icon: '😟', color: '#F59E0B' },
]

export default function MorningPrompt({ onComplete }) {
  const navigate = useNavigate()
  const [colleagues, setColleagues] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [notes, setNotes] = useState('')
  const [mood, setMood] = useState(null)
  const [loading, setLoading] = useState(false)
  const [todayPrompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)])

  useEffect(() => {
    getColleagues().then(c => setColleagues(c.slice(0, 6))).catch(console.error)
  }, [])

  function toggleColleague(id) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function skip() {
    if (onComplete) onComplete()
    else navigate('/dashboard')
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const names = selectedIds.map(id => colleagues.find(c => c.id === id)?.name).filter(Boolean)
      await logInteraction({
        colleagueId: selectedIds[0] || null,
        interactionType: 'morning_reflection',
        rawContent: notes || `Morning check-in. Thinking about: ${names.join(', ') || 'general reflections'}.`,
        source: 'paste',
        moodSignal: mood,
      })
      if (onComplete) onComplete()
      else navigate('/dashboard')
    } catch (err) {
      console.error('Morning prompt error:', err)
    } finally {
      setLoading(false)
    }
  }

  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning.' : h < 17 ? 'Good afternoon.' : 'Good evening.'

  return (
    <div className="min-h-screen bg-ritual-morning flex flex-col">
      {/* Topbar */}
      <div className="flex items-center justify-between px-8 py-5">
        <span className="font-semibold text-slate-900" style={{ fontSize: 17, letterSpacing: '-0.03em' }}>mirro</span>
        <div className="flex items-center gap-4 text-caption font-mono text-slate-400">
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          <button onClick={skip} className="btn-tertiary text-caption">Skip</button>
        </div>
      </div>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-lg">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-5 text-indigo-500">
            <Sun size={18} strokeWidth={1.75} />
            <span className="text-micro uppercase tracking-widest font-mono">Morning check-in</span>
          </div>

          <h1 className="text-display-xl text-slate-900 mb-2">{greeting}</h1>
          <p className="text-body-lg text-slate-500 mb-8 leading-relaxed">{todayPrompt}</p>

          {/* Main card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
            {/* Mood */}
            <div className="p-5 border-b border-slate-200">
              <p className="text-body-sm font-medium text-slate-700 mb-3">How are you starting the day?</p>
              <div className="flex gap-2">
                {MOODS.map(m => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(prev => prev === m.value ? null : m.value)}
                    aria-pressed={mood === m.value}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg border text-body-sm transition-colors duration-fast ${
                      mood === m.value
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl" aria-hidden>{m.icon}</span>
                    <span className="text-caption font-medium">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colleagues on mind */}
            {colleagues.length > 0 && (
              <div className="p-5 border-b border-slate-200">
                <p className="text-body-sm font-medium text-slate-700 mb-3">Who's on your mind today?</p>
                <div className="space-y-1.5">
                  {colleagues.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleColleague(c.id)}
                      aria-pressed={selectedIds.includes(c.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors duration-fast ${
                        selectedIds.includes(c.id)
                          ? 'border-indigo-400 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors duration-fast ${
                        selectedIds.includes(c.id) ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                      }`}>
                        {selectedIds.includes(c.id) && <Check size={10} color="white" strokeWidth={3} />}
                      </span>
                      <Avatar name={c.name} size={22} />
                      <span className="text-body-sm font-medium text-slate-900 flex-1">{c.name}</span>
                      {c.role && <span className="text-caption text-slate-400">{c.role}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="p-5 border-b border-slate-200">
              <textarea
                className="w-full min-h-20 resize-none border-none outline-none text-body-sm text-slate-900 placeholder:text-slate-400 leading-relaxed bg-transparent"
                placeholder="Any intentions for today? What would help you navigate this better…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-5 py-4 bg-slate-50">
              <button onClick={skip} className="btn-tertiary text-body-sm">Skip for now</button>
              <Button icon={Check} onClick={handleSubmit} loading={loading}>Start day</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
