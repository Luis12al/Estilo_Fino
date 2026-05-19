// frontend/src/api/service.api.ts
import { api } from './axios.config';
import type { ApiResponse } from 'src/types/auth.types';

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationMinutes: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServicePayload {
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  imageUrl?: string;
}

export interface UpdateServicePayload {
  name?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
  imageUrl?: string;
  isActive?: boolean;
}

export const serviceApi = {
  // Público
  getAll: () => api.get<ApiResponse<Service[]>>('/services').then((res) => res.data),
  getById: (id: string) => api.get<ApiResponse<Service>>(`/services/${id}`).then((res) => res.data),

  // Admin
  getAllAdmin: () => api.get<ApiResponse<Service[]>>('/services/admin/all').then((res) => res.data),
  create: (data: CreateServicePayload) =>
    api.post<ApiResponse<Service>>('/services', data).then((res) => res.data),
  update: (id: string, data: UpdateServicePayload) =>
    api.put<ApiResponse<Service>>(`/services/${id}`, data).then((res) => res.data),
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/services/${id}`).then((res) => res.data),
  reactivate: (id: string) =>
    api.patch<ApiResponse<Service>>(`/services/${id}/reactivate`).then((res) => res.data),
  hardDelete: (id: string) =>
    api.delete<ApiResponse<null>>(`/services/${id}/permanent`).then((res) => res.data),

};