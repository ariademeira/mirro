import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import ColleagueList from './colleagues/ColleagueList'
import InsightFeed from './insights/InsightFeed'
import InteractionHistory from './interactions/InteractionHistory'
import MorningPrompt from './ritual/MorningPrompt'
import EveningReflection from './ritual/EveningReflection'

export default function Dashboard() {
  const { user } = useAuth()
  const [showMorning, setShowMorning] = useState(false)
  const [showEvening, setShowEvening] = useState(false)
  const [activeTab, setActiveTab] = useState('colleagues') // 'colleagues' | 'insights' | 'history'

  useEffect(() => {
    // Show morning prompt if not completed today
    const lastMorning = localStorage.getItem('mirro_morning_done')
    const todayStr = new Date().toDateString()
    if (lastMorning !== todayStr) {
      setShowMorning(true)
    }
  }, [])

  function completeMorning() {
    localStorage.setItem('mirro_morning_done', new Date().toDateString())
    setShowMorning(false)
  }

  const hour = new Date().getHours()
  const showEveningPrompt = hour >= 16 && !showMorning

  if (showMorning) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <MorningPrompt onComplete={completeMorning} />
      </div>
    )
  }

  if (showEvening) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <EveningReflection onComplete={() => setShowEvening(false)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Dashboard</h1>
        <div className="flex gap-2">
          {showEveningPrompt && (
            <button className="btn-secondary text-sm" onClick={() => setShowEvening(true)}>
              Evening reflection
            </button>
          )}
          <Link to="/interactions/new" className="btn-primary text-sm">+ Log interaction</Link>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: 'colleagues', label: 'Colleagues' },
          { key: 'insights',   label: 'Insights' },
          { key: 'history',    label: 'History' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(tab.key)}
            aria-selected={activeTab === tab.key}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {activeTab === 'colleagues' && <ColleagueList />}
        {activeTab === 'insights'   && <InsightFeed />}
        {activeTab === 'history'    && <InteractionHistory />}
      </div>
    </div>
  )
}
