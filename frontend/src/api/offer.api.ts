// frontend/src/api/offer.api.ts
import { api } from './axios.config';
import type { ApiResponse } from 'src/types/auth.types';

export interface Offer {
  id: string;
  title: string;
  description: string | null;
  discountPercent: number | null;
  discountAmount: number | null;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
}

export const offerApi = {
  getAll: () => 
    api.get<ApiResponse<Offer[]>>('/offers')
      .then((res) => res.data)
      .catch(() => ({ success: true, data: [] })), // ← Fallback silencioso si 404
  
  getById: (id: string) => 
    api.get<ApiResponse<Offer>>(`/offers/${id}`)
      .then((res) => res.data)
      .catch(() => ({ success: false, data: null })),
};