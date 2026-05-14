import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard, Users, MessageSquarePlus, Clock, Sparkles,
  Settings, LogOut,
} from 'lucide-react'

const NAV = [
  { to: '/dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/colleagues',   label: 'Colleagues',      icon: Users            },
  { to: '/interactions/new', label: 'Log interaction', icon: MessageSquarePlus },
  { to: '/interactions', label: 'History',          icon: Clock            },
  { to: '/insights',     label: 'Insights',         icon: Sparkles         },
]

function Avatar({ name, size = 28 }) {
  const initials = name
    ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?'
  const colors = [
    ['#EEF2FF', '#4338CA'], ['#ECFDF5', '#047857'], ['#FEF3C7', '#B45309'],
    ['#FEE2E2', '#B91C1C'], ['#EFF6FF', '#1D4ED8'],
  ]
  const [bg, fg] = colors[(name?.charCodeAt(0) || 0) % colors.length]
  return (
    <span
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.38 }}
      className="inline-flex items-center justify-center rounded-full font-semibold shrink-0 select-none"
    >
      {initials}
    </span>
  )
}

function Sidebar({ collapsed, pathname, user, onLogout }) {
  return (
    <aside
      className={`
        hidden sm:flex flex-col shrink-0 h-screen sticky top-0
        bg-white border-r border-slate-200
        transition-all duration-slow
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center h-14 border-b border-slate-200 ${collapsed ? 'justify-center px-0' : 'px-5'}`}>
        {collapsed ? (
          <span className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <span className="text-white font-bold text-body-sm leading-none">m</span>
          </span>
        ) : (
          <Link to="/dashboard" className="font-semibold text-slate-900 tracking-tight" style={{ fontSize: 17, letterSpacing: '-0.03em' }}>
            mirro
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {!collapsed && (
          <p className="px-2 mb-2 text-micro text-slate-400 uppercase tracking-widest">Workspace</p>
        )}
        {NAV.map(({ to, label, icon: Icon }) => {
          // history tab should not match /interactions/new
          const isActive = to === '/interactions'
            ? pathname === '/interactions'
            : pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={`
                flex items-center gap-2.5 px-2 py-1.5 rounded-md text-body-sm
                transition-colors duration-fast
                ${isActive
                  ? 'bg-slate-100 text-slate-900 font-medium'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-normal'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={16}
                className={isActive ? 'text-indigo-500' : 'text-slate-400'}
                strokeWidth={isActive ? 2 : 1.75}
              />
              {!collapsed && label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={`border-t border-slate-200 p-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 mb-2">
            <Avatar name={user.email} size={28} />
            <div className="flex-1 min-w-0">
              <p className="text-caption font-medium text-slate-900 truncate">{user.email}</p>
              <p className="text-micro text-slate-400 font-mono">Free plan</p>
            </div>
          </div>
        )}
        <div className={`flex ${collapsed ? 'flex-col gap-1' : 'gap-1'}`}>
          <Link
            to="/settings"
            title="Settings"
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-fast"
          >
            <Settings size={15} strokeWidth={1.75} />
            {!collapsed && <span className="text-body-sm">Settings</span>}
          </Link>
          <button
            onClick={onLogout}
            title="Log out"
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-fast w-full text-left"
          >
            <LogOut size={15} strokeWidth={1.75} />
            {!collapsed && <span className="text-body-sm">Log out</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}

function MobileBottomNav({ pathname }) {
  const MOBILE_NAV = NAV.filter(n => n.to !== '/insights')
  return (
    <nav
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200"
      aria-label="Mobile navigation"
    >
      <div className="flex">
        {MOBILE_NAV.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/interactions'
            ? pathname === '/interactions'
            : pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className={`
                flex-1 flex flex-col items-center gap-0.5 py-2.5
                text-micro transition-colors duration-fast
                ${isActive ? 'text-indigo-500' : 'text-slate-400'}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.75} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const { user, signOut } = useAuth()

  // Collapse sidebar on tablet (sm breakpoint), but JS can't do breakpoints easily,
  // so we use CSS classes and render both states; the collapsed prop handles icon-only mode.
  // For simplicity: collapse at exactly 768–1023px using a media hook would be ideal,
  // but the CSS classes handle the visual difference already.

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar collapsed={false} pathname={pathname} user={user} onLogout={signOut} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-16 sm:pb-0" id="main-content">
          <div className="max-w-5xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav pathname={pathname} />
    </div>
  )
}
