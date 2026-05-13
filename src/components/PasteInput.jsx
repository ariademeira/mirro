export default function PasteInput({
  value,
  onChange,
  placeholder = 'Paste a Slack message, email, or describe what happened…',
  rows = 6,
  maxLength = 5000,
  label = 'Interaction notes',
  hint = 'Copy-paste works great here.',
  id = 'paste-input',
}) {
  const charsUsed = value?.length || 0
  const charsLeft = maxLength - charsUsed

  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <textarea
        id={id}
        className="textarea"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={maxLength}
        aria-describedby={`${id}-hint ${id}-count`}
      />
      <div className="flex justify-between items-center mt-1">
        <p id={`${id}-hint`} className="text-xs text-gray-400">{hint}</p>
        {charsUsed > 0 && (
          <p id={`${id}-count`} className={`text-xs tabular-nums ${charsLeft < 200 ? 'text-amber-600' : 'text-gray-400'}`}>
            {charsUsed.toLocaleString()} / {maxLength.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )
}
