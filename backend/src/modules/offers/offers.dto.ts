// backend/src/modules/offers/offers.dto.ts

import { z } from 'zod';
import { OfferType } from '@prisma/client';

export const offerTypeValues = ['PERMANENT', 'LIMITED_TIME'] as const;

export const createOfferSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres').max(150),
  description: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
  
  originalPrice: z.number().min(0, 'El precio original debe ser mayor o igual a 0'),
  discountPercent: z.number().int().min(0).max(100).optional(),
  finalPrice: z.number().min(0).optional(), // ← Se calcula automáticamente, pero puede venir del frontend
  
  type: z.enum(offerTypeValues, {
    errorMap: () => ({ message: 'Tipo inválido. Use PERMANENT o LIMITED_TIME' }),
  }),
  validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  imageUrl: z.string().url('URL inválida').max(500).optional(),
});

export const updateOfferSchema = createOfferSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const offerIdParamSchema = z.object({
  id: z.string().uuid('ID de oferta inválido'),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;