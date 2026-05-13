import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getColleagues } from '../lib/api/colleagues'
import { logInteraction } from '../lib/api/interactions'
import PasteInput from '../components/PasteInput'

export default function MorningPrompt({ onComplete }) {
  const navigate = useNavigate()
  const [colleagues, setColleagues] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [content, setContent] = useState('')
  const [step, setStep] = useState(1) // 1: who | 2: what
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getColleagues().then(recent => setColleagues(recent.slice(0, 5))).catch(console.error)
  }, [])

  function toggleColleague(id) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      await logInteraction({
        colleagueId: selectedIds[0] || null,
        interactionType: 'morning_reflection',
        rawContent: content || `Morning check-in. Thinking about: ${selectedIds.map(id => colleagues.find(c => c.id === id)?.name).filter(Boolean).join(', ') || 'general reflections'}.`,
        source: 'paste',
      })
      if (onComplete) onComplete()
      else navigate('/dashboard')
    } catch (err) {
      console.error('Morning prompt error:', err)
    } finally {
      setLoading(false)
    }
  }

  const greeting = getGreeting()

  return (
    <div className="max-w-md mx-auto">
      <div className="card space-y-6">
        {step === 1 && (
          <>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Morning check-in</p>
              <h1>{greeting}</h1>
              <p className="text-gray-500 text-sm mt-1">Who's on your radar today?</p>
            </div>

            {colleagues.length > 0 && (
              <div className="space-y-2">
                {colleagues.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors ${
                      selectedIds.includes(c.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleColleague(c.id)}
                    aria-pressed={selectedIds.includes(c.id)}
                  >
                    <span className={`h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedIds.includes(c.id) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedIds.includes(c.id) && (
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm">{c.name}</span>
                    {c.last_interaction && (
                      <span className="ml-auto text-xs text-gray-400">
                        {new Date(c.last_interaction).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button className="btn-ghost flex-1" onClick={() => { if (onComplete) onComplete(); else navigate('/dashboard') }}>
                Skip
              </button>
              <button className="btn-primary flex-1" onClick={() => setStep(2)}>
                Continue
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Morning check-in</p>
              <h2>What would help you navigate this better?</h2>
            </div>

            <PasteInput
              value={content}
              onChange={setContent}
              placeholder="Share what's on your mind — paste a message, describe a situation, or just write freely…"
              rows={5}
              label=""
              id="morning-content"
            />

            <div className="flex gap-3">
              <button className="btn-ghost flex-1" onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary flex-1" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving…' : 'Start day'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning!'
  if (h < 17) return 'Good afternoon!'
  return 'Good evening!'
}
