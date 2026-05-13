import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getInsights } from '../lib/api/insights'
import EvidenceCard from '../components/EvidenceCard'
import FreemiumGate from '../components/FreemiumGate'
import { framing } from '../config'

export default function InsightFeed({ colleagueId } = {}) {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [gateReason, setGateReason] = useState(null)

  useEffect(() => {
    getInsights({ colleagueId })
      .then(result => {
        if (result.error) {
          setGateReason(result.error.reason)
          return
        }
        setInsights(result.data || [])
      })
      .finally(() => setLoading(false))
  }, [colleagueId])

  if (loading) return <div className="animate-pulse space-y-3">{[1,2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-lg" />)}</div>

  return (
    <>
      {gateReason && <FreemiumGate reason={gateReason} onDismiss={() => setGateReason(null)} />}

      <div className="space-y-4">
        <h2>{framing.userInsights}</h2>

        {insights.length === 0 ? (
          <div className="card text-center py-8 space-y-2">
            <p className="text-2xl">🔍</p>
            <p className="text-gray-600 font-medium">No insights yet</p>
            <p className="text-sm text-gray-400">Log at least 3 interactions with a colleague to start seeing patterns.</p>
            <Link to="/interactions/new" className="btn-secondary text-sm inline-flex mt-2">Log an interaction</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map(i => <EvidenceCard key={i.id} insight={i} />)}
          </div>
        )}
      </div>
    </>
  )
}
