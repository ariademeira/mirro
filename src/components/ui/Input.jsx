export function Input({ label, hint, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="label">{label}</label>}
      <input
        className={`${error ? 'input-error' : 'input'} ${className}`}
        {...props}
      />
      {(hint || error) && (
        <p className={`text-caption ${error ? 'text-danger-600' : 'text-slate-500'}`}>
          {error || hint}
        </p>
      )}
    </div>
  )
}

export function Textarea({ label, hint, error, charCount, charLimit, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="label">{label}</label>}
      <textarea
        className={`textarea ${error ? 'border-danger-500 shadow-error' : ''} ${className}`}
        {...props}
      />
      <div className="flex justify-between items-center">
        {(hint || error) && (
          <p className={`text-caption ${error ? 'text-danger-600' : 'text-slate-500'}`}>
            {error || hint}
          </p>
        )}
        {charCount != null && charLimit && (
          <p className="text-caption font-mono text-slate-400 ml-auto">
            {charCount} / {charLimit}
          </p>
        )}
      </div>
    </div>
  )
}

export function Select({ label, hint, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="label">{label}</label>}
      <select
        className={`${error ? 'input-error' : 'input'} ${className}`}
        {...props}
      >
        {children}
      </select>
      {(hint || error) && (
        <p className={`text-caption ${error ? 'text-danger-600' : 'text-slate-500'}`}>
          {error || hint}
        </p>
      )}
    </div>
  )
}
