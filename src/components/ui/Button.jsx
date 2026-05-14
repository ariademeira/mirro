import { Loader2 } from 'lucide-react'

const BASE = 'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors duration-fast focus:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed shrink-0'

const VARIANTS = {
  primary:   'bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700 disabled:bg-indigo-100 disabled:text-indigo-300',
  secondary: 'bg-white border border-slate-300 text-slate-900 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-200',
  tertiary:  'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 disabled:text-slate-300',
  danger:    'bg-white border border-red-200 text-danger-600 hover:bg-danger-50 hover:border-red-300 active:bg-danger-100 disabled:opacity-50',
}

const SIZES = {
  sm: 'h-btn-sm px-2.5 text-caption',
  md: 'h-btn-md px-4 text-body-sm',
  lg: 'h-btn-lg px-5 text-body-lg',
}

export function Button({ variant = 'primary', size = 'md', loading, icon: Icon, children, className = '', ...props }) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading
        ? <Loader2 size={size === 'sm' ? 13 : size === 'lg' ? 17 : 15} className="animate-spin" />
        : Icon && <Icon size={size === 'sm' ? 13 : size === 'lg' ? 17 : 15} strokeWidth={1.75} />
      }
      {children}
    </button>
  )
}
