// frontend/src/pages/client/ClientDashboard.tsx
import { useAuth } from '@hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { appointmentApi } from '@api/appointment.api';
import { barberApi } from '@api/barber.api';
import { serviceApi } from '@api/service.api';
import { offerApi } from '@api/offer.api';
import {
  LogOut, Calendar, Clock, User, Scissors, Star,
  ChevronRight, Bell, MapPin, ArrowRight
} from 'lucide-react';

interface DashboardStats {
  barbersCount: number;
  servicesCount: number;
  offersCount: number;
  upcomingAppointments: number;
}

interface UpcomingAppointment {
  id: string;
  startTime: string;
  barberName: string;
  services: string[];
  status: string;
}

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats>({
    barbersCount: 0,
    servicesCount: 0,
    offersCount: 0,
    upcomingAppointments: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Cargar datos en paralelo con manejo de errores individual
        // Si uno falla, los demás siguen funcionando
        const [barbersRes, servicesRes, offersRes, appointmentsRes] = await Promise.all([
          barberApi.getAll().catch(err => {
            console.error('Error cargando barberos:', err);
            return { success: true, data: [] }; // Fallback vacío
          }),
          serviceApi.getAll().catch(err => {
            console.error('Error cargando servicios:', err);
            return { success: true, data: [] };
          }),
          offerApi.getAll().catch(err => {
            console.error('Error cargando ofertas:', err);
            return { success: true, data: [] };
          }),
          appointmentApi.getMyAppointments().catch(err => {
            console.error('Error cargando citas:', err);
            return { success: true, data: [] };
          }),
        ]);

        // Extraer datos con fallback seguro
        const barbersData = Array.isArray(barbersRes.data) ? barbersRes.data : [];
        const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data : [];
        const offersData = Array.isArray(offersRes.data) ? offersRes.data : [];
        const appointmentsData = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];

        console.log('✅ Dashboard cargado:', {
          barbers: barbersData.length,
          services: servicesData.length,
          offers: offersData.length,
          appointments: appointmentsData.length
        });

        setStats({
          barbersCount: barbersData.length,
          servicesCount: servicesData.length,
          offersCount: offersData.length,
          upcomingAppointments: appointmentsData.filter(
            (a: any) => ['PENDING', 'CONFIRMED'].includes(a.status)
          ).length,
        });

        setBarbers(barbersData.slice(0, 3));
        
        const activeOffers = offersData
          .filter((o: any) => o.isActive !== false)
          .slice(0, 3);
        setOffers(activeOffers);

        const upcoming = appointmentsData
          .filter((a: any) => new Date(a.startTime) > new Date())
          .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
          .slice(0, 3)
          .map((a: any) => ({
            id: a.id,
            startTime: a.startTime,
            barberName: a.barber?.user 
              ? `${a.barber.user.firstName} ${a.barber.user.lastName}`
              : 'Barbero no disponible',
            services: Array.isArray(a.services) 
              ? a.services.map((s: any) => s.service?.name || 'Servicio').filter(Boolean)
              : [],
            status: a.status,
          }));
        
        setUpcomingAppointments(upcoming);
      } catch (err) {
        console.error('❌ Error general loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING': return { label: 'Pendiente', color: 'text-yellow-400 bg-yellow-400/10' };
      case 'CONFIRMED': return { label: 'Confirmada', color: 'text-green-400 bg-green-400/10' };
      case 'COMPLETED': return { label: 'Completada', color: 'text-blue-400 bg-blue-400/10' };
      default: return { label: status, color: 'text-[#9CA3AF] bg-[#252525]' };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#C9A84C] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Top Navbar */}
      <nav className="bg-[#1A1A1A] border-b border-[#2A2A2A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
              <Scissors size={20} className="text-[#C9A84C]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Estilo Fino</h1>
              <p className="text-xs text-[#9CA3AF]">Panel de Cliente</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-[#9CA3AF] hover:text-white transition-colors rounded-lg hover:bg-[#252525]">
              <Bell size={20} />
              {stats.upcomingAppointments > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#C9A84C] rounded-full" />
              )}
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-[#9CA3AF]">{user?.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 flex items-center justify-center border border-[#C9A84C]/20">
                <Link to="/client/profile" className="p-2 text-[#9CA3AF] hover:text-white transition-colors rounded-lg hover:bg-[#252525]">
                  <User size={18} />
                </Link>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-[#9CA3AF] hover:text-red-400 transition-colors rounded-lg hover:bg-[#252525]"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="bg-[#1E1E1E] rounded-2xl p-8 mb-8 border border-[#2A2A2A] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A84C]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-2">
              ¡Hola, <span className="text-[#C9A84C]">{user?.firstName}</span>!
            </h2>
            <p className="text-[#9CA3AF] max-w-lg mb-6">
              {upcomingAppointments.length > 0
                ? `Tienes ${upcomingAppointments.length} cita${upcomingAppointments.length > 1 ? 's' : ''} próxima${upcomingAppointments.length > 1 ? 's' : ''}.`
                : 'Reserva tu cita con los mejores barberos de la ciudad.'}
            </p>
            <Link
              to="/client/booking"
              className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            >
              <Calendar size={18} />
              {upcomingAppointments.length > 0 ? 'Agendar otra cita' : 'Agendar Cita'}
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Barberos', value: stats.barbersCount, icon: User, color: 'text-[#C9A84C]' },
            { label: 'Servicios', value: stats.servicesCount, icon: Scissors, color: 'text-blue-400' },
            { label: 'Ofertas', value: stats.offersCount, icon: Star, color: 'text-green-400' },
            { label: 'Mis Citas', value: stats.upcomingAppointments, icon: Calendar, color: 'text-purple-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#1E1E1E] rounded-xl p-5 border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all">
              <div className="flex items-center justify-between mb-3">
                <stat.icon size={20} className={stat.color} />
                <span className="text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-[#9CA3AF] text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Próximas Citas */}
        {upcomingAppointments.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Mis Próximas Citas</h3>
                <p className="text-[#9CA3AF] text-sm">Tus reservas confirmadas</p>
              </div>
              <Link to="/client/appointments" className="text-[#C9A84C] hover:text-[#B8983F] text-sm font-medium flex items-center gap-1 transition-colors">
                Ver todas
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingAppointments.map((apt) => {
                const status = getStatusConfig(apt.status);
                return (
                  <div key={apt.id} className="bg-[#1E1E1E] rounded-xl p-5 border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
                          <Calendar size={20} className="text-[#C9A84C]" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{formatDate(apt.startTime)}</h4>
                          <p className="text-[#9CA3AF] text-sm">Con {apt.barberName}</p>
                          <p className="text-[#9CA3AF] text-xs mt-0.5">{apt.services.join(', ')}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Barberos Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Nuestros Barberos</h3>
              <p className="text-[#9CA3AF] text-sm">Profesionales destacados listos para atenderte</p>
            </div>
            <Link to="/client/barbers" className="text-[#C9A84C] hover:text-[#B8983F] text-sm font-medium flex items-center gap-1 transition-colors">
              Ver todos
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {barbers.map((barber) => (
              <div key={barber.id} className="bg-[#1E1E1E] rounded-2xl p-5 border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#252525] flex items-center justify-center relative overflow-hidden">
                    {barber.avatarUrl ? (
                      <img src={barber.avatarUrl} alt={barber.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <User size={28} className="text-[#9CA3AF]" />
                    )}
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#1E1E1E] bg-green-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{barber.firstName} {barber.lastName}</h4>
                    <p className="text-[#9CA3AF] text-sm line-clamp-1">{barber.bio || 'Barbero profesional'}</p>
                    {barber.schedules?.some((s: any) => s.isActive) && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={12} className="text-[#C9A84C]" />
                        <span className="text-[#C9A84C] text-xs">
                          {barber.schedules.find((s: any) => s.isActive)?.startTime} - {barber.schedules.find((s: any) => s.isActive)?.endTime}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#2A2A2A]">
                  <div className="flex items-center gap-2 text-[#9CA3AF] text-sm">
                    <MapPin size={14} />
                    Disponible
                  </div>
                  <Link
                    to="/client/booking"
                    className="text-[#C9A84C] hover:text-[#B8983F] text-sm font-medium flex items-center gap-1 transition-colors group-hover:gap-2"
                  >
                    Agendar
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ofertas Section */}
        {offers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Ofertas Especiales</h3>
                <p className="text-[#9CA3AF] text-sm">Aprovecha nuestras promociones exclusivas</p>
              </div>
              <Link to="/client/offers" className="text-[#C9A84C] hover:text-[#B8983F] text-sm font-medium flex items-center gap-1 transition-colors">
                Ver todas
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {offers.map((offer) => (
                <div key={offer.id} className="bg-[#1E1E1E] rounded-2xl overflow-hidden border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all group cursor-pointer">
                  <div className="h-32 bg-gradient-to-br from-[#C9A84C]/20 to-[#C9A84C]/5 flex items-center justify-center">
                    <Star size={40} className="text-[#C9A84C]/30" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        offer.validUntil && new Date(offer.validUntil) > new Date()
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-[#C9A84C]/10 text-[#C9A84C]'
                      }`}>
                        {offer.validUntil ? 'Por tiempo limitado' : 'Permanente'}
                      </span>
                    </div>
                    <h4 className="text-white font-semibold mb-1">{offer.title}</h4>
                    {offer.description && (
                      <p className="text-[#9CA3AF] text-sm mb-3 line-clamp-2">{offer.description}</p>
                    )}
                    <button className="w-full py-2.5 bg-[#252525] hover:bg-[#C9A84C] hover:text-[#1A1A1A] text-[#9CA3AF] rounded-lg transition-all text-sm font-medium">
                      Ver detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}