// frontend/src/pages/admin/AdminDashboard.tsx
import { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useBarberAppointments } from '@hooks/useBarberAppointments';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, Calendar, Users, TrendingUp, Clock,
  Scissors, Star, ChevronRight, Bell, CheckCircle,
  XCircle, Play, Timer, Settings, User, Menu
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ← TODOS LOS HOOKS PRIMERO, antes de cualquier return
  const today = new Date().toISOString().split('T')[0];

  const {
    appointments: rawAppointments,
    stats: backendStats,
    loading: appointmentsLoading,
    actionLoading,
    error,
    updateStatus,
    extend,
  } = useBarberAppointments({ date: today });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handlers de logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Format helpers
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getDuration = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.round(diff / 60000);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING': return {
        label: 'Pendiente',
        color: 'text-yellow-400 bg-yellow-400/10',
        icon: Clock,
        actions: ['start', 'cancel']
      };
      case 'CONFIRMED': return {
        label: 'Confirmada',
        color: 'text-blue-400 bg-blue-400/10',
        icon: CheckCircle,
        actions: ['start', 'cancel']
      };
      case 'IN_PROGRESS': return {
        label: 'En progreso',
        color: 'text-[#C9A84C] bg-[#C9A84C]/10',
        icon: Play,
        actions: ['extend', 'complete']
      };
      case 'COMPLETED': return {
        label: 'Completada',
        color: 'text-green-400 bg-green-400/10',
        icon: CheckCircle,
        actions: []
      };
      case 'CANCELLED': return {
        label: 'Cancelada',
        color: 'text-red-400 bg-red-400/10',
        icon: XCircle,
        actions: []
      };
      default: return {
        label: status,
        color: 'text-[#9CA3AF] bg-[#252525]',
        icon: Clock,
        actions: []
      };
    }
  };

  // Action handlers
  const handleStart = async (id: string) => {
    await updateStatus(id, { status: 'IN_PROGRESS' });
  };

  const handleComplete = async (id: string) => {
    await updateStatus(id, { status: 'COMPLETED' });
  };

  const handleCancel = async (id: string) => {
    await updateStatus(id, { status: 'CANCELLED', reason: 'Cancelada desde dashboard' });
  };

  const handleExtend = async (id: string) => {
    await extend(id, 20);
  };

  // Map appointments
  const appointments = rawAppointments.map((a) => ({
    id: a.id,
    clientName: a.client 
      ? `${a.client.firstName} ${a.client.lastName}` 
      : (a.guestName || 'Cliente walk-in'),
    clientPhone: a.client?.phone || a.guestPhone || 'Sin teléfono',
    services: a.services.map((s) => s.service.name),
    startTime: a.startTime,
    endTime: a.endTime,
    status: a.status,
    totalPrice: Number(a.totalPrice),
  }));

  // Stats
  const calculateStatsFromAppointments = (appointments: typeof rawAppointments): TodayStatsData => {
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => {
    const aptDate = new Date(a.startTime).toISOString().split('T')[0];
    return aptDate === today;
  });

  return {
    total: todayAppointments.length,
    pending: todayAppointments.filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED').length,
    confirmed: todayAppointments.filter((a) => a.status === 'CONFIRMED').length,
    inProgress: todayAppointments.filter((a) => a.status === 'IN_PROGRESS').length,
    completed: todayAppointments.filter((a) => a.status === 'COMPLETED').length,
    cancelled: todayAppointments.filter((a) => a.status === 'CANCELLED').length,
  };
};

