import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function DataControl() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const [interactions, colleagues, insights] = await Promise.all([
        supabase.from('interactions').select('*').then(r => r.data),
        supabase.from('colleagues').select('*').then(r => r.data),
        supabase.from('insights').select('*').then(r => r.data),
      ])
      const blob = new Blob([JSON.stringify({ interactions, colleagues, insights }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mirro-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Export failed: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  async function handleDeleteAll() {
    const confirmed = confirm('Delete ALL your data? This cannot be undone. Your account will be removed.')
    if (!confirmed) return
    const doubleConfirm = confirm('Are you sure? All interactions, colleagues, and insights will be permanently deleted.')
    if (!doubleConfirm) return

    setDeleting(true)
    try {
      // Delete in order (FK constraints): insights → interactions → colleagues → user_profile
      await supabase.from('insights').delete().eq('user_id', user.id)
      await supabase.from('interactions').delete().eq('user_id', user.id)
      await supabase.from('colleagues').delete().eq('user_id', user.id)
      await supabase.from('user_profiles').delete().eq('id', user.id)
      await supabase.auth.admin.deleteUser(user.id).catch(() => {}) // best-effort
      await signOut()
      navigate('/')
    } catch (err) {
      alert('Delete failed: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1>My data</h1>
      <p className="text-sm text-gray-500">You own your data. Export or delete it at any time.</p>

      <div className="card space-y-3">
        <h2 className="text-base">Export data</h2>
        <p className="text-sm text-gray-600">Download all your interactions, colleagues, and insights as JSON.</p>
        <button className="btn-secondary" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting…' : 'Download my data'}
        </button>
      </div>

      <div className="card space-y-3 border-red-200">
        <h2 className="text-base text-red-700">Delete all data</h2>
        <p className="text-sm text-gray-600">Permanently delete your account and all associated data. This cannot be undone.</p>
        <button className="btn-secondary text-red-600 hover:bg-red-50 border-red-300" onClick={handleDeleteAll} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete my account and data'}
        </button>
      </div>
    </div>
  )
}
