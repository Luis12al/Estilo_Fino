// frontend/src/api/barber.api.ts
import { api } from './axios.config';
import type { ApiResponse } from 'src/types/auth.types';

// ── INTERFACES EXISTENTES (no tocar) ──
export interface Barber {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  defaultSlotDuration: number;
  schedules: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }>;
  breaks: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
}

// ── NUEVAS INTERFACES para panel admin ──
export interface WorkSchedule {
  id: string;
  barberId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface BreakItem {
  id: string;
  barberId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface DayOffItem {
  id: string;
  barberId: string;
  date: string;
  reason: string | null;
}

export interface BarberProfile extends Barber {
  daysOff: DayOffItem[];
}

export interface UpdateSchedulePayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface CreateBreakPayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface CreateDayOffPayload {
  date: string;
  reason?: string;
}

// ── API EXISTENTE (no tocar) ──
export const barberApi = {
  getAll: () => api.get<ApiResponse<Barber[]>>('/barbers').then((res) => res.data),
  getById: (id: string) => api.get<ApiResponse<Barber>>(`/barbers/${id}`).then((res) => res.data),

  // ── NUEVOS: Endpoints /me/* para panel admin ──
  getMyProfile: () =>
    api.get<ApiResponse<BarberProfile>>('/barbers/me/profile').then((res) => res.data),

  updateSchedule: (data: UpdateSchedulePayload) =>
    api.put<ApiResponse<WorkSchedule>>('/barbers/me/schedule', data).then((res) => res.data),

  createBreak: (data: CreateBreakPayload) =>
    api.post<ApiResponse<BreakItem>>('/barbers/me/breaks', data).then((res) => res.data),

  deleteBreak: (breakId: string) =>
    api.delete<ApiResponse<null>>(`/barbers/me/breaks/${breakId}`).then((res) => res.data),

  createDayOff: (data: CreateDayOffPayload) =>
    api.post<ApiResponse<DayOffItem>>('/barbers/me/days-off', data).then((res) => res.data),

  deleteDayOff: (dayOffId: string) =>
    api.delete<ApiResponse<null>>(`/barbers/me/days-off/${dayOffId}`).then((res) => res.data),

  updateProfile: (data: { bio?: string; avatarUrl?: string; defaultSlotDuration?: number }) =>
    api.put<ApiResponse<BarberProfile>>('/barbers/me/profile', data).then((res) => res.data),

  getMyStats: () =>
    api.get<ApiResponse<{
      totalAppointments: number;
      completedThisMonth: number;
      totalRevenue: number;
      rating: number;
      memberSince: string;
    }>>('/barbers/me/stats').then((res) => res.data),

};