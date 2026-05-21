import { useEffect, useState } from 'react'
import { Building2, Plus, Trash2, Star, Copy } from 'lucide-react'
import api from '../api'

const BANKS = ['CBE', 'AWASH', 'DASHEN', 'TELEBIRR', 'ABYSSINIA', 'WEGAGEN', 'NIB']

export default function BankAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ bank_code: 'CBE', account_number: '', account_name: '', account_type: 'current', is_primary: false })
  const [saving, setSaving] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/merchant/bank-accounts')
      setAccounts(res.data.bank_accounts || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAccounts() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.post('/merchant/bank-accounts', form)
      setWebhookUrl(res.data.webhook_url)
      setForm({ bank_code: 'CBE', account_number: '', account_name: '', account_type: 'current', is_primary: false })
      setShowForm(false)
      fetchAccounts()
    } catch (err) {
      alert(err.response?.data?.message || 'Error')
    } finally { setSaving(false) }
  }

  const handleDelete = async (uuid) => {
    if (!confirm('Unlink this bank account?')) return
    try {
      await api.delete(`/merchant/bank-accounts/${uuid}`)
      fetchAccounts()
    } catch {}
  }

  const bankColors = {
    CBE: '#1a237e', TELEBIRR: '#e65100', AWASH: '#1b5e20',
    DASHEN: '#880e4f', ABYSSINIA: '#4a148c', WEGAGEN: '#bf360c', NIB: '#006064',
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e' }}>Bank Accounts</h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Linked payment accounts</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#0f3460', color: '#fff', border: 'none',
          borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600,
        }}>
          <Plus size={18} /> Link Account
        </button>
      </div>

      {webhookUrl && (
        <div style={{
          background: '#e8f5e9', border: '1px solid #a5d6a7',
          borderRadius: 12, padding: 20, marginBottom: 24,
        }}>
          <div style={{ fontWeight: 700, color: '#2e7d32', marginBottom: 8 }}>
            ✅ Bank account linked! Share this webhook URL with your bank:
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <code style={{
              background: '#fff', padding: '8px 14px', borderRadius: 8,
              fontSize: 13, flex: 1, wordBreak: 'break-all', color: '#1a1a2e',
            }}>
              {webhookUrl}
            </code>
            <button onClick={() => { navigator.clipboard.writeText(webhookUrl) }} style={{
              background: '#2e7d32', color: '#fff', border: 'none',
              borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
            }}>
              <Copy size={14} /> Copy
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{
          background: '#fff', borderRadius: 16, padding: 28,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 24,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#1a1a2e' }}>Link New Bank Account</h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Bank</label>
                <select
                  value={form.bank_code}
                  onChange={e => setForm({ ...form, bank_code: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, outline: 'none' }}
                >
                  {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Account Type</label>
                <select
                  value={form.account_type}
                  onChange={e => setForm({ ...form, account_type: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, outline: 'none' }}
                >
                  <option value="current">Current</option>
                  <option value="savings">Savings</option>
                  <option value="business">Business</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Account Number</label>
                <input
                  type="text" required value={form.account_number}
                  onChange={e => setForm({ ...form, account_number: e.target.value })}
                  placeholder="1000234567890"
                  style={{ width: '100%', padding: '10px 14px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>Account Name</label>
                <input
                  type="text" required value={form.account_name}
                  onChange={e => setForm({ ...form, account_name: e.target.value })}
                  placeholder="My Business Name"
                  style={{ width: '100%', padding: '10px 14px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button type="submit" disabled={saving} style={{
                background: '#0f3460', color: '#fff', border: 'none',
                borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontWeight: 600,
              }}>
                {saving ? 'Linking...' : 'Link Account'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                background: '#f0f2f5', color: '#666', border: 'none',
                borderRadius: 10, padding: '10px 24px', cursor: 'pointer',
              }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {loading ? (
          <div style={{ color: '#aaa' }}>Loading...</div>
        ) : accounts.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: 48, textAlign: 'center', color: '#aaa', gridColumn: '1/-1' }}>
            <Building2 size={48} style={{ marginBottom: 12, opacity: 0.2 }} />
            <div>No bank accounts linked yet.</div>
          </div>
        ) : accounts.map(acc => (
          <div key={acc.id} style={{
            borderRadius: 18, overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}>
            {/* Card top */}
            <div style={{
              background: `linear-gradient(135deg, ${bankColors[acc.bank_code] || '#1a1a2e'}, #0f3460)`,
              padding: '24px 24px 20px',
              color: '#fff',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>BANK</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{acc.bank_name}</div>
                </div>
                {acc.is_primary && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 20, fontSize: 11 }}>
                    <Star size={12} fill="#fff" /> Primary
                  </div>
                )}
              </div>
              <div style={{ marginTop: 20, fontFamily: 'monospace', fontSize: 18, letterSpacing: 2 }}>
                {acc.account_number_masked}
              </div>
              <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>{acc.account_name}</div>
            </div>

            {/* Card bottom */}
            <div style={{ background: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: '#aaa' }}>Type</div>
                <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{acc.account_type}</div>
              </div>
              <div>
                <span style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: acc.is_active ? '#e8f5e9' : '#f5f5f5',
                  color: acc.is_active ? '#2e7d32' : '#aaa',
                }}>
                  {acc.is_active ? '● Active' : '● Inactive'}
                </span>
              </div>
              <button onClick={() => handleDelete(acc.uuid)} style={{
                background: '#fce4ec', color: '#c62828', border: 'none',
                borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
              }}>
                <Trash2 size={13} /> Unlink
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}