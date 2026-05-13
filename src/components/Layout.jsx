import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NAV = [
  { to: '/dashboard',    label: 'Dashboard'    },
  { to: '/colleagues',   label: 'Colleagues'   },
  { to: '/interactions', label: 'Interactions' },
  { to: '/insights',     label: 'Insights'     },
  { to: '/settings',     label: 'Settings'     },
]

const MOBILE_NAV = NAV.filter(n => n.to !== '/insights')

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="font-bold text-gray-900 text-lg tracking-tight">
            mirro
          </Link>
          <nav className="hidden sm:flex items-center gap-1" aria-label="Main navigation">
            {NAV.map(n => (
              <Link
                key={n.to}
                to={n.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(n.to)
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                aria-current={pathname.startsWith(n.to) ? 'page' : undefined}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          {user && (
            <span className="hidden sm:block text-xs text-gray-400 truncate max-w-[160px]">
              {user.email}
            </span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-8 pb-24 sm:pb-8" id="main-content">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-40" aria-label="Mobile navigation">
        <div className="flex">
          {MOBILE_NAV.map(n => (
            <Link
              key={n.to}
              to={n.to}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                pathname.startsWith(n.to) ? 'text-indigo-600' : 'text-gray-500'
              }`}
              aria-current={pathname.startsWith(n.to) ? 'page' : undefined}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
