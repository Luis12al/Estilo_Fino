import React, { useState } from 'react'
import { 
  Users, Clock, Scissors, Play, CheckCircle, XCircle, 
  Plus, MoreVertical, Phone, Calendar, Filter 
} from 'lucide-react'
import { appointments, services } from '../../data/mockData'

const AdminAppointments = () => {
  const [filter, setFilter] = useState('all')
  const [appointmentsList, setAppointmentsList] = useState(appointments)
  const [expandedCard, setExpandedCard] = useState(null)

  const filteredAppointments = appointmentsList.filter(a => {
    if (filter === 'all') return true
    return a.status === filter
  })

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="badge badge-warning">Pendiente</span>
      case 'in-progress': return <span className="badge badge-info">En progreso</span>
      case 'completed': return <span className="badge badge-success">Completado</span>
      case 'cancelled': return <span className="badge badge-danger">Cancelado</span>
      default: return null
    }
  }

  const updateStatus = (id, newStatus) => {
    setAppointmentsList(prev => prev.map(a => 
      a.id === id ? { ...a, status: newStatus } : a
    ))
  }

  const extendTime = (id) => {
    setAppointmentsList(prev => prev.map(a => 
      a.id === id ? { ...a, duration: a.duration + 20 } : a
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Citas del Día</h2>
          <p className="section-subtitle">Gestiona las citas de tus clientes</p>
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'Todas' },
            { value: 'pending', label: 'Pendientes' },
            { value: 'in-progress', label: 'En Progreso' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                filter === f.value
                  ? 'bg-barber-gold/20 text-barber-gold border border-barber-gold/30'
                  : 'bg-barber-gray border border-barber-grayLight text-barber-textMuted hover:text-barber-text'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id} className="card p-5">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-barber-gold/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-barber-gold" />
                </div>
                <div>
                  <h4 className="font-semibold text-barber-text">{appointment.clientName}</h4>
                  <div className="flex items-center gap-1 text-sm text-barber-textMuted">
                    <Phone className="w-3 h-3" />
                    <span>{appointment.clientPhone}</span>
                  </div>
                </div>
              </div>
              {getStatusBadge(appointment.status)}
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-barber-textMuted">
                <Calendar className="w-4 h-4 text-barber-gold" />
                <span>{appointment.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-barber-textMuted">
                <Clock className="w-4 h-4 text-barber-gold" />
                <span>{appointment.time} ({appointment.duration} min)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-barber-textMuted">
                <Scissors className="w-4 h-4 text-barber-gold" />
                <span>
                  {appointment.services.map(id => {
                    const s = services.find(sv => sv.id === id)
                    return s?.name
                  }).join(', ')}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between pt-3 border-t border-barber-grayLight mb-4">
              <span className="text-sm text-barber-textMuted">Total del servicio</span>
              <span className="text-xl font-bold text-barber-gold">${appointment.total.toLocaleString()}</span>
            </div>

            {/* Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setExpandedCard(expandedCard === appointment.id ? null : appointment.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-barber-grayLight text-barber-text hover:bg-barber-grayLighter transition-colors text-sm font-medium"
              >
                <MoreVertical className="w-4 h-4" />
                Acciones
              </button>

              {expandedCard === appointment.id && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-barber-gray border border-barber-grayLighter rounded-xl shadow-xl overflow-hidden z-10">
                  {appointment.status === 'pending' && (
                    <button
                      onClick={() => { updateStatus(appointment.id, 'in-progress'); setExpandedCard(null); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-barber-info hover:bg-barber-grayLight transition-colors text-left"
                    >
                      <Play className="w-4 h-4" />
                      <span>Iniciar atención</span>
                    </button>
                  )}

                  {appointment.status === 'in-progress' && (
                    <button
                      onClick={() => { updateStatus(appointment.id, 'completed'); setExpandedCard(null); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-barber-success hover:bg-barber-grayLight transition-colors text-left"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Finalizar atención</span>
                    </button>
                  )}

                  <button
                    onClick={() => { updateStatus(appointment.id, 'cancelled'); setExpandedCard(null); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-barber-danger hover:bg-barber-grayLight transition-colors text-left"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancelar cita</span>
                  </button>

                  <button
                    onClick={() => { extendTime(appointment.id); setExpandedCard(null); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-barber-warning hover:bg-barber-grayLight transition-colors text-left"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Extender 20 min</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-20">
          <Calendar className="w-16 h-16 text-barber-grayLighter mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-barber-text mb-2">No hay citas</h3>
          <p className="text-barber-textMuted">No tienes citas en esta categoría</p>
        </div>
      )}
    </div>
  )
}

export default AdminAppointments