// ← FIX: Usar stats del backend si existen, sino calcular desde citas
const stats = backendStats.total > 0 
  ? backendStats 
  : calculateStatsFromAppointments(rawAppointments);

  const totalRevenue = rawAppointments
    .filter((a) => a.status === 'COMPLETED')
    .reduce((sum, a) => sum + Number(a.totalPrice), 0);

  // ← AHORA SÍ: Return condicional DESPUÉS de todos los hooks
  if (appointmentsLoading && appointments.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#C9A84C] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <div className="flex">
        {/* Sidebar - Responsive */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-64 bg-[#1A1A1A] border-r border-[#2A2A2A] min-h-screen fixed left-0 top-0 z-40 transition-transform duration-300`}>
          <div className="p-6 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#C9A84C]/10 rounded-full mb-4 border-2 border-[#C9A84C] ring-2 ring-[#C9A84C]/30">
                <img 
                  src="../../../logo.jpeg"  // ← Ruta desde public/
                  alt="Estilo Fino" 
                  className="w-full h-full object-cover rounded-full"
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
              { label: 'Inicio', icon: TrendingUp, active: true, path: '/admin/dashboard' },
              { label: 'Agenda', icon: Calendar, path: '/admin/schedule' },
              { label: 'Citas', icon: Clock, path: '/admin/appointments' },
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
              <p className="text-[#9CA3AF] text-sm hidden sm:block">
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <button className="relative p-2 text-[#9CA3AF] hover:text-white transition-colors rounded-lg hover:bg-[#252525]">
                <Bell size={20} />
                {stats.pending > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#C9A84C] rounded-full" />
                )}
              </button>

              <Link
                to="/admin/profile"
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white group-hover:text-[#C9A84C] transition-colors">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">Barbero</p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#C9A84C]/10 flex items-center justify-center border border-[#C9A84C]/20 group-hover:bg-[#C9A84C]/20 group-hover:border-[#C9A84C]/40 transition-all">
                  <User size={16} className="md:size-[18px] text-[#C9A84C]" />
                </div>
              </Link>
            </div>
          </div>

          <div className="p-4 md:p-8">
            {/* Welcome */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1">¡Bienvenido, {user?.firstName}!</h2>
              <p className="text-[#9CA3AF] text-sm">Resumen de tu día de trabajo</p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-sm mb-4 md:mb-6">
                {error}
                <button 
                  onClick={() => window.location.reload()} 
                  className="ml-4 underline hover:no-underline"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              {[
                { 
                  label: 'Citas hoy', 
                  value: (stats?.total ?? 0).toString(), 
                  icon: Calendar, 
                  color: 'text-[#C9A84C]', 
                  bg: 'bg-[#C9A84C]/10' 
                },
                { 
                  label: 'Pendientes', 
                  value: (stats?.pending ?? 0).toString(), 
                  icon: Clock, 
                  color: 'text-yellow-400', 
                  bg: 'bg-yellow-400/10' 
                },
                { 
                  label: 'Completadas', 
                  value: (stats?.completed ?? 0).toString(), 
                  icon: CheckCircle, 
                  color: 'text-green-400', 
                  bg: 'bg-green-400/10' 
                },
                { 
                  label: 'Ingresos hoy', 
                  value: `$${(totalRevenue ?? 0).toLocaleString()}`, 
                  icon: TrendingUp, 
                  color: 'text-blue-400', 
                  bg: 'bg-blue-400/10' 
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#1E1E1E] rounded-xl p-4 md:p-5 border border-[#2A2A2A]">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon size={16} className={`md:size-[20px] ${stat.color}`} />
                    </div>
                    <span className="text-lg md:text-2xl font-bold text-white">{stat.value}</span>
                  </div>
                  <p className="text-[#9CA3AF] text-xs md:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Citas del día */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold text-white">Citas de hoy</h3>
                <Link to="/admin/appointments" className="text-[#C9A84C] hover:text-[#B8983F] text-sm font-medium flex items-center gap-1 transition-colors">
                  Ver todas
                  <ChevronRight size={16} />
                </Link>
              </div>

              {appointments.length === 0 ? (
                <div className="bg-[#1E1E1E] rounded-xl p-8 border border-[#2A2A2A] text-center">
                  <Calendar size={32} className="text-[#3A3A3A] mx-auto mb-3" />
                  <p className="text-[#9CA3AF] text-sm">No tienes citas programadas para hoy</p>
                  <Link to="/admin/schedule" className="text-[#C9A84C] text-sm mt-2 inline-block hover:underline">
                    Configura tu agenda
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {appointments.map((appointment) => {
                    const status = getStatusConfig(appointment.status);
                    const StatusIcon = status.icon;
                    const isProcessing = actionLoading === appointment.id;

                    return (
                      <div key={appointment.id} className={`bg-[#1E1E1E] rounded-xl p-4 md:p-5 border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all ${isProcessing ? 'opacity-60' : ''}`}>
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-0 lg:justify-between">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#252525] flex items-center justify-center flex-shrink-0">
                              <Users size={18} className="md:size-[20px] text-[#9CA3AF]" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-white font-semibold text-sm md:text-base truncate">{appointment.clientName}</h4>
                              <p className="text-[#9CA3AF] text-xs md:text-sm truncate">{appointment.services.join(', ')}</p>
                              <p className="text-[#9CA3AF] text-xs mt-0.5">{appointment.clientPhone}</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 lg:gap-6 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#2A2A2A]">
                            <div className="sm:text-right">
                              <p className="text-white font-medium text-sm md:text-base">{formatTime(appointment.startTime)}</p>
                              <p className="text-[#9CA3AF] text-xs md:text-sm">
                                {getDuration(appointment.startTime, appointment.endTime)} min • ${appointment.totalPrice.toLocaleString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
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
                                        onClick={() => handleCancel(appointment.id)}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                        title="Cancelar"
                                      >
                                        <XCircle size={16} />
                                      </button>
                                    </>
                                  )}
                                  {appointment.status === 'CONFIRMED' && (
                                    <>
                                      <button
                                        onClick={() => handleStart(appointment.id)}
                                        className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all"
                                        title="Iniciar"
                                      >
                                        <Play size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleCancel(appointment.id)}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                        title="Cancelar"
                                      >
                                        <XCircle size={16} />
                                      </button>
                                    </>
                                  )}
                                  {appointment.status === 'IN_PROGRESS' && (
                                    <>
                                      <button
                                        onClick={() => handleExtend(appointment.id)}
                                        className="p-2 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#1A1A1A] transition-all"
                                        title="Extender 20min"
                                      >
                                        <Timer size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleComplete(appointment.id)}
                                        className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all"
                                        title="Finalizar"
                                      >
                                        <CheckCircle size={16} />
                                      </button>
                                    </>
                                  )}
                                  {appointment.status === 'COMPLETED' && (
                                    <span className="px-3 py-1 bg-green-500/10 text-green-400 text-sm rounded-full flex items-center gap-1">
                                      <CheckCircle size={14} />
                                      Completada
                                    </span>
                                  )}
                                  {appointment.status === 'CANCELLED' && (
                                    <span className="px-3 py-1 bg-red-500/10 text-red-400 text-sm rounded-full flex items-center gap-1">
                                      <XCircle size={14} />
                                      Cancelada
                                    </span>
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <Link to="/admin/schedule" className="bg-[#1E1E1E] rounded-xl p-5 md:p-6 border border-[#2A2A2A] hover:border-[#C9A84C]/30 transition-all group">
                <Calendar size={20} className="md:size-[24px] text-[#C9A84C] mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-semibold mb-1 text-sm md:text-base">Gestionar agenda</h4>
                <p className="text-[#9CA3AF] text-xs md:text-sm">Configurar horarios, descansos y días libres</p>
              </Link>

              <Link to="/admin/appointments" className="bg-[#1E1E1E] rounded-xl p-5 md:p-6 border border-[#2A2A2A] hover:border-[#C9A84C]/30 transition-all group">
                <Clock size={20} className="md:size-[24px] text-[#C9A84C] mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-semibold mb-1 text-sm md:text-base">Ver citas</h4>
                <p className="text-[#9CA3AF] text-xs md:text-sm">Administrar citas del día e historial</p>
              </Link>

              <Link to="/admin/services" className="bg-[#1E1E1E] rounded-xl p-5 md:p-6 border border-[#2A2A2A] hover:border-[#C9A84C]/30 transition-all group">
                <Scissors size={20} className="md:size-[24px] text-[#C9A84C] mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-semibold mb-1 text-sm md:text-base">Servicios</h4>
                <p className="text-[#9CA3AF] text-xs md:text-sm">Gestionar precios y duración</p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}