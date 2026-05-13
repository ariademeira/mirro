export default function Disclaimer({ className = '' }) {
  return (
    <p className={`disclaimer-bar ${className}`} role="note">
      This AI observation is based on your interaction notes, not a professional assessment.
      Treat insights as prompts for reflection, not definitive conclusions.
    </p>
  )
}
