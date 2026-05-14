import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Input } from '../components/ui'

export default function LoginFlow() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch {
      setError('Incorrect email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-semibold text-slate-900" style={{ fontSize: 24, letterSpacing: '-0.03em' }}>mirro</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-5">
          <div>
            <h1 className="text-h2 text-slate-900 mb-1">Welcome back</h1>
            <p className="text-body-sm text-slate-500">Sign in to your Mirro account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <Input
              id="email"
              type="email"
              label="Email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-describedby={error ? 'login-error' : undefined}
            />
            <Input
              id="password"
              type="password"
              label="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {error && (
              <p id="login-error" className="text-caption text-danger-600" role="alert">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full justify-center">
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-body-sm text-slate-500 mt-5">
          No account yet?{' '}
          <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium">Create one</Link>
        </p>
      </div>
    </div>
  )
}
