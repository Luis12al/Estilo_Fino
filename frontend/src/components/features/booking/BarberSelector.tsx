import { useBarbers } from '@hooks/useBarbers';
import { useBookingStore } from '@stores/booking.store';
import { BarberAgendaModal } from './BarberAgendaModal';
import { 
  User, Clock, Star, ChevronRight, Calendar, 
  Scissors, Award, Phone 
} from 'lucide-react';
import { useState } from 'react';

export const BarberSelector = () => {
  const { barbers, loading, error } = useBarbers();
  const { selectedBarber, setSelectedBarber } = useBookingStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showAgenda, setShowAgenda] = useState(false);

  const getTodaySchedule = (barber: any) => {
    const today = new Date().getDay();
    const schedule = barber.schedules?.find((s: any) => s.dayOfWeek === today && s.isActive);
    return schedule ? `${schedule.startTime} - ${schedule.endTime}` : 'No disponible hoy';
  };

  const getStatusColor = (barber: any) => {
    const today = new Date().getDay();
    const schedule = barber.schedules?.find((s: any) => s.dayOfWeek === today && s.isActive);
    return schedule ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = (barber: any) => {
    const today = new Date().getDay();
    const schedule = barber.schedules?.find((s: any) => s.dayOfWeek === today && s.isActive);
    return schedule ? 'Disponible hoy' : 'No disponible';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#C9A84C] border-t-transparent mb-4" />
        <p className="text-[#9CA3AF] text-sm">Cargando barberos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <span className="text-red-400 text-2xl">!</span>
        </div>
        <p className="text-[#9CA3AF] text-sm">{error}</p>
      </div>
    );
  }

  if (barbers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-[#252525] flex items-center justify-center mb-4">
          <Scissors size={28} className="text-[#9CA3AF]" />
        </div>
        <p className="text-[#9CA3AF] text-sm">No hay barberos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header informativo */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            {barbers.length} barbero{barbers.length !== 1 ? 's' : ''} disponible{barbers.length !== 1 ? 's' : ''}
          </h3>
          <p className="text-[#9CA3AF] text-sm">Selecciona uno para ver su agenda</p>
        </div>
        <div className="flex items-center gap-2 text-[#9CA3AF] text-sm bg-[#1E1E1E] px-4 py-2 rounded-full border border-[#2A2A2A]">
          <Calendar size={14} />
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </div>
      </div>

      {/* Grid de barberos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {barbers.map((barber) => {
          const isSelected = selectedBarber?.id === barber.id;
          const isHovered = hoveredId === barber.id;
          
          return (
            <button
              key={barber.id}
              onClick={() => setSelectedBarber(isSelected ? null : barber)}
              onMouseEnter={() => setHoveredId(barber.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`relative bg-[#1E1E1E] rounded-2xl p-6 border transition-all duration-300 text-left group ${
                isSelected
                  ? 'border-[#C9A84C] shadow-xl shadow-[#C9A84C]/10 scale-[1.02]'
                  : isHovered
                  ? 'border-[#3A3A3A] shadow-lg shadow-black/20 scale-[1.01]'
                  : 'border-[#2A2A2A]'
              }`}
            >
              {/* Badge de selección */}
              {isSelected && (
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#C9A84C] flex items-center justify-center shadow-lg">
                  <ChevronRight size={16} className="text-[#1A1A1A]" />
                </div>
              )}

              {/* Header con foto y estado */}
              <div className="flex items-start gap-4 mb-5">
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden transition-all ${
                    isSelected ? 'bg-[#C9A84C]/15' : 'bg-[#252525] group-hover:bg-[#2A2A2A]'
                  }`}>
                    {barber.avatarUrl ? (
                      <img 
                        src={barber.avatarUrl} 
                        alt={barber.firstName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={32} className={isSelected ? 'text-[#C9A84C]' : 'text-[#9CA3AF]'} />
                    )}
                  </div>
                  {/* Indicador de estado */}
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#1E1E1E] ${getStatusColor(barber)}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-lg truncate group-hover:text-[#C9A84C] transition-colors">
                    {barber.firstName} {barber.lastName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      getStatusColor(barber) === 'bg-green-500' 
                        ? 'bg-green-500/10 text-green-400' 
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {getStatusText(barber)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {barber.bio && (
                <p className="text-[#9CA3AF] text-sm mb-4 line-clamp-2 leading-relaxed">
                  {barber.bio}
                </p>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-[#C9A84C] fill-[#C9A84C]" />
                  <span className="text-white text-sm font-semibold">4.9</span>
                  <span className="text-[#9CA3AF] text-xs">(128)</span>
                </div>
                <div className="h-3 w-px bg-[#2A2A2A]" />
                <div className="flex items-center gap-1.5 text-[#9CA3AF] text-sm">
                  <Award size={14} className="text-[#C9A84C]" />
                  <span>Experto</span>
                </div>
              </div>

              {/* Horario */}
              <div className="flex items-center gap-3 p-3 bg-[#252525] rounded-xl mb-4">
                <Clock size={16} className="text-[#C9A84C]" />
                <div>
                  <p className="text-white text-sm font-medium">Horario hoy</p>
                  <p className="text-[#9CA3AF] text-xs">{getTodaySchedule(barber)}</p>
                </div>
              </div>

              {/* Footer con acción */}
              <div className={`flex items-center justify-between pt-4 border-t transition-colors ${
                isSelected ? 'border-[#C9A84C]/20' : 'border-[#2A2A2A]'
              }`}>
                <div className="flex items-center gap-2 text-[#9CA3AF] text-xs">
                  <Phone size={12} />
                  <span>{barber.phone || 'Sin teléfono'}</span>
                </div>
                <span className={`text-sm font-semibold flex items-center gap-1 transition-all ${
                  isSelected ? 'text-[#C9A84C]' : 'text-[#9CA3AF] group-hover:text-[#C9A84C]'
                }`}>
                  {isSelected ? 'Seleccionado' : 'Seleccionar'}
                  <ChevronRight size={14} className={`transition-transform ${isHovered ? 'translate-x-0.5' : ''}`} />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info adicional cuando hay selección */}
      {selectedBarber && (
        <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
            <Calendar size={24} className="text-[#C9A84C]" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">Barbero seleccionado</p>
            <p className="text-[#9CA3AF] text-sm">
              {selectedBarber.firstName} {selectedBarber.lastName} — 
              Ahora puedes ver su disponibilidad y agendar tu cita
            </p>
          </div>
          <div className="flex gap-2">
            {/* ← NUEVO: Botón Ver Agenda */}
            <button
              onClick={() => setShowAgenda(true)}
              className="bg-[#252525] hover:bg-[#3A3A3A] text-[#C9A84C] border border-[#C9A84C]/30 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            >
              Ver agenda
            </button>
            {/* Botón existente */}
          </div>
        </div>
      )}
      <BarberAgendaModal
        isOpen={showAgenda}
        onClose={() => setShowAgenda(false)}
        barber={selectedBarber}
        onBookFromHere={() => {
          // Navegar al booking con el barbero preseleccionado
          // Esto ya está hecho porque selectedBarber está en el store
        }}
      />
    </div>
  );
};