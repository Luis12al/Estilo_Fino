import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Scissors, Calendar, ShoppingBag, Tag, Star, 
  Clock, ArrowRight, User 
} from 'lucide-react'
import { barbers, services, offers, products } from '../../data/mockData'

const ClientDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-barber-gray to-barber-grayLight p-8 border border-barber-grayLighter">
        <div className="absolute top-0 right-0 w-64 h-64 bg-barber-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-barber-text mb-2">
            ¡Bienvenido a <span className="text-barber-gold">Estilo_Fino</span>!
          </h2>
          <p className="text-barber-textMuted max-w-xl mb-6">
            Reserva tu cita con los mejores barberos, explora nuestros servicios y aprovecha las ofertas especiales.
          </p>
          <Link to="/client/barbers" className="inline-flex items-center gap-2 btn-primary">
            <Calendar className="w-5 h-5" />
            Agendar Cita
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: User, label: 'Barberos', value: barbers.length, color: 'text-barber-gold', bg: 'bg-barber-gold/10' },
          { icon: Scissors, label: 'Servicios', value: services.length, color: 'text-barber-info', bg: 'bg-blue-900/20' },
          { icon: Tag, label: 'Ofertas', value: offers.length, color: 'text-barber-success', bg: 'bg-green-900/20' },
          { icon: ShoppingBag, label: 'Productos', value: products.length, color: 'text-barber-warning', bg: 'bg-yellow-900/20' },
        ].map((stat, index) => (
          <div key={index} className="card p-5 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-barber-textMuted text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-barber-text mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Barbers */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="section-title">Nuestros Barberos</h3>
            <p className="section-subtitle">Profesionales destacados listos para atenderte</p>
          </div>
          <Link to="/client/barbers" className="text-barber-gold hover:text-barber-goldLight text-sm font-medium flex items-center gap-1">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {barbers.slice(0, 3).map((barber) => (
            <div key={barber.id} className="card p-5 card-hover">
              <div className="flex items-start gap-4">
                <img 
                  src={barber.avatar} 
                  alt={barber.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-barber-gold/30"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-barber-text">{barber.name}</h4>
                  <p className="text-sm text-barber-textMuted">{barber.specialty}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 text-barber-gold fill-barber-gold" />
                    <span className="text-sm font-medium text-barber-text">{barber.rating}</span>
                    <span className="text-xs text-barber-textMuted">({barber.reviews} reseñas)</span>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${barber.isAvailable ? 'bg-barber-success' : 'bg-barber-danger'} ring-2 ring-barber-gray`} />
              </div>
              <div className="mt-4 pt-4 border-t border-barber-grayLight flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-barber-textMuted">
                  <Clock className="w-4 h-4" />
                  <span>{barber.schedule.start} - {barber.schedule.end}</span>
                </div>
                <Link 
                  to={`/client/schedule/${barber.id}`}
                  className="text-sm text-barber-gold hover:text-barber-goldLight font-medium"
                >
                  Agendar →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Offers */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="section-title">Ofertas Especiales</h3>
            <p className="section-subtitle">Aprovecha nuestras promociones exclusivas</p>
          </div>
          <Link to="/client/offers" className="text-barber-gold hover:text-barber-goldLight text-sm font-medium flex items-center gap-1">
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.slice(0, 3).map((offer) => (
            <div key={offer.id} className="card overflow-hidden card-hover">
              <div className="relative h-40">
                <img src={offer.image} alt={offer.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3">
                  <span className={`badge ${offer.type === 'permanente' ? 'badge-gold' : 'badge-warning'}`}>
                    {offer.type === 'permanente' ? 'Permanente' : 'Limitado'}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-barber-gray to-transparent p-4">
                  <h4 className="font-semibold text-barber-text">{offer.name}</h4>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-barber-textMuted mb-3">{offer.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-barber-gold">${offer.price.toLocaleString()}</span>
                    <span className="text-sm text-barber-textMuted line-through ml-2">${offer.originalPrice.toLocaleString()}</span>
                  </div>
                  <span className="badge badge-success">-{Math.round((1 - offer.price/offer.originalPrice) * 100)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ClientDashboard
