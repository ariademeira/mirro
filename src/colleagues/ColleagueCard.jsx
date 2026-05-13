import { Link } from 'react-router-dom'

const STATUS_BADGE = {
  emerging:    'badge-emerging',
  developing:  'badge-developing',
  established: 'badge-established',
}

export default function ColleagueCard({ colleague }) {
  const { id, name, role, department, profile_status, interaction_count, last_interaction } = colleague

  return (
    <Link
      to={`/colleagues/${id}`}
      className="card block hover:border-indigo-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded-xl"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{name}</p>
          {(role || department) && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {[role, department].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <span className={STATUS_BADGE[profile_status] || 'badge-emerging'}>
          {profile_status || 'emerging'}
        </span>
      </div>

      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
        <span>{interaction_count || 0} interaction{interaction_count !== 1 ? 's' : ''}</span>
        {last_interaction && (
          <span className="ml-auto">
            {new Date(last_interaction).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </Link>
  )
}
