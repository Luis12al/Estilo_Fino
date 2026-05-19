// frontend/src/pages/admin/Appointments.tsx
import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useBarberAppointments } from '@hooks/useBarberAppointments';
import { useAvailability } from '@hooks/useAvailability';
import { useServices } from '@hooks/useServices';
import { useNavigate, Link } from 'react-router-dom';
import { DatePicker } from '@components/features/booking/DatePicker';
import { TimeSlotGrid } from '@components/features/booking/TimeSlotGrid';
import { barberApi } from '@api/barber.api';
import {
  LogOut, Calendar, Clock, Users, Plus, X, CheckCircle,
  Filter, Phone, User, Scissors, Menu,
  TrendingUp, Star, Settings, Search,
} from 'lucide-react';

// ============================================
// ServiceSelector Controlado (versión admin)
// ============================================
interface ServiceSelectorAdminProps {
  selectedServices: Array<{ id: string; name: string; price: number; durationMinutes: number }>;
  onToggleService: (service: any) => void;
  loading: boolean;
  services: any[];
}

const ServiceSelectorAdmin = ({ selectedServices, onToggleService, loading, services }: ServiceSelectorAdminProps) => {
  const isSelected = (id: string) => selectedServices.some((s) => s.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#C9A84C] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
      {services.map((service) => {
        const selected = isSelected(service.id);
        return (
          <button
            key={service.id}
            onClick={() => onToggleService(service)}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
              selected
                ? 'border-[#C9A84C] bg-[#C9A84C]/10'
                : 'border-[#2A2A2A] bg-[#252525] hover:border-[#3A3A3A]'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              selected ? 'bg-[#C9A84C]/20' : 'bg-[#1E1E1E]'
            }`}>
              <Scissors size={16} className={selected ? 'text-[#C9A84C]' : 'text-[#9CA3AF]'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{service.name}</p>
              <p className="text-[#9CA3AF] text-xs">${Number(service.price).toLocaleString()} • {service.durationMinutes}min</p>
            </div>
            {selected && <CheckCircle size={16} className="text-[#C9A84C] flex-shrink-0" />}
          </button>
        );
      })}
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function AdminAppointments() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const {
    appointments,
    loading,
    actionLoading,
    error,
    refresh,
    updateStatus,
    extend,
    filterStatus,
    setFilterStatus,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    fetchAllAppointments,
    createManual,
  } = useBarberAppointments({ autoFetch: true });

  const { services, loading: servicesLoading } = useServices();
  const { availability, loading: availabilityLoading, error: availabilityError, checkAvailability } = useAvailability();

  // ── Estado del modal de agendamiento manual ──
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);

  const toggleService = useCallback((service: any) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id);
      if (exists) return prev.filter((s) => s.id !== service.id);
      return [...prev, service];
    });
  }, []);

  // Obtener barberId del perfil logueado
  const fetchBarberProfile = useCallback(async () => {
    try {
      const response = await barberApi.getMyProfile();
      if (response.success && response.data) {
        setBarberId(response.data.id);
      }
    } catch (e: any) {
      console.error('Error fetching barber profile:', e.response?.data?.message || e.message);
    }
  }, []);

  const openModal = () => {
    setShowModal(true);
    setStep(1);
    setGuestName('');
    setGuestPhone('');
    setSelectedServices([]);
    setSelectedDate(null);
    setSelectedSlot(null);
    setNotes('');
    setCreateError(null);
    fetchBarberProfile();
  };

  const handleDateSelect = useCallback((date: Date | null) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (date && barberId && totalDuration > 0) {
      const dateStr = date.toISOString().split('T')[0];
      checkAvailability(barberId, dateStr, totalDuration);
    }
  }, [barberId, totalDuration, checkAvailability]);

  const handleCreateManual = async () => {
    if (!selectedDate || !selectedSlot || !guestName.trim() || !guestPhone.trim() || selectedServices.length === 0) {
      setCreateError('Completa todos los campos requeridos');
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const [hours, minutes] = selectedSlot.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);

      await createManual({
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        startTime: startTime.toISOString(),
        serviceIds: selectedServices.map((s) => s.id),
        notes: notes.trim() || undefined,
      });

      setShowModal(false);
      setStep(1);
      setGuestName('');
      setGuestPhone('');
      setSelectedServices([]);
      setSelectedDate(null);
      setSelectedSlot(null);
      setNotes('');
    } catch (err: any) {
      setCreateError(err.message || 'Error al crear la cita');
    } finally {
      setCreating(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleApplyFilters = useCallback(() => {
    // ← FIX: Pasar valores actuales explícitamente, no depender del estado del hook
    fetchAllAppointments({
      status: filterStatus || undefined,
      from: dateFrom || undefined,
      to: dateTo || undefined,
      search: searchQuery.trim() || undefined,
    });
  }, [filterStatus, dateFrom, dateTo, searchQuery, fetchAllAppointments]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING': return { label: 'Pendiente', color: 'text-yellow-400 bg-yellow-400/10', icon: Clock };
      case 'CONFIRMED': return { label: 'Confirmada', color: 'text-blue-400 bg-blue-400/10', icon: CheckCircle };
      case 'IN_PROGRESS': return { label: 'En progreso', color: 'text-[#C9A84C] bg-[#C9A84C]/10', icon: Clock };
      case 'COMPLETED': return { label: 'Completada', color: 'text-green-400 bg-green-400/10', icon: CheckCircle };
      case 'CANCELLED': return { label: 'Cancelada', color: 'text-red-400 bg-red-400/10', icon: X };
      default: return { label: status, color: 'text-[#9CA3AF] bg-[#252525]', icon: Clock };
    }
  };

  useEffect(() => {
    if (searchQuery.trim().length < 2) return; // Solo buscar si hay 2+ chars
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(() => {
      fetchAllAppointments({
        status: filterStatus || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        search: searchQuery.trim(),
      });
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);


  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <div className="flex">
        {/* Sidebar - Responsive */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-64 bg-[#1A1A1A] border-r border-[#2A2A2A] min-h-screen fixed left-0 top-0 z-40 transition-transform duration-300`}>
          <div className="p-6 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
                <img 
                  src="/logo.jpeg"
                  alt="Estilo Fino" 
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Estilo_Fino</h1>
                <p className="text-xs text-[#9CA3AF]">Panel de Control</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {[
              { label: 'Inicio', icon: TrendingUp, path: '/admin/dashboard' },
              { label: 'Agenda', icon: Calendar, path: '/admin/schedule' },
              { label: 'Citas', icon: Clock, active: true, path: '/admin/appointments' },
              { label: 'Servicios', icon: Scissors, path: '/admin/services' },
              { label: 'Ofertas', icon: Star, path: '/admin/offers' },
              { label: 'Productos', icon: Settings, path: '/admin/products' },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  item.active
                    ? 'bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20'
                    : 'text-[#9CA3AF] hover:bg-[#252525] hover:text-white'
                }`}
              >
                <item.icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#2A2A2A]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-[#9CA3AF] hover:text-red-400 transition-colors w-full rounded-xl hover:bg-[#252525]"
            >
              <LogOut size={18} />
              <span className="font-medium text-sm">Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* Overlay móvil para sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          {/* Top Bar */}
          <div className="bg-[#1A1A1A] border-b border-[#2A2A2A] px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-[#252525] text-[#9CA3AF]"
              >
                <Menu size={20} />
              </button>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white">Gestión de Citas</h2>
                <p className="text-[#9CA3AF] text-xs md:text-sm hidden sm:block">Administra tus citas y agenda nuevas</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={openModal}
                className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] rounded-xl font-medium text-xs md:text-sm transition-all"
              >
                <Plus size={16} className="md:size-[18px]" />
                <span className="hidden sm:inline">Nueva Cita</span>
              </button>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-[#9CA3AF]">Barbero</p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#C9A84C]/10 flex items-center justify-center border border-[#C9A84C]/20">
                  <Users size={16} className="md:size-[18px] text-[#C9A84C]" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-8">
            {/* Filtros */}
            <div className="bg-[#1E1E1E] rounded-xl p-3 md:p-4 border border-[#2A2A2A] mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-[#9CA3AF]" />
                  <span className="text-white text-sm font-medium hidden sm:inline">Filtros:</span>
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-[#252525] border border-[#2A2A2A] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#C9A84C]"
                >
                  <option value="">Todos los estados</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="CONFIRMED">Confirmada</option>
                  <option value="IN_PROGRESS">En progreso</option>
                  <option value="COMPLETED">Completada</option>
                  <option value="CANCELLED">Cancelada</option>
                </select>

                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-[#252525] border border-[#2A2A2A] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#C9A84C]"
                />

                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-[#252525] border border-[#2A2A2A] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#C9A84C]"
                />
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar cliente..."
                    className="w-full bg-[#252525] border border-[#2A2A2A] text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
                <button
                  onClick={() => handleApplyFilters()}
                  className="px-4 py-2 bg-[#252525] hover:bg-[#3A3A3A] text-white text-sm rounded-lg transition-colors border border-[#2A2A2A]"
                >
                  Aplicar
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-sm mb-4 md:mb-6">
                {error}
                <button onClick={() => refresh()} className="ml-4 underline hover:no-underline">
                  Reintentar
                </button>
              </div>
            )}

            {/* Lista de citas */}
            {loading && appointments.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#C9A84C] border-t-transparent" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="bg-[#1E1E1E] rounded-xl p-8 border border-[#2A2A2A] text-center">
                <Calendar size={32} className="text-[#3A3A3A] mx-auto mb-3" />
                <p className="text-[#9CA3AF] text-sm">No hay citas para mostrar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => {
                  const status = getStatusConfig(appointment.status);
                  const StatusIcon = status.icon;
                  const isProcessing = actionLoading === appointment.id;

                  const clientName = appointment.client 
                    ? `${appointment.client.firstName} ${appointment.client.lastName}`
                    : (appointment.guestName || 'Cliente no especificado');

                  const clientPhone = appointment.client?.phone 
                    || appointment.guestPhone 
                    || 'Sin teléfono';

                  return (
                    <div key={appointment.id} className={`bg-[#1E1E1E] rounded-xl p-4 md:p-5 border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all ${isProcessing ? 'opacity-60' : ''}`}>
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-0 lg:justify-between">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#252525] flex items-center justify-center flex-shrink-0">
                            <User size={18} className="md:size-[20px] text-[#9CA3AF]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-white font-semibold text-sm md:text-base truncate">{clientName}</h4>
                              {!appointment.client && (
                                <span className="px-2 py-0.5 bg-[#C9A84C]/10 text-[#C9A84C] text-xs rounded-full border border-[#C9A84C]/20">
                                  Walk-in
                                </span>
                              )}
                            </div>
                            <p className="text-[#9CA3AF] text-xs md:text-sm truncate">
                              {appointment.services.map((s: any) => s.service.name).join(', ')}
                            </p>
                            <p className="text-[#9CA3AF] text-xs mt-0.5 flex items-center gap-1">
                              <Phone size={12} />
                              {clientPhone}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 lg:gap-6 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#2A2A2A]">
                          <div className="sm:text-right">
                            <p className="text-white font-medium text-sm md:text-base">{formatTime(appointment.startTime)}</p>
                            <p className="text-[#9CA3AF] text-xs md:text-sm">
                              {appointment.totalDuration} min • ${Number(appointment.totalPrice).toLocaleString()}
                            </p>
                          </div>

                          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${status.color} whitespace-nowrap`}>
                            <StatusIcon size={14} />
                            {status.label}
                          </div>

                          <div className="flex items-center gap-1">
                            {isProcessing ? (
                              <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                {appointment.status === 'PENDING' && (
                                  <>
                                    <button
                                      onClick={() => updateStatus(appointment.id, { status: 'CONFIRMED' })}
                                      className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                                      title="Confirmar"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                    <button
                                      onClick={() => updateStatus(appointment.id, { status: 'CANCELLED', reason: 'Cancelada desde gestión' })}
                                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                      title="Cancelar"
                                    >
                                      <X size={16} />
                                    </button>
                                  </>
                                )}
                                {appointment.status === 'CONFIRMED' && (
                                  <>
                                    <button
                                      onClick={() => updateStatus(appointment.id, { status: 'IN_PROGRESS' })}
                                      className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all"
                                      title="Iniciar"
                                    >
                                      <Clock size={16} />
                                    </button>
                                    <button
                                      onClick={() => updateStatus(appointment.id, { status: 'CANCELLED', reason: 'Cancelada desde gestión' })}
                                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                      title="Cancelar"
                                    >
                                      <X size={16} />
                                    </button>
                                  </>
                                )}
                                {appointment.status === 'IN_PROGRESS' && (
                                  <>
                                    <button
                                      onClick={() => extend(appointment.id, 20)}
                                      className="p-2 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#1A1A1A] transition-all"
                                      title="Extender 20min"
                                    >
                                      <Clock size={16} />
                                    </button>
                                    <button
                                      onClick={() => updateStatus(appointment.id, { status: 'COMPLETED' })}
                                      className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all"
                                      title="Finalizar"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
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
          MODAL: AGENDAMIENTO MANUAL (WALK-IN)
          ============================================ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !creating && setShowModal(false)} />

          <div className="relative bg-[#1E1E1E] rounded-2xl border border-[#2A2A2A] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-[#1E1E1E] border-b border-[#2A2A2A] px-4 md:px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-base md:text-lg font-bold text-white">Nueva Cita (Walk-in)</h3>
                <p className="text-[#9CA3AF] text-sm">Paso {step} de 4</p>
              </div>
              <button
                onClick={() => !creating && setShowModal(false)}
                className="p-2 rounded-lg hover:bg-[#252525] text-[#9CA3AF] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-4 md:px-6 pt-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-1.5 rounded-full transition-all ${
                      s <= step ? 'bg-[#C9A84C]' : 'bg-[#2A2A2A]'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-6">
              {/* Error del formulario */}
              {createError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-sm">
                  {createError}
                </div>
              )}

              {/* PASO 1: Datos del cliente */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Nombre del cliente *</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Ej: Juan Pérez"
                        className="w-full bg-[#252525] border border-[#2A2A2A] text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#3A3A3A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Teléfono *</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="Ej: 3001234567"
                        className="w-full bg-[#252525] border border-[#2A2A2A] text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#3A3A3A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Notas (opcional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notas adicionales sobre la cita..."
                      rows={3}
                      className="w-full bg-[#252525] border border-[#2A2A2A] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-[#3A3A3A] resize-none"
                    />
                  </div>
                </div>
              )}

              {/* PASO 2: Selección de servicios */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium text-sm md:text-base">Selecciona los servicios</h4>
                    <div className="text-[#9CA3AF] text-xs md:text-sm">
                      {totalDuration} min • ${totalPrice.toLocaleString()}
                    </div>
                  </div>
                  <ServiceSelectorAdmin
                    services={services}
                    loading={servicesLoading}
                    selectedServices={selectedServices}
                    onToggleService={toggleService}
                  />
                </div>
              )}

              {/* PASO 3: Fecha y hora */}
              {step === 3 && (
                <div className="space-y-4">
                  <DatePicker
                    selectedDate={selectedDate}
                    onSelectDate={handleDateSelect}
                  />

                  {availabilityError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-500 text-sm">
                      {availabilityError}
                    </div>
                  )}

                  {selectedDate && (
                    <TimeSlotGrid
                      slots={availability?.slots || []}
                      selectedSlot={selectedSlot}
                      onSelectSlot={setSelectedSlot}
                      loading={availabilityLoading}
                    />
                  )}

                  {!selectedDate && (
                    <div className="bg-[#252525] rounded-xl p-6 text-center text-[#9CA3AF] text-sm">
                      Selecciona una fecha para ver los horarios disponibles
                    </div>
                  )}
                </div>
              )}

              {/* PASO 4: Confirmación */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="bg-[#252525] rounded-xl p-4 md:p-5 space-y-3">
                    <h4 className="text-white font-semibold mb-3">Resumen de la cita</h4>

                    <div className="flex justify-between text-sm">
                      <span className="text-[#9CA3AF]">Cliente</span>
                      <span className="text-white font-medium">{guestName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#9CA3AF]">Teléfono</span>
                      <span className="text-white font-medium">{guestPhone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#9CA3AF]">Fecha</span>
                      <span className="text-white font-medium">
                        {selectedDate?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#9CA3AF]">Hora</span>
                      <span className="text-white font-medium">{selectedSlot}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#9CA3AF]">Servicios</span>
                      <span className="text-white font-medium text-right">
                        {selectedServices.map(s => s.name).join(', ')}
                      </span>
                    </div>
                    <div className="border-t border-[#2A2A2A] pt-3 flex justify-between">
                      <span className="text-[#9CA3AF]">Total</span>
                      <span className="text-[#C9A84C] font-bold text-lg">${totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#9CA3AF]">Duración</span>
                      <span className="text-white font-medium">{totalDuration} minutos</span>
                    </div>
                    {notes && (
                      <div className="text-sm">
                        <span className="text-[#9CA3AF]">Notas:</span>
                        <p className="text-white mt-1">{notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botones de navegación */}
              <div className="flex items-center justify-between pt-4 border-t border-[#2A2A2A]">
                <button
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1 || creating}
                  className="px-4 py-2.5 text-[#9CA3AF] hover:text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Atrás
                </button>

                {step < 4 ? (
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={
                      (step === 1 && (!guestName.trim() || !guestPhone.trim())) ||
                      (step === 2 && selectedServices.length === 0) ||
                      (step === 3 && (!selectedDate || !selectedSlot)) ||
                      creating
                    }
                    className="px-6 py-2.5 bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] rounded-xl font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={handleCreateManual}
                    disabled={creating}
                    className="px-6 py-2.5 bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] rounded-xl font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {creating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Confirmar Cita
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}