// frontend/src/pages/admin/Products.tsx
import { useState, useEffect, useCallback } from 'react';
import { useProducts } from '@hooks/useProducts';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_AVAILABILITY,
  getCategoryLabel,
  getAvailabilityLabel,
  type Product,
  type ProductCategory,
  type ProductAvailability,
} from '../../types/product.types';
import {
  Plus, Search, Package, Pencil, Trash2, Eye, EyeOff,
  X, Loader, ImageIcon, AlertTriangle, Check,
  ShoppingBag, Filter
} from 'lucide-react';

type ModalMode = 'create' | 'edit' | null;

const INITIAL_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'OTHER' as ProductCategory,
  stock: '',
  imageUrl: '',
  availability: 'PERMANENT' as ProductAvailability,
  limitedUntil: '',
  isActive: true,
};

export default function Products() {
  const {
    products,
    loading,
    creating,
    updating,
    deleting,
    error,
    fetchAdmin,
    createProduct,
    updateProduct,
    softDeleteProduct,
    toggleProduct,
    clearError,
  } = useProducts();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ProductCategory | 'ALL'>('ALL');
  const [filterAvailability, setFilterAvailability] = useState<ProductAvailability | 'ALL'>('ALL');
  const [showInactive, setShowInactive] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInactive, filterCategory, filterAvailability]);

  const loadProducts = useCallback(() => {
    fetchAdmin({
      includeInactive: showInactive,
      ...(filterCategory !== 'ALL' && { category: filterCategory }),
      ...(filterAvailability !== 'ALL' && { availability: filterAvailability }),
      ...(searchTerm && { search: searchTerm }),
    });
  }, [fetchAdmin, showInactive, filterCategory, filterAvailability, searchTerm]);

  const handleSearch = () => loadProducts();

  const openCreate = () => {
    setForm(INITIAL_FORM);
    setFormErrors({});
    setSelectedProduct(null);
    setModalMode('create');
    clearError();
  };

  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(Number(product.price)),
      category: product.category,
      stock: String(product.stock),
      imageUrl: product.imageUrl || '',
      availability: product.availability,
      limitedUntil: product.limitedUntil
        ? new Date(product.limitedUntil).toISOString().slice(0, 16)
        : '',
      isActive: product.isActive,
    });
    setFormErrors({});
    setSelectedProduct(product);
    setModalMode('edit');
    clearError();
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedProduct(null);
    setFormErrors({});
    clearError();
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.name.trim() || form.name.length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }
    if (!form.price || Number(form.price) <= 0) {
      errors.price = 'El precio debe ser mayor a 0';
    }
    if (!form.stock || Number(form.stock) < 0) {
      errors.stock = 'El stock no puede ser negativo';
    }
    if (form.availability === 'LIMITED' && !form.limitedUntil) {
      errors.limitedUntil = 'Los productos limitados requieren una fecha límite';
    }
    if (
      form.availability === 'LIMITED' &&
      form.limitedUntil &&
      new Date(form.limitedUntil) <= new Date()
    ) {
      errors.limitedUntil = 'La fecha límite debe ser futura';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      category: form.category,
      stock: Number(form.stock),
      imageUrl: form.imageUrl.trim() || null,
      availability: form.availability,
      limitedUntil: form.availability === 'LIMITED' && form.limitedUntil
        ? new Date(form.limitedUntil).toISOString()
        : null,
      isActive: form.isActive,
    };

    let success = false;
    if (modalMode === 'create') {
      const result = await createProduct(payload);
      success = !!result;
    } else if (modalMode === 'edit' && selectedProduct) {
      const result = await updateProduct(selectedProduct.id, payload);
      success = !!result;
    }

    if (success) {
      closeModal();
      loadProducts();
    }
  };

  const handleSoftDelete = async (id: string) => {
    const ok = await softDeleteProduct(id);
    if (ok) setDeleteConfirm(null);
  };

  const handleToggle = async (id: string) => {
    await toggleProduct(id);
  };

  const formatPrice = (price: string) => {
    return `$${Number(price).toLocaleString('es-CO')}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return { label: 'Sin stock', className: 'bg-red-500/10 text-red-400' };
    if (stock <= 5) return { label: `${stock} unidades`, className: 'bg-orange-500/10 text-orange-400' };
    return { label: `${stock} disponibles`, className: 'bg-green-500/10 text-green-400' };
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Header */}
      <div className="bg-[#1A1A1A] border-b border-[#2A2A2A] px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
                <ShoppingBag size={20} className="text-[#C9A84C]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Productos</h1>
                <p className="text-sm text-[#9CA3AF]">Gestiona tu tienda interna</p>
              </div>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] px-4 py-2.5 rounded-xl font-semibold transition-all hover:scale-105"
            >
              <Plus size={18} />
              Nuevo Producto
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-[#252525] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-[#9CA3AF] focus:border-[#C9A84C] focus:outline-none transition-colors"
              />
            </div>

            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as ProductCategory | 'ALL')}
                className="bg-[#252525] border border-[#2A2A2A] rounded-xl pl-9 pr-8 py-2.5 text-white text-sm focus:border-[#C9A84C] focus:outline-none appearance-none cursor-pointer"
              >
                <option value="ALL">Todas las categorías</option>
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
            </div>

            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value as ProductAvailability | 'ALL')}
                className="bg-[#252525] border border-[#2A2A2A] rounded-xl pl-9 pr-8 py-2.5 text-white text-sm focus:border-[#C9A84C] focus:outline-none appearance-none cursor-pointer"
              >
                <option value="ALL">Todas las disponibilidades</option>
                {PRODUCT_AVAILABILITY.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
              <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
            </div>

            <label className="flex items-center gap-2 text-sm text-[#9CA3AF] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="w-4 h-4 rounded border-[#2A2A2A] bg-[#252525] text-[#C9A84C] focus:ring-[#C9A84C] focus:ring-offset-0"
              />
              Mostrar inactivos
            </label>
          </div>
        </div>
      </div>

      {/* Content */}
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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={32} className="text-[#C9A84C] animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="text-[#3A3A3A] mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-1">No hay productos</h3>
            <p className="text-[#9CA3AF] text-sm mb-6">
              {showInactive
                ? 'No se encontraron productos con los filtros aplicados'
                : 'Empieza agregando tu primer producto a la tienda'}
            </p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] px-4 py-2.5 rounded-xl font-semibold transition-all"
            >
              <Plus size={18} />
              Crear Producto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => {
              const stockBadge = getStockBadge(product.stock);
              const isLimited = product.availability === 'LIMITED';
              const isExpired = isLimited && product.limitedUntil && new Date(product.limitedUntil) < new Date();

              return (
                <div
                  key={product.id}
                  className={`bg-[#1E1E1E] rounded-2xl border overflow-hidden transition-all group ${
                    product.isActive
                      ? 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                      : 'border-[#2A2A2A] opacity-60'
                  }`}
                >
                  {/* Imagen */}
                  <div className="h-40 bg-[#252525] relative overflow-hidden">
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
                        <ImageIcon size={40} className="text-[#3A3A3A]" />
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium backdrop-blur-sm ${
                        isLimited
                          ? isExpired
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-orange-500/20 text-orange-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {getAvailabilityLabel(product.availability)}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg text-xs font-medium backdrop-blur-sm bg-[#C9A84C]/20 text-[#C9A84C]">
                        {getCategoryLabel(product.category)}
                      </span>
                    </div>
                    {!product.isActive && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-[#252525] text-[#9CA3AF] text-xs font-medium">
                          Inactivo
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold group-hover:text-[#C9A84C] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <span className="text-[#C9A84C] font-bold text-lg">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    {product.description && (
                      <p className="text-[#9CA3AF] text-sm line-clamp-2 mb-3">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${stockBadge.className}`}>
                        {stockBadge.label}
                      </span>
                      {isLimited && product.limitedUntil && (
                        <span className="text-orange-400/70 text-xs">
                          Hasta {formatDate(product.limitedUntil)}
                        </span>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 pt-4 border-t border-[#2A2A2A]">
                      <button
                        onClick={() => openEdit(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-[#252525] hover:bg-[#3A3A3A] text-white text-sm py-2 rounded-lg transition-colors"
                      >
                        <Pencil size={14} />
                        Editar
                      </button>

                      {product.isActive ? (
                        <button
                          onClick={() => handleToggle(product.id)}
                          disabled={updating}
                          className="flex items-center justify-center gap-1.5 bg-[#252525] hover:bg-[#3A3A3A] text-[#9CA3AF] hover:text-yellow-400 text-sm px-3 py-2 rounded-lg transition-colors"
                          title="Desactivar"
                        >
                          <EyeOff size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggle(product.id)}
                          disabled={updating}
                          className="flex items-center justify-center gap-1.5 bg-[#252525] hover:bg-[#3A3A3A] text-[#9CA3AF] hover:text-green-400 text-sm px-3 py-2 rounded-lg transition-colors"
                          title="Activar"
                        >
                          <Eye size={14} />
                        </button>
                      )}

                      {deleteConfirm === product.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSoftDelete(product.id)}
                            disabled={deleting}
                            className="flex items-center justify-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg transition-colors"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex items-center justify-center gap-1 bg-[#252525] hover:bg-[#3A3A3A] text-[#9CA3AF] text-sm px-3 py-2 rounded-lg transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="flex items-center justify-center gap-1.5 bg-[#252525] hover:bg-red-500/20 text-[#9CA3AF] hover:text-red-400 text-sm px-3 py-2 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1E1E1E] rounded-2xl border border-[#2A2A2A] w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1E1E1E] border-b border-[#2A2A2A] px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-white">
                {modalMode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-[#9CA3AF] hover:text-white hover:bg-[#252525] rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full bg-[#252525] border rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#9CA3AF] focus:outline-none transition-colors ${
                    formErrors.name ? 'border-red-500' : 'border-[#2A2A2A] focus:border-[#C9A84C]'
                  }`}
                  placeholder="Ej: Cera para barba"
                />
                {formErrors.name && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                  Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#252525] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#9CA3AF] focus:border-[#C9A84C] focus:outline-none transition-colors resize-none"
                  placeholder="Describe el producto..."
                />
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                    Precio ($) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={`w-full bg-[#252525] border rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#9CA3AF] focus:outline-none transition-colors ${
                      formErrors.price ? 'border-red-500' : 'border-[#2A2A2A] focus:border-[#C9A84C]'
                    }`}
                    placeholder="20000"
                  />
                  {formErrors.price && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.price}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                    Stock <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className={`w-full bg-[#252525] border rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#9CA3AF] focus:outline-none transition-colors ${
                      formErrors.stock ? 'border-red-500' : 'border-[#2A2A2A] focus:border-[#C9A84C]'
                    }`}
                    placeholder="10"
                  />
                  {formErrors.stock && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.stock}</p>
                  )}
                </div>
              </div>

              {/* Categoría y Disponibilidad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                    Categoría <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                    className="w-full bg-[#252525] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-white text-sm focus:border-[#C9A84C] focus:outline-none appearance-none cursor-pointer"
                  >
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                    Disponibilidad <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.availability}
                    onChange={(e) => setForm({ ...form, availability: e.target.value as ProductAvailability })}
                    className="w-full bg-[#252525] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-white text-sm focus:border-[#C9A84C] focus:outline-none appearance-none cursor-pointer"
                  >
                    {PRODUCT_AVAILABILITY.map((a) => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fecha límite (condicional) */}
              {form.availability === 'LIMITED' && (
                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                    Fecha límite <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={form.limitedUntil}
                    onChange={(e) => setForm({ ...form, limitedUntil: e.target.value })}
                    className={`w-full bg-[#252525] border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none transition-colors ${
                      formErrors.limitedUntil ? 'border-red-500' : 'border-[#2A2A2A] focus:border-[#C9A84C]'
                    }`}
                  />
                  {formErrors.limitedUntil && (
                    <p className="text-red-400 text-xs mt-1">{formErrors.limitedUntil}</p>
                  )}
                </div>
              )}

              {/* Imagen URL */}
              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                  URL de imagen
                </label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full bg-[#252525] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#9CA3AF] focus:border-[#C9A84C] focus:outline-none transition-colors"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              {/* Estado activo */}
              <label className="flex items-center gap-2 text-sm text-[#9CA3AF] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-[#2A2A2A] bg-[#252525] text-[#C9A84C] focus:ring-[#C9A84C] focus:ring-offset-0"
                />
                Producto activo
              </label>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-[#252525] hover:bg-[#3A3A3A] text-white py-2.5 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="flex-1 bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] py-2.5 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {(creating || updating) && <Loader size={16} className="animate-spin" />}
                  {modalMode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}