// frontend/src/components/features/booking/ServiceSelector.tsx
import { useServices } from '@hooks/useServices';
import { useBookingStore } from '@stores/booking.store';
import { Plus, Minus, Clock, DollarSign, Scissors } from 'lucide-react';

export const ServiceSelector = () => {
  const { services, loading } = useServices(); // Modo público por defecto
  const { selectedServices, addService, removeService, totalPrice, totalDuration } = useBookingStore();

  const isSelected = (id: string) => selectedServices.some((s) => s.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#C9A84C] border-t-transparent" />
      </div>
    );
  }

  if (!loading && services.length === 0) {
    return (
      <div className="text-center py-12 bg-[#1E1E1E] rounded-2xl border border-[#2A2A2A]">
        <Scissors size={48} className="mx-auto text-[#9CA3AF] mb-4" />
        <h3 className="text-white font-semibold text-lg mb-2">
          No hay servicios disponibles
        </h3>
        <p className="text-[#9CA3AF] text-sm max-w-sm mx-auto">
          En este momento no hay servicios configurados. Por favor, contacta al administrador de la barbería.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con totales */}
      <div className="bg-[#1E1E1E] rounded-2xl p-5 border border-[#2A2A2A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[#9CA3AF]">
              <Clock size={18} className="text-[#C9A84C]" />
              <span className="text-sm font-medium">{totalDuration} min</span>
            </div>
            <div className="h-4 w-px bg-[#2A2A2A]" />
            <div className="flex items-center gap-2 text-[#C9A84C]">
              <DollarSign size={18} />
              <span className="font-bold text-lg">${totalPrice.toLocaleString()}</span>
            </div>
          </div>
          <span className="text-sm text-[#9CA3AF] bg-[#252525] px-3 py-1 rounded-full">
            {selectedServices.length} seleccionado{selectedServices.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Grid de servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => {
          const selected = isSelected(service.id);

          return (
            <div
              key={service.id}
              className={`group relative bg-[#1E1E1E] rounded-2xl p-5 border transition-all duration-300 ${
                selected
                  ? 'border-[#C9A84C] shadow-lg shadow-[#C9A84C]/5'
                  : 'border-[#2A2A2A] hover:border-[#3A3A3A] hover:shadow-lg hover:shadow-black/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Icono/Imagen del servicio */}
                <div
                  className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                    selected ? 'bg-[#C9A84C]/10' : 'bg-[#252525] group-hover:bg-[#2A2A2A]'
                  }`}
                >
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <Scissors
                      size={24}
                      className={selected ? 'text-[#C9A84C]' : 'text-[#9CA3AF]'}
                    />
                  )}
                </div>

                {/* Info del servicio */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-base mb-1 truncate">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-[#9CA3AF] text-sm mb-3 line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4">
                    <span className="text-[#C9A84C] font-bold text-lg">
                      ${Number(service.price).toLocaleString()}
                    </span>
                    <span className="text-[#9CA3AF] text-sm flex items-center gap-1.5 bg-[#252525] px-2.5 py-1 rounded-lg">
                      <Clock size={14} />
                      {service.durationMinutes} min
                    </span>
                  </div>
                </div>

                {/* Botón + / - */}
                <button
                  onClick={() =>
                    selected ? removeService(service.id) : addService(service)
                  }
                  className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${
                    selected
                      ? 'bg-[#C9A84C] text-[#1A1A1A] hover:bg-[#B8983F] hover:scale-105'
                      : 'bg-[#2A2A2A] text-[#C9A84C] hover:bg-[#3A3A3A] hover:scale-105'
                  }`}
                >
                  {selected ? <Minus size={20} /> : <Plus size={20} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};