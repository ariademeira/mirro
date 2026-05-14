import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquarePlus, Trash2, Clock } from 'lucide-react'
import { getInteractions, deleteInteraction } from '../lib/api/interactions'
import { getColleagues } from '../lib/api/colleagues'
import { Avatar, Badge, Button, EmptyState, Card } from '../components/ui'

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-micro text-slate-400 uppercase tracking-widest font-mono mb-1.5">
            {interactions.length > 0 ? `${interactions.length} entries · last 30 days` : 'Last 30 days'}
          </p>
          <h1 className="text-h1 text-slate-900">History</h1>
        </div>
        <Link to="/interactions/new" className="btn-primary inline-flex items-center gap-2 h-btn-md px-4 text-body-sm font-medium rounded-md">
          <MessageSquarePlus size={15} strokeWidth={1.75} />
          Log interaction
        </Link>
      </div>

      {/* Filter */}
      {!propColleagueId && colleagues.length > 0 && (
        <select
          className="input w-full sm:w-52"
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

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 skeleton rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && interactions.length === 0 && (
        <EmptyState
          icon={Clock}
          title="No interactions yet"
          description={filterColleagueId
            ? 'No interactions logged for this colleague in the last 30 days.'
            : 'Start logging your conversations to see them here.'}
          action={() => {}}
          actionLabel="Log your first"
        />
      )}

      {/* Timeline */}
      {!loading && grouped.length > 0 && (
        <div className="relative pl-10">
          {/* Vertical line */}
          <div className="absolute left-2.5 top-2 bottom-2 w-px bg-slate-200" />

          {grouped.map(({ label, items }) => (
            <div key={label} className="mb-7">
              {/* Date header */}
              <div className="relative flex items-center gap-3 -ml-10 mb-4">
                <div className="w-5 h-5 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                </div>
                <h2 className="text-body-sm font-semibold text-slate-900" style={{ letterSpacing: '-0.01em' }}>{label}</h2>
              </div>

              <div className="space-y-2.5">
                {items.map(i => (
                  <Card key={i.id} padding={false} className="group overflow-hidden">
                    <div className="flex gap-4 p-4">
                      <div className="relative shrink-0">
                        <Avatar name={i.colleagues?.name || '?'} size={36} />
                        {i.mood_signal && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                            style={{ background: moodColor(i.mood_signal) }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-body-sm font-semibold text-slate-900" style={{ letterSpacing: '-0.01em' }}>
                              {i.colleagues?.name || 'General'}
                            </span>
                            <Badge variant="neutral">{i.interaction_type.replace(/_/g, ' ')}</Badge>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-caption font-mono text-slate-400">
                              {new Date(i.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                            <button
                              className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-danger-600 transition-[opacity,color] duration-fast p-1 rounded"
                              onClick={() => handleDelete(i.id)}
                              aria-label="Delete interaction"
                            >
                              <Trash2 size={13} strokeWidth={1.75} />
                            </button>
                          </div>
                        </div>
                        <p className="text-body-sm text-slate-600 line-clamp-2 leading-relaxed">{i.raw_content}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function moodColor(mood) {
  if (mood === 'good' || mood === 'open') return '#10B981'
  if (mood === 'tough' || mood === 'tense') return '#F59E0B'
  return '#94A3B8'
}

function groupByDate(interactions) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  const groups = {}
  for (const i of interactions) {
    const d = new Date(i.created_at); d.setHours(0, 0, 0, 0)
    let label
    if (d.getTime() === today.getTime()) label = 'Today'
    else if (d.getTime() === yesterday.getTime()) label = 'Yesterday'
    else label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    if (!groups[label]) groups[label] = []
    groups[label].push(i)
  }
  return Object.entries(groups).map(([label, items]) => ({ label, items }))
}
