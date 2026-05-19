// frontend/src/pages/admin/Services.tsx
import { useState } from 'react';
import { useServices } from '@hooks/useServices';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Pencil, X, Check, Clock, DollarSign,
  Scissors, AlertCircle, Loader2, Eye, EyeOff, ImageIcon, Trash2,
  Search, Filter, ArrowUpDown, Sparkles, Package, ArrowLeft
} from 'lucide-react';

interface ServiceFormData {
  name: string;
  description: string;
  price: string;
  durationMinutes: string;
  imageUrl: string;
}

const INITIAL_FORM: ServiceFormData = {
  name: '',
  description: '',
  price: '',
  durationMinutes: '',
  imageUrl: '',
};

export default function AdminServices() {
  const {
    services,
    loading,
    saving,
    createService,
    updateService,
    deleteService,
    reactivateService,
    hardDeleteService,
  } = useServices({ mode: 'admin', autoFetch: true });

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'duration'>('name');

  const openCreate = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setFormError(null);
    setActionError(null);
    setShowModal(true);
  };

  const openEdit = (service: any) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      durationMinutes: service.durationMinutes.toString(),
      imageUrl: service.imageUrl || '',
    });
    setFormError(null);
    setActionError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('El nombre es obligatorio');
      return;
    }
    const price = Number(formData.price);
    if (isNaN(price) || price <= 0) {
      setFormError('El precio debe ser un número mayor a 0');
      return;
    }
    const duration = Number(formData.durationMinutes);
    if (isNaN(duration) || duration < 5 || duration > 480) {
      setFormError('La duración debe estar entre 5 y 480 minutos');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price,
        durationMinutes: duration,
        imageUrl: formData.imageUrl.trim() || undefined,
      };

      if (editingId) {
        await updateService(editingId, payload);
      } else {
        await createService(payload);
      }

      setShowModal(false);
      setFormData(INITIAL_FORM);
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleDeactivate = async (id: string) => {
    setActionError(null);
    try {
      await deleteService(id);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleReactivate = async (id: string) => {
    setActionError(null);
    try {
      await reactivateService(id);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Filtrar y ordenar servicios
  const filteredServices = services
    .filter(s => {
      if (filterActive === 'active') return s.isActive;
      if (filterActive === 'inactive') return !s.isActive;
      return true;
    })
    .filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-3 border-[#C9A84C] border-t-transparent" />
          <p className="text-[#9CA3AF] text-sm animate-pulse">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Header elegante */}
      <div className="bg-[#1A1A1A] border-b border-[#2A2A2A] px-4 md:px-6 py-4 md:py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
            <div className="flex items-center gap-3 md:gap-4">
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="p-2 rounded-xl hover:bg-[#252525] text-[#9CA3AF] hover:text-white transition-all"
                  title="Volver al dashboard"
                >
                  <ArrowLeft size={20} />
                </button>
              
            <div>  
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center border border-[#C9A84C]/20 flex-shrink-0">
                  <Scissors size={16} className="md:size-[20px] text-[#C9A84C]" />
                </div>
                
                <span className="truncate">Servicios</span>
              </h1>
              <p className="text-[#9CA3AF] text-xs md:text-sm mt-1 md:mt-2 ml-10 md:ml-[52px]">
                {services.filter(s => s.isActive).length} activos • {services.filter(s => !s.isActive).length} inactivos • {services.length} total
              </p>

              </div>
            </div>
            <button
              onClick={openCreate}
              disabled={saving}
              className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#B8983F] disabled:bg-[#C9A84C]/50 text-[#1A1A1A] px-4 md:px-5 py-2.5 md:py-3 rounded-xl font-semibold transition-all hover:scale-105 disabled:hover:scale-100 shadow-lg shadow-[#C9A84C]/10 text-sm"
            >
              <Plus size={16} className="md:size-[18px]" />
              <span className="hidden sm:inline">Nuevo servicio</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-4 md:space-y-6">
        {actionError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 animate-in slide-in-from-top-2">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span className="text-sm">{actionError}</span>
          </div>
        )}

        {/* Barra de filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar servicios..."
              className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-[#3A3A3A] focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value as any)}
                className="w-full sm:w-auto bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A84C] appearance-none cursor-pointer"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            <button
              onClick={() => setSortBy(sortBy === 'name' ? 'price' : sortBy === 'price' ? 'duration' : 'name')}
              className="flex items-center gap-2 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-sm hover:border-[#C9A84C]/30 transition-colors flex-shrink-0"
              title={`Ordenar por: ${sortBy}`}
            >
              <ArrowUpDown size={14} className="text-[#9CA3AF]" />
              <span className="hidden sm:inline text-[#9CA3AF]">
                {sortBy === 'name' ? 'Nombre' : sortBy === 'price' ? 'Precio' : 'Duración'}
              </span>
            </button>
          </div>
        </div>

        {/* Grid de servicios mejorado */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#252525] flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="md:size-[40px] text-[#3A3A3A]" />
            </div>
            <p className="text-[#9CA3AF] text-base md:text-lg font-medium">
              {searchQuery ? 'No se encontraron servicios' : 'No hay servicios registrados'}
            </p>
            <p className="text-[#3A3A3A] text-sm mt-1">
              {searchQuery ? 'Intenta con otra búsqueda' : 'Crea tu primer servicio para empezar'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className={`group bg-[#1E1E1E] rounded-2xl border transition-all duration-300 overflow-hidden ${
                  service.isActive 
                    ? 'border-[#2A2A2A] hover:border-[#C9A84C]/30 hover:shadow-lg hover:shadow-[#C9A84C]/5' 
                    : 'border-red-500/20 opacity-60 hover:opacity-80'
                }`}
              >
                {/* Imagen con overlay */}
                <div className="h-40 md:h-44 bg-[#252525] relative overflow-hidden">
                  {service.imageUrl ? (
                    <img 
                      src={service.imageUrl} 
                      alt={service.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Scissors size={40} className="md:size-[48px] text-[#3A3A3A] group-hover:text-[#2A2A2A] transition-colors" />
                    </div>
                  )}

                  {/* Badge de estado */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 backdrop-blur-md ${
                      service.isActive 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {service.isActive ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          Activo
                        </>
                      ) : (
                        <>
                          <EyeOff size={10} />
                          Inactivo
                        </>
                      )}
                    </span>
                  </div>

                  {/* Acciones rápidas */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(service)}
                      className="p-2 rounded-lg bg-black/60 backdrop-blur-md text-white hover:bg-[#C9A84C] hover:text-[#1A1A1A] transition-all"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('¿Eliminar permanentemente? Esta acción no se puede deshacer.')) {
                          try {
                            await hardDeleteService(service.id);
                          } catch (err: any) {
                            alert(err.message);
                          }
                        }
                      }}
                      className="p-2 rounded-lg bg-black/60 backdrop-blur-md text-white hover:bg-red-500 transition-all"
                      title="Eliminar permanentemente"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="p-4 md:p-5">
                  <h3 className="text-white font-semibold text-base md:text-lg mb-2 group-hover:text-[#C9A84C] transition-colors">
                    {service.name}
                  </h3>

                  {service.description && (
                    <p className="text-[#9CA3AF] text-xs md:text-sm mb-3 md:mb-4 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5">
                    <div className="flex items-center gap-1.5 bg-[#C9A84C]/10 px-2 md:px-3 py-1.5 rounded-lg border border-[#C9A84C]/20">
                      <DollarSign size={14} className="text-[#C9A84C]" />
                      <span className="text-[#C9A84C] font-bold text-sm">
                        ${Number(service.price).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#252525] px-2 md:px-3 py-1.5 rounded-lg border border-[#2A2A2A]">
                      <Clock size={14} className="text-[#9CA3AF]" />
                      <span className="text-[#9CA3AF] text-sm font-medium">
                        {service.durationMinutes} min
                      </span>
                    </div>
                  </div>

                  {/* Toggle activo/inactivo */}
                  <button
                    onClick={() => service.isActive ? handleDeactivate(service.id) : handleReactivate(service.id)}
                    disabled={saving}
                    className={`w-full py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      service.isActive
                        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                        : 'bg-[#252525] text-[#9CA3AF] hover:bg-[#3A3A3A] border border-[#2A2A2A]'
                    }`}
                  >
                    {service.isActive ? (
                      <>
                        <Eye size={16} />
                        Servicio activo
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Reactivar servicio
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal mejorado */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)} />

          <div className="relative bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header con gradiente sutil */}
            <div className="p-4 md:p-6 border-b border-[#2A2A2A] bg-gradient-to-r from-[#C9A84C]/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white">
                    {editingId ? 'Editar Servicio' : 'Nuevo Servicio'}
                  </h2>
                  <p className="text-[#9CA3AF] text-xs md:text-sm mt-1">
                    {editingId ? 'Modifica los detalles del servicio' : 'Crea un nuevo servicio para tus clientes'}
                  </p>
                </div>
                <button
                  onClick={() => !saving && setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-[#252525] text-[#9CA3AF] hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-5">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2 animate-in slide-in-from-top-1">
                  <AlertCircle size={16} />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Nombre del servicio *</label>
                <div className="relative">
                  <Scissors size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Corte de cabello"
                    className="w-full bg-[#252525] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#3A3A3A] focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el servicio, técnica, productos usados..."
                  rows={3}
                  className="w-full bg-[#252525] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-[#3A3A3A] focus:outline-none focus:border-[#C9A84C] transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Precio ($) *</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9A84C]" />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="20000"
                      min="0"
                      className="w-full bg-[#252525] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#3A3A3A] focus:outline-none focus:border-[#C9A84C] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Duración (min) *</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                      placeholder="60"
                      min="5"
                      max="480"
                      className="w-full bg-[#252525] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#3A3A3A] focus:outline-none focus:border-[#C9A84C] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-2">URL de imagen</label>
                <div className="relative">
                  <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full bg-[#252525] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#3A3A3A] focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                </div>
                <p className="text-[#3A3A3A] text-xs mt-2">
                  Deja vacío para usar imagen por defecto
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="flex-1 py-2.5 md:py-3 border border-[#2A2A2A] text-[#9CA3AF] rounded-xl hover:bg-[#252525] transition-colors font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 md:py-3 bg-[#C9A84C] hover:bg-[#B8983F] disabled:bg-[#C9A84C]/50 text-[#1A1A1A] rounded-xl transition-all font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#C9A84C]/10 text-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      {editingId ? 'Actualizar' : 'Crear servicio'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}