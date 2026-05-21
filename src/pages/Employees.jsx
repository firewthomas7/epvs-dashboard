import { useEffect, useState } from 'react'
import { UserPlus, Trash2, Shield, User } from 'lucide-react'
import api from '../api'

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', position: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees')
      setEmployees(res.data.employees || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEmployees() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.post('/employees', form)
      setMessage(`✅ Employee added! Temp password: ${res.data.temp_password}`)
      setForm({ name: '', phone: '', email: '', position: '' })
      setShowForm(false)
      fetchEmployees()
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Error adding employee'))
    } finally { setSaving(false) }
  }

  const handleDelete = async (uuid) => {
    if (!confirm('Remove this employee?')) return
    try {
      await api.delete(`/employees/${uuid}`)
      fetchEmployees()
    } catch {}
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e' }}>Employees</h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>{employees.length} team members</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#0f3460', color: '#fff', border: 'none',
          borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600,
        }}>
          <UserPlus size={18} /> Add Employee
        </button>
      </div>

      {message && (
        <div style={{
          padding: '14px 20px', borderRadius: 10, marginBottom: 20,
          background: message.startsWith('✅') ? '#e8f5e9' : '#fce4ec',
          color: message.startsWith('✅') ? '#2e7d32' : '#c62828',
          fontSize: 14, fontWeight: 500,
        }}>
          {message}
        </div>
      )}

      {showForm && (
        <div style={{
          background: '#fff', borderRadius: 16, padding: 28,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 24,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#1a1a2e' }}>Add New Employee</h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Almaz Tadesse', required: true },
                { label: 'Phone', key: 'phone', type: 'text', placeholder: '0923456789', required: true },
                { label: 'Email (optional)', key: 'email', type: 'email', placeholder: 'almaz@example.com' },
                { label: 'Position', key: 'position', type: 'text', placeholder: 'Cashier' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    required={f.required}
                    style={{
                      width: '100%', padding: '10px 14px',
                      border: '2px solid #e0e0e0', borderRadius: 10,
                      fontSize: 14, outline: 'none',
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} style={{
                background: '#0f3460', color: '#fff', border: 'none',
                borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontWeight: 600,
              }}>
                {saving ? 'Adding...' : 'Add Employee'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                background: '#f0f2f5', color: '#666', border: 'none',
                borderRadius: 10, padding: '10px 24px', cursor: 'pointer',
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employee Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {loading ? (
          <div style={{ color: '#aaa', padding: 40 }}>Loading...</div>
        ) : employees.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: 16, padding: 48,
            textAlign: 'center', color: '#aaa', gridColumn: '1/-1',
          }}>
            <User size={48} style={{ marginBottom: 12, opacity: 0.2 }} />
            <div>No employees yet. Add your first cashier.</div>
          </div>
        ) : employees.map(emp => (
          <div key={emp.id} style={{
            background: '#fff', borderRadius: 16, padding: 24,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 18,
                }}>
                  {emp.user?.name?.charAt(0) || 'E'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1a1a2e' }}>{emp.user?.name}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{emp.position || 'Employee'}</div>
                </div>
              </div>
              <button onClick={() => handleDelete(emp.id)} style={{
                background: '#fce4ec', color: '#c62828', border: 'none',
                borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
              }}>
                <Trash2 size={15} />
              </button>
            </div>

            <div style={{ marginTop: 16, fontSize: 13, color: '#555' }}>
              <div>📞 {emp.user?.phone}</div>
              <div style={{ marginTop: 4 }}>📧 {emp.user?.email}</div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Shield size={12} /> Permissions
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Object.entries(emp.permissions || {}).map(([key, val]) => (
                  <span key={key} style={{
                    padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                    background: val ? '#e8f5e9' : '#f5f5f5',
                    color: val ? '#2e7d32' : '#aaa',
                  }}>
                    {key.replace('can_', '').replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <span style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: emp.is_active ? '#e8f5e9' : '#f5f5f5',
                color: emp.is_active ? '#2e7d32' : '#aaa',
              }}>
                {emp.is_active ? '● Active' : '● Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}