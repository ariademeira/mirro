import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import AuthGuard from './auth/AuthGuard'
import Layout from './components/Layout'
import { ToastProvider } from './components/ui'

import LoginFlow    from './auth/LoginFlow'
import SignupFlow   from './auth/SignupFlow'
import Dashboard    from './Dashboard'

import ColleagueList   from './colleagues/ColleagueList'
import ColleagueDetail from './colleagues/ColleagueDetail'
import AddColleague    from './colleagues/AddColleague'

import InteractionLogger  from './interactions/InteractionLogger'
import InteractionHistory from './interactions/InteractionHistory'

import InsightFeed  from './insights/InsightFeed'
import ReviewQueue  from './insights/HITL/ReviewQueue'

import UserSettings from './settings/UserSettings'
import UserProfilePage from './pages/UserProfilePage'
import PrivacyNotice    from './legal/PrivacyNotice'
import DisclaimerPage   from './legal/Disclaimer'
import DataControl      from './legal/DataControl'

function ProtectedLayout({ children }) {
  return (
    <AuthGuard>
      <Layout>{children}</Layout>
    </AuthGuard>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"      element={<LoginFlow />} />
          <Route path="/signup"     element={<SignupFlow />} />
          <Route path="/privacy"    element={<PrivacyNotice />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />

          <Route path="/colleagues"       element={<ProtectedLayout><ColleagueList /></ProtectedLayout>} />
          <Route path="/colleagues/new"   element={<ProtectedLayout><AddColleague /></ProtectedLayout>} />
          <Route path="/colleagues/:id"   element={<ProtectedLayout><ColleagueDetail /></ProtectedLayout>} />

          <Route path="/interactions/new" element={<ProtectedLayout><InteractionLogger /></ProtectedLayout>} />
          <Route path="/interactions"     element={<ProtectedLayout><InteractionHistory /></ProtectedLayout>} />

          <Route path="/insights"         element={<ProtectedLayout><InsightFeed /></ProtectedLayout>} />
          <Route path="/admin/hitl"       element={<ProtectedLayout><ReviewQueue /></ProtectedLayout>} />

          <Route path="/profile"          element={<ProtectedLayout><UserProfilePage /></ProtectedLayout>} />
          <Route path="/settings"         element={<ProtectedLayout><UserSettings /></ProtectedLayout>} />
          <Route path="/settings/upgrade" element={<ProtectedLayout><UpgradePlaceholder /></ProtectedLayout>} />
          <Route path="/data-control"     element={<ProtectedLayout><DataControl /></ProtectedLayout>} />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

function UpgradePlaceholder() {
  return (
    <div className="max-w-md mx-auto card text-center py-12 space-y-3">
      <p className="text-3xl">✨</p>
      <h1>Premium</h1>
      <p className="text-gray-500 text-sm">Premium plans are coming soon. You're currently on the free tier.</p>
    </div>
  )
}
