const PALETTES = [
  ['#EEF2FF', '#4338CA'],
  ['#ECFDF5', '#047857'],
  ['#FEF3C7', '#B45309'],
  ['#FEE2E2', '#B91C1C'],
  ['#EFF6FF', '#1D4ED8'],
  ['#F3E8FF', '#7E22CE'],
]

export function Avatar({ name, size = 32 }) {
  const initials = name
    ? name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?'
  const [bg, fg] = PALETTES[(name?.charCodeAt(0) || 0) % PALETTES.length]
  return (
    <span
      style={{ width: size, height: size, background: bg, color: fg, fontSize: Math.round(size * 0.38) }}
      className="inline-flex items-center justify-center rounded-full font-semibold shrink-0 select-none leading-none"
    >
      {initials}
    </span>
  )
}
