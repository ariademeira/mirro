import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Pencil, Trash2, MessageSquarePlus } from 'lucide-react'
import { getColleague, updateColleague, deleteColleague } from '../lib/api/colleagues'
import { getInteractions } from '../lib/api/interactions'
import { getInsights } from '../lib/api/insights'
import EvidenceCard from '../components/EvidenceCard'
import { Avatar, Badge, Button, Card, Input, ConfirmDialog } from '../components/ui'
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
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-slate-100 rounded-lg w-1/3" />
      <div className="h-32 bg-slate-100 rounded-lg" />
    </div>
  )
  if (!colleague) return <p className="text-body-sm text-danger-600">Colleague not found.</p>

  const status = colleague.profile_status || 'emerging'

  return (
    <>
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title={`Delete ${colleague.name}?`}
        message="This will permanently remove the colleague and all associated data. This cannot be undone."
        confirmLabel={deleting ? 'Deleting…' : 'Yes, delete'}
        danger
      />

      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-caption text-slate-500">
          <Link to="/colleagues" className="hover:text-slate-700 transition-colors">Colleagues</Link>
          <ChevronRight size={12} className="text-slate-400" />
          <span className="text-slate-900">{colleague.name}</span>
        </div>

        {/* Header */}
        {editing ? (
          <Card>
            <form onSubmit={handleSave} className="space-y-4">
              <h2 className="text-h2 text-slate-900 mb-4">Edit colleague</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Name *" value={editName} onChange={e => setEditName(e.target.value)} required autoFocus className="col-span-2 sm:col-span-1" />
                <Input label="Role" value={editRole} onChange={e => setEditRole(e.target.value)} className="col-span-2 sm:col-span-1" />
                <Input label="Department" value={editDept} onChange={e => setEditDept(e.target.value)} className="col-span-2" />
              </div>
              {saveError && <p className="text-caption text-danger-600" role="alert">{saveError}</p>}
              <div className="flex gap-2 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                <Button type="submit" loading={saving} disabled={!editName.trim()}>Save changes</Button>
              </div>
            </form>
          </Card>
        ) : (
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Avatar name={colleague.name} size={56} />
              <div>
                <h1 className="text-h1 text-slate-900">{colleague.name}</h1>
                <div className="flex items-center gap-2.5 mt-1.5">
                  {(colleague.role || colleague.department) && (
                    <span className="text-body-sm text-slate-500">
                      {[colleague.role, colleague.department].filter(Boolean).join(' · ')}
                    </span>
                  )}
                  <Badge variant={status} dot>{status}</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={Pencil} onClick={startEdit}>Edit</Button>
              <Button variant="danger" size="sm" icon={Trash2} onClick={() => setConfirmDelete(true)}>Delete</Button>
              <Link to={`/interactions/new?colleague=${id}`} className="btn-primary inline-flex items-center gap-2 h-btn-sm px-3 text-caption">
                <MessageSquarePlus size={14} strokeWidth={1.75} />
                Log interaction
              </Link>
            </div>
          </div>
        )}

        {/* Stats row */}
        {!editing && (
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center">
              <p className="text-display-xl text-indigo-500">{colleague.interaction_count || 0}</p>
              <p className="text-caption text-slate-500 mt-1 font-medium">Interactions</p>
            </Card>
            <Card className="text-center">
              <p className="text-display-xl text-indigo-500">{insights.length}</p>
              <p className="text-caption text-slate-500 mt-1 font-medium">Insights</p>
            </Card>
            <Card className="text-center">
              <p className="text-body-sm font-semibold text-slate-700 capitalize mt-2">{status}</p>
              <p className="text-caption text-slate-500 mt-1 font-medium">Status</p>
            </Card>
          </div>
        )}

        {/* Insights */}
        {!editing && insights.length > 0 && (
          <section>
            <h2 className="text-h3 text-slate-900 mb-3">{framing.userInsights}</h2>
            <div className="space-y-3">
              {insights.map(i => <EvidenceCard key={i.id} insight={i} />)}
            </div>
          </section>
        )}

        {/* Interaction history */}
        {!editing && (
          <section>
            <h2 className="text-h3 text-slate-900 mb-3">Interactions</h2>
            {interactions.length === 0 ? (
              <div className="empty-state">
                <p className="text-body text-slate-500">No interactions logged yet.</p>
                <Link to={`/interactions/new?colleague=${id}`} className="btn-secondary inline-flex mt-4 text-body-sm">
                  Log first interaction
                </Link>
              </div>
            ) : (
              <Card padding={false}>
                <div className="divide-y divide-slate-100">
                  {interactions.slice(0, 10).map(i => (
                    <div key={i.id} className="px-5 py-4">
                      <div className="flex items-center justify-between text-caption text-slate-400 mb-1.5">
                        <div className="flex items-center gap-2">
                          <Badge variant="neutral">{i.interaction_type.replace('_', ' ')}</Badge>
                          {i.mood_signal && <span className="capitalize text-slate-400">{i.mood_signal}</span>}
                        </div>
                        <span className="font-mono">{new Date(i.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <p className="text-body-sm text-slate-700 line-clamp-3 leading-relaxed">{i.raw_content}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </section>
        )}
      </div>
    </>
  )
}
