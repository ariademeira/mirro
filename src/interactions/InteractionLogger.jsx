import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { logInteraction } from '../lib/api/interactions'
import { getColleagues } from '../lib/api/colleagues'
import PasteInput from '../components/PasteInput'
import FreemiumGate from '../components/FreemiumGate'

const INTERACTION_TYPES = [
  { value: 'conversation', label: 'Conversation' },
  { value: 'meeting',      label: 'Meeting' },
  { value: 'message',      label: 'Message / Email' },
  { value: 'observation',  label: 'Observation' },
]

export default function InteractionLogger() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedColleague = searchParams.get('colleague')

  const [colleagues, setColleagues] = useState([])
  const [colleagueId, setColleagueId] = useState(preselectedColleague || '')
  const [interactionType, setType] = useState('conversation')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [gateReason, setGateReason] = useState(null)

  useEffect(() => {
    getColleagues().then(setColleagues).catch(console.error)
  }, [])

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
      })
      if (result.error) {
        setGateReason(result.error.reason)
        return
      }
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

      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1>Log interaction</h1>
          <p className="text-sm text-gray-500 mt-1">
            Paste a conversation, email, meeting notes, or observation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label htmlFor="colleague" className="block text-sm font-medium text-gray-700 mb-1.5">
              Colleague <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select id="colleague" className="input" value={colleagueId} onChange={e => setColleagueId(e.target.value)}>
              <option value="">— General reflection —</option>
              {colleagues.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
            <div className="flex flex-wrap gap-2">
              {INTERACTION_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    interactionType === t.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
                  }`}
                  onClick={() => setType(t.value)}
                  aria-pressed={interactionType === t.value}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <PasteInput value={content} onChange={setContent} />

          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading || !content.trim()}>
              {loading ? 'Logging…' : 'Log interaction'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
