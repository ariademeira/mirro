import { Link } from 'react-router-dom'

export default function PrivacyNotice() {
  return (
    <div className="max-w-2xl mx-auto prose prose-sm py-8 px-4">
      <h1>Privacy Notice</h1>
      <p className="text-gray-500 text-xs">Last updated: May 2026 · <Link to="/signup" className="text-blue-600">Back to signup</Link></p>

      <h2>What we collect</h2>
      <p>Mirro collects the interaction notes you paste or type, plus the context you provide about colleagues (name, role, department). Your raw notes are stored and processed to generate behavioral insights.</p>

      <h2>How we process your data</h2>
      <p>Your notes are sent to Anthropic's Claude AI API to identify patterns in how you approach professional relationships. Before sending, we remove emails, phone numbers, and personal names from your content (PII masking). Anthropic processes this content under their <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a>.</p>

      <h2>What we don't do</h2>
      <ul>
        <li>We do not sell your data to third parties.</li>
        <li>We do not share individual insights with employers or colleagues.</li>
        <li>We do not use your data to train AI models without explicit consent.</li>
      </ul>

      <h2>Your rights</h2>
      <p>You can delete any interaction or insight at any time. You can request full data export or account deletion from the <Link to="/data-control">Data Control</Link> page.</p>

      <h2>Data storage</h2>
      <p>Data is stored on Supabase (PostgreSQL) with row-level security — only you can access your data. Data is hosted in the EU/US depending on your region.</p>

      <h2>Contact</h2>
      <p>Questions? Email <a href="mailto:privacy@mirro.app">privacy@mirro.app</a>.</p>
    </div>
  )
}
