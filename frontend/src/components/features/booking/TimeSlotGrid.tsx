// frontend/src/components/features/booking/TimeSlotGrid.tsx
import { Clock, Check, X } from 'lucide-react';

interface TimeSlotGridProps {
  slots: string[];
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
  loading: boolean;
  occupiedSlots?: string[];
}

export const TimeSlotGrid = ({ slots, selectedSlot, onSelectSlot, loading, occupiedSlots = [] }: TimeSlotGridProps) => {
  if (loading) {
    return (
      <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#2A2A2A]">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#C9A84C] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#2A2A2A]">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clock size={40} className="text-[#3A3A3A] mb-4" />
          <p className="text-[#9CA3AF] text-sm">No hay horarios disponibles para esta fecha</p>
          <p className="text-[#9CA3AF] text-xs mt-1">Prueba con otra fecha o barbero</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#2A2A2A]">
      <div className="flex items-center gap-3 mb-6">
        <Clock size={20} className="text-[#C9A84C]" />
        <h3 className="text-white font-semibold">Horarios disponibles</h3>
        <span className="ml-auto text-[#9CA3AF] text-sm">{slots.length} cupos</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {slots.map((slot) => {
          const isSelected = selectedSlot === slot;
          const isOccupied = occupiedSlots.includes(slot);
          
          return (
            <button
              key={slot}
              onClick={() => !isOccupied && onSelectSlot(isSelected ? '' : slot)}
              disabled={isOccupied} // ← NUEVO
              className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-[#C9A84C] text-[#1A1A1A] shadow-lg shadow-[#C9A84C]/20'
                  : 'bg-[#252525] text-white hover:bg-[#3A3A3A] border border-[#2A2A2A] hover:border-[#3A3A3A]'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                {isOccupied ? <X size={14} /> : isSelected && <Check size={14} />}
                {slot}
              </div>
            </button>
          );
        })}
      </div>

      {occupiedSlots.length > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs text-[#9CA3AF]">
          <div className="w-3 h-3 rounded bg-[#1A1A1A] border border-[#2A2A2A]" />
          <span>Horario no disponible</span>
        </div>
      )}
    </div>
  );
};