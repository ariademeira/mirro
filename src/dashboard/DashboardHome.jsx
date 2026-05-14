import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, MessageSquarePlus, Zap, Clock } from 'lucide-react'
import { getColleagues } from '../lib/api/colleagues'
import { getInteractions } from '../lib/api/interactions'
import { StatCard, Card, Badge, Avatar, Button, EmptyState } from '../components/ui'
import { freeTierConfig } from '../config'

export default function DashboardHome() {
  const [colleagues, setColleagues] = useState([])
  const [recentInteractions, setRecentInteractions] = useState([])
  const [todayCount, setTodayCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getColleagues(),
      getInteractions({ days: 30 }),
    ]).then(([cols, interactions]) => {
      setColleagues(cols)
      const today = new Date(); today.setHours(0, 0, 0, 0)
      setTodayCount(
        interactions.filter(i =>
          new Date(i.created_at) >= today &&
          !['morning_reflection', 'evening_reflection'].includes(i.interaction_type)
        ).length
      )
      setRecentInteractions(interactions.slice(0, 5))
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const isOnboarding = !loading && colleagues.length === 0 && recentInteractions.length === 0

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-micro text-slate-400 uppercase tracking-widest font-mono mb-1.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-h1 text-slate-900">{getGreeting()}</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/interactions" className="btn-secondary">View history</Link>
          <Link to="/interactions/new" className="btn-primary">
            <MessageSquarePlus size={15} strokeWidth={1.75} />
            Log interaction
          </Link>
        </div>
      </div>

      {/* Onboarding empty state */}
      {isOnboarding && (
        <EmptyState
          icon={Users}
          title="Welcome to Mirro"
          description="Start by adding the colleagues you work with most. Mirro will help you see patterns in how those relationships develop."
          action={() => {}}
          actionLabel="Add your first colleague"
        />
      )}

      {/* Stats grid */}
      {!isOnboarding && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <div className="skeleton h-7 w-12 mb-3 rounded" />
                <div className="skeleton h-3 w-20 rounded" />
              </Card>
            ))
          ) : (
            <>
              <StatCard label="Colleagues" value={colleagues.length} icon={Users}
                delta={`of ${freeTierConfig.maxColleagues} max`} deltaTone="flat" />
              <StatCard label="Logged today" value={todayCount} icon={MessageSquarePlus}
                delta={todayCount > 0 ? 'great momentum' : 'log your first'} deltaTone={todayCount > 0 ? 'up' : 'flat'} />
              <StatCard label="This month" value={recentInteractions.length} icon={Clock}
                delta="last 30 days" deltaTone="flat" />
              <StatCard label="Streak" value="—" icon={Zap}
                delta="start logging daily" deltaTone="flat" />
            </>
          )}
        </div>
      )}

      {/* Quick actions row */}
      {!isOnboarding && !loading && (
        <div className="flex gap-3 flex-wrap">
          <Link to="/interactions/new" className="btn-primary">
            <MessageSquarePlus size={15} strokeWidth={1.75} />
            Log interaction
          </Link>
          <Link to="/colleagues/new" className="btn-secondary">+ Add colleague</Link>
          <Link to="/colleagues" className="btn-tertiary">View all colleagues</Link>
        </div>
      )}

      {/* Recent activity */}
      {!loading && recentInteractions.length > 0 && (
        <section>
          <Card padding={false}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-h3 text-slate-900">Recent interactions</h2>
                <p className="text-caption text-slate-500 mt-0.5">Last 30 days</p>
              </div>
              <Link to="/interactions" className="btn-tertiary text-caption">View all</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentInteractions.map(i => (
                <div key={i.id} className="flex gap-4 px-5 py-3.5">
                  <Avatar name={i.colleagues?.name || '?'} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="text-body-sm font-semibold text-slate-900" style={{ letterSpacing: '-0.01em' }}>
                        {i.colleagues?.name || 'General'}
                      </span>
                      <span className="text-caption font-mono text-slate-400 shrink-0">{relativeDate(i.created_at)}</span>
                    </div>
                    <p className="text-body-sm text-slate-500 line-clamp-2 leading-relaxed">{i.raw_content}</p>
                    <div className="mt-1.5">
                      <Badge variant="neutral">{i.interaction_type.replace(/_/g, ' ')}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning.'
  if (h < 17) return 'Good afternoon.'
  return 'Good evening.'
}

function relativeDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diffMins = Math.floor((now - d) / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffMins / 1440)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
