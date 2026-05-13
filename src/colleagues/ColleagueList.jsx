import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getColleagues } from '../lib/api/colleagues'
import ColleagueCard from './ColleagueCard'
import { freeTierConfig } from '../config'

const SORT_OPTIONS = [
  { value: 'recent',       label: 'Most recent' },
  { value: 'alphabetical', label: 'A → Z' },
  { value: 'interactions', label: 'Most interactions' },
]

export default function ColleagueList() {
  const [colleagues, setColleagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recent')

  useEffect(() => {
    getColleagues()
      .then(setColleagues)
      .catch(err => setError(err.message))
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
    if (sort === 'alphabetical') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sort === 'interactions') {
      list = [...list].sort((a, b) => (b.interaction_count || 0) - (a.interaction_count || 0))
    }
    // 'recent' is the default order from the API
    return list
  }, [colleagues, search, sort])

  if (loading) return <LoadingSkeleton />
  if (error)   return <p className="text-sm text-red-600" role="alert">{error}</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>
          Colleagues{' '}
          <span className="text-gray-400 font-normal text-sm">
            ({colleagues.length}/{freeTierConfig.maxColleagues})
          </span>
        </h2>
        <Link to="/colleagues/new" className="btn-primary text-sm">+ Add</Link>
      </div>

      {/* Search + sort controls */}
      {colleagues.length > 0 && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="search"
              className="input pl-8 py-1.5 text-sm"
              placeholder="Search by name, role…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search colleagues"
            />
          </div>
          <select
            className="input py-1.5 text-sm w-40"
            value={sort}
            onChange={e => setSort(e.target.value)}
            aria-label="Sort colleagues"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      {filtered.length === 0 && colleagues.length > 0 ? (
        <div className="card text-center py-6">
          <p className="text-gray-500 text-sm">No colleagues match "{search}".</p>
          <button className="btn-ghost text-sm mt-2" onClick={() => setSearch('')}>Clear search</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-8 space-y-2">
          <p className="text-gray-500">No colleagues yet.</p>
          <Link to="/colleagues/new" className="btn-secondary text-sm inline-flex">Add your first colleague</Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map(c => <ColleagueCard key={c.id} colleague={c} />)}
        </div>
      )}

      {colleagues.length >= freeTierConfig.maxColleagues && (
        <p className="text-xs text-amber-600 text-center">
          You've reached the free tier limit.{' '}
          <Link to="/settings/upgrade" className="underline font-medium">Upgrade</Link> to add more.
        </p>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading colleagues">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
        <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
