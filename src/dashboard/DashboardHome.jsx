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
    <div className="space-y-8">
      {/* Quick stats */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Your progress</h2>
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            loading={loading}
            value={colleagues.length}
            max={freeTierConfig.maxColleagues}
            label="Colleagues"
            href="/colleagues"
            color="indigo"
          />
          <StatCard
            loading={loading}
            value={todayInteractions.filter(i => !['morning_reflection','evening_reflection'].includes(i.interaction_type)).length}
            label="Logged today"
            href="/interactions"
            color="green"
          />
          <StatCard
            loading={loading}
            value={lastInteraction ? relativeDate(lastInteraction.created_at) : '—'}
            label="Last interaction"
            href="/interactions"
            isText
            color="blue"
          />
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <div className="card-flat space-y-4">
          <h2>Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/interactions/new" className="btn-primary">+ Log interaction</Link>
            <Link to="/colleagues/new" className="btn-secondary">+ Add colleague</Link>
            <Link to="/interactions" className="btn-ghost">View history</Link>
          </div>
        </div>
      </section>

      {/* Recent interactions */}
      {!loading && recentInteractions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2>Recent activity</h2>
            <Link to="/interactions" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              See all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentInteractions.map(i => (
              <div key={i.id} className="card py-4">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1 flex-wrap">
                  <span className="capitalize font-medium">{i.interaction_type.replace(/_/g, ' ')}</span>
                  {i.colleagues?.name && <span>· {i.colleagues.name}</span>}
                  <span className="ml-auto">{relativeDate(i.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{i.raw_content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Onboarding empty state */}
      {!loading && colleagues.length === 0 && recentInteractions.length === 0 && (
        <div className="empty-state">
          <p className="text-4xl mb-4">👋</p>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Mirro</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Start by adding the colleagues you work with most.
          </p>
          <Link to="/colleagues/new" className="btn-primary">Add your first colleague</Link>
        </div>
      )}
    </div>
  )
}

function StatCard({ loading, value, max, label, href, isText, color }) {
  const colorMap = {
    indigo: 'text-indigo-600',
    green:  'text-green-600',
    blue:   'text-blue-600',
  }
  const valueColor = colorMap[color] || 'text-indigo-600'

  return (
    <Link
      to={href}
      className="card block text-center hover:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
    >
      {loading ? (
        <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto w-12 mb-2" />
      ) : (
        <p className={`font-bold ${valueColor} ${isText ? 'text-sm mt-1' : 'text-3xl'}`}>
          {value}{max != null ? <span className="text-gray-400 font-normal text-base">/{max}</span> : null}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
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
