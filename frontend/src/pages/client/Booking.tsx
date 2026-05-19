import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '@stores/booking.store';
import { useAvailability } from '@hooks/useAvailability';
import { appointmentApi } from '@api/appointment.api';
import { BarberSelector } from '@components/features/booking/BarberSelector';
import { ServiceSelector } from '@components/features/booking/ServiceSelector';
import { DatePicker } from '@components/features/booking/DatePicker';
import { TimeSlotGrid } from '@components/features/booking/TimeSlotGrid';
import { 
  ArrowLeft, ArrowRight, Check, ChevronLeft, 
  Calendar, Scissors, User, 
  Clock, Wallet, Smartphone, Loader2 
} from 'lucide-react';

export default function ClientBooking() {
  const navigate = useNavigate();
  const {
    selectedBarber,
    selectedServices,
    selectedDate,
    selectedTimeSlot,
    totalDuration,
    totalPrice,
    setSelectedDate,
    setSelectedTimeSlot,
    reset,
  } = useBookingStore();

  const { availability, loading, error, checkAvailability} = useAvailability();
  const [step, setStep] = useState(selectedBarber ? 2 : 1);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
    // ── Navegación entre pasos ──
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleContinue = () => {
    if (step < 4) setStep(step + 1);
  };

  const goToStep = (targetStep: number) => {
    if (targetStep < step) setStep(targetStep);
  };

  

  // ── Selección de fecha → consultar disponibilidad ──
  const handleDateSelect = async (date: Date | null) => {  // ← Date | null
    if (!date) {
      setSelectedDate(null);
      return;
    }
    setSelectedDate(date);
    setCreateError(null);

    if (selectedBarber && totalDuration > 0) {
      const dateStr = date.toISOString().split('T')[0];
      await checkAvailability(selectedBarber.id, dateStr, totalDuration);
    }
  };

  // ── CREAR CITA (reemplaza el TODO) ──
  const handleCreateAppointment = async () => {
    if (!selectedBarber || !selectedDate || !selectedTimeSlot || selectedServices.length === 0) {
      setCreateError('Faltan datos para crear la cita');
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      // Construir startTime: fecha + hora del slot
      const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);

      const payload = {
        barberId: selectedBarber.id,
        startTime: startTime.toISOString(),
        serviceIds: selectedServices.map((s) => s.id),
        notes: undefined,
        paymentReference: paymentRef.trim() || undefined,
      };

      await appointmentApi.create(payload);

      // Éxito: redirigir a "Mis Citas"
      reset();
      navigate('/client/appointments', {
        state: { success: true, message: '¡Cita agendada exitosamente!' },
      });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Error al crear la cita';
      setCreateError(message);
    } finally {
      setCreating(false);
    }
  };

  // ── Configuración de pasos ──
  const steps = [
    { num: 1, label: 'Barbero', icon: User, complete: !!selectedBarber },
    { num: 2, label: 'Servicios', icon: Scissors, complete: selectedServices.length > 0 },
    { num: 3, label: 'Fecha', icon: Calendar, complete: !!selectedDate && !!selectedTimeSlot },
    { num: 4, label: 'Confirmar', icon: Check, complete: false },
  ];

  const advancePayment = Math.round(totalPrice * 0.5);
  const [paymentRef, setPaymentRef] = useState('');
  const occupiedSlots = availability?.appointments?.map(apt => apt.start) || [];

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#0F0F0F]/90 backdrop-blur-md border-b border-[#2A2A2A]/50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/client/dashboard')}
            className="p-2 rounded-xl hover:bg-[#252525] text-[#9CA3AF] hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Agendar cita</h1>
            <p className="text-xs text-[#9CA3AF]">Paso {step} de 4</p>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center gap-2">
              <button
                onClick={() => s.complete && goToStep(s.num)}
                disabled={!s.complete || s.num >= step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  s.complete
                    ? s.num < step 
                      ? 'bg-[#C9A84C] text-[#1A1A1A] cursor-pointer hover:scale-110'
                      : 'bg-[#C9A84C] text-[#1A1A1A]'
                    : step === s.num
                    ? 'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]'
                    : 'bg-[#252525] text-[#9CA3AF]'
                }`}
              >
                {s.complete && s.num < step ? <Check size={16} /> : s.num}
              </button>
              <span className={`text-sm hidden sm:block ${
                step === s.num ? 'text-white' : s.complete ? 'text-[#C9A84C]' : 'text-[#9CA3AF]'
              }`}>
                {s.label}
              </span>
              {idx < steps.length - 1 && (
                <div className={`w-8 h-px mx-1 ${
                  s.complete ? 'bg-[#C9A84C]' : 'bg-[#2A2A2A]'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Botón volver */}
        {step > 1 && (
          <button
            onClick={handleBack}
            className="mb-4 flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            Volver a {steps[step - 2].label}
          </button>
        )}

        {/* ── STEP 1: Barbero ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#2A2A2A]">
              <h2 className="text-xl font-bold text-white mb-2">Selecciona tu barbero</h2>
              <p className="text-[#9CA3AF] text-sm mb-6">Elige el profesional que te atenderá</p>
              <BarberSelector />
            </div>
            {selectedBarber && (
              <button
                onClick={handleContinue}
                className="w-full py-4 bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] font-bold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                Continuar
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        )}

        {/* ── STEP 2: Servicios ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#2A2A2A]">
              <h2 className="text-xl font-bold text-white mb-2">Selecciona tus servicios</h2>
              <p className="text-[#9CA3AF] text-sm mb-6">Puedes elegir uno o varios servicios</p>
              <ServiceSelector />
            </div>
            {selectedServices.length > 0 && (
              <button
                onClick={handleContinue}
                className="w-full py-4 bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] font-bold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                Continuar
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        )}

        {/* ── STEP 3: Fecha y hora ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DatePicker
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
              />
              {selectedDate && (
                <TimeSlotGrid
                  slots={availability?.slots || []}
                  selectedSlot={selectedTimeSlot}
                  onSelectSlot={setSelectedTimeSlot}
                  loading={loading}
                  occupiedSlots={occupiedSlots}
                />
              )}
            </div>
            
            {/* Error de disponibilidad */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {/* Mensaje cuando no hay slots */}
            {!loading && availability && !availability.available && !error && (
              <div className="bg-[#1E1E1E] rounded-xl p-4 border border-[#2A2A2A] text-[#9CA3AF] text-sm text-center">
                {availability.reason || 'No hay horarios disponibles para esta fecha'}
              </div>
            )}

            {selectedTimeSlot && (
              <button
                onClick={handleContinue}
                className="w-full py-4 bg-[#C9A84C] hover:bg-[#B8983F] text-[#1A1A1A] font-bold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                Continuar
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        )}

        {/* ── STEP 4: Confirmar ── */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Error global */}
            {createError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                {createError}
              </div>
            )}

            {/* Resumen */}
            <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#2A2A2A]">
              <h2 className="text-xl font-bold text-white mb-6">Confirma tu cita</h2>
              
              <div className="space-y-4 mb-6">
                {/* Fecha y hora */}
                <div className="flex items-center gap-4 p-4 bg-[#252525] rounded-xl">
                  <Calendar size={20} className="text-[#C9A84C]" />
                  <div>
                    <p className="text-white font-medium">
                      {selectedDate?.toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </p>
                    <p className="text-[#9CA3AF] text-sm flex items-center gap-1">
                      <Clock size={12} />
                      {selectedTimeSlot} ({totalDuration} min)
                    </p>
                  </div>
                </div>

                {/* Barbero */}
                <div className="flex items-center gap-4 p-4 bg-[#252525] rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
                    <User size={20} className="text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {selectedBarber?.firstName} {selectedBarber?.lastName}
                    </p>
                    <p className="text-[#9CA3AF] text-sm">Barbero profesional</p>
                  </div>
                </div>

                {/* Servicios */}
                <div className="p-4 bg-[#252525] rounded-xl">
                  <p className="text-[#9CA3AF] text-sm mb-3 flex items-center gap-2">
                    <Scissors size={14} />
                    Servicios seleccionados:
                  </p>
                  {selectedServices.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-[#2A2A2A] last:border-0">
                      <span className="text-white text-sm">{s.name}</span>
                      <span className="text-[#C9A84C] text-sm font-medium">
                        ${Number(s.price).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#C9A84C]/20">
                    <span className="text-white font-medium">Total servicios</span>
                    <span className="text-[#C9A84C] font-bold text-lg">
                      ${totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pago Nequi */}
            <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#2A2A2A]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
                  <Wallet size={20} className="text-[#C9A84C]" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Pago con Nequi</h3>
                  <p className="text-[#9CA3AF] text-sm">Consignación del 50% para reservar</p>
                </div>
              </div>

              <div className="bg-[#252525] rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#9CA3AF]">Total de la cita</span>
                  <span className="text-white font-medium">${totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#9CA3AF]">Anticipo requerido (50%)</span>
                  <span className="text-[#C9A84C] font-bold text-xl">${advancePayment.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#2A2A2A]">
                  <span className="text-[#9CA3AF]">Pendiente en la barbería</span>
                  <span className="text-white font-medium">${advancePayment.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3 p-4 bg-[#C9A84C]/5 border border-[#C9A84C]/10 rounded-xl">
                  <Smartphone size={20} className="text-[#C9A84C] mt-0.5" />
                  <div>
                    <p className="text-white font-medium mb-1">Instrucciones de pago</p>
                    <ol className="text-[#9CA3AF] text-sm space-y-2 list-decimal list-inside">
                      <li>Abre la app de Nequi</li>
                      <li>Envía <span className="text-[#C9A84C] font-bold">${advancePayment.toLocaleString()}</span> al número:</li>
                    </ol>
                    <div className="mt-3 p-3 bg-[#1A1A1A] rounded-lg text-center">
                      <p className="text-2xl font-bold text-[#C9A84C] tracking-wider">300 123 4567</p>
                      <p className="text-[#9CA3AF] text-xs mt-1">Estilo Fino - Barbería</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
                    Número de confirmación Nequi (opcional)
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="Ej: 1234567890"
                    className="w-full px-4 py-3 bg-[#252525] border border-[#2A2A2A] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#C9A84C] transition-all"
                  />
                  <p className="text-[#9CA3AF] text-xs mt-2">
                    Puedes dejar esto vacío y mostrar el comprobante en la barbería
                  </p>
                </div>
              </div>

              {/* Botón confirmar */}
              <button
                onClick={handleCreateAppointment}
                disabled={creating}
                className="w-full py-4 bg-[#C9A84C] hover:bg-[#B8983F] disabled:bg-[#C9A84C]/50 disabled:cursor-not-allowed text-[#1A1A1A] font-bold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creando cita...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Confirmar reserva y pagar ${advancePayment.toLocaleString()}
                  </>
                )}
              </button>

              <p className="text-center text-[#9CA3AF] text-xs mt-4">
                Al confirmar, aceptas realizar el pago del 50% para garantizar tu cita
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}