import { useEffect, useState, useRef, useCallback } from 'react'
import {
  TrendingUp, ArrowLeftRight, Clock, AlertTriangle,
  RefreshCw, CheckCircle, Zap, Volume2, Bell, X
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import api from '../api'

// ── Voice Announcement ─────────────────────────────────────
function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.rate = 0.9
  utter.pitch = 1
  utter.volume = 1
  window.speechSynthesis.speak(utter)
}

// ── Alert Popup ────────────────────────────────────────────
function PaymentAlert({ alert, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      background: '#fff', borderRadius: 16,
      boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      padding: '20px 24px', minWidth: 320, maxWidth: 400,
      borderLeft: '5px solid #2e7d32',
      animation: 'slideIn 0.4s ease',
    }}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: '#e8f5e9', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircle size={24} color="#2e7d32" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>💰 PAYMENT RECEIVED</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#1a1a2e', marginTop: 2 }}>
              ETB {Number(alert.amount).toLocaleString('en', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: '#aaa',
        }}>
          <X size={18} />
        </button>
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: '#555' }}>
        <div>👤 <strong>{alert.sender_name || 'Unknown sender'}</strong></div>
        <div style={{ marginTop: 4 }}>🏦 {alert.bank_name} · {alert.source_type}</div>
        <div style={{ marginTop: 4 }}>🔖 {alert.epvs_ref}</div>
      </div>
      <div style={{
        marginTop: 14, height: 3, background: '#e8f5e9', borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', background: '#2e7d32', borderRadius: 3,
          animation: 'shrink 6s linear forwards',
          width: '100%',
        }} />
      </div>
      <style>{`
        @keyframes shrink { from { width: 100%; } to { width: 0%; } }
      `}</style>
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────────
function StatCard({ title, value, subtitle, icon: Icon, color, bg }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 24,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      display: 'flex', alignItems: 'flex-start', gap: 16,
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: bg, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', marginTop: 4 }}>{value}</div>
        {subtitle && <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  )
}

const statusColors = {
  verified:   { bg: '#e8f5e9', color: '#2e7d32' },
  pending:    { bg: '#fff8e1', color: '#f57f17' },
  suspicious: { bg: '#fce4ec', color: '#c62828' },
  failed:     { bg: '#f5f5f5', color: '#757575' },
}

