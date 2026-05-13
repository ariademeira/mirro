export default function ConfidenceIndicator({ score }) {
  if (score === null || score === undefined) return null

  const pct = Math.round(score * 100)
  const level = pct >= 70 ? 'high' : pct >= 50 ? 'medium' : 'low'
  const colorClass = {
    high:   'bg-green-500',
    medium: 'bg-blue-500',
    low:    'bg-amber-500',
  }[level]
  const textClass = {
    high:   'text-green-700',
    medium: 'text-blue-700',
    low:    'text-amber-700',
  }[level]

  return (
    <div className="flex items-center gap-2" aria-label={`Confidence: ${pct}%`}>
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-medium tabular-nums ${textClass}`}>{pct}%</span>
    </div>
  )
}
