import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getColleague } from '../lib/api/colleagues'
import { getInteractions } from '../lib/api/interactions'
import { getInsights } from '../lib/api/insights'
import EvidenceCard from '../components/EvidenceCard'
import { framing } from '../config'

export default function ColleagueDetail() {
  const { id } = useParams()
  const [colleague, setColleague] = useState(null)
  const [interactions, setInteractions] = useState([])
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getColleague(id),
      getInteractions({ colleagueId: id }),
      getInsights({ colleagueId: id }),
    ]).then(([c, i, ins]) => {
      setColleague(c)
      setInteractions(i)
      setInsights(ins.data || [])
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="animate-pulse space-y-3"><div className="h-6 bg-gray-200 rounded w-1/3" /><div className="h-32 bg-gray-100 rounded" /></div>
  if (!colleague) return <p className="text-sm text-red-600">Colleague not found.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h1>{colleague.name}</h1>
          {(colleague.role || colleague.department) && (
            <p className="text-gray-500 text-sm mt-0.5">{[colleague.role, colleague.department].filter(Boolean).join(' · ')}</p>
          )}
        </div>
        <Link to={`/interactions/new?colleague=${id}`} className="btn-primary text-sm">+ Log interaction</Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-semibold text-blue-600">{colleague.interaction_count}</p>
          <p className="text-xs text-gray-500 mt-0.5">Interactions</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-semibold text-blue-600">{insights.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Insights</p>
        </div>
        <div className="card text-center">
          <p className="text-sm font-medium text-gray-700 capitalize">{colleague.profile_status}</p>
          <p className="text-xs text-gray-500 mt-0.5">Profile</p>
        </div>
      </div>

      {insights.length > 0 && (
        <section>
          <h2 className="mb-3">{framing.userInsights}</h2>
          <div className="space-y-3">
            {insights.map(i => <EvidenceCard key={i.id} insight={i} />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3">Recent interactions</h2>
        {interactions.length === 0 ? (
          <div className="card text-center py-6">
            <p className="text-gray-500 text-sm">No interactions logged yet.</p>
            <Link to={`/interactions/new?colleague=${id}`} className="btn-secondary text-sm inline-flex mt-3">Log first interaction</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {interactions.slice(0, 10).map(i => (
              <div key={i.id} className="card">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span className="capitalize">{i.interaction_type.replace('_', ' ')}</span>
                  <span>{new Date(i.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">{i.raw_content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
