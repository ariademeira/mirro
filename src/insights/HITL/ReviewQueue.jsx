import { useState, useEffect } from 'react'
import { getHITLQueue, resolveHITL } from '../../lib/api/insights'
import ConfidenceIndicator from '../../components/ConfidenceIndicator'

export default function ReviewQueue() {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState(null)

  useEffect(() => {
    getHITLQueue()
      .then(setQueue)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleResolve(id, approved) {
    const notes = approved ? '' : prompt('Reason for rejection (optional):') || ''
    setResolving(id)
    try {
      await resolveHITL(id, { approved, notes })
      setQueue(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      alert('Failed to resolve: ' + err.message)
    } finally {
      setResolving(null)
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading review queue…</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1>HITL Review Queue</h1>
        {queue.length > 0 && (
          <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {queue.length} pending
          </span>
        )}
      </div>

      {queue.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-green-600 font-medium">All clear — no items to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map(item => (
            <div key={item.id} className="card space-y-3 border-l-4 border-amber-400">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-400">
                    User: {item.user_profiles?.email || item.user_id} ·
                    Colleague: {item.colleagues?.name || '—'} ·
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                  <span className="text-xs font-medium uppercase text-amber-600 mt-1 inline-block">
                    {item.insight_type}
                  </span>
                </div>
                <ConfidenceIndicator score={item.confidence_score} />
              </div>

              <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                {item.content.pattern && <p><strong>Pattern:</strong> {item.content.pattern}</p>}
                {item.content.interpretation && <p><strong>Interpretation:</strong> {item.content.interpretation}</p>}
                {item.content.suggestion && <p><strong>Suggestion:</strong> {item.content.suggestion}</p>}
                {item.content.evidence && <p className="text-xs text-gray-500 italic">Evidence: {item.content.evidence}</p>}
              </div>

              <div className="flex gap-2">
                <button
                  className="btn-primary flex-1"
                  disabled={resolving === item.id}
                  onClick={() => handleResolve(item.id, true)}
                >
                  {resolving === item.id ? 'Saving…' : 'Approve'}
                </button>
                <button
                  className="btn-secondary flex-1 text-red-600 hover:bg-red-50"
                  disabled={resolving === item.id}
                  onClick={() => handleResolve(item.id, false)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
