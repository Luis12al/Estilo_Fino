import { useEffect, useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { appointmentApi } from '@api/appointment.api';
import {
  LogOut, Calendar, Clock, User, CheckCircle, ArrowLeft,
  MapPin, XCircle, AlertTriangle
} from 'lucide-react';

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  totalDuration: number;
  services: Array<{ service: { name: string } }>;
  barber: { user: { firstName: string; lastName: string } };
}

export default function ClientAppointments() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Mostrar mensaje de éxito si viene del redirect
  useEffect(() => {
    if (location.state?.success) {
      setShowSuccess(true);
      setSuccessMessage(location.state.message || '¡Operación exitosa!');
      // Limpiar state para no mostrarlo al refrescar
      window.history.replaceState({}, document.title);
      // Auto-ocultar después de 5 segundos
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await appointmentApi.getMyAppointments();
      if (response.success && response.data) {
        setAppointments(response.data);
      }
    } catch (err) {
      console.error('Error cargando citas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING': return { label: 'Pendiente', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' };
      case 'CONFIRMED': return { label: 'Confirmada', color: 'text-green-400 bg-green-400/10 border-green-400/20' };
      case 'IN_PROGRESS': return { label: 'En progreso', color: 'text-[#C9A84C] bg-[#C9A84C]/10 border-[#C9A84C]/20' };
      case 'COMPLETED': return { label: 'Completada', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' };
      case 'CANCELLED': return { label: 'Cancelada', color: 'text-red-400 bg-red-400/10 border-red-400/20' };
      default: return { label: status, color: 'text-[#9CA3AF] bg-[#252525] border-[#2A2A2A]' };
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const upcoming = appointments.filter(a => new Date(a.startTime) > new Date());
  const past = appointments.filter(a => new Date(a.startTime) <= new Date());

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Navbar */}
      <nav className="bg-[#1A1A1A] border-b border-[#2A2A2A] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/client/dashboard')}
              className="p-2 rounded-xl hover:bg-[#252525] text-[#9CA3AF] hover:text-white transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Mis Citas</h1>
              <p className="text-xs text-[#9CA3AF]">Historial de reservas</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="p-2 text-[#9CA3AF] hover:text-red-400 transition-colors rounded-lg hover:bg-[#252525]"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Banner de éxito */}
        {showSuccess && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
            <p className="text-green-400 text-sm font-medium">{successMessage}</p>
            <button 
              onClick={() => setShowSuccess(false)}
              className="ml-auto text-green-400/60 hover:text-green-400"
            >
              <XCircle size={16} />
            </button>
          </div>
        )}

        {/* Próximas citas */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-[#C9A84C]" />
            Próximas Citas
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#C9A84C] border-t-transparent" />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="bg-[#1E1E1E] rounded-xl p-8 border border-[#2A2A2A] text-center">
              <Calendar size={32} className="text-[#3A3A3A] mx-auto mb-3" />
              <p className="text-[#9CA3AF] text-sm mb-4">No tienes citas próximas</p>
              <Link
                to="/client/booking"
                className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] px-4 py-2 rounded-xl font-medium text-sm transition-all"
              >
                Agendar cita
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((apt) => {
                const status = getStatusConfig(apt.status);
                return (
                  <div key={apt.id} className="bg-[#1E1E1E] rounded-xl p-5 border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-[#9CA3AF] text-sm">{formatDate(apt.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
                        <User size={18} className="text-[#C9A84C]" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          Con {apt.barber.user.firstName} {apt.barber.user.lastName}
                        </p>
                        <p className="text-[#9CA3AF] text-sm">
                          {apt.services.map(s => s.service.name).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#9CA3AF]">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {apt.totalDuration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        ${Number(apt.totalPrice).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Historial */}
        {past.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-[#9CA3AF]" />
              Historial
            </h2>
            <div className="space-y-3 opacity-60">
              {past.map((apt) => {
                const status = getStatusConfig(apt.status);
                return (
                  <div key={apt.id} className="bg-[#1E1E1E] rounded-xl p-5 border border-[#2A2A2A]">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-[#9CA3AF] text-sm">{formatDate(apt.startTime)}</span>
                    </div>
                    <p className="text-[#9CA3AF] text-sm">
                      Con {apt.barber.user.firstName} {apt.barber.user.lastName}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}