// frontend/src/stores/booking.store.ts
import { create } from 'zustand';
import type { Service } from '@api/service.api';
import type { Barber } from '@api/barber.api';

interface BookingState {
  
  selectedBarber: Barber | null;
  selectedServices: Service[];
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
  totalPrice: number;
  totalDuration: number;
  

  setSelectedBarber: (barber: Barber | null) => void;
  addService: (service: Service) => void;
  removeService: (serviceId: string) => void;
  clearServices: () => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTimeSlot: (time: string | null) => void;
  reset: () => void;
  setSelectedBarberOnly: (barber: Barber | null) => void;
}



export const useBookingStore = create<BookingState>((set, get) => ({
  selectedBarber: null,
  selectedServices: [],
  selectedDate: null,
  selectedTimeSlot: null,
  totalPrice: 0,
  totalDuration: 0,

  // ← CORREGIDO: Al cambiar de barbero, limpia TODO (fecha, slot, servicios)
  setSelectedBarber: (barber) => set({
    selectedBarber: barber,
    selectedDate: null,
    selectedTimeSlot: null,
    selectedServices: [],
    totalPrice: 0,
    totalDuration: 0,
  }),

  setSelectedBarberOnly: (barber) => set({ selectedBarber: barber }),

  addService: (service) => {
    const current = get().selectedServices;
    if (current.find((s) => s.id === service.id)) return;
    
    const updated = [...current, service];
    set({
      selectedServices: updated,
      totalPrice: updated.reduce((sum, s) => sum + Number(s.price), 0),
      totalDuration: updated.reduce((sum, s) => sum + s.durationMinutes, 0),
    });
  },

  removeService: (serviceId) => {
    const updated = get().selectedServices.filter((s) => s.id !== serviceId);
    set({
      selectedServices: updated,
      totalPrice: updated.reduce((sum, s) => sum + Number(s.price), 0),
      totalDuration: updated.reduce((sum, s) => sum + s.durationMinutes, 0),
    });
  },

  clearServices: () => set({ selectedServices: [], totalPrice: 0, totalDuration: 0 }),

  // ← CORREGIDO: Al cambiar de fecha, limpia el slot seleccionado
  setSelectedDate: (date) => set({
    selectedDate: date,
    selectedTimeSlot: null,
  }),
  
  setSelectedTimeSlot: (time) => set({ selectedTimeSlot: time }),

  reset: () => set({
    selectedBarber: null,
    selectedServices: [],
    selectedDate: null,
    selectedTimeSlot: null,
    totalPrice: 0,
    totalDuration: 0,
  }),
  

}));