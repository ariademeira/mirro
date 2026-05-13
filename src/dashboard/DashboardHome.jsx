import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getColleagues } from '../lib/api/colleagues'
import { getInteractions } from '../lib/api/interactions'
import { freeTierConfig } from '../config'

export default function DashboardHome() {
  const [colleagues, setColleagues] = useState([])
  const [todayInteractions, setTodayInteractions] = useState([])
  const [recentInteractions, setRecentInteractions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getColleagues(),
      getInteractions({ days: 30 }),
    ]).then(([cols, interactions]) => {
      setColleagues(cols)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      setTodayInteractions(interactions.filter(i => new Date(i.created_at) >= today))
      setRecentInteractions(interactions.slice(0, 5))
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const lastInteraction = recentInteractions[0]

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          loading={loading}
          value={colleagues.length}
          max={freeTierConfig.maxColleagues}
          label="Colleagues"
          href="/colleagues"
        />
        <StatCard
          loading={loading}
          value={todayInteractions.filter(i => !['morning_reflection','evening_reflection'].includes(i.interaction_type)).length}
          label="Logged today"
          href="/interactions"
        />
        <StatCard
          loading={loading}
          value={lastInteraction
            ? relativeDate(lastInteraction.created_at)
            : '—'}
          label="Last interaction"
          href="/interactions"
          isText
        />
      </div>

      {/* Quick actions */}
      <div className="card space-y-3">
        <h2 className="text-base">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/interactions/new" className="btn-primary text-sm">+ Log interaction</Link>
          <Link to="/colleagues/new" className="btn-secondary text-sm">+ Add colleague</Link>
          <Link to="/interactions" className="btn-ghost text-sm">View history</Link>
        </div>
      </div>

      {/* Recent interactions */}
      {!loading && recentInteractions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base">Recent activity</h2>
            <Link to="/interactions" className="text-xs text-blue-600 hover:underline">See all</Link>
          </div>
          <div className="space-y-2">
            {recentInteractions.map(i => (
              <div key={i.id} className="card py-3">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-0.5">
                  <span className="capitalize">{i.interaction_type.replace(/_/g, ' ')}</span>
                  {i.colleagues?.name && <span>· {i.colleagues.name}</span>}
                  <span className="ml-auto">{relativeDate(i.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{i.raw_content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && colleagues.length === 0 && recentInteractions.length === 0 && (
        <div className="card text-center py-10 space-y-3">
          <p className="text-2xl">👋</p>
          <p className="font-medium text-gray-800">Welcome to Mirro</p>
          <p className="text-sm text-gray-500">Start by adding the colleagues you work with most.</p>
          <Link to="/colleagues/new" className="btn-primary text-sm inline-flex">Add your first colleague</Link>
        </div>
      )}
    </div>
  )
}

function StatCard({ loading, value, max, label, href, isText }) {
  return (
    <Link to={href} className="card block text-center hover:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
      {loading ? (
        <div className="h-7 bg-gray-200 rounded animate-pulse mx-auto w-10 mb-1" />
      ) : (
        <p className={`font-semibold text-blue-600 ${isText ? 'text-sm mt-1' : 'text-2xl'}`}>
          {value}{max != null ? <span className="text-gray-400 font-normal text-sm">/{max}</span> : null}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </Link>
  )
}

function relativeDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
