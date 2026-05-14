import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Input } from '../components/ui'

export default function SignupFlow() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consentGiven, setConsentGiven] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('form')

  async function handleSignup(e) {
    e.preventDefault()
    if (!consentGiven) { setError('Please accept the privacy notice to continue.'); return }
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto text-2xl">✉️</div>
          <h1 className="text-h2 text-slate-900">Check your email</h1>
          <p className="text-body-sm text-slate-600">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <Link to="/login" className="btn-secondary w-full justify-center inline-flex">Back to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-semibold text-slate-900" style={{ fontSize: 24, letterSpacing: '-0.03em' }}>mirro</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-5">
          <div>
            <h1 className="text-h2 text-slate-900 mb-1">Create your account</h1>
            <p className="text-body-sm text-slate-500">Understand how you show up in professional relationships.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4" noValidate>
            <Input
              id="email"
              type="email"
              label="Email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <div>
              <Input
                id="password"
                type="password"
                label="Password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                id="consent"
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                checked={consentGiven}
                onChange={e => setConsentGiven(e.target.checked)}
              />
              <span className="text-body-sm text-slate-600">
                I've read and agree to the{' '}
                <Link to="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium" target="_blank">Privacy Notice</Link>
                {' '}and{' '}
                <Link to="/disclaimer" className="text-indigo-600 hover:text-indigo-700 font-medium" target="_blank">AI Disclaimer</Link>.
              </span>
            </label>

            {error && (
              <p className="text-caption text-danger-600" role="alert">{error}</p>
            )}

            <Button type="submit" loading={loading} disabled={!consentGiven} className="w-full justify-center">
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-body-sm text-slate-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
