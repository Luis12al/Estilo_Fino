import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login'
import ClientLayout from './components/Client/ClientLayout'
import AdminLayout from './components/Admin/AdminLayout'
import ClientDashboard from './components/Client/ClientDashboard'
import ClientBarbers from './components/Client/ClientBarbers'
import ClientSchedule from './components/Client/ClientSchedule'
import ClientServices from './components/Client/ClientServices'
import ClientOffers from './components/Client/ClientOffers'
import ClientProducts from './components/Client/ClientProducts'
import AdminDashboard from './components/Admin/AdminDashboard'
import AdminSchedule from './components/Admin/AdminSchedule'
import AdminAppointments from './components/Admin/AdminAppointments'
import AdminServices from './components/Admin/AdminServices'
import AdminOffers from './components/Admin/AdminOffers'
import AdminProducts from './components/Admin/AdminProducts'
import AdminHistory from './components/Admin/AdminHistory'

function App() {
  const [user, setUser] = useState(null)

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <Routes>
      {/* Client Routes */}
      <Route path="/client" element={<ClientLayout user={user} onLogout={handleLogout} />}>
        <Route index element={<ClientDashboard />} />
        <Route path="barbers" element={<ClientBarbers />} />
        <Route path="schedule/:barberId" element={<ClientSchedule />} />
        <Route path="services" element={<ClientServices />} />
        <Route path="offers" element={<ClientOffers />} />
        <Route path="products" element={<ClientProducts />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout user={user} onLogout={handleLogout} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="schedule" element={<AdminSchedule />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="offers" element={<AdminOffers />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="history" element={<AdminHistory />} />
      </Route>

      {/* Redirect root */}
      <Route path="/" element={<Navigate to={user.role === 'admin' ? '/admin' : '/client'} replace />} />
    </Routes>
  )
}

export default App
