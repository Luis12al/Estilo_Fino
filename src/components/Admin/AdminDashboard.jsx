import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, Users, Scissors, DollarSign, TrendingUp, 
  Clock, ArrowRight, Star, CheckCircle, XCircle, AlertCircle 
} from 'lucide-react'
import { appointments, barbers, services, history } from '../../data/mockData'

const AdminDashboard = () => {
  const todayAppointments = appointments.filter(a => a.date === '2026-04-25')
  const pendingCount = todayAppointments.filter(a => a.status === 'pending').length
  const inProgressCount = todayAppointments.filter(a => a.status === 'in-progress').length
  const completedToday = history.filter(h => h.date === '2026-04-25' && h.status === 'completed').length

  const todayRevenue = history
    .filter(h => h.date === '2026-04-25' && h.status === 'completed')
    .reduce((sum, h) => sum + h.total, 0)

  const weeklyRevenue = history
    .filter(h => h.status === 'completed')
    .reduce((sum, h) => sum + h.total, 0)

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-barber-gray to-barber-grayLight p-8 border border-barber-grayLighter">
        <div className="absolute top-0 right-0 w-64 h-64 bg-barber-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-barber-text mb-2">
            ¡Buen día, <span className="text-barber-gold">Carlos</span>!
          </h2>
          <p className="text-barber-textMuted max-w-xl">
            Aquí tienes un resumen de tu día. Tienes {todayAppointments.length} citas programadas para hoy.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            icon: Calendar, 
            label: 'Citas Hoy', 
            value: todayAppointments.length, 
            sublabel: `${pendingCount} pendientes`,
            color: 'text-barber-gold', 
            bg: 'bg-barber-gold/10' 
          },
          { 
            icon: Clock, 
            label: 'En Progreso', 
            value: inProgressCount, 
            sublabel: 'atendiendo ahora',
            color: 'text-barber-info', 
            bg: 'bg-blue-900/20' 
          },
          { 
            icon: DollarSign, 
            label: 'Ingresos Hoy', 
            value: `$${todayRevenue.toLocaleString()}`, 
            sublabel: 'ingresos del día',
            color: 'text-barber-success', 
            bg: 'bg-green-900/20' 
          },
          { 
            icon: TrendingUp, 
            label: 'Ingresos Semana', 
            value: `$${weeklyRevenue.toLocaleString()}`, 
            sublabel: 'últimos 7 días',
            color: 'text-barber-warning', 
            bg: 'bg-yellow-900/20' 
          },
        ].map((stat, index) => (
          <div key={index} className="card p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-barber-textMuted text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-barber-text mt-1">{stat.value}</p>
            <p className="text-xs text-barber-textMuted mt-1">{stat.sublabel}</p>
          </div>
        ))}
      </div>

      {/* Today's Appointments */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="section-title">Citas de Hoy</h3>
            <p className="section-subtitle">Clientes programados para el día de hoy</p>
          </div>
          <Link to="/admin/appointments" className="text-barber-gold hover:text-barber-goldLight text-sm font-medium flex items-center gap-1">
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todayAppointments.map((appointment) => (
            <div key={appointment.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-barber-gold/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-barber-gold" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-barber-text">{appointment.clientName}</h4>
                    <p className="text-sm text-barber-textMuted">{appointment.clientPhone}</p>
                  </div>
                </div>
                <span className={`badge ${
                  appointment.status === 'pending' ? 'badge-warning' :
                  appointment.status === 'in-progress' ? 'badge-info' :
                  'badge-success'
                }`}>
                  {appointment.status === 'pending' ? 'Pendiente' :
                   appointment.status === 'in-progress' ? 'En progreso' :
                   'Completado'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-barber-textMuted mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-barber-gold" />
                  <span>{appointment.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Scissors className="w-4 h-4 text-barber-gold" />
                  <span>{appointment.duration} min</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-barber-grayLight">
                <span className="text-lg font-bold text-barber-gold">${appointment.total.toLocaleString()}</span>
                <div className="flex gap-2">
                  {appointment.status === 'pending' && (
                    <button className="px-3 py-1.5 rounded-lg bg-barber-gold/20 text-barber-gold text-sm font-medium hover:bg-barber-gold/30 transition-colors">
                      Iniciar
                    </button>
                  )}
                  {appointment.status === 'in-progress' && (
                    <button className="px-3 py-1.5 rounded-lg bg-green-900/30 text-barber-success text-sm font-medium hover:bg-green-900/50 transition-colors">
                      Finalizar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="section-title mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Configurar Agenda', path: '/admin/schedule', icon: Clock, color: 'bg-barber-gold/10 text-barber-gold' },
            { label: 'Gestionar Servicios', path: '/admin/services', icon: Scissors, color: 'bg-blue-900/20 text-barber-info' },
            { label: 'Nueva Oferta', path: '/admin/offers', icon: Star, color: 'bg-green-900/20 text-barber-success' },
            { label: 'Agregar Producto', path: '/admin/products', icon: DollarSign, color: 'bg-yellow-900/20 text-barber-warning' },
          ].map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="card p-5 card-hover flex items-center gap-4"
            >
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="font-medium text-barber-text">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
