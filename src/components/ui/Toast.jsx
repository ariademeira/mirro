import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const VARIANTS = {
  success: { bg: 'bg-success-50 border-green-200',  icon: CheckCircle2,   iconColor: 'text-success-500',  text: 'text-success-700'  },
  danger:  { bg: 'bg-danger-50 border-red-200',    icon: XCircle,        iconColor: 'text-danger-500',   text: 'text-danger-700'   },
  warning: { bg: 'bg-warning-50 border-amber-200', icon: AlertTriangle,  iconColor: 'text-warning-500',  text: 'text-warning-700'  },
  info:    { bg: 'bg-info-50 border-blue-200',     icon: Info,           iconColor: 'text-info-500',     text: 'text-info-700'     },
}

const ToastContext = createContext(null)

let _id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, variant = 'info', duration = 4000) => {
    const id = ++_id
    setToasts(prev => [...prev, { id, message, variant }])
    if (duration > 0) {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
    }
    return id
  }, [])

  const dismiss = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => {
          const v = VARIANTS[t.variant] || VARIANTS.info
          const Icon = v.icon
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slideUp max-w-sm ${v.bg}`}
            >
              <Icon size={16} className={`shrink-0 mt-0.5 ${v.iconColor}`} strokeWidth={2} />
              <p className={`text-body-sm font-medium flex-1 ${v.text}`}>{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className={`shrink-0 ${v.text} opacity-60 hover:opacity-100 transition-opacity`}
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
