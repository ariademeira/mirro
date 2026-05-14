const VARIANTS = {
  emerging:    'bg-slate-100 text-slate-600',
  developing:  'bg-indigo-50 text-indigo-700',
  established: 'bg-success-50 text-success-700',
  success:     'bg-success-50 text-success-700',
  danger:      'bg-danger-50 text-danger-700',
  warning:     'bg-warning-50 text-warning-700',
  info:        'bg-info-50 text-info-700',
  neutral:     'bg-slate-100 text-slate-600',
}

const DOT_COLORS = {
  emerging:    'bg-slate-400',
  developing:  'bg-indigo-500',
  established: 'bg-success-500',
  success:     'bg-success-500',
  danger:      'bg-danger-500',
  warning:     'bg-warning-500',
  info:        'bg-info-500',
  neutral:     'bg-slate-400',
}

export function Badge({ variant = 'neutral', dot, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-caption font-medium ${VARIANTS[variant]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_COLORS[variant]}`} />}
      {children}
    </span>
  )
}
