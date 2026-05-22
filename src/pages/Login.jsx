import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'
import api from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('epvs_token', res.data.token)
      localStorage.setItem('epvs_user', JSON.stringify(res.data.user))
      navigate('/')
    } catch (err) {
      console.error('Full Error Object:', err)
      
      // Extract the most detailed message possible from Laravel
      const detailedMessage = 
        err.response?.data?.message || 
        (err.response?.data && typeof err.response.data === 'string' ? err.response.data : null) ||
        (err.response?.data ? JSON.stringify(err.response.data) : null) || 
        err.message;

      setError(detailedMessage || 'Login failed')

      // Also throw an alert popup so you can easily read long error tracks on mobile
      alert("Backend Error Trace:\n" + (typeof detailedMessage === 'string' ? detailedMessage.substring(0, 500) : detailedMessage))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: 48,
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72,
            background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
            borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <ShieldCheck size={36} color="#00d4ff" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e' }}>EPVS</h1>
          <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>
            Electronic Payment Verification System
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fff0f0', border: '1px solid #ffcdd2',
            borderRadius: 10, padding: '12px 16px',
            color: '#c62828', fontSize: 14, marginBottom: 20,
            wordBreak: 'break-word', overflowY: 'auto', maxHeigth: '150px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
              Email or Phone
            </label>
            <input
              type="text"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="Enter your email or phone"
              required
              style={{
                width: '100%', padding: '12px 16px',
                border: '2px solid #e0e0e0', borderRadius: 10,
                fontSize: 14, outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#0f3460'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%', padding: '12px 44px 12px 16px',
                  border: '2px solid #e0e0e0', borderRadius: 10,
                  fontSize: 14, outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#0f3460'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: 'absolute', right: 12, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#888',
              }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px',
            background: loading ? '#ccc' : 'linear-gradient(135deg, #1a1a2e, #0f3460)',
            color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s',
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: 24, padding: 16,
          background: '#f8f9fa', borderRadius: 10,
          fontSize: 12, color: '#666',
        }}>
          <div style={{ fontWeight: 600, marginBottom: 6, color: '#444' }}>Demo Credentials:</div>
          <div>📧 abebe@selammarket.et</div>
          <div>🔑 Demo@1234!</div>
        </div>
      </div>
    </div>
  )
}
