import React, { useState } from 'react'
import { Clock, Calendar, Save, ToggleLeft, ToggleRight, Info } from 'lucide-react'
import { barbers } from '../../data/mockData'

const AdminSchedule = () => {
  const [schedule, setSchedule] = useState({
    startTime: '09:00',
    endTime: '21:00',
    breakStart: '12:00',
    breakEnd: '14:00',
    isAvailable: true,
  })

  const [daysOfWeek, setDaysOfWeek] = useState([
    { day: 'Lunes', active: true },
    { day: 'Martes', active: true },
    { day: 'Miércoles', active: true },
    { day: 'Jueves', active: true },
    { day: 'Viernes', active: true },
    { day: 'Sábado', active: true },
    { day: 'Domingo', active: false },
  ])

  const toggleDay = (index) => {
    setDaysOfWeek(prev => prev.map((d, i) => 
      i === index ? { ...d, active: !d.active } : d
    ))
  }

  const calculateSlots = () => {
    const start = parseInt(schedule.startTime.split(':')[0])
    const end = parseInt(schedule.endTime.split(':')[0])
    const breakStart = parseInt(schedule.breakStart.split(':')[0])
    const breakEnd = parseInt(schedule.breakEnd.split(':')[0])

    const totalHours = (end - start) - (breakEnd - breakStart)
    const avgServiceTime = 1.25 // 75 min average
    return Math.floor(totalHours / avgServiceTime)
  }

  const timeOptions = []
  for (let h = 0; h < 24; h++) {
    timeOptions.push(`${h.toString().padStart(2, '0')}:00`)
    timeOptions.push(`${h.toString().padStart(2, '0')}:30`)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="section-title">Configuración de Agenda</h2>
        <p className="section-subtitle">Gestiona tus horarios de disponibilidad</p>
      </div>

      {/* Availability Toggle */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              schedule.isAvailable ? 'bg-barber-success/20' : 'bg-barber-danger/20'
            }`}>
              {schedule.isAvailable ? (
                <ToggleRight className="w-8 h-8 text-barber-success" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-barber-danger" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-barber-text">
                {schedule.isAvailable ? 'Disponible para citas' : 'No disponible'}
              </h3>
              <p className="text-sm text-barber-textMuted">
                {schedule.isAvailable 
                  ? 'Los clientes pueden agendar citas contigo' 
                  : 'Los clientes no podrán agendar citas'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSchedule(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
            className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
              schedule.isAvailable ? 'bg-barber-success' : 'bg-barber-grayLighter'
            }`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
              schedule.isAvailable ? 'left-9' : 'left-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Schedule Settings */}
      <div className="card p-6 space-y-6">
        <h3 className="text-lg font-semibold text-barber-text flex items-center gap-2">
          <Clock className="w-5 h-5 text-barber-gold" />
          Horario de Atención
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-barber-text mb-2">Hora de inicio</label>
            <select 
              value={schedule.startTime}
              onChange={(e) => setSchedule(prev => ({ ...prev, startTime: e.target.value }))}
              className="input-field"
            >
              {timeOptions.filter(t => parseInt(t) >= 6 && parseInt(t) <= 12).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-barber-text mb-2">Hora de fin</label>
            <select 
              value={schedule.endTime}
              onChange={(e) => setSchedule(prev => ({ ...prev, endTime: e.target.value }))}
              className="input-field"
            >
              {timeOptions.filter(t => parseInt(t) >= 17 && parseInt(t) <= 23).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-barber-grayLight">
          <h4 className="text-sm font-medium text-barber-text mb-4">Tiempo de descanso</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-barber-textMuted mb-2">Inicio descanso</label>
              <select 
                value={schedule.breakStart}
                onChange={(e) => setSchedule(prev => ({ ...prev, breakStart: e.target.value }))}
                className="input-field"
              >
                {timeOptions.filter(t => {
                  const hour = parseInt(t)
                  return hour >= parseInt(schedule.startTime) && hour < parseInt(schedule.endTime)
                }).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-barber-textMuted mb-2">Fin descanso</label>
              <select 
                value={schedule.breakEnd}
                onChange={(e) => setSchedule(prev => ({ ...prev, breakEnd: e.target.value }))}
                className="input-field"
              >
                {timeOptions.filter(t => {
                  const hour = parseInt(t)
                  return hour > parseInt(schedule.breakStart) && hour <= parseInt(schedule.endTime)
                }).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Days of Week */}
      <div className="card p-6 space-y-6">
        <h3 className="text-lg font-semibold text-barber-text flex items-center gap-2">
          <Calendar className="w-5 h-5 text-barber-gold" />
          Días de la Semana
        </h3>

        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map((day, index) => (
            <button
              key={index}
              onClick={() => toggleDay(index)}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-300 ${
                day.active
                  ? 'bg-barber-gold/20 border-barber-gold text-barber-gold'
                  : 'bg-barber-grayLight border-barber-grayLighter text-barber-textMuted'
              }`}
            >
              <span className="text-xs uppercase">{day.day.slice(0, 3)}</span>
              <div className={`w-3 h-3 rounded-full mt-2 ${day.active ? 'bg-barber-gold' : 'bg-barber-grayLighter'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Slots Preview */}
      <div className="card p-6 bg-gradient-to-r from-barber-gold/10 to-transparent border-barber-gold/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-barber-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Info className="w-6 h-6 text-barber-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-barber-text mb-1">Estimación de cupos</h3>
            <p className="text-barber-textMuted mb-3">
              Basado en tu horario configurado, podrás atender aproximadamente:
            </p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-barber-gold">{calculateSlots()}</span>
              <span className="text-barber-text">clientes por día</span>
            </div>
            <p className="text-xs text-barber-textMuted mt-2">
              * Calculado con un tiempo promedio de servicio de 75 minutos
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button 
        onClick={() => alert('Configuración guardada exitosamente')}
        className="w-full btn-primary"
      >
        <Save className="w-5 h-5" />
        Guardar Configuración
      </button>
    </div>
  )
}

export default AdminSchedule
