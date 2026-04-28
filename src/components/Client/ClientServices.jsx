import React, { useState } from 'react'
import { Plus, Minus, Clock, Scissors, Check, ShoppingCart } from 'lucide-react'
import { services } from '../../data/mockData'

const ClientServices = () => {
  const [cart, setCart] = useState({})

  const addToCart = (serviceId) => {
    setCart(prev => ({
      ...prev,
      [serviceId]: (prev[serviceId] || 0) + 1
    }))
  }

  const removeFromCart = (serviceId) => {
    setCart(prev => {
      const newCart = { ...prev }
      if (newCart[serviceId] > 1) {
        newCart[serviceId]--
      } else {
        delete newCart[serviceId]
      }
      return newCart
    })
  }

  const getTotalItems = () => Object.values(cart).reduce((a, b) => a + b, 0)
  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const service = services.find(s => s.id === parseInt(id))
      return total + (service ? service.price * qty : 0)
    }, 0)
  }
  const getTotalDuration = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const service = services.find(s => s.id === parseInt(id))
      return total + (service ? service.duration * qty : 0)
    }, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Menú de Servicios</h2>
          <p className="section-subtitle">Selecciona los servicios que necesitas</p>
        </div>
        {getTotalItems() > 0 && (
          <div className="flex items-center gap-3 bg-barber-gold/10 px-4 py-2 rounded-lg border border-barber-gold/30">
            <ShoppingCart className="w-5 h-5 text-barber-gold" />
            <span className="text-barber-gold font-bold">{getTotalItems()} servicios</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {services.map((service) => {
          const qty = cart[service.id] || 0
          return (
            <div key={service.id} className="card overflow-hidden card-hover">
              <div className="relative h-48">
                <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3">
                  <span className="badge badge-gold capitalize">{service.category}</span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-barber-text">{service.name}</h3>
                    <p className="text-sm text-barber-textMuted mt-1">{service.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-barber-gold">
                    <Scissors className="w-4 h-4" />
                    <span className="text-2xl font-bold">${service.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-barber-textMuted">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration} min</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => removeFromCart(service.id)}
                      disabled={qty === 0}
                      className="w-10 h-10 rounded-lg bg-barber-grayLight border border-barber-grayLighter flex items-center justify-center text-barber-text hover:bg-barber-grayLighter transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-barber-text text-lg">{qty}</span>
                    <button
                      onClick={() => addToCart(service.id)}
                      className="w-10 h-10 rounded-lg bg-barber-gold/20 border border-barber-gold/30 flex items-center justify-center text-barber-gold hover:bg-barber-gold/30 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {qty > 0 && (
                    <span className="text-barber-gold font-bold">
                      ${(service.price * qty).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {getTotalItems() > 0 && (
        <div className="card p-6 sticky bottom-6 bg-barber-gray/95 backdrop-blur-sm border-barber-gold/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-barber-textMuted">Servicios</p>
                <p className="text-xl font-bold text-barber-text">{getTotalItems()}</p>
              </div>
              <div>
                <p className="text-sm text-barber-textMuted">Duración total</p>
                <p className="text-xl font-bold text-barber-text">{getTotalDuration()} min</p>
              </div>
              <div>
                <p className="text-sm text-barber-textMuted">Total</p>
                <p className="text-2xl font-bold text-barber-gold">${getTotalPrice().toLocaleString()}</p>
              </div>
            </div>
            <button className="btn-primary w-full sm:w-auto">
              <Check className="w-5 h-5" />
              Proceder a Agendar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientServices
