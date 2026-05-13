import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import RitualScheduler from '../ritual/RitualScheduler'

export default function UserSettings() {
  const { user, signOut } = useAuth()

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <h1>Settings</h1>

      <div className="card space-y-3">
        <h2 className="text-base">Account</h2>
        <p className="text-sm text-gray-600">{user?.email}</p>
        <div className="flex gap-3 pt-1">
          <Link to="/settings/upgrade" className="btn-secondary text-sm">Upgrade to Premium</Link>
          <button className="btn-ghost text-sm text-red-600 hover:bg-red-50" onClick={signOut}>Sign out</button>
        </div>
      </div>

      <RitualScheduler />

      <div className="card space-y-2">
        <h2 className="text-base">Your data</h2>
        <p className="text-sm text-gray-500">Download or delete your data at any time.</p>
        <Link to="/data-control" className="btn-secondary text-sm inline-flex">Manage my data</Link>
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <Link to="/privacy" className="hover:underline block">Privacy Notice</Link>
        <Link to="/disclaimer" className="hover:underline block">AI Disclaimer</Link>
      </div>
    </div>
  )
}
