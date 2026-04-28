import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Clock, Calendar, Search, Filter, Award } from 'lucide-react'
import { barbers } from '../../data/mockData'

const ClientBarbers = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAvailable, setFilterAvailable] = useState(false)

  const filteredBarbers = barbers.filter(barber => {
    const matchesSearch = barber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         barber.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterAvailable ? barber.isAvailable : true
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">Nuestros Barberos</h2>
        <p className="section-subtitle">Elige tu barbero favorito y agenda tu cita</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-barber-textMuted" />
          <input
            type="text"
            placeholder="Buscar por nombre o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <button
          onClick={() => setFilterAvailable(!filterAvailable)}
          className={`flex items-center gap-2 px-5 py-3 rounded-lg border transition-all duration-300 ${
            filterAvailable
              ? 'bg-barber-gold/20 border-barber-gold text-barber-gold'
              : 'bg-barber-gray border-barber-grayLight text-barber-textMuted hover:text-barber-text'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Disponibles hoy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBarbers.map((barber) => (
          <div key={barber.id} className="card overflow-hidden card-hover">
            <div className="relative h-32 bg-gradient-to-br from-barber-grayLight to-barber-gray">
              <div className="absolute -bottom-10 left-6">
                <img 
                  src={barber.avatar} 
                  alt={barber.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-barber-gray shadow-lg"
                />
              </div>
              <div className="absolute top-4 right-4">
                <span className={`badge ${barber.isAvailable ? 'badge-success' : 'badge-danger'}`}>
                  {barber.isAvailable ? 'Disponible' : 'No disponible'}
                </span>
              </div>
            </div>

            <div className="pt-12 pb-6 px-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-barber-text">{barber.name}</h3>
                  <p className="text-sm text-barber-textMuted">{barber.specialty}</p>
                </div>
                <div className="flex items-center gap-1 bg-barber-gold/10 px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-barber-gold fill-barber-gold" />
                  <span className="text-sm font-bold text-barber-gold">{barber.rating}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-barber-textMuted">
                  <Award className="w-4 h-4 text-barber-gold" />
                  <span>{barber.reviews} reseñas</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-barber-textMuted">
                  <Clock className="w-4 h-4 text-barber-info" />
                  <span>{barber.slotsPerDay} cupos/día</span>
                </div>
              </div>

              <div className="bg-barber-grayLight rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-barber-text mb-2">
                  <Calendar className="w-4 h-4 text-barber-gold" />
                  <span className="font-medium">Horario de atención</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-barber-textMuted">
                    <span>Mañana</span>
                    <span className="text-barber-text">{barber.schedule.start} - {barber.schedule.breakStart}</span>
                  </div>
                  <div className="flex justify-between text-barber-textMuted">
                    <span>Tarde</span>
                    <span className="text-barber-text">{barber.schedule.breakEnd} - {barber.schedule.end}</span>
                  </div>
                </div>
              </div>

              <Link
                to={`/client/schedule/${barber.id}`}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  barber.isAvailable
                    ? 'btn-primary'
                    : 'bg-barber-grayLighter text-barber-textMuted cursor-not-allowed'
                }`}
                onClick={(e) => !barber.isAvailable && e.preventDefault()}
              >
                <Calendar className="w-5 h-5" />
                {barber.isAvailable ? 'Ver Agenda y Agendar' : 'No disponible'}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClientBarbers
