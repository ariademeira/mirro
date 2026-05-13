import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getInteractions, deleteInteraction } from '../lib/api/interactions'
import { getColleagues } from '../lib/api/colleagues'

export default function InteractionHistory({ colleagueId: propColleagueId, limit = 50 }) {
  const [interactions, setInteractions] = useState([])
  const [colleagues, setColleagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterColleagueId, setFilterColleagueId] = useState(propColleagueId || '')

  useEffect(() => {
    // Only load colleague dropdown when used as standalone page (no propColleagueId)
    if (!propColleagueId) {
      getColleagues().then(setColleagues).catch(console.error)
    }
  }, [propColleagueId])

  useEffect(() => {
    setLoading(true)
    getInteractions({ colleagueId: filterColleagueId || undefined, days: 30 })
      .then(data => setInteractions(data.slice(0, limit)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filterColleagueId, propColleagueId, limit])

  async function handleDelete(id) {
    if (!confirm('Delete this interaction? This cannot be undone.')) return
    await deleteInteraction(id)
    setInteractions(prev => prev.filter(i => i.id !== id))
  }

  // Group interactions by date
  const grouped = groupByDate(interactions)

  if (loading) return (
    <div className="animate-pulse space-y-2" aria-label="Loading interactions">
      {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header + filter */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2>Interaction history <span className="text-gray-400 font-normal text-sm">(last 30 days)</span></h2>
        <Link to="/interactions/new" className="btn-primary text-sm">+ Log</Link>
      </div>

      {!propColleagueId && colleagues.length > 0 && (
        <select
          className="input py-1.5 text-sm w-full sm:w-48"
          value={filterColleagueId}
          onChange={e => setFilterColleagueId(e.target.value)}
          aria-label="Filter by colleague"
        >
          <option value="">All colleagues</option>
          {colleagues.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}

      {interactions.length === 0 ? (
        <div className="card text-center py-6 space-y-2">
          <p className="text-gray-500 text-sm">
            {filterColleagueId ? 'No interactions logged for this colleague in the last 30 days.' : 'No interactions logged yet.'}
          </p>
          <Link to="/interactions/new" className="btn-secondary text-sm inline-flex">Log your first</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ label, items }) => (
            <div key={label}>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{label}</p>
              <div className="space-y-2">
                {items.map(i => (
                  <div key={i.id} className="card group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1 flex-wrap">
                          <span className="capitalize">{i.interaction_type.replace(/_/g, ' ')}</span>
                          {i.colleagues?.name && <span>· {i.colleagues.name}</span>}
                          {i.mood_signal && (
                            <span className="capitalize text-gray-500">· {i.mood_signal}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{i.raw_content}</p>
                      </div>
                      <button
                        className="btn-ghost opacity-0 group-hover:opacity-100 focus:opacity-100 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                        onClick={() => handleDelete(i.id)}
                        aria-label={`Delete interaction from ${new Date(i.created_at).toLocaleDateString()}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function groupByDate(interactions) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const groups = {}
  for (const i of interactions) {
    const d = new Date(i.created_at)
    d.setHours(0, 0, 0, 0)
    let label
    if (d.getTime() === today.getTime()) label = 'Today'
    else if (d.getTime() === yesterday.getTime()) label = 'Yesterday'
    else label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

    if (!groups[label]) groups[label] = []
    groups[label].push(i)
  }
  return Object.entries(groups).map(([label, items]) => ({ label, items }))
}
