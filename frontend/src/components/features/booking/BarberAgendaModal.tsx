// frontend/src/components/features/booking/BarberAgendaModal.tsx
import { useState, useEffect } from 'react';
import { useAvailability } from '@hooks/useAvailability';
// import { appointmentApi } from '@api/appointment.api';
import { useBookingStore } from '@stores/booking.store';
import { useNavigate } from 'react-router-dom';
import { 
  X, Calendar, Clock, ChevronLeft, ChevronRight, 
  Scissors, MapPin, AlertCircle 
} from 'lucide-react';

interface BarberAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  barber: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;  // ← CORREGIDO: acepta null o undefined
    bio?: string | null;          // ← CORREGIDO: acepta null o undefined
  } | null;
  onBookFromHere?: () => void;
}

export const BarberAgendaModal = ({ 
  isOpen, 
  onClose, 
  barber, 
  onBookFromHere 
}: BarberAgendaModalProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(60); // Default 60min
  const navigate = useNavigate();
  const { setSelectedBarberOnly } = useBookingStore();  
  const { availability, loading, error, checkAvailability } = useAvailability();

  // Resetear al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setCurrentMonth(new Date());
      setSelectedDate(null);
    }
  }, [isOpen]);

  // Consultar disponibilidad cuando se selecciona fecha
  useEffect(() => {
    if (barber && selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      checkAvailability(barber.id, dateStr, selectedDuration);
    }
  }, [barber, selectedDate, selectedDuration]);

  if (!isOpen || !barber) return null;

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: Array<{ date: number; fullDate: Date | null }> = [];
    for (let i = 0; i < startingDay; i++) days.push({ date: 0, fullDate: null });
    for (let i = 1; i <= daysInMonth; i++) days.push({ date: i, fullDate: new Date(year, month, i) });
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const days = getDaysInMonth(currentMonth);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#1A1A1A]/95 backdrop-blur-md border-b border-[#2A2A2A] p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
                {barber.avatarUrl ? (
                  <img src={barber.avatarUrl} alt={barber.firstName} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <Calendar size={24} className="text-[#C9A84C]" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Agenda de {barber.firstName} {barber.lastName}
                </h2>
                <p className="text-[#9CA3AF] text-sm">Consulta disponibilidad antes de agendar</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[#252525] text-[#9CA3AF] hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Selector de duración estimada */}
          <div className="bg-[#252525] rounded-xl p-4">
            <label className="block text-sm font-medium text-[#9CA3AF] mb-3">
              Duración estimada de tu servicio
            </label>
            <div className="flex gap-2 flex-wrap">
              {[30, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    setSelectedDuration(mins);
                    setSelectedDate(null);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedDuration === mins
                      ? 'bg-[#C9A84C] text-[#1A1A1A]'
                      : 'bg-[#1E1E1E] text-[#9CA3AF] hover:text-white border border-[#2A2A2A]'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Calendario */}
          <div className="bg-[#1E1E1E] rounded-xl p-5 border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Calendar size={18} className="text-[#C9A84C]" />
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[#252525] text-[#9CA3AF] hover:text-white transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[#252525] text-[#9CA3AF] hover:text-white transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-[#9CA3AF] text-xs font-medium py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                if (!day.fullDate) return <div key={idx} className="h-10" />;
                
                const past = isPast(day.fullDate);
                const today = isToday(day.fullDate);
                const selected = isSelected(day.fullDate);

                return (
                  <button
                    key={idx}
                    onClick={() => !past && setSelectedDate(day.fullDate)}
                    disabled={past}
                    className={`h-10 rounded-lg text-sm font-medium transition-all ${
                      selected
                        ? 'bg-[#C9A84C] text-[#1A1A1A]'
                        : today
                        ? 'bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30'
                        : past
                        ? 'text-[#3A3A3A] cursor-not-allowed'
                        : 'text-white hover:bg-[#252525]'
                    }`}
                  >
                    {day.date}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horarios del día seleccionado */}
          {selectedDate && (
            <div className="bg-[#1E1E1E] rounded-xl p-5 border border-[#2A2A2A]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Clock size={18} className="text-[#C9A84C]" />
                  {selectedDate.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </h3>
                {availability?.schedule && (
                  <span className="text-[#9CA3AF] text-sm">
                    Horario: {availability.schedule.start} - {availability.schedule.end}
                  </span>
                )}
              </div>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#C9A84C] border-t-transparent" />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-lg text-red-400 text-sm">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              {!loading && availability && (
                <>
                  {!availability.available ? (
                    <div className="text-center py-8">
                      <MapPin size={32} className="text-[#3A3A3A] mx-auto mb-3" />
                      <p className="text-[#9CA3AF] text-sm">{availability.reason || 'No disponible'}</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-4">
                        {availability.slots.map((slot) => (
                          <div
                            key={slot}
                            className="py-2 px-1 bg-[#252525] rounded-lg text-center text-sm text-white border border-[#2A2A2A]"
                          >
                            {slot}
                          </div>
                        ))}
                      </div>
                      <p className="text-[#9CA3AF] text-xs text-center">
                        {availability.slots.length} cupos disponibles de {selectedDuration} min
                      </p>
                    </>
                  )}

                  {/* Info de descansos */}
                  {availability.breaks && availability.breaks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
                      <p className="text-[#9CA3AF] text-xs mb-2">Descansos del día:</p>
                      {availability.breaks.map((b, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded-lg mr-2">
                          <Clock size={12} />
                          {b.start} - {b.end}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Citas existentes (solo para visualización) */}
                  {availability.appointments && availability.appointments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
                      <p className="text-[#9CA3AF] text-xs mb-2">Citas agendadas:</p>
                      {availability.appointments.map((apt) => (
                        <div key={apt.id} className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-1">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          {apt.start} - {apt.end} ({apt.clientName})
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Botón de acción */}
          {onBookFromHere && (
            <button
          onClick={() => {
            if (barber) {
              // Preseleccionar barbero y navegar al booking
              setSelectedBarberOnly({
                id: barber.id,
                userId: '', // No lo tenemos en el modal, pero el booking solo necesita id
                firstName: barber.firstName,
                lastName: barber.lastName,
                email: '',
                phone: null,
                bio: barber.bio || null,
                avatarUrl: barber.avatarUrl || null,
                defaultSlotDuration: 60,
                schedules: [],
                breaks: [],
              });
              onClose();
              navigate('/client/booking');
            }
          }}
          className="w-full py-4 bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] font-bold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <Scissors size={18} />
          Agendar cita con {barber?.firstName}
        </button>
          )}
        </div>
      </div>
    </div>
  );
};