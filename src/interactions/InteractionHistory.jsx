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

  const grouped = groupByDate(interactions)

  if (loading) return (
    <div className="animate-pulse space-y-3" aria-label="Loading interactions">
      {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1>Interactions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Last 30 days</p>
        </div>
        <Link to="/interactions/new" className="btn-primary">+ Log</Link>
      </div>

      {!propColleagueId && colleagues.length > 0 && (
        <select
          className="input py-2 w-full sm:w-52"
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
        <div className="empty-state">
          <p className="text-3xl mb-4">📝</p>
          <h3 className="mb-2">No interactions yet</h3>
          <p className="text-sm text-gray-500 mb-6">
            {filterColleagueId
              ? 'No interactions logged for this colleague in the last 30 days.'
              : 'Start logging your conversations to see them here.'}
          </p>
          <Link to="/interactions/new" className="btn-primary">Log your first</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ label, items }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{label}</p>
              <div className="space-y-3">
                {items.map(i => (
                  <div key={i.id} className="card group py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5 flex-wrap">
                          <span className="capitalize font-medium">{i.interaction_type.replace(/_/g, ' ')}</span>
                          {i.colleagues?.name && <span>· {i.colleagues.name}</span>}
                          {i.mood_signal && (
                            <span className="capitalize">· {i.mood_signal}</span>
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
