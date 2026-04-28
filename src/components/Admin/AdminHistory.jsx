import React, { useState } from 'react'
import { History, Calendar, Filter, DollarSign, Clock, CheckCircle, XCircle, Users } from 'lucide-react'
import { history } from '../../data/mockData'

const AdminHistory = () => {
  const [timeFilter, setTimeFilter] = useState('all')

  const filteredHistory = history.filter(h => {
    if (timeFilter === 'all') return true
    const date = new Date(h.date)
    const today = new Date('2026-04-25')
    const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24))

    if (timeFilter === 'daily') return diffDays === 0
    if (timeFilter === 'weekly') return diffDays <= 7
    if (timeFilter === 'monthly') return diffDays <= 30
    return true
  })

  const totalRevenue = filteredHistory
    .filter(h => h.status === 'completed')
    .reduce((sum, h) => sum + h.total, 0)

  const totalServices = filteredHistory.filter(h => h.status === 'completed').length
  const cancelledServices = filteredHistory.filter(h => h.status === 'cancelled').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="section-title">Historial de Atención</h2>
        <p className="section-subtitle">Registro de todos los servicios realizados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-barber-success/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-barber-success" />
            </div>
            <div>
              <p className="text-sm text-barber-textMuted">Completados</p>
              <p className="text-2xl font-bold text-barber-text">{totalServices}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-barber-danger/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-barber-danger" />
            </div>
            <div>
              <p className="text-sm text-barber-textMuted">Cancelados</p>
              <p className="text-2xl font-bold text-barber-text">{cancelledServices}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-barber-gold/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-barber-gold" />
            </div>
            <div>
              <p className="text-sm text-barber-textMuted">Ingresos</p>
              <p className="text-2xl font-bold text-barber-gold">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'Todo el historial' },
          { value: 'daily', label: 'Hoy' },
          { value: 'weekly', label: 'Esta semana' },
          { value: 'monthly', label: 'Este mes' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setTimeFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              timeFilter === f.value
                ? 'bg-barber-gold/20 text-barber-gold border border-barber-gold/30'
                : 'bg-barber-gray border border-barber-grayLight text-barber-textMuted hover:text-barber-text'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filteredHistory.map((record) => (
          <div key={record.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                record.status === 'completed' ? 'bg-barber-success/20' : 'bg-barber-danger/20'
              }`}>
                {record.status === 'completed' ? (
                  <CheckCircle className="w-6 h-6 text-barber-success" />
                ) : (
                  <XCircle className="w-6 h-6 text-barber-danger" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-barber-text">{record.clientName}</h4>
                <div className="flex items-center gap-3 text-sm text-barber-textMuted mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {record.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {record.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <History className="w-3 h-3" />
                    {record.duration} min
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`badge ${record.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>
                {record.status === 'completed' ? 'Completado' : 'Cancelado'}
              </span>
              <span className="text-xl font-bold text-barber-gold">${record.total.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-20">
          <History className="w-16 h-16 text-barber-grayLighter mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-barber-text mb-2">No hay registros</h3>
          <p className="text-barber-textMuted">No se encontraron servicios en este período</p>
        </div>
      )}
    </div>
  )
}

export default AdminHistory
