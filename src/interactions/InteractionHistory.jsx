import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getInteractions, deleteInteraction } from '../lib/api/interactions'

export default function InteractionHistory({ colleagueId, limit = 20 }) {
  const [interactions, setInteractions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInteractions({ colleagueId })
      .then(data => setInteractions(data.slice(0, limit)))
      .finally(() => setLoading(false))
  }, [colleagueId, limit])

  async function handleDelete(id) {
    if (!confirm('Delete this interaction? This cannot be undone.')) return
    await deleteInteraction(id)
    setInteractions(prev => prev.filter(i => i.id !== id))
  }

  if (loading) return <div className="animate-pulse space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}</div>

  if (interactions.length === 0) {
    return (
      <div className="card text-center py-6 space-y-2">
        <p className="text-gray-500 text-sm">No interactions logged yet.</p>
        <Link to="/interactions/new" className="btn-secondary text-sm inline-flex">Log your first</Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {interactions.map(i => (
        <div key={i.id} className="card group">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <span className="capitalize">{i.interaction_type.replace('_', ' ')}</span>
                {i.colleagues?.name && <span>· {i.colleagues.name}</span>}
                <span>· {new Date(i.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">{i.raw_content}</p>
            </div>
            <button
              className="btn-ghost opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(i.id)}
              aria-label="Delete interaction"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
