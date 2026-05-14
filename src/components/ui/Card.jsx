import { Avatar } from './Avatar'
import { Badge } from './Badge'

export function Card({ children, className = '', padding = true, hover = false, ...props }) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-lg ${padding ? 'p-5' : ''} shadow-sm ${hover ? 'hover:shadow-md hover:border-slate-300 transition-[border-color,box-shadow] duration-base cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function StatCard({ label, value, delta, deltaTone = 'up', icon: Icon }) {
  const deltaColors = {
    up:   'text-success-700',
    down: 'text-danger-700',
    flat: 'text-slate-500',
  }
  return (
    <Card>
      <div className="flex justify-between items-start mb-3">
        <span className="text-caption font-medium text-slate-500">{label}</span>
        {Icon && <Icon size={16} className="text-slate-300" strokeWidth={1.75} />}
      </div>
      <div className="text-display-xl text-slate-900">{value}</div>
      {delta && (
        <p className={`mt-2.5 text-caption font-mono ${deltaColors[deltaTone]}`}>{delta}</p>
      )}
    </Card>
  )
}

export function ColleagueCard({ name, role, dept, status, count, last, onClick }) {
  return (
    <Card hover onClick={onClick}>
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={name} size={36} />
        <div className="min-w-0 flex-1">
          <p className="text-body-sm font-semibold text-slate-900 truncate" style={{ letterSpacing: '-0.01em' }}>{name}</p>
          <p className="text-caption text-slate-500 mt-0.5 truncate">{role}{dept ? ` · ${dept}` : ''}</p>
        </div>
        <Badge variant={status} dot>{status}</Badge>
      </div>
      <div className="flex justify-between pt-3 border-t border-slate-200 font-mono text-caption">
        <span className="text-slate-500">{count} interactions</span>
        <span className="text-slate-400">{last}</span>
      </div>
    </Card>
  )
}
