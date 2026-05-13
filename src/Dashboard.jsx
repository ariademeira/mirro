import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import MorningPrompt from './ritual/MorningPrompt'
import EveningReflection from './ritual/EveningReflection'
import DashboardHome from './dashboard/DashboardHome'

export default function Dashboard() {
  const { user } = useAuth()
  const [showMorning, setShowMorning] = useState(false)
  const [showEvening, setShowEvening] = useState(false)

  useEffect(() => {
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
  const showEveningBanner = hour >= 16 && !showMorning && !showEvening

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
        {showEveningBanner && (
          <button className="btn-secondary text-sm" onClick={() => setShowEvening(true)}>
            Evening reflection
          </button>
        )}
      </div>

      {showEveningBanner && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 flex items-center justify-between gap-3">
          <span>Time for your evening reflection — how did today go?</span>
          <button className="btn-primary text-xs py-1" onClick={() => setShowEvening(true)}>Start</button>
        </div>
      )}

      <DashboardHome />
    </div>
  )
}
