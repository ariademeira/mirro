import { Button } from './Button'

export function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
      {Icon && (
        <span className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-500 mb-4">
          <Icon size={26} strokeWidth={1.5} />
        </span>
      )}
      {title && <h3 className="text-h3 text-slate-900 mb-2">{title}</h3>}
      {description && (
        <p className="text-body text-slate-500 max-w-sm leading-relaxed mb-6">{description}</p>
      )}
      {action && actionLabel && (
        <Button onClick={action}>{actionLabel}</Button>
      )}
    </div>
  )
}
