import { Link } from 'react-router-dom'

const STATUS_BADGE = {
  emerging:    'badge-emerging',
  developing:  'badge-developing',
  established: 'badge-established',
}

export default function ColleagueCard({ colleague }) {
  const { id, name, role, department, profile_status, interaction_count, last_interaction } = colleague

  return (
    <Link to={`/colleagues/${id}`} className="card block hover:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{name}</p>
          {(role || department) && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{[role, department].filter(Boolean).join(' · ')}</p>
          )}
        </div>
        <span className={STATUS_BADGE[profile_status] || 'badge-emerging'}>{profile_status}</span>
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
        <span>{interaction_count} interaction{interaction_count !== 1 ? 's' : ''}</span>
        {last_interaction && (
          <span>Last: {new Date(last_interaction).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        )}
      </div>
    </Link>
  )
}
