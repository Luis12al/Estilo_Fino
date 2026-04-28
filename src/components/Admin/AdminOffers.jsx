import React, { useState } from 'react'
import { Tag, Plus, Pencil, Trash2, Clock, Calendar, Image, X, Check, Percent } from 'lucide-react'
import { offers } from '../../data/mockData'

const AdminOffers = () => {
  const [offersList, setOffersList] = useState(offers)
  const [showModal, setShowModal] = useState(false)
  const [editingOffer, setEditingOffer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    duration: '',
    type: 'permanente',
    validUntil: ''
  })

  const openModal = (offer = null) => {
    if (offer) {
      setEditingOffer(offer)
      setFormData({
        name: offer.name,
        description: offer.description,
        price: offer.price,
        originalPrice: offer.originalPrice,
        duration: offer.duration,
        type: offer.type,
        validUntil: offer.validUntil || ''
      })
    } else {
      setEditingOffer(null)
      setFormData({ name: '', description: '', price: '', originalPrice: '', duration: '', type: 'permanente', validUntil: '' })
    }
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingOffer) {
      setOffersList(prev => prev.map(o => 
        o.id === editingOffer.id 
          ? { ...o, ...formData, price: parseInt(formData.price), originalPrice: parseInt(formData.originalPrice), duration: parseInt(formData.duration) }
          : o
      ))
    } else {
      const newOffer = {
        id: Date.now(),
        ...formData,
        price: parseInt(formData.price),
        originalPrice: parseInt(formData.originalPrice),
        duration: parseInt(formData.duration),
        image: 'https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?w=400&h=300&fit=crop'
      }
      setOffersList(prev => [...prev, newOffer])
    }
    setShowModal(false)
  }

  const deleteOffer = (id) => {
    if (confirm('¿Estás seguro de eliminar esta oferta?')) {
      setOffersList(prev => prev.filter(o => o.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Gestión de Ofertas</h2>
          <p className="section-subtitle">Administra las promociones de la barbería</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Nueva Oferta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {offersList.map((offer) => (
          <div key={offer.id} className="card overflow-hidden card-hover">
            <div className="relative h-40">
              <img src={offer.image} alt={offer.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <span className={`badge ${offer.type === 'permanente' ? 'badge-gold' : 'badge-warning'}`}>
                  {offer.type === 'permanente' ? 'Permanente' : 'Limitado'}
                </span>
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <button 
                  onClick={() => openModal(offer)}
                  className="w-8 h-8 bg-barber-gray/80 rounded-lg flex items-center justify-center text-barber-text hover:text-barber-gold transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteOffer(offer.id)}
                  className="w-8 h-8 bg-barber-gray/80 rounded-lg flex items-center justify-center text-barber-text hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-3 right-3">
                <div className="w-12 h-12 bg-barber-gold rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-barber-dark font-bold text-xs">-{Math.round((1 - offer.price/offer.originalPrice) * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-barber-text mb-1">{offer.name}</h3>
              <p className="text-sm text-barber-textMuted mb-3">{offer.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-barber-textMuted">
                  <Clock className="w-4 h-4 text-barber-gold" />
                  <span>{offer.duration} minutos</span>
                </div>
                {offer.validUntil && (
                  <div className="flex items-center gap-2 text-sm text-barber-textMuted">
                    <Calendar className="w-4 h-4 text-barber-warning" />
                    <span>Hasta: {new Date(offer.validUntil).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-barber-grayLight">
                <div>
                  <span className="text-sm text-barber-textMuted line-through">${offer.originalPrice.toLocaleString()}</span>
                  <span className="text-xl font-bold text-barber-gold ml-2">${offer.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-barber-gray rounded-2xl border border-barber-grayLight w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-barber-grayLight flex items-center justify-between">
              <h3 className="text-xl font-bold text-barber-text">
                {editingOffer ? 'Editar Oferta' : 'Nueva Oferta'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-barber-grayLight rounded-lg transition-colors">
                <X className="w-5 h-5 text-barber-textMuted" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-barber-text mb-2">Nombre</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  placeholder="Ej: Combo Completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-barber-text mb-2">Descripción</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field min-h-[80px]"
                  placeholder="Descripción de la oferta..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-barber-text mb-2">Precio Oferta ($)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="input-field"
                    placeholder="32000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-barber-text mb-2">Precio Original ($)</label>
                  <input 
                    type="number" 
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                    className="input-field"
                    placeholder="37000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-barber-text mb-2">Duración (min)</label>
                  <input 
                    type="number" 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="input-field"
                    placeholder="85"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-barber-text mb-2">Tipo</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="input-field"
                  >
                    <option value="permanente">Permanente</option>
                    <option value="limitado">Por tiempo limitado</option>
                  </select>
                </div>
              </div>

              {formData.type === 'limitado' && (
                <div>
                  <label className="block text-sm font-medium text-barber-text mb-2">Válido hasta</label>
                  <input 
                    type="date" 
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    className="input-field"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  <Check className="w-5 h-5" />
                  {editingOffer ? 'Guardar Cambios' : 'Crear Oferta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOffers
