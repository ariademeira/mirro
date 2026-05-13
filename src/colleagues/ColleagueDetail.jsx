import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getColleague, updateColleague, deleteColleague } from '../lib/api/colleagues'
import { getInteractions } from '../lib/api/interactions'
import { getInsights } from '../lib/api/insights'
import EvidenceCard from '../components/EvidenceCard'
import { framing } from '../config'

export default function ColleagueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [colleague, setColleague] = useState(null)
  const [interactions, setInteractions] = useState([])
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editDept, setEditDept] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    Promise.all([
      getColleague(id),
      getInteractions({ colleagueId: id }),
      getInsights({ colleagueId: id }),
    ]).then(([c, i, ins]) => {
      setColleague(c)
      setInteractions(i)
      setInsights(ins.data || [])
    }).finally(() => setLoading(false))
  }, [id])

  function startEdit() {
    setEditName(colleague.name)
    setEditRole(colleague.role || '')
    setEditDept(colleague.department || '')
    setSaveError(null)
    setEditing(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!editName.trim()) return
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await updateColleague(id, {
        name: editName.trim(),
        role: editRole.trim() || null,
        department: editDept.trim() || null,
      })
      setColleague(updated)
      setEditing(false)
    } catch (err) {
      setSaveError(err.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteColleague(id)
      navigate('/colleagues')
    } catch (err) {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded-lg w-1/3" />
      <div className="h-32 bg-gray-100 rounded-xl" />
    </div>
  )
  if (!colleague) return <p className="text-sm text-red-600">Colleague not found.</p>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link to="/colleagues" className="btn-ghost text-sm px-2 py-1.5 mt-0.5" aria-label="Back to colleagues">
          ←
        </Link>
        <div className="flex-1">
          {editing ? (
            <form onSubmit={handleSave} className="card space-y-4">
              <h2>Edit colleague</h2>
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name <span aria-hidden>*</span>
                </label>
                <input id="edit-name" type="text" required className="input" value={editName} onChange={e => setEditName(e.target.value)} autoFocus />
              </div>
              <div>
                <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <input id="edit-role" type="text" className="input" value={editRole} onChange={e => setEditRole(e.target.value)} />
              </div>
              <div>
                <label htmlFor="edit-dept" className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                <input id="edit-dept" type="text" className="input" value={editDept} onChange={e => setEditDept(e.target.value)} />
              </div>
              {saveError && <p className="text-sm text-red-600" role="alert">{saveError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" className="btn-secondary flex-1" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={saving || !editName.trim()}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1>{colleague.name}</h1>
                {(colleague.role || colleague.department) && (
                  <p className="text-gray-500 text-sm mt-1">
                    {[colleague.role, colleague.department].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary text-sm" onClick={startEdit}>Edit</button>
                <Link to={`/interactions/new?colleague=${id}`} className="btn-primary text-sm">+ Log</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {!editing && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-3xl font-bold text-indigo-600">{colleague.interaction_count || 0}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">Interactions</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-indigo-600">{insights.length}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">Insights</p>
          </div>
          <div className="card text-center">
            <p className="text-sm font-semibold text-gray-700 capitalize mt-1">
              {colleague.profile_status || 'emerging'}
            </p>
            <p className="text-xs text-gray-500 mt-1 font-medium">Profile status</p>
          </div>
        </div>
      )}

      {/* Insights */}
      {!editing && insights.length > 0 && (
        <section>
          <h2 className="mb-4">{framing.userInsights}</h2>
          <div className="space-y-3">
            {insights.map(i => <EvidenceCard key={i.id} insight={i} />)}
          </div>
        </section>
      )}

      {/* Recent interactions */}
      {!editing && (
        <section>
          <h2 className="mb-4">Recent interactions</h2>
          {interactions.length === 0 ? (
            <div className="empty-state">
              <p className="text-gray-500 text-sm">No interactions logged yet.</p>
              <Link to={`/interactions/new?colleague=${id}`} className="btn-secondary text-sm inline-flex mt-4">
                Log first interaction
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {interactions.slice(0, 10).map(i => (
                <div key={i.id} className="card py-4">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                    <span className="capitalize font-medium">{i.interaction_type.replace('_', ' ')}</span>
                    <span>{new Date(i.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">{i.raw_content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Delete */}
      {!editing && (
        <div className="pt-4 border-t border-gray-100">
          {confirmDelete ? (
            <div className="card border-red-200 bg-red-50 space-y-3">
              <p className="text-sm text-red-700 font-semibold">Delete {colleague.name}?</p>
              <p className="text-xs text-red-600">
                This will permanently remove the colleague and all associated data. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button className="btn-ghost flex-1 text-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
                <button
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn-ghost text-sm text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => setConfirmDelete(true)}
            >
              Delete colleague
            </button>
          )}
        </div>
      )}
    </div>
  )
}
