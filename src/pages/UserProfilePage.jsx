import { useState, useEffect } from 'react'
import { getUserProfile, updateUserProfile } from '../lib/api/profile'
import { Input, Textarea, Button, Card } from '../components/ui'

const SENIORITY_OPTIONS = [
  { value: 'individual_contributor', label: 'Individual Contributor' },
  { value: 'lead',      label: 'Lead / Senior' },
  { value: 'manager',   label: 'Manager' },
  { value: 'director',  label: 'Director' },
  { value: 'executive', label: 'Executive (VP+)' },
]

const MAX_OBJECTIVES = 1000

export default function UserProfilePage() {
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(false)

  const [form, setForm] = useState({
    job_title: '', seniority: '', company: '', industry: '', department: '', objectives: '',
  })

  useEffect(() => {
    getUserProfile()
      .then(profile => {
        if (profile) {
          setForm({
            job_title:   profile.job_title   || '',
            seniority:   profile.seniority   || '',
            company:     profile.company     || '',
            industry:    profile.industry    || '',
            department:  profile.department  || '',
            objectives:  profile.objectives  || '',
          })
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await updateUserProfile(form)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 skeleton rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-h1 text-slate-900">Your profile</h1>
        <p className="text-body-sm text-slate-500 mt-1">
          Help Mirro understand your professional context so insights are tailored to you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="space-y-4">
          <h2 className="text-base font-semibold text-slate-800">Professional</h2>

          <Input
            label="Job title"
            value={form.job_title}
            onChange={set('job_title')}
            placeholder="e.g. Engineering Manager"
          />

          <div>
            <label className="label" htmlFor="seniority">Seniority level</label>
            <select
              id="seniority"
              value={form.seniority}
              onChange={set('seniority')}
              className="input w-full"
            >
              <option value="">Select level…</option>
              {SENIORITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Company" value={form.company} onChange={set('company')} placeholder="Acme Corp" />
            <Input label="Industry" value={form.industry} onChange={set('industry')} placeholder="SaaS, Finance…" />
          </div>

          <Input label="Department" value={form.department} onChange={set('department')} placeholder="Engineering, Product…" />
        </Card>

        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-slate-800">Your goals</h2>
          <Textarea
            label="What are you trying to achieve? (optional)"
            value={form.objectives}
            onChange={set('objectives')}
            placeholder={`Examples:\n– Build stronger relationships with my team\n– Navigate organisational politics\n– Prepare for difficult conversations`}
            rows={5}
            charCount={form.objectives.length}
            charLimit={MAX_OBJECTIVES}
          />
          <p className="text-caption text-slate-400">This helps Mirro tailor insights to your specific goals.</p>
        </Card>

        {error   && <p className="text-caption text-danger-600" role="alert">{error}</p>}
        {success && <p className="text-caption text-success-600">Profile saved.</p>}

        <div className="flex justify-end">
          <Button type="submit" loading={saving}>Save profile</Button>
        </div>
      </form>
    </div>
  )
}
