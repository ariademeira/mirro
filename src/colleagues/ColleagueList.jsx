import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getColleagues } from '../lib/api/colleagues'
import ColleagueCard from './ColleagueCard'
import { freeTierConfig } from '../config'

export default function ColleagueList() {
  const [colleagues, setColleagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getColleagues()
      .then(setColleagues)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton />
  if (error)   return <p className="text-sm text-red-600">{error}</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>Colleagues <span className="text-gray-400 font-normal text-sm">({colleagues.length}/{freeTierConfig.maxColleagues})</span></h2>
        <Link to="/colleagues/new" className="btn-primary text-sm">+ Add</Link>
      </div>

      {colleagues.length === 0 ? (
        <div className="card text-center py-8 space-y-2">
          <p className="text-gray-500">No colleagues yet.</p>
          <Link to="/colleagues/new" className="btn-secondary text-sm inline-flex">Add your first colleague</Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {colleagues.map(c => <ColleagueCard key={c.id} colleague={c} />)}
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2" aria-label="Loading colleagues">
      {[1, 2, 3].map(i => (
        <div key={i} className="card animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}
