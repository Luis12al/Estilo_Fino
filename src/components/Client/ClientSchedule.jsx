import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Calendar, Clock, ChevronLeft, Check, Scissors, User, Phone, ArrowRight 
} from 'lucide-react'
import { barbers, services } from '../../data/mockData'

const ClientSchedule = () => {
  const { barberId } = useParams()
  const barber = barbers.find(b => b.id === parseInt(barberId))

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedServices, setSelectedServices] = useState([])
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '' })
  const [step, setStep] = useState(1)

  const generateTimeSlots = () => {
    const slots = []
    const start = 9
    const end = 21
    for (let hour = start; hour < end; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const toggleService = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const getTotalDuration = () => {
    return selectedServices.reduce((total, id) => {
      const service = services.find(s => s.id === id)
      return total + (service ? service.duration : 0)
    }, 0)
  }

  const getTotalPrice = () => {
    return selectedServices.reduce((total, id) => {
      const service = services.find(s => s.id === id)
      return total + (service ? service.price : 0)
    }, 0)
  }

  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  if (!barber) {
    return (
      <div className="text-center py-20">
        <p className="text-barber-textMuted">Barbero no encontrado</p>
        <Link to="/client/barbers" className="text-barber-gold mt-4 inline-block">Volver a barberos</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/client/barbers" className="p-2 rounded-lg hover:bg-barber-grayLight transition-colors">
          <ChevronLeft className="w-6 h-6 text-barber-text" />
        </Link>
        <div>
          <h2 className="section-title">Agendar Cita</h2>
          <p className="section-subtitle">Con {barber.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        {[
          { num: 1, label: 'Servicios' },
          { num: 2, label: 'Fecha y Hora' },
          { num: 3, label: 'Confirmar' },
        ].map((s, i) => (
          <React.Fragment key={s.num}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= s.num ? 'bg-barber-gold text-barber-dark' : 'bg-barber-grayLight text-barber-textMuted'
              }`}>
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step >= s.num ? 'text-barber-gold' : 'text-barber-textMuted'}`}>
                {s.label}
              </span>
            </div>
            {i < 2 && <div className={`flex-1 h-0.5 ${step > s.num ? 'bg-barber-gold' : 'bg-barber-grayLight'}`} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-barber-text mb-1">Selecciona los servicios</h3>
            <p className="text-sm text-barber-textMuted">Puedes elegir uno o varios servicios</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`card p-4 cursor-pointer transition-all duration-300 ${
                  selectedServices.includes(service.id) 
                    ? 'border-barber-gold ring-1 ring-barber-gold/50' 
                    : 'hover:border-barber-gold/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <img src={service.image} alt={service.name} className="w-20 h-20 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-barber-text">{service.name}</h4>
                        <p className="text-sm text-barber-textMuted mt-1">{service.description}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedServices.includes(service.id)
                          ? 'bg-barber-gold border-barber-gold'
                          : 'border-barber-grayLighter'
                      }`}>
                        {selectedServices.includes(service.id) && <Check className="w-4 h-4 text-barber-dark" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-lg font-bold text-barber-gold">${service.price.toLocaleString()}</span>
                      <span className="flex items-center gap-1 text-sm text-barber-textMuted">
                        <Clock className="w-4 h-4" />
                        {service.duration} min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedServices.length > 0 && (
            <div className="card p-5 bg-barber-gold/5 border-barber-gold/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-barber-textMuted">Servicios seleccionados:</span>
                <span className="font-bold text-barber-text">{selectedServices.length}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-barber-textMuted">Duración estimada:</span>
                <span className="font-bold text-barber-text">{getTotalDuration()} minutos</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-barber-gold/20">
                <span className="text-lg font-semibold text-barber-text">Total:</span>
                <span className="text-2xl font-bold text-barber-gold">${getTotalPrice().toLocaleString()}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => selectedServices.length > 0 && setStep(2)}
            disabled={selectedServices.length === 0}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-barber-text mb-1">Selecciona fecha y hora</h3>
            <p className="text-sm text-barber-textMuted">Elige el día y horario que prefieras</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-barber-text mb-3">Fecha</label>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {getAvailableDates().map((date) => {
                const dateObj = new Date(date)
                const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'short' })
                const dayNum = dateObj.getDate()
                const isSelected = selectedDate === date

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center min-w-[70px] p-3 rounded-xl border transition-all duration-300 ${
                      isSelected
                        ? 'bg-barber-gold/20 border-barber-gold text-barber-gold'
                        : 'bg-barber-gray border-barber-grayLight text-barber-textMuted hover:border-barber-gold/30'
                    }`}
                  >
                    <span className="text-xs uppercase">{dayName}</span>
                    <span className="text-xl font-bold">{dayNum}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-barber-text mb-3">Horarios disponibles</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all duration-300 ${
                    selectedTime === time
                      ? 'bg-barber-gold/20 border-barber-gold text-barber-gold'
                      : 'bg-barber-gray border-barber-grayLight text-barber-text hover:border-barber-gold/30'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="flex-1 btn-secondary">
              Atrás
            </button>
            <button
              onClick={() => selectedTime && setStep(3)}
              disabled={!selectedTime}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-barber-text mb-1">Confirma tu cita</h3>
            <p className="text-sm text-barber-textMuted">Revisa los detalles y completa tu información</p>
          </div>

          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-barber-grayLight">
              <img src={barber.avatar} alt={barber.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <h4 className="font-semibold text-barber-text">{barber.name}</h4>
                <p className="text-sm text-barber-textMuted">{barber.specialty}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-barber-text">
                <Calendar className="w-5 h-5 text-barber-gold" />
                <span>{new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3 text-barber-text">
                <Clock className="w-5 h-5 text-barber-gold" />
                <span>{selectedTime}</span>
              </div>
              <div className="flex items-center gap-3 text-barber-text">
                <Scissors className="w-5 h-5 text-barber-gold" />
                <span>{selectedServices.length} servicio(s) - {getTotalDuration()} min</span>
              </div>
            </div>

            <div className="pt-4 border-t border-barber-grayLight">
              <h5 className="text-sm font-medium text-barber-textMuted mb-2">Servicios:</h5>
              <div className="space-y-2">
                {selectedServices.map(id => {
                  const service = services.find(s => s.id === id)
                  return (
                    <div key={id} className="flex justify-between text-sm">
                      <span className="text-barber-text">{service.name}</span>
                      <span className="text-barber-gold font-medium">${service.price.toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t border-barber-grayLight">
                <span className="text-barber-text">Total</span>
                <span className="text-barber-gold">${getTotalPrice().toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h4 className="font-semibold text-barber-text">Tus datos</h4>
            <div>
              <label className="block text-sm font-medium text-barber-text mb-2">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-barber-textMuted" />
                <input
                  type="text"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                  className="input-field pl-12"
                  placeholder="Tu nombre"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-barber-text mb-2">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-barber-textMuted" />
                <input
                  type="tel"
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                  className="input-field pl-12"
                  placeholder="300 123 4567"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(2)} className="flex-1 btn-secondary">
              Atrás
            </button>
            <button
              onClick={() => alert('¡Cita agendada exitosamente!')}
              disabled={!clientInfo.name || !clientInfo.phone}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5" />
              Confirmar Cita
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientSchedule
