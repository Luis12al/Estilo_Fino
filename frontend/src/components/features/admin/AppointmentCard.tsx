// frontend/src/components/features/admin/AppointmentCard.tsx
import React, { useState } from 'react';
import { 
  Play, CheckCircle, XCircle, Clock, MoreVertical, 
  User, Phone, Scissors, AlertCircle 
} from 'lucide-react';
import type { Appointment } from '@api/appointment.api';

interface AppointmentCardProps {
  appointment: Appointment;
  onStart: (id: string) => Promise<void>;
  onComplete: (id: string) => Promise<void>;
  onCancel: (id: string, reason?: string) => Promise<void>;
  onExtend: (id: string) => Promise<void>;
  actionLoading: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING: { label: 'Pendiente', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  CONFIRMED: { label: 'Confirmada', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  IN_PROGRESS: { label: 'En Progreso', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  COMPLETED: { label: 'Completada', color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
  CANCELLED: { label: 'Cancelada', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onStart,
  onComplete,
  onCancel,
  onExtend,
  actionLoading,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const isLoading = actionLoading === appointment.id;
  const status = STATUS_CONFIG[appointment.status];
  const startTime = new Date(appointment.startTime).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  const endTime = new Date(appointment.endTime).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit', hour12: false
  });

  const handleCancel = async () => {
    await onCancel(appointment.id, cancelReason);
    setShowCancelModal(false);
    setCancelReason('');
  };

  return (
    <div className={`relative bg-[#1E1E1E] rounded-2xl p-5 border transition-all duration-300 ${status.border} ${isLoading ? 'opacity-60' : ''}`}>
      {/* Header: Hora + Estado + Menú */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status.bg}`}>
            <Clock size={20} className={status.color} />
          </div>
          <div>
            <span className="text-white font-bold text-lg">{startTime}</span>
            <span className="text-[#9CA3AF] text-sm ml-2">- {endTime}</span>
            <div className={`text-xs font-medium mt-0.5 ${status.color}`}>
              {status.label}
            </div>
          </div>
        </div>

        {/* Menú de acciones */}
        {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              disabled={isLoading}
              className="w-9 h-9 rounded-lg bg-[#252525] border border-[#2A2A2A] 
                       flex items-center justify-center text-[#9CA3AF]
                       hover:bg-[#2A2A2A] hover:text-white transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
              ) : (
                <MoreVertical size={18} />
              )}
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-11 z-50 w-48 bg-[#1A1A1A] border border-[#2A2A2A] 
                              rounded-xl shadow-xl shadow-black/40 overflow-hidden">
                  
                  {appointment.status === 'CONFIRMED' && (
                    <button
                      onClick={() => { onStart(appointment.id); setMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-white
                               hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] transition-colors"
                    >
                      <Play size={16} />
                      <span className="text-sm font-medium">Iniciar</span>
                    </button>
                  )}

                  {appointment.status === 'IN_PROGRESS' && (
                    <>
                      <button
                        onClick={() => { onComplete(appointment.id); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-white
                                 hover:bg-green-500/10 hover:text-green-500 transition-colors"
                      >
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium">Finalizar</span>
                      </button>
                      <button
                        onClick={() => { onExtend(appointment.id); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-white
                                 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
                      >
                        <Clock size={16} />
                        <span className="text-sm font-medium">Extender +20min</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => { setShowCancelModal(true); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-white
                             hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  >
                    <XCircle size={16} />
                    <span className="text-sm font-medium">Cancelar</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Info del Cliente */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[#252525] border border-[#2A2A2A] 
                      flex items-center justify-center">
          <User size={18} className="text-[#9CA3AF]" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">
            {appointment.client?.firstName} {appointment.client?.lastName}
          </h3>
          {appointment.client?.phone && (
            <div className="flex items-center gap-1.5 text-[#9CA3AF] text-xs">
              <Phone size={12} />
              <span>{appointment.client.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Servicios */}
      <div className="flex flex-wrap gap-2">
        {appointment.services?.map((s, index) => (
          <span
            key={`${appointment.id}-service-${index}`}
            className="inline-flex items-center gap-1.5 bg-[#252525] border border-[#2A2A2A] 
                    text-[#9CA3AF] text-xs px-2.5 py-1 rounded-lg"
          >
            <Scissors size={12} className="text-[#C9A84C]" />
            {s.service.name}
          </span>
        ))}
        <span className="inline-flex items-center text-[#C9A84C] text-xs font-medium ml-auto">
          ${Number(appointment.totalPrice).toLocaleString()}
        </span>
      </div>

      {/* Modal de Cancelación */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <h3 className="text-white font-semibold">Cancelar Cita</h3>
            </div>
            <p className="text-[#9CA3AF] text-sm mb-4">
              ¿Estás seguro de cancelar la cita de {appointment.client?.firstName}? 
              Esta acción no se puede deshacer.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Motivo de cancelación (opcional)..."
              className="w-full bg-[#252525] border border-[#2A2A2A] rounded-xl p-3 text-white text-sm
                       placeholder-[#9CA3AF] focus:border-[#C9A84C] focus:outline-none resize-none h-20 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#252525] text-white text-sm font-medium
                         hover:bg-[#2A2A2A] transition-colors"
              >
                Volver
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 
                         text-red-500 text-sm font-medium hover:bg-red-500/20 transition-colors
                         disabled:opacity-50"
              >
                {isLoading ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};