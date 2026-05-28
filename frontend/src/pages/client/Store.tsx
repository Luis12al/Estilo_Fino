// frontend/src/pages/client/Store.tsx
import { useState, useEffect } from 'react';
import { useProducts } from '@hooks/useProducts';
import {
  PRODUCT_CATEGORIES,
  getCategoryLabel,
  getAvailabilityLabel,
  type ProductCategory,
} from '../../types/product.types';
import {
  ShoppingBag, Search, Package, Loader,
  Calendar, AlertTriangle, X
} from 'lucide-react';

export default function Store() {
  const { products, loading, error, fetchPublic, clearError } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ALL'>('ALL');

  useEffect(() => {
    fetchPublic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: string) => {
    return `$${Number(price).toLocaleString('es-CO')}`;
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Header */}
      <div className="bg-[#1A1A1A] border-b border-[#2A2A2A] px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
              <ShoppingBag size={20} className="text-[#C9A84C]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Tienda</h1>
              <p className="text-sm text-[#9CA3AF]">Productos exclusivos de la barbería</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#252525] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-[#9CA3AF] focus:border-[#C9A84C] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={clearError} className="ml-auto text-red-400 hover:text-red-300">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-[#C9A84C] text-[#1A1A1A]'
                : 'bg-[#252525] text-[#9CA3AF] hover:text-white hover:bg-[#3A3A3A]'
            }`}
          >
            Todos
          </button>
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === cat.value
                  ? 'bg-[#C9A84C] text-[#1A1A1A]'
                  : 'bg-[#252525] text-[#9CA3AF] hover:text-white hover:bg-[#3A3A3A]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={32} className="text-[#C9A84C] animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="text-[#3A3A3A] mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-1">No hay productos</h3>
            <p className="text-[#9CA3AF] text-sm">
              {searchTerm || selectedCategory !== 'ALL'
                ? 'No se encontraron productos con los filtros aplicados'
                : 'Próximamente nuevos productos en la tienda'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const isLimited = product.availability === 'LIMITED';
              const isLowStock = product.stock > 0 && product.stock <= 5;
              const isOutOfStock = product.stock === 0;

              return (
                <div
                  key={product.id}
                  className="bg-[#1E1E1E] rounded-2xl border border-[#2A2A2A] hover:border-[#3A3A3A] overflow-hidden transition-all group"
                >
                  {/* Imagen */}
                  <div className="h-48 bg-[#252525] relative overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={48} className="text-[#3A3A3A]" />
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium backdrop-blur-sm ${
                        isLimited
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {getAvailabilityLabel(product.availability)}
                      </span>
                      {isOutOfStock && (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-medium backdrop-blur-sm bg-red-500/20 text-red-400">
                          Agotado
                        </span>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-medium backdrop-blur-sm bg-orange-500/20 text-orange-400">
                          ¡Quedan {product.stock}!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-[#9CA3AF] bg-[#252525] px-2 py-0.5 rounded-lg">
                        {getCategoryLabel(product.category)}
                      </span>
                    </div>

                    <h3 className="text-white font-semibold mb-1 group-hover:text-[#C9A84C] transition-colors">
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="text-[#9CA3AF] text-sm line-clamp-2 mb-3">
                        {product.description}
                      </p>
                    )}

                    {isLimited && product.limitedUntil && (
                      <p className="text-orange-400/70 text-xs flex items-center gap-1 mb-3">
                        <Calendar size={10} />
                        Disponible hasta {new Date(product.limitedUntil).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                        })}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-[#2A2A2A]">
                      <span className="text-[#C9A84C] font-bold text-xl">
                        {formatPrice(product.price)}
                      </span>
                      <span className={`text-xs font-medium ${
                        isOutOfStock ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {isOutOfStock ? 'Sin stock' : `${product.stock} disponibles`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}