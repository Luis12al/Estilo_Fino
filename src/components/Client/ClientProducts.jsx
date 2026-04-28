import React, { useState } from 'react'
import { ShoppingBag, Search, Filter, Package, AlertCircle } from 'lucide-react'
import { products } from '../../data/mockData'

const ClientProducts = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', ...new Set(products.map(p => p.category))]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="section-title">Tienda de Productos</h2>
        <p className="section-subtitle">Productos profesionales para el cuidado personal</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-barber-textMuted" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-barber-gold/20 border-barber-gold text-barber-gold'
                  : 'bg-barber-gray border-barber-grayLight text-barber-textMuted hover:text-barber-text'
              }`}
            >
              {cat === 'all' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProducts.map((product) => (
          <div key={product.id} className="card overflow-hidden card-hover group">
            <div className="relative h-52 overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <span className={`badge ${product.availability === 'permanente' ? 'badge-success' : 'badge-warning'}`}>
                  {product.availability === 'permanente' ? 'Disponible' : 'Limitado'}
                </span>
              </div>
              {product.availability === 'limitado' && (
                <div className="absolute top-3 right-3">
                  <span className="badge badge-danger">{product.stock} unidades</span>
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs text-barber-gold uppercase font-medium">{product.category}</span>
                  <h3 className="text-lg font-bold text-barber-text mt-1">{product.name}</h3>
                </div>
              </div>

              <p className="text-sm text-barber-textMuted mb-4">{product.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-barber-grayLight">
                <span className="text-2xl font-bold text-barber-gold">${product.price.toLocaleString()}</span>
                <button className="btn-primary py-2 px-4 text-sm">
                  <ShoppingBag className="w-4 h-4" />
                  Comprar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-barber-grayLighter mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-barber-text mb-2">No se encontraron productos</h3>
          <p className="text-barber-textMuted">Intenta con otros términos de búsqueda</p>
        </div>
      )}
    </div>
  )
}

export default ClientProducts