// ── Simulate Payment Modal ─────────────────────────────────
function SimulateModal({ onClose, onSuccess, webhookToken }) {
  const [form, setForm] = useState({
    amount: '500', sender_name: 'Tigist Alemu',
    sender_phone: '0923456789', reference: 'CBE-TXN-' + Date.now(),
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(`/webhooks/bank/${webhookToken}`, {
        ...form,
        amount: parseFloat(form.amount),
        currency: 'ETB',
        sender_account: '1000987654321',
      })
      onSuccess({ ...form, amount: form.amount, epvs_ref: 'Simulated', bank_name: 'CBE', source_type: 'bank_api' })
      onClose()
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message))
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: 32,
        width: '100%', maxWidth: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Simulate Payment</h3>
            <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Test incoming bank notification</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Amount (ETB)', key: 'amount', type: 'number', placeholder: '500' },
            { label: 'Sender Name', key: 'sender_name', type: 'text', placeholder: 'Tigist Alemu' },
            { label: 'Sender Phone', key: 'sender_phone', type: 'text', placeholder: '0923456789' },
            { label: 'Bank Reference', key: 'reference', type: 'text', placeholder: 'CBE-TXN-001' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
                {f.label}
              </label>
              <input
                type={f.type} value={form[f.key]} required
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                style={{
                  width: '100%', padding: '10px 14px',
                  border: '2px solid #e0e0e0', borderRadius: 10,
                  fontSize: 14, outline: 'none',
                }}
              />
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="submit" disabled={loading} style={{
              flex: 1, background: '#2e7d32', color: '#fff',
              border: 'none', borderRadius: 10, padding: '12px',
              fontWeight: 700, cursor: 'pointer', fontSize: 14,
            }}>
              {loading ? 'Sending...' : '⚡ Send Payment'}
            </button>
            <button type="button" onClick={onClose} style={{
              background: '#f0f2f5', color: '#666', border: 'none',
              borderRadius: 10, padding: '12px 20px', cursor: 'pointer',
            }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [alert, setAlert] = useState(null)
  const [showSimulate, setShowSimulate] = useState(false)
  const [webhookToken, setWebhookToken] = useState('a07fd301c0c3340fded5c48f5e71d9757c4b0be758f15dd29ed592242d37f3ac')
  const [notifications, setNotifications] = useState([])
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const prevCountRef = useRef(0)
  const user = JSON.parse(localStorage.getItem('epvs_user') || '{}')

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, txRes] = await Promise.all([
        api.get('/transactions/stats'),
        api.get('/transactions?per_page=10'),
      ])
      const newStats = statsRes.data.stats
      const newTxs   = txRes.data.data || []

      // Detect new transaction
      const newCount = newStats.total_count + newStats.pending
      if (prevCountRef.current > 0 && newCount > prevCountRef.current && newTxs.length > 0) {
        const newest = newTxs[0]
        setAlert(newest)
        setNotifications(prev => [newest, ...prev].slice(0, 20))
        if (voiceEnabled) {
          const amt = Number(newest.amount).toLocaleString('en')
          const sender = newest.sender_name || 'a customer'
          speak(`${amt} birr received from ${sender}`)
        }
      }
      prevCountRef.current = newCount

      setStats(newStats)
      setTransactions(newTxs)
      setLastUpdated(new Date())
    } catch {}
    finally { setLoading(false) }
  }, [voiceEnabled])

  // Fetch webhook token
  useEffect(() => {
    api.get('/merchant/bank-accounts').then(res => {
      const accounts = res.data.bank_accounts || []
      // We don't get the token from API (hidden for security)
      // Use tinker to get it, or store it after linking
    }).catch(() => {})
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 8000) // poll every 8s
    return () => clearInterval(interval)
  }, [fetchData])

  const handleSimulateSuccess = (paymentData) => {
    setAlert(paymentData)
    setNotifications(prev => [paymentData, ...prev].slice(0, 20))
    if (voiceEnabled) {
      const amt = Number(paymentData.amount).toLocaleString('en')
      const sender = paymentData.sender_name || 'a customer'
      speak(`${amt} birr received from ${sender}`)
    }
    setTimeout(fetchData, 1000)
  }

  const chartData = (() => {
    const days = {}
    transactions.forEach(t => {
      const day = new Date(t.created_at).toLocaleDateString('en-US', { weekday: 'short' })
      if (!days[day]) days[day] = { day, amount: 0, count: 0 }
      days[day].amount += parseFloat(t.amount)
      days[day].count += 1
    })
    return Object.values(days).slice(-7)
  })()

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <RefreshCw size={40} color="#0f3460" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        <div style={{ marginTop: 12, color: '#666' }}>Loading EPVS dashboard...</div>
      </div>
    </div>
  )

  return (
    <div style={{ padding: 32 }}>
      {/* Payment Alert Popup */}
      {alert && <PaymentAlert alert={alert} onClose={() => setAlert(null)} />}

      {/* Simulate Modal */}
      {showSimulate && (
        <SimulateModal
          onClose={() => setShowSimulate(false)}
          onSuccess={handleSimulateSuccess}
          webhookToken={webhookToken}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e' }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
            {user.merchant?.epvs_id || 'EPVS'} · Auto-refreshes every 8 seconds · {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Voice toggle */}
          <button onClick={() => setVoiceEnabled(!voiceEnabled)} title="Toggle voice" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: voiceEnabled ? '#e8f5e9' : '#f5f5f5',
            color: voiceEnabled ? '#2e7d32' : '#aaa',
            border: `2px solid ${voiceEnabled ? '#a5d6a7' : '#e0e0e0'}`,
            borderRadius: 10, padding: '9px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}>
            <Volume2 size={16} />
            {voiceEnabled ? 'Voice ON' : 'Voice OFF'}
          </button>

          {/* Simulate payment */}
          <button onClick={() => setShowSimulate(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'linear-gradient(135deg, #2e7d32, #1b5e20)',
            color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 18px',
            cursor: 'pointer', fontSize: 13, fontWeight: 700,
            boxShadow: '0 4px 12px rgba(46,125,50,0.3)',
          }}>
            <Zap size={16} /> Simulate Payment
          </button>

          {/* Refresh */}
          <button onClick={fetchData} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#0f3460', color: '#fff',
            border: 'none', borderRadius: 10, padding: '10px 18px',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 20, marginBottom: 32,
      }}>
        <StatCard title="Today's Revenue"
          value={`ETB ${Number(stats?.today_amount || 0).toLocaleString('en', { minimumFractionDigits: 2 })}`}
          subtitle={`${stats?.today_count || 0} transactions today`}
          icon={TrendingUp} color="#0f3460" bg="#e8eaf6" />
        <StatCard title="Total Revenue"
          value={`ETB ${Number(stats?.total_amount || 0).toLocaleString('en', { minimumFractionDigits: 2 })}`}
          subtitle={`${stats?.total_count || 0} total verified`}
          icon={CheckCircle} color="#2e7d32" bg="#e8f5e9" />
        <StatCard title="Pending"
          value={stats?.pending || 0}
          subtitle="Awaiting verification"
          icon={Clock} color="#f57f17" bg="#fff8e1" />
        <StatCard title="Suspicious"
          value={stats?.suspicious || 0}
          subtitle="Needs review"
          icon={AlertTriangle} color="#c62828" bg="#fce4ec" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 32 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 20 }}>Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f3460" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0f3460" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`ETB ${Number(v).toFixed(2)}`, 'Amount']} />
              <Area type="monotone" dataKey="amount" stroke="#0f3460" strokeWidth={2} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 20 }}>Transactions/Day</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#00d4ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Notifications + Transactions side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

        {/* Recent Transactions Table */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>Recent Transactions</h3>
            <a href="/transactions" style={{ fontSize: 13, color: '#0f3460', fontWeight: 600, textDecoration: 'none' }}>
              View All →
            </a>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  {['EPVS Ref', 'Sender', 'Amount', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#888', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const s = statusColors[t.status] || statusColors.failed
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f8f8f8' }}>
                      <td style={{ padding: '12px', fontSize: 12, fontFamily: 'monospace', color: '#0f3460', fontWeight: 600 }}>
                        {t.epvs_ref}
                      </td>
                      <td style={{ padding: '12px', fontSize: 13 }}>
                        <div style={{ fontWeight: 600 }}>{t.sender_name || 'Unknown'}</div>
                        <div style={{ fontSize: 11, color: '#aaa' }}>{t.sender_phone}</div>
                      </td>
                      <td style={{ padding: '12px', fontSize: 14, fontWeight: 800 }}>
                        ETB {Number(t.amount).toLocaleString('en', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: s.bg, color: s.color,
                          padding: '4px 10px', borderRadius: 20,
                          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                        }}>{t.status}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Notification Feed */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Bell size={18} color="#0f3460" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>Live Alerts</h3>
            {notifications.length > 0 && (
              <span style={{
                background: '#c62828', color: '#fff',
                borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700,
              }}>{notifications.length}</span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#aaa' }}>
              <Bell size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
              <div style={{ fontSize: 13 }}>No alerts yet</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Use "Simulate Payment" to test</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
              {notifications.map((n, i) => (
                <div key={i} style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: '#f8f9fa', borderLeft: '3px solid #2e7d32',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e' }}>
                    ETB {Number(n.amount).toLocaleString('en', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: 12, color: '#555', marginTop: 3 }}>
                    {n.sender_name || 'Unknown'} · {n.bank_code || n.bank_name || 'CBE'}
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
