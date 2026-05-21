import { useEffect, useState } from 'react'
import { Search, Filter, CheckCircle, RefreshCw } from 'lucide-react'
import api from '../api'

const statusColors = {
  verified:   { bg: '#e8f5e9', color: '#2e7d32' },
  pending:    { bg: '#fff8e1', color: '#f57f17' },
  suspicious: { bg: '#fce4ec', color: '#c62828' },
  failed:     { bg: '#f5f5f5', color: '#757575' },
  duplicate:  { bg: '#f3e5f5', color: '#6a1b9a' },
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({})

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, per_page: 15 })
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)
      const res = await api.get(`/transactions?${params}`)
      setTransactions(res.data.data || [])
      setMeta({ total: res.data.total, lastPage: res.data.last_page })
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTransactions() }, [page, statusFilter])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchTransactions()
  }

  const handleVerify = async (uuid) => {
    try {
      await api.post(`/transactions/${uuid}/verify`)
      fetchTransactions()
    } catch (e) {
      alert(e.response?.data?.message || 'Error')
    }
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e' }}>Transactions</h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
          {meta.total || 0} total transactions
        </p>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20,
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ref, sender, phone..."
              style={{
                width: '100%', padding: '10px 12px 10px 36px',
                border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 14, outline: 'none',
              }}
            />
          </div>
          <button type="submit" style={{
            background: '#0f3460', color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600,
          }}>
            Search
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          style={{
            padding: '10px 14px', border: '2px solid #e0e0e0',
            borderRadius: 10, fontSize: 14, outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="">All Status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="suspicious">Suspicious</option>
        </select>

        <button onClick={fetchTransactions} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#f0f2f5', border: 'none', borderRadius: 10,
          padding: '10px 16px', cursor: 'pointer', fontSize: 13,
        }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #f0f0f0' }}>
                {['EPVS Ref', 'Sender', 'Bank', 'Source', 'Amount (ETB)', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, color: '#666', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Loading...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>No transactions found</td></tr>
              ) : transactions.map((t) => {
                const s = statusColors[t.status] || statusColors.failed
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f8f8f8', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: 12, color: '#0f3460', fontWeight: 700 }}>
                      {t.epvs_ref}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t.sender_name || '—'}</div>
                      <div style={{ fontSize: 11, color: '#aaa' }}>{t.sender_phone || ''}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#555' }}>{t.bank_code || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: t.source_type === 'telebirr' ? '#e3f2fd' : '#f3e5f5',
                        color: t.source_type === 'telebirr' ? '#1565c0' : '#6a1b9a',
                        padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      }}>
                        {t.source_type}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 15, fontWeight: 800, color: '#1a1a2e' }}>
                      {Number(t.amount).toLocaleString('en', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: s.bg, color: s.color,
                        padding: '4px 10px', borderRadius: 20,
                        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#aaa' }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {t.status === 'pending' && (
                        <button
                          onClick={() => handleVerify(t.uuid)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            background: '#e8f5e9', color: '#2e7d32',
                            border: 'none', borderRadius: 8,
                            padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                          }}
                        >
                          <CheckCircle size={14} /> Verify
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.lastPage > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 20 }}>
            {Array.from({ length: meta.lastPage }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                width: 36, height: 36, borderRadius: 8, border: 'none',
                background: p === page ? '#0f3460' : '#f0f2f5',
                color: p === page ? '#fff' : '#666',
                cursor: 'pointer', fontWeight: 600, fontSize: 13,
              }}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}