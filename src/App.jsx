import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Employees from './pages/Employees'
import BankAccounts from './pages/BankAccounts'
import Layout from './components/Layout'

const isLoggedIn = () => !!localStorage.getItem('epvs_token')

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="employees" element={<Employees />} />
        <Route path="bank-accounts" element={<BankAccounts />} />
      </Route>
    </Routes>
  )
}