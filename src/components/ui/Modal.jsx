import { X } from 'lucide-react'
import { useEffect } from 'react'

export function Modal({ open, onClose, title, subtitle, children, footer, maxWidth = 540 }) {
  useEffect(() => {
    if (!open) return
    const handler = e => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40"
      onClick={e => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full animate-slideUp"
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || onClose) && (
          <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200">
            <div>
              {title && (
                <h2 id="modal-title" className="text-h2 text-slate-900">{title}</h2>
              )}
              {subtitle && <p className="text-body-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100 ml-4 shrink-0"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth={400}
      footer={
        <>
          <span />
          <div className="flex gap-2 ml-auto">
            <button onClick={onClose} className="btn-tertiary">Cancel</button>
            <button onClick={onConfirm} className={danger ? 'btn-danger' : 'btn-primary'}>
              {confirmLabel}
            </button>
          </div>
        </>
      }
    >
      {message && <p className="text-body text-slate-600">{message}</p>}
    </Modal>
  )
}
