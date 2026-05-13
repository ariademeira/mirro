import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function SignupFlow() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consentGiven, setConsentGiven] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('form') // 'form' | 'consent' | 'verify'

  async function handleSignup(e) {
    e.preventDefault()
    if (!consentGiven) {
      setError('Please accept the privacy notice to continue.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await signUp(email, password)
      setStep('verify')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card max-w-md w-full text-center space-y-4">
          <div className="text-4xl">✉️</div>
          <h1>Check your email</h1>
          <p className="text-gray-600">
            We sent a confirmation link to <strong>{email}</strong>.
            Click it to activate your account.
          </p>
          <Link to="/login" className="btn-secondary w-full">Back to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card max-w-md w-full space-y-6">
        <div>
          <h1 className="mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm">Understand how you show up in professional relationships.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              aria-describedby={error ? 'form-error' : undefined}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">At least 8 characters</p>
          </div>

          <div className="flex items-start gap-3">
            <input
              id="consent"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={consentGiven}
              onChange={e => setConsentGiven(e.target.checked)}
            />
            <label htmlFor="consent" className="text-sm text-gray-600">
              I have read and agree to the{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline" target="_blank">Privacy Notice</Link>
              {' '}and{' '}
              <Link to="/disclaimer" className="text-blue-600 hover:underline" target="_blank">AI Disclaimer</Link>.
            </label>
          </div>

          {error && (
            <p id="form-error" className="text-sm text-red-600" role="alert">{error}</p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
