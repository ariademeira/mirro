import { Link } from 'react-router-dom'

export default function DisclaimerPage() {
  return (
    <div className="max-w-2xl mx-auto prose prose-sm py-8 px-4">
      <h1>AI Disclaimer</h1>
      <p className="text-gray-500 text-xs">Last updated: May 2026 · <Link to="/signup" className="text-blue-600">Back to signup</Link></p>

      <h2>What Mirro is</h2>
      <p>Mirro is a personal reflection tool. It uses AI to identify patterns in the interaction notes you log, and surfaces observations about your professional relationships and communication style.</p>

      <h2>What Mirro is not</h2>
      <ul>
        <li><strong>Not a clinical assessment.</strong> Mirro does not diagnose, assess, or treat any mental health condition. Its output is not therapy and should not be treated as such.</li>
        <li><strong>Not professional advice.</strong> Insights are not a substitute for professional coaching, therapy, HR guidance, or legal advice.</li>
        <li><strong>Not objective truth.</strong> AI-generated insights are probabilistic pattern matches based on the notes you provide. They may be incomplete, incorrect, or miss important context.</li>
        <li><strong>Not about colleagues.</strong> All insights describe your own patterns and behaviors — not diagnoses or assessments of other people.</li>
      </ul>

      <h2>Confidence scores</h2>
      <p>Every insight includes a confidence score. Lower confidence insights have been reviewed by a human before being shown to you. Even high-confidence insights should be treated as prompts for reflection, not conclusions.</p>

      <h2>How to use insights well</h2>
      <p>Use Mirro's observations as starting points for your own reflection. Discuss patterns you find meaningful with a trusted colleague, coach, or therapist who has full context — Mirro only sees what you share with it.</p>
    </div>
  )
}
