import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createColleague } from '../lib/api/colleagues'
import FreemiumGate from '../components/FreemiumGate'
import { Input, Textarea, Button, Modal } from '../components/ui'

export default function AddColleague() {
  const navigate = useNavigate()
  const [name, setName]       = useState('')
  const [role, setRole]       = useState('')
  const [dept, setDept]       = useState('')
  const [notes, setNotes]     = useState('')
  const [addAnother, setAddAnother] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [gateReason, setGateReason] = useState(null)

  function reset() {
    setName(''); setRole(''); setDept(''); setNotes(''); setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await createColleague({
        name: name.trim(),
        role: role.trim(),
        department: dept.trim(),
        notes: notes.trim() || undefined,
      })
      if (result.error) { setGateReason(result.error.reason); return }
      if (addAnother) reset()
      else navigate(`/colleagues/${result.data.id}`)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {gateReason && <FreemiumGate reason={gateReason} onDismiss={() => setGateReason(null)} />}

      <Modal
        open
        onClose={() => navigate('/colleagues')}
        title="Add a colleague"
        subtitle="Someone you interact with regularly. Stored only on your account."
        maxWidth={540}
        footer={
          <>
            <label className="flex items-center gap-2 text-body-sm text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={addAnother}
                onChange={e => setAddAnother(e.target.checked)}
                className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
              />
              Add another after saving
            </label>
            <div className="flex gap-2">
              <button type="button" className="btn-tertiary" onClick={() => navigate('/colleagues')}>Cancel</button>
              <Button type="submit" form="add-colleague-form" loading={loading} disabled={!name.trim()}>
                Save colleague
              </Button>
            </div>
          </>
        }
      >
        <form id="add-colleague-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <Input
            label="Name *"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Maya Chen"
            required
            autoFocus
            className="col-span-2 sm:col-span-1"
          />
          <Input
            label="Role"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="e.g. Engineering Manager"
            className="col-span-2 sm:col-span-1"
          />
          <Input
            label="Department"
            value={dept}
            onChange={e => setDept(e.target.value)}
            placeholder="Platform, Brand…"
            className="col-span-2 sm:col-span-1"
          />
          <Input
            label="How often do you interact?"
            placeholder="Daily, weekly, monthly…"
            className="col-span-2 sm:col-span-1"
          />
          <div className="col-span-2">
            <Textarea
              label="Context (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What helps you remember — shared history, what they care about, how they communicate…"
              rows={3}
              charCount={notes.length}
              charLimit={500}
            />
          </div>
          {error && <p className="col-span-2 text-caption text-danger-600" role="alert">{error}</p>}
        </form>
      </Modal>
    </>
  )
}
