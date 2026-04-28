import React, { useState } from 'react'
import { Scissors, Plus, Pencil, Trash2, Clock, DollarSign, Image, X, Check } from 'lucide-react'
import { services } from '../../data/mockData'

const AdminServices = () => {
  const [servicesList, setServicesList] = useState(services)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'cabello',
    image: ''
  })

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
        image: service.image
      })
    } else {
      setEditingService(null)
      setFormData({ name: '', description: '', price: '', duration: '', category: 'cabello', image: '' })
    }
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingService) {
      setServicesList(prev => prev.map(s => 
        s.id === editingService.id 
          ? { ...s, ...formData, price: parseInt(formData.price), duration: parseInt(formData.duration) }
          : s
      ))
    } else {
      const newService = {
        id: Date.now(),
        ...formData,
        price: parseInt(formData.price),
        duration: parseInt(formData.duration),
        image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop'
      }
      setServicesList(prev => [...prev, newService])
    }
    setShowModal(false)
  }

  const deleteService = (id) => {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      setServicesList(prev => prev.filter(s => s.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Gestión de Servicios</h2>
          <p className="section-subtitle">Administra los servicios que ofreces</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Nuevo Servicio
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {servicesList.map((service) => (
          <div key={service.id} className="card overflow-hidden card-hover">
            <div className="relative h-40">
              <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <span className="badge badge-gold capitalize">{service.category}</span>
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <button 
                  onClick={() => openModal(service)}
                  className="w-8 h-8 bg-barber-gray/80 rounded-lg flex items-center justify-center text-barber-text hover:text-barber-gold transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteService(service.id)}
                  className="w-8 h-8 bg-barber-gray/80 rounded-lg flex items-center justify-center text-barber-text hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-barber-text mb-1">{service.name}</h3>
              <p className="text-sm text-barber-textMuted mb-4">{service.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-barber-grayLight">
                <div className="flex items-center gap-1 text-barber-gold">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xl font-bold">${service.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-barber-textMuted">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration} min</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-barber-gray rounded-2xl border border-barber-grayLight w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-barber-grayLight flex items-center justify-between">
              <h3 className="text-xl font-bold text-barber-text">
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
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
                  placeholder="Ej: Corte de Pelo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-barber-text mb-2">Descripción</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field min-h-[80px]"
                  placeholder="Descripción del servicio..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-barber-text mb-2">Precio ($)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="input-field"
                    placeholder="20000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-barber-text mb-2">Duración (min)</label>
                  <input 
                    type="number" 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="input-field"
                    placeholder="60"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-barber-text mb-2">Categoría</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="input-field"
                >
                  <option value="cabello">Cabello</option>
                  <option value="barba">Barba</option>
                  <option value="cejas">Cejas</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  <Check className="w-5 h-5" />
                  {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminServices
