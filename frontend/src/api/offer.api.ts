import { api } from './axios.config';
import type { ApiResponse } from 'src/types/auth.types';

export type OfferType = 'PERMANENT' | 'LIMITED_TIME';

export interface Offer {
  id: string;
  title: string;
  description: string | null;
  originalPrice: number | null; 
  discountPercent: number | null;
  discountAmount: number | null;
  finalPrice: number | null; 
  type: OfferType;
  validFrom: string | null;
  validUntil: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  barber: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  } | null;
}

export interface CreateOfferInput {
  title: string;
  description?: string;
  originalPrice: number;
  discountPercent?: number;
  discountAmount?: number;
  finalPrice?: number;  
  type: OfferType;
  validFrom?: string;
  validUntil?: string;
  imageUrl?: string;
}

export type UpdateOfferInput = Partial<CreateOfferInput> & {
  isActive?: boolean;
};

export const offerApi = {
  // ── Público ──
  getAllPublic: () =>
    api.get<ApiResponse<Offer[]>>('/offers').then((res) => res.data),

  // ── Admin ──
  getMyOffers: (includeInactive = false) =>
    api
      .get<ApiResponse<Offer[]>>(`/offers/admin`, {
        params: includeInactive ? { includeInactive: 'true' } : undefined,
      })
      .then((res) => res.data),

  getById: (id: string) =>
    api.get<ApiResponse<Offer>>(`/offers/admin/${id}`).then((res) => res.data),

  create: (data: CreateOfferInput) =>
    api.post<ApiResponse<Offer>>('/offers/admin', data).then((res) => res.data),

  update: (id: string, data: UpdateOfferInput) =>
    api.put<ApiResponse<Offer>>(`/offers/admin/${id}`, data).then((res) => res.data),

  deactivate: (id: string) =>
    api
      .patch<ApiResponse<Offer>>(`/offers/admin/${id}/deactivate`)
      .then((res) => res.data),

  reactivate: (id: string) =>
    api
      .patch<ApiResponse<Offer>>(`/offers/admin/${id}/reactivate`)
      .then((res) => res.data),

  delete: (id: string) =>
    api
      .delete<ApiResponse<null>>(`/offers/admin/${id}`)
      .then((res) => res.data),
};