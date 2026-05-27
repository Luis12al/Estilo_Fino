import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useOffers } from '@hooks/useOffers';
import { Link, useNavigate } from 'react-router-dom';
import {
  LogOut, Plus, X, CheckCircle, Star, Calendar, Clock,
  Tag, Percent, DollarSign, Image, Type, FileText,
  ToggleLeft, ToggleRight, Edit3, Eye, Menu,
  TrendingUp, Settings, Scissors, Users
} from 'lucide-react';
import type { OfferType, CreateOfferInput } from '@api/offer.api';

// ============================================
// TIPOS LOCALES
// ============================================

interface OfferFormData {
  title: string;
  description: string;
  originalPrice: string;
  finalPrice: string;
  discountPercent: string;
  type: OfferType;
  validFrom: string;
  validUntil: string;
  imageUrl: string;
}

// ============================================
// COMPONENTE: Badge de Tipo
// ============================================

const TypeBadge = ({ type }: { type: OfferType }) => {
  if (type === 'PERMANENT') {
    return (
      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] sm:text-xs rounded-full border border-blue-500/20 flex items-center gap-1 whitespace-nowrap">
        <Clock size={10} className="sm:size-[12px]" />
        <span className="hidden sm:inline">Permanente</span>
        <span className="sm:hidden">Perm.</span>
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[10px] sm:text-xs rounded-full border border-orange-500/20 flex items-center gap-1 whitespace-nowrap">
      <Calendar size={10} className="sm:size-[12px]" />
      <span className="hidden sm:inline">Por tiempo limitado</span>
      <span className="sm:hidden">Limit.</span>
    </span>
  );
};

// ============================================
// COMPONENTE: Badge de Estado
// ============================================

