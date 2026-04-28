import React from 'react'
import { Clock, Calendar, ArrowRight, Percent } from 'lucide-react'
import { offers } from '../../data/mockData'

const ClientOffers = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">Ofertas y Promociones</h2>
        <p className="section-subtitle">Aprovecha nuestras promociones especiales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div key={offer.id} className="card overflow-hidden card-hover group">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={offer.image} 
                alt={offer.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-barber-gray via-transparent to-transparent" />

              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`badge ${offer.type === 'permanente' ? 'badge-gold' : 'badge-warning'}`}>
                  {offer.type === 'permanente' ? 'Permanente' : 'Por tiempo limitado'}
                </span>
              </div>

              <div className="absolute top-4 right-4">
                <div className="w-14 h-14 bg-barber-gold rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-barber-dark font-bold text-sm">
                    -{Math.round((1 - offer.price/offer.originalPrice) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-barber-text mb-2">{offer.name}</h3>
              <p className="text-sm text-barber-textMuted mb-4">{offer.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-barber-textMuted">
                  <Clock className="w-4 h-4 text-barber-gold" />
                  <span>Duración estimada: {offer.duration} minutos</span>
                </div>
                {offer.validUntil && (
                  <div className="flex items-center gap-2 text-sm text-barber-textMuted">
                    <Calendar className="w-4 h-4 text-barber-warning" />
                    <span>Válido hasta: {new Date(offer.validUntil).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-end justify-between pt-4 border-t border-barber-grayLight">
                <div>
                  <p className="text-sm text-barber-textMuted line-through">${offer.originalPrice.toLocaleString()}</p>
                  <p className="text-2xl font-bold text-barber-gold">${offer.price.toLocaleString()}</p>
                </div>
                <button className="btn-primary py-2 px-4 text-sm">
                  Aprovechar
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6 bg-gradient-to-r from-barber-gold/10 to-transparent border-barber-gold/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-barber-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Percent className="w-6 h-6 text-barber-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-barber-text mb-1">¿Quieres más ofertas?</h3>
            <p className="text-sm text-barber-textMuted">
              Síguenos en nuestras redes sociales para enterarte primero de nuestras promociones exclusivas 
              y descuentos especiales para clientes frecuentes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientOffers
