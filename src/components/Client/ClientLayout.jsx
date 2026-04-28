import React, { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { 
  Scissors, Calendar, ShoppingBag, Tag, Home, 
  Menu, X, LogOut, User, ChevronRight 
} from 'lucide-react'

const ClientLayout = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const menuItems = [
    { path: '/client', icon: Home, label: 'Inicio' },
    { path: '/client/barbers', icon: User, label: 'Barberos' },
    { path: '/client/services', icon: Scissors, label: 'Servicios' },
    { path: '/client/offers', icon: Tag, label: 'Ofertas' },
    { path: '/client/products', icon: ShoppingBag, label: 'Productos' },
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
                <p className="text-xs text-barber-textMuted">Panel de Cliente</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/client'}
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
              <div className="w-10 h-10 bg-barber-gold/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-barber-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-barber-text truncate">{user.name}</p>
                <p className="text-xs text-barber-textMuted truncate">{user.email}</p>
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

export default ClientLayout