const StatusBadge = ({ isActive }: { isActive: boolean }) => {
  if (isActive) {
    return (
      <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] sm:text-xs rounded-full border border-green-500/20 flex items-center gap-1 whitespace-nowrap">
        <ToggleRight size={10} className="sm:size-[12px]" />
        Activa
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] sm:text-xs rounded-full border border-red-500/20 flex items-center gap-1 whitespace-nowrap">
      <ToggleLeft size={10} className="sm:size-[12px]" />
      Inactiva
      </span>
    );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function AdminOffers() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    offers,
    loading,
    actionLoading,
    error,
    includeInactive,
    setIncludeInactive,
    create,
    update,
    deactivate,
    reactivate,
    refresh,
  } = useOffers({ mode: 'admin', autoFetch: true });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<OfferFormData>({
    title: '',
    description: '',
    originalPrice: '',
    discountPercent: '',
    finalPrice: '',
    type: 'PERMANENT',
    validFrom: '',
    validUntil: '',
    imageUrl: '',
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      originalPrice: '',
      discountPercent: '',
      finalPrice: '',
      type: 'PERMANENT',
      validFrom: '',
      validUntil: '',
      imageUrl: '',
    });
    setFormError(null);
    setEditingId(null);
  }, []);

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (offer: any) => {
    setEditingId(offer.id);
    setFormData({
      title: offer.title,
      description: offer.description || '',
      originalPrice: offer.originalPrice ? String(Number(offer.originalPrice)) : '',
      discountPercent: offer.discountPercent?.toString() || '',
      finalPrice: offer.finalPrice ? String(Number(offer.finalPrice)) : '',
      type: offer.type,
      validFrom: offer.validFrom ? offer.validFrom.split('T')[0] : '',
      validUntil: offer.validUntil ? offer.validUntil.split('T')[0] : '',
      imageUrl: offer.imageUrl || '',
    });
    setShowModal(true);
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'El título es obligatorio';
    if (!formData.originalPrice || parseFloat(formData.originalPrice) <= 0) {
      return 'El precio original es obligatorio y debe ser mayor a 0';
    }
    if (formData.type === 'LIMITED_TIME') {
      if (!formData.validFrom || !formData.validUntil) {
        return 'Las ofertas por tiempo limitado requieren fechas de inicio y fin';
      }
      if (new Date(formData.validFrom) > new Date(formData.validUntil)) {
        return 'La fecha de inicio no puede ser posterior a la fecha de fin';
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload: CreateOfferInput = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      originalPrice: parseFloat(formData.originalPrice),
      type: formData.type,
      ...(formData.discountPercent && { discountPercent: parseInt(formData.discountPercent) }),
      ...(formData.finalPrice && { finalPrice: parseFloat(formData.finalPrice) }),
      ...(formData.type === 'LIMITED_TIME' && {
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
      }),
      ...(formData.imageUrl.trim() && { imageUrl: formData.imageUrl.trim() }),
    };

    try {
      if (editingId) {
        await update(editingId, payload);
      } else {
        await create(payload);
      }
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar la oferta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (offer: any) => {
    try {
      if (offer.isActive) {
        await deactivate(offer.id);
      } else {
        await reactivate(offer.id);
      }
    } catch (err: any) {
      // Error ya se maneja en el hook
    }
  };

  const formatPrice = (offer: any) => {
    const original = offer.originalPrice ? Number(offer.originalPrice) : null;
    const final = offer.finalPrice ? Number(offer.finalPrice) : null;
    const discount = offer.discountPercent;

    if (original && final && discount) {
      return (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[#9CA3AF] line-through text-xs sm:text-sm">${original.toLocaleString()}</span>
          <span className="text-[#C9A84C] font-bold text-base sm:text-lg">${final.toLocaleString()}</span>
          <span className="bg-[#C9A84C]/10 text-[#C9A84C] text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">-{discount}%</span>
        </div>
      );
    }
    
    if (original) {
      return <span className="text-[#C9A84C] font-bold text-base sm:text-lg">${original.toLocaleString()}</span>;
    }
    
    return <span className="text-[#9CA3AF] text-xs sm:text-sm">Sin precio</span>;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateFinalPrice = useCallback(() => {
    const original = parseFloat(formData.originalPrice);
    const discount = parseFloat(formData.discountPercent);
    
    if (!isNaN(original) && !isNaN(discount) && discount >= 0 && discount <= 100) {
      const discountAmount = (original * discount) / 100;
      const final = original - discountAmount;
      return Math.round(final * 100) / 100;
    }
    
    if (!isNaN(original)) {
      return original;
    }
    
    return '';
  }, [formData.originalPrice, formData.discountPercent]);

  useEffect(() => {
    const calculated = calculateFinalPrice();
    if (calculated !== '') {
      setFormData(prev => ({
        ...prev,
        finalPrice: calculated.toString(),
      }));
    }
  }, [formData.originalPrice, formData.discountPercent, calculateFinalPrice]);

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <div className="flex">
        {/* ============================================
            SIDEBAR — RESPONSIVO
            ============================================ */}
        <aside 
          className={`
            fixed left-0 top-0 z-50 h-screen w-64 bg-[#1A1A1A] border-r border-[#2A2A2A] 
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:static lg:z-auto
          `}
        >
          <div className="p-4 sm:p-6 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C9A84C]/10 rounded-full flex items-center justify-center border-2 border-[#C9A84C] flex-shrink-0">
                <img src="/logo.jpeg" alt="Estilo Fino" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-white truncate">Estilo_Fino</h1>
                <p className="text-[10px] sm:text-xs text-[#9CA3AF]">Panel de Control</p>
              </div>
            </div>
          </div>

          <nav className="p-3 sm:p-4 space-y-1 sm:space-y-2">
            {[
              { label: 'Inicio', icon: TrendingUp, path: '/admin/dashboard' },
              { label: 'Agenda', icon: Calendar, path: '/admin/schedule' },
              { label: 'Citas', icon: Clock, path: '/admin/appointments' },
              { label: 'Servicios', icon: Scissors, path: '/admin/services' },
              { label: 'Ofertas', icon: Star, path: '/admin/offers', active: true },
              { label: 'Productos', icon: Settings, path: '/admin/products' },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all text-sm ${
                  item.active
                    ? 'bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20'
                    : 'text-[#9CA3AF] hover:bg-[#252525] hover:text-white'
                }`}
              >
                <item.icon size={16} className="sm:size-[18px] flex-shrink-0" />
                <span className="font-medium truncate">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-[#2A2A2A]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-[#9CA3AF] hover:text-red-400 transition-colors w-full rounded-xl hover:bg-[#252525] text-sm"
            >
              <LogOut size={16} className="sm:size-[18px] flex-shrink-0" />
              <span className="font-medium">Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* Overlay móvil para sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}

        {/* ============================================
            MAIN CONTENT
            ============================================ */}
        <main className="flex-1 min-w-0 lg:ml-0">
          {/* ============================================
              TOP BAR — RESPONSIVO
              ============================================ */}
          <div className="bg-[#1A1A1A] border-b border-[#2A2A2A] px-3 sm:px-4 md:px-8 py-3 sm:py-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-[#252525] text-[#9CA3AF] flex-shrink-0"
              >
                <Menu size={18} className="sm:size-[20px]" />
              </button>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">Gestión de Ofertas</h2>
                <p className="text-[#9CA3AF] text-[10px] sm:text-xs md:text-sm hidden sm:block">Crea y administra promociones</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] rounded-xl font-medium text-xs sm:text-sm transition-all active:scale-95"
              >
                <Plus size={14} className="sm:size-[16px]" />
                <span className="hidden sm:inline">Nueva Oferta</span>
                <span className="sm:hidden">Nueva</span>
              </button>
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-white truncate max-w-[120px]">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-[#9CA3AF]">Barbero</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#C9A84C]/10 flex items-center justify-center border border-[#C9A84C]/20 flex-shrink-0">
                  <Users size={14} className="sm:size-[18px] text-[#C9A84C]" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 md:p-8">
            {/* ============================================
                FILTROS — RESPONSIVOS
                ============================================ */}
            <div className="bg-[#1E1E1E] rounded-xl p-3 sm:p-4 border border-[#2A2A2A] mb-4 md:mb-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Eye size={14} className="sm:size-[16px] text-[#9CA3AF]" />
                  <span className="text-white text-xs sm:text-sm font-medium">Mostrar:</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIncludeInactive(false)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all ${
                      !includeInactive
                        ? 'bg-[#C9A84C] text-[#1A1A1A] font-medium'
                        : 'bg-[#252525] text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    Activas
                  </button>
                  <button
                    onClick={() => setIncludeInactive(true)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all ${
                      includeInactive
                        ? 'bg-[#C9A84C] text-[#1A1A1A] font-medium'
                        : 'bg-[#252525] text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    Todas
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-4 text-red-500 text-xs sm:text-sm mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>{error}</span>
                <button onClick={refresh} className="underline hover:no-underline text-left sm:text-right">
                  Reintentar
                </button>
              </div>
            )}

            {/* ============================================
                LISTA DE OFERTAS — GRID RESPONSIVO
                ============================================ */}
            {loading && offers.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-2 border-[#C9A84C] border-t-transparent" />
              </div>
            ) : offers.length === 0 ? (
              <div className="bg-[#1E1E1E] rounded-xl p-6 sm:p-8 border border-[#2A2A2A] text-center">
                <Tag size={28} className="sm:size-[32px] text-[#3A3A3A] mx-auto mb-3" />
                <p className="text-[#9CA3AF] text-sm">No hay ofertas para mostrar</p>
                <p className="text-[#3A3A3A] text-xs mt-1">Crea tu primera promoción</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {offers.map((offer) => {
                  const isProcessing = actionLoading === offer.id;

                  return (
                    <div
                      key={offer.id}
                      className={`bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all overflow-hidden ${
                        isProcessing ? 'opacity-60' : ''
                      } ${!offer.isActive ? 'grayscale-[0.3]' : ''}`}
                    >
                      {/* Imagen — Altura responsiva */}
                      <div className="h-32 sm:h-36 md:h-40 bg-[#252525] relative overflow-hidden">
                        {offer.imageUrl ? (
                          <img
                            src={offer.imageUrl}
                            alt={offer.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Tag size={32} className="sm:size-[40px] text-[#3A3A3A]" />
                          </div>
                        )}
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-wrap gap-1.5 sm:gap-2">
                          <TypeBadge type={offer.type} />
                          <StatusBadge isActive={offer.isActive} />
                        </div>
                      </div>

                      {/* Contenido — Padding responsivo */}
                      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                        <div className="min-w-0">
                          <h4 className="text-white font-semibold text-sm sm:text-base truncate">{offer.title}</h4>
                          <p className="text-[#9CA3AF] text-[11px] sm:text-xs mt-0.5 sm:mt-1 line-clamp-2">{offer.description || 'Sin descripción'}</p>
                        </div>

                        {/* Precio */}
                        <div className="pt-0.5 sm:pt-1">
                          {formatPrice(offer)}
                        </div>

                        {offer.type === 'LIMITED_TIME' && (
                          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-[#9CA3AF]">
                            <Calendar size={10} className="sm:size-[12px]" />
                            <span className="truncate">
                              {formatDate(offer.validFrom)} — {formatDate(offer.validUntil)}
                            </span>
                          </div>
                        )}

                        {/* Acciones — Botones apilados en móvil muy pequeño */}
                        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 pt-2 border-t border-[#2A2A2A]">
                          <button
                            onClick={() => openEdit(offer)}
                            disabled={isProcessing}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#252525] hover:bg-[#3A3A3A] text-[#9CA3AF] hover:text-white text-xs transition-all disabled:opacity-40"
                          >
                            <Edit3 size={12} className="sm:size-[14px]" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(offer)}
                            disabled={isProcessing}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all disabled:opacity-40 ${
                              offer.isActive
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white'
                                : 'bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white'
                            }`}
                          >
                            {offer.isActive ? (
                              <>
                                <ToggleLeft size={12} className="sm:size-[14px]" />
                                <span>Desactivar</span>
                              </>
                            ) : (
                              <>
                                <ToggleRight size={12} className="sm:size-[14px]" />
                                <span>Activar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ============================================
          MODAL — TOTALMENTE RESPONSIVO
          ============================================ */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
            onClick={() => !submitting && setShowModal(false)} 
          />

          <div className="relative bg-[#1E1E1E] rounded-t-2xl sm:rounded-2xl border border-[#2A2A2A] w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-[#1E1E1E] border-b border-[#2A2A2A] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
              <h3 className="text-base sm:text-lg font-bold text-white">
                {editingId ? 'Editar Oferta' : 'Nueva Oferta'}
              </h3>
              <button
                onClick={() => !submitting && setShowModal(false)}
                className="p-2 rounded-lg hover:bg-[#252525] text-[#9CA3AF] hover:text-white transition-colors"
              >
                <X size={18} className="sm:size-[20px]" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-4 text-red-500 text-xs sm:text-sm">
                  {formError}
                </div>
              )}

              {/* Título */}
              <div>
                <label className="block text-white text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Título *</label>
                <div className="relative">
                  <Type size={16} className="sm:size-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Descuento de Verano"
                    className="w-full bg-[#252525] border border-[#2A2A2A] text-white text-sm rounded-xl pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#3A3A3A]"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-white text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Descripción</label>
                <div className="relative">
                  <FileText size={16} className="sm:size-[18px] absolute left-3 top-3 text-[#9CA3AF]" />
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe la oferta..."
                    rows={2}
                    className="w-full bg-[#252525] border border-[#2A2A2A] text-white text-sm rounded-xl pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#3A3A3A] resize-none"
                  />
                </div>
              </div>

              {/* Tipo de oferta */}
              <div>
                <label className="block text-white text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Tipo de oferta *</label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'PERMANENT', validFrom: '', validUntil: '' })}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border transition-all text-xs sm:text-sm ${
                      formData.type === 'PERMANENT'
                        ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]'
                        : 'border-[#2A2A2A] bg-[#252525] text-[#9CA3AF] hover:border-[#3A3A3A]'
                    }`}
                  >
                    <Clock size={14} className="sm:size-[16px]" />
                    Permanente
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'LIMITED_TIME' })}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border transition-all text-xs sm:text-sm ${
                      formData.type === 'LIMITED_TIME'
                        ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]'
                        : 'border-[#2A2A2A] bg-[#252525] text-[#9CA3AF] hover:border-[#3A3A3A]'
                    }`}
                  >
                    <Calendar size={14} className="sm:size-[16px]" />
                    <span className="hidden sm:inline">Por tiempo limitado</span>
                    <span className="sm:hidden">Limitado</span>
                  </button>
                </div>
              </div>

              {/* Precio original */}
              <div>
                <label className="block text-white text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Precio original *</label>
                <div className="relative">
                  <DollarSign size={16} className="sm:size-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="number"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="Ej: 25000"
                    className="w-full bg-[#252525] border border-[#2A2A2A] text-white text-sm rounded-xl pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#3A3A3A]"
                  />
                </div>
              </div>

              {/* % Descuento y Precio Final — 1 columna en móvil, 2 en desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-white text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">% Descuento</label>
                  <div className="relative">
                    <Percent size={16} className="sm:size-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                      placeholder="Ej: 20"
                      className="w-full bg-[#252525] border border-[#2A2A2A] text-white text-sm rounded-xl pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#3A3A3A]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Precio final</label>
                  <div className="relative">
                    <DollarSign size={16} className="sm:size-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-[#C9A84C]" />
                    <input
                      type="number"
                      min="0"
                      value={formData.finalPrice}
                      readOnly
                      className="w-full bg-[#1A1A1A] border border-[#C9A84C]/30 text-[#C9A84C] font-bold text-sm rounded-xl pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 focus:outline-none cursor-default"
                    />
                  </div>
                </div>
              </div>

              {/* Preview del ahorro */}
              {formData.originalPrice && formData.discountPercent && (
                <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-xl p-2.5 sm:p-3 flex items-center justify-between">
                  <span className="text-[#9CA3AF] text-xs sm:text-sm">Ahorro del cliente:</span>
                  <span className="text-[#C9A84C] font-bold text-xs sm:text-sm">
                    ${(parseFloat(formData.originalPrice) - parseFloat(formData.finalPrice || '0')).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Fechas (solo si es LIMITED_TIME) */}
              {formData.type === 'LIMITED_TIME' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-white text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Desde *</label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="w-full bg-[#252525] border border-[#2A2A2A] text-white text-sm rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:border-[#C9A84C] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Hasta *</label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full bg-[#252525] border border-[#2A2A2A] text-white text-sm rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:border-[#C9A84C] transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Imagen */}
              <div>
                <label className="block text-white text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">URL de imagen</label>
                <div className="relative">
                  <Image size={16} className="sm:size-[18px] absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full bg-[#252525] border border-[#2A2A2A] text-white text-sm rounded-xl pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#3A3A3A]"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[#2A2A2A] gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  disabled={submitting}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 text-[#9CA3AF] hover:text-white text-xs sm:text-sm font-medium disabled:opacity-30 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] rounded-xl font-medium text-xs sm:text-sm transition-all disabled:opacity-40 flex items-center gap-1.5 sm:gap-2 active:scale-95"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} className="sm:size-[18px]" />
                      <span>{editingId ? 'Actualizar' : 'Crear Oferta'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}