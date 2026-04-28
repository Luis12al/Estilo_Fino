import React, { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { 
  Scissors, Calendar, Users, Settings, Home, 
  Menu, LogOut, User, ChevronRight, Tag, ShoppingBag, 
  History, Clock 
} from 'lucide-react'

const AdminLayout = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/schedule', icon: Clock, label: 'Mi Agenda' },
    { path: '/admin/appointments', icon: Calendar, label: 'Citas' },
    { path: '/admin/services', icon: Scissors, label: 'Servicios' },
    { path: '/admin/offers', icon: Tag, label: 'Ofertas' },
    { path: '/admin/products', icon: ShoppingBag, label: 'Productos' },
    { path: '/admin/history', icon: History, label: 'Historial' },
  ]

  return (
    <div className="min-h-screen bg-barber-dark flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-barber-gray border-r border-barber-grayLight
        transform transition-transform duration-300 lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-barber-grayLight">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-barber-gold/10 rounded-lg flex items-center justify-center border border-barber-gold/30">
                <Scissors className="w-5 h-5 text-barber-gold" />
              </div>
              <div>
                <h1 className="font-bold text-barber-gold text-lg">Estilo_Fino</h1>
                <p className="text-xs text-barber-textMuted">Panel de Barbero</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => 
                  `sidebar-item ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-barber-grayLight">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border border-barber-gold/30"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-barber-text truncate">{user.name}</p>
                <p className="text-xs text-barber-textMuted truncate">Barbero</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-barber-gray border-b border-barber-grayLight px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-barber-grayLight transition-colors"
          >
            <Menu className="w-6 h-6 text-barber-text" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden sm:flex items-center gap-2 text-sm text-barber-textMuted">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
