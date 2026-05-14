import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Moon } from 'lucide-react'
import MorningPrompt from './ritual/MorningPrompt'
import EveningReflection from './ritual/EveningReflection'
import DashboardHome from './dashboard/DashboardHome'

export default function Dashboard() {
  const [showMorning, setShowMorning] = useState(false)
  const [showEvening, setShowEvening] = useState(false)

  useEffect(() => {
    const lastMorning = localStorage.getItem('mirro_morning_done')
    if (lastMorning !== new Date().toDateString()) {
      setShowMorning(true)
    }
  }, [])

  function completeMorning() {
    localStorage.setItem('mirro_morning_done', new Date().toDateString())
    setShowMorning(false)
  }

  const hour = new Date().getHours()
  const showEveningBanner = hour >= 16 && !showMorning && !showEvening

  return (
    <>
      {/* Ritual overlays rendered outside Layout via portal */}
      {showMorning && createPortal(
        <MorningPrompt onComplete={completeMorning} />,
        document.body
      )}
      {showEvening && createPortal(
        <EveningReflection onComplete={() => setShowEvening(false)} />,
        document.body
      )}

      <div className="space-y-6">
        {/* Evening banner */}
        {showEveningBanner && (
          <div className="flex items-center justify-between gap-3 bg-indigo-50 border border-indigo-200 rounded-lg px-5 py-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <Moon size={16} className="text-indigo-500 shrink-0" strokeWidth={1.75} />
              <p className="text-body-sm text-indigo-800">Time for your evening reflection — how did today go?</p>
            </div>
            <button className="btn-primary shrink-0 text-caption h-btn-sm px-3 rounded-md" onClick={() => setShowEvening(true)}>
              Start
            </button>
          </div>
        )}

        <DashboardHome />
      </div>
    </>
  )
}
