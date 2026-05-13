import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createColleague } from '../lib/api/colleagues'
import FreemiumGate from '../components/FreemiumGate'

export default function AddColleague() {
  const navigate = useNavigate()
  const [name, setName]           = useState('')
  const [role, setRole]           = useState('')
  const [department, setDept]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [gateReason, setGateReason] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await createColleague({ name: name.trim(), role: role.trim(), department: department.trim() })
      if (result.error) {
        setGateReason(result.error.reason)
        return
      }
      navigate(`/colleagues/${result.data.id}`)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {gateReason && <FreemiumGate reason={gateReason} onDismiss={() => setGateReason(null)} />}

      <div className="max-w-md mx-auto space-y-6">
        <h1>Add colleague</h1>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name <span aria-hidden>*</span></label>
            <input id="name" type="text" required className="input" value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-gray-400 font-normal">(optional)</span></label>
            <input id="role" type="text" className="input" value={role} onChange={e => setRole(e.target.value)} />
          </div>
          <div>
            <label htmlFor="dept" className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-gray-400 font-normal">(optional)</span></label>
            <input id="dept" type="text" className="input" value={department} onChange={e => setDept(e.target.value)} />
          </div>

          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading || !name.trim()}>
              {loading ? 'Adding…' : 'Add colleague'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
