import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, Users } from 'lucide-react'
import { getColleagues } from '../lib/api/colleagues'
import { ColleagueCard, EmptyState, Button, Card } from '../components/ui'
import { freeTierConfig } from '../config'

const STATUSES = ['all', 'emerging', 'developing', 'established']

export default function ColleagueList() {
  const navigate = useNavigate()
  const [colleagues, setColleagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  useEffect(() => {
    getColleagues()
      .then(setColleagues)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = colleagues
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.role || '').toLowerCase().includes(q) ||
        (c.department || '').toLowerCase().includes(q)
      )
    }
    if (status !== 'all') {
      list = list.filter(c => (c.profile_status || 'emerging') === status)
    }
    return list
  }, [colleagues, search, status])

  const counts = useMemo(() => ({
    all: colleagues.length,
    emerging:    colleagues.filter(c => (c.profile_status || 'emerging') === 'emerging').length,
    developing:  colleagues.filter(c => c.profile_status === 'developing').length,
    established: colleagues.filter(c => c.profile_status === 'established').length,
  }), [colleagues])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-micro text-slate-400 uppercase tracking-widest font-mono mb-1.5">
            Workspace · {colleagues.length} {colleagues.length === 1 ? 'person' : 'people'}
          </p>
          <h1 className="text-h1 text-slate-900">Colleagues</h1>
        </div>
        <Link to="/colleagues/new" className="btn-primary shrink-0">
          <Plus size={15} strokeWidth={2} />
          Add colleague
        </Link>
      </div>

      {/* Search + filter */}
      {colleagues.length > 0 && (
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" strokeWidth={1.75} />
            <input
              type="search"
              className="input pl-9"
              placeholder="Search by name, role, or department…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search colleagues"
            />
          </div>
          <div className="flex gap-0.5 bg-white border border-slate-200 rounded-lg p-1">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-md text-caption font-medium transition-colors duration-fast ${
                  status === s
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {s === 'all' ? `All · ${counts.all}` : `${s.charAt(0).toUpperCase() + s.slice(1)} · ${counts[s]}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <div className="flex items-center gap-3 mb-3">
                <div className="skeleton w-9 h-9 rounded-full" />
                <div className="flex-1">
                  <div className="skeleton h-3.5 w-28 rounded mb-1.5" />
                  <div className="skeleton h-3 w-20 rounded" />
                </div>
              </div>
              <div className="skeleton h-3 w-full rounded mt-3 pt-3" />
            </Card>
          ))}
        </div>
      )}

      {/* Empty states */}
      {!loading && colleagues.length === 0 && (
        <EmptyState
          icon={Users}
          title="No colleagues yet"
          description="Add the people you work with most closely. Mirro will help you see patterns in how those relationships develop."
          action={() => navigate('/colleagues/new')}
          actionLabel="Add your first colleague"
        />
      )}

      {!loading && colleagues.length > 0 && filtered.length === 0 && (
        <div className="empty-state">
          <p className="text-body text-slate-500">No colleagues match your search.</p>
          <button className="btn-ghost mt-3 text-body-sm" onClick={() => { setSearch(''); setStatus('all') }}>
            Clear filters
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => (
            <ColleagueCard
              key={c.id}
              name={c.name}
              role={c.role}
              dept={c.department}
              status={c.profile_status || 'emerging'}
              count={c.interaction_count || 0}
              last={c.last_interaction ? relativeDate(c.last_interaction) : 'no interactions'}
              onClick={() => navigate(`/colleagues/${c.id}`)}
            />
          ))}
        </div>
      )}

      {/* Freemium limit */}
      {colleagues.length >= freeTierConfig.maxColleagues && (
        <p className="text-caption text-warning-700 text-center">
          You've reached the free tier limit.{' '}
          <Link to="/settings/upgrade" className="underline font-medium">Upgrade</Link> to add more.
        </p>
      )}
    </div>
  )
}

function relativeDate(iso) {
  const d = new Date(iso)
  const diffDays = Math.floor((Date.now() - d) / 86400000)
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
