import React, { useState } from 'react'
import { ShoppingBag, Plus, Pencil, Trash2, Package, AlertCircle, X, Check } from 'lucide-react'
import { products } from '../../data/mockData'

const AdminProducts = () => {
  const [productsList, setProductsList] = useState(products)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'cabello',
    availability: 'permanente',
    stock: ''
  })

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        availability: product.availability,
        stock: product.stock
      })
    } else {
      setEditingProduct(null)
      setFormData({ name: '', description: '', price: '', category: 'cabello', availability: 'permanente', stock: '' })
    }
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingProduct) {
      setProductsList(prev => prev.map(p => 
        p.id === editingProduct.id 
          ? { ...p, ...formData, price: parseInt(formData.price), stock: parseInt(formData.stock) }
          : p
      ))
    } else {
      const newProduct = {
        id: Date.now(),
        ...formData,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop'
      }
      setProductsList(prev => [...prev, newProduct])
    }
    setShowModal(false)
  }

  const deleteProduct = (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      setProductsList(prev => prev.filter(p => p.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Gestión de Productos</h2>
          <p className="section-subtitle">Administra los productos de la tienda</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {productsList.map((product) => (
          <div key={product.id} className="card overflow-hidden card-hover">
            <div className="relative h-48">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <span className={`badge ${product.availability === 'permanente' ? 'badge-success' : 'badge-warning'}`}>
                  {product.availability === 'permanente' ? 'Disponible' : 'Limitado'}
                </span>
              </div>
              {product.availability === 'limitado' && (
                <div className="absolute top-3 right-3">
                  <span className="badge badge-danger">{product.stock} unid.</span>
                </div>
              )}
              <div className="absolute top-3 right-3 flex gap-2">
                <button 
                  onClick={() => openModal(product)}
                  className="w-8 h-8 bg-barber-gray/80 rounded-lg flex items-center justify-center text-barber-text hover:text-barber-gold transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteProduct(product.id)}
                  className="w-8 h-8 bg-barber-gray/80 rounded-lg flex items-center justify-center text-barber-text hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <span className="text-xs text-barber-gold uppercase font-medium">{product.category}</span>
              <h3 className="text-lg font-bold text-barber-text mt-1 mb-1">{product.name}</h3>
              <p className="text-sm text-barber-textMuted mb-4">{product.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-barber-grayLight">
                <span className="text-xl font-bold text-barber-gold">${product.price.toLocaleString()}</span>
                {product.availability === 'limitado' && (
                  <span className="text-sm text-barber-textMuted">{product.stock} en stock</span>
                )}
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
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
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
                  placeholder="Ej: Pomada Mate"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-barber-text mb-2">Descripción</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field min-h-[80px]"
                  placeholder="Descripción del producto..."
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
                    placeholder="35000"
                    required
                  />
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
                    <option value="kit">Kit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-barber-text mb-2">Disponibilidad</label>
                  <select 
                    value={formData.availability}
                    onChange={(e) => setFormData({...formData, availability: e.target.value})}
                    className="input-field"
                  >
                    <option value="permanente">Permanente</option>
                    <option value="limitado">Limitado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-barber-text mb-2">Stock</label>
                  <input 
                    type="number" 
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="input-field"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  <Check className="w-5 h-5" />
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
