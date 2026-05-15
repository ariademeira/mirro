import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createColleague } from '../lib/api/colleagues'
import FreemiumGate from '../components/FreemiumGate'
import PhotoUpload from '../components/PhotoUpload'
import { Input, Textarea, Button, Modal } from '../components/ui'

export default function AddColleague() {
  const navigate = useNavigate()
  const [addAnother, setAddAnother] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [gateReason, setGateReason] = useState(null)

  const [form, setForm] = useState({
    name: '', title: '', role: '', company: '', email: '', phone: '', department: '', notes: '', photo_url: '',
  })

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  function reset() {
    setForm({ name: '', title: '', role: '', company: '', email: '', phone: '', department: '', notes: '', photo_url: '' })
    setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await createColleague({
        name: form.name.trim(),
        title: form.title.trim() || undefined,
        role: form.role.trim() || undefined,
        company: form.company.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        department: form.department.trim() || undefined,
        notes: form.notes.trim() || undefined,
        photo_url: form.photo_url || undefined,
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
        maxWidth={580}
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
              <Button type="submit" form="add-colleague-form" loading={loading} disabled={!form.name.trim()}>
                Save colleague
              </Button>
            </div>
          </>
        }
      >
        <form id="add-colleague-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Photo */}
          <PhotoUpload
            colleagueId="new"
            currentPhotoUrl={form.photo_url}
            name={form.name}
            onUploadComplete={url => setForm(f => ({ ...f, photo_url: url }))}
          />

          {/* Basic */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name *"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Maya Chen"
              required
              autoFocus
              className="col-span-2 sm:col-span-1"
            />
            <Input
              label="Job title"
              value={form.title}
              onChange={set('title')}
              placeholder="Engineering Manager"
              className="col-span-2 sm:col-span-1"
            />
            <Input
              label="Role"
              value={form.role}
              onChange={set('role')}
              placeholder="IC, Lead, Manager…"
              className="col-span-2 sm:col-span-1"
            />
            <Input
              label="Department"
              value={form.department}
              onChange={set('department')}
              placeholder="Platform, Brand…"
              className="col-span-2 sm:col-span-1"
            />
            <Input
              label="Company"
              value={form.company}
              onChange={set('company')}
              placeholder="Acme Corp"
              className="col-span-2 sm:col-span-1"
            />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="maya@company.com"
              className="col-span-2 sm:col-span-1"
            />
            <Input
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="+1 555 000 0000"
              className="col-span-2 sm:col-span-1"
            />
          </div>

          {/* Notes */}
          <Textarea
            label="Context (optional)"
            value={form.notes}
            onChange={set('notes')}
            placeholder="What helps you remember — shared history, how they communicate, what they care about…"
            rows={3}
            charCount={form.notes.length}
            charLimit={1000}
          />

          {error && <p className="text-caption text-danger-600" role="alert">{error}</p>}
        </form>
      </Modal>
    </>
  )
}
