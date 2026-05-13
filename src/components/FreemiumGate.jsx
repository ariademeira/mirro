import { Link } from 'react-router-dom'

export default function FreemiumGate({ reason, onDismiss }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" role="dialog" aria-modal="true" aria-label="Upgrade required">
      <div className="card max-w-sm w-full space-y-4 text-center">
        <div className="text-3xl">✨</div>
        <h2>Upgrade to continue</h2>
        <p className="text-sm text-gray-600">{reason}</p>
        <div className="flex gap-3">
          <button className="btn-ghost flex-1" onClick={onDismiss}>Maybe later</button>
          <Link to="/settings/upgrade" className="btn-primary flex-1">Upgrade</Link>
        </div>
      </div>
    </div>
  )
}
