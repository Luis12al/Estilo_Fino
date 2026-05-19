// frontend/src/api/appointment.api.ts
import { api } from './axios.config';
import type { ApiResponse } from 'src/types/auth.types';

export interface AvailabilityResponse {
  available: boolean;
  reason?: string;
  schedule?: { start: string; end: string };
  slots: string[];
  breaks?: Array<{ start: string; end: string }>;
  appointments?: Array<{
    id: string;
    start: string;
    end: string;
    status: string;
    clientName: string;
  }>;
}

export interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  totalDuration: number;
  services: Array<{
    service: { name: string; price: number };
    priceAtBooking: number;
  }>;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
  } | null;


  guestName: string | null;
  guestPhone: string | null;

  barber: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface TodayStats {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export const appointmentApi = {
  getAvailability: (barberId: string, date: string, durationMinutes: number) =>
    api
      .get<ApiResponse<AvailabilityResponse>>('/appointments/availability', {
        params: { barberId, date, durationMinutes },
      })
      .then((res) => res.data),

  create: (data: {
    barberId: string;
    startTime: string;
    serviceIds: string[];
    notes?: string;
    paymentReference?: string;
  }) => api.post<ApiResponse<Appointment>>('/appointments', data).then((res) => res.data),

  getMyAppointments: () =>
    api.get<ApiResponse<Appointment[]>>('/appointments/my').then((res) => res.data),

  // ← NUEVO: Obtener citas del barbero logueado
  getMyBarberAppointments: (date?: string) =>
    api
      .get<ApiResponse<Appointment[]>>('/appointments/barber/me', {
        params: date ? { date } : undefined,
      })
      .then((res) => res.data),

  // Obtener citas de un barbero específico (para admin)
  getBarberAppointments: (barberId: string, date?: string) =>
    api
      .get<ApiResponse<Appointment[]>>(`/appointments/barber/${barberId}`, {
        params: date ? { date } : undefined,
      })
      .then((res) => res.data),

    // ← NUEVO: Admin — Estadísticas del día
  getTodayStats: () =>
    api.get<ApiResponse<{ total: number; pending: number; confirmed: number; inProgress: number; completed: number; cancelled: number }>>('/appointments/barber/stats')
      .then((res) => res.data),

  // ← NUEVO: Admin — Cambiar estado (Iniciar, Finalizar, Cancelar)
  updateStatus: (id: string, data: { status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'; reason?: string }) =>
    api.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, data)
      .then((res) => res.data),

  // ← NUEVO: Admin — Extender cita +20min
  extend: (id: string, additionalMinutes?: number) =>
    api.post<ApiResponse<Appointment>>(`/appointments/${id}/extend`, { additionalMinutes })
      .then((res) => res.data),

 // Admin — Todas las citas (con filtros)
  getAllMyAppointments: (params?: {
  status?: string;
  from?: string;
  to?: string;
  search?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.from) query.append('from', params.from);
  if (params?.to) query.append('to', params.to);
  if (params?.search) query.append('search', params.search);
  
  const queryString = query.toString();
  const url = queryString ? `/appointments/barber/all?${queryString}` : '/appointments/barber/all';
  
  return api
    .get<ApiResponse<Appointment[]>>(url)  // ← SIN headers de cache
    .then((res) => res.data);
},

  // Admin — Crear cita para cliente
  createForClient: (data: {
    clientId: string;
    startTime: string;
    serviceIds: string[];
    notes?: string;
  }) => api
    .post<ApiResponse<Appointment>>('/appointments/barber/create-for-client', data)
    .then((res) => res.data),



    createManual: (data: {
    guestName: string;
    guestPhone: string;
    startTime: string;
    serviceIds: string[];
    notes?: string;
  }) => api
    .post<ApiResponse<Appointment>>('/appointments/barber/manual', data)
    .then((res) => res.data),

};