import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, Users,
  Building2, LogOut, ShieldCheck, Menu, X
} from 'lucide-react'
import { useState } from 'react'
import api from '../api'

export default function Layout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const user = JSON.parse(localStorage.getItem('epvs_user') || '{}')

  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    localStorage.clear()
    navigate('/login')
  }

  const navItems = [
    { to: '/',              icon: LayoutDashboard, label: 'Dashboard'     },
    { to: '/transactions',  icon: ArrowLeftRight,  label: 'Transactions'  },
    { to: '/employees',     icon: Users,           label: 'Employees'     },
    { to: '/bank-accounts', icon: Building2,       label: 'Bank Accounts' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 260 : 70,
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s',
        overflow: 'hidden',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <ShieldCheck size={32} color="#00d4ff" />
          {sidebarOpen && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#00d4ff' }}>EPVS</div>
              <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>Payment Verification</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              marginLeft: 'auto', background: 'none',
              border: 'none', color: '#fff', cursor: 'pointer',
            }}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 8px' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                marginBottom: 4,
                textDecoration: 'none',
                color: isActive ? '#00d4ff' : 'rgba(255,255,255,0.7)',
                background: isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              })}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              {sidebarOpen && label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          {sidebarOpen && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                {user.name || 'Merchant'}
              </div>
              <div style={{ fontSize: 11, color: '#aaa' }}>{user.email || ''}</div>
            </div>
          )}
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,60,60,0.15)', border: '1px solid rgba(255,60,60,0.3)',
            color: '#ff6b6b', padding: '8px 12px', borderRadius: 8,
            cursor: 'pointer', fontSize: 13, width: '100%',
          }}>
            <LogOut size={16} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: sidebarOpen ? 260 : 70,
        flex: 1,
        transition: 'margin-left 0.3s',
        minHeight: '100vh',
      }}>
        <Outlet />
      </main>
    </div>
  )
}