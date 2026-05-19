// backend/src/modules/services/service.dto.ts
import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  description: z.string().max(500).optional().or(z.literal('').transform(() => undefined)),
  price: z.union([
    z.string().transform((val) => {
      const num = Number(val);
      if (isNaN(num)) throw new Error('El precio debe ser un número');
      return num;
    }),
    z.number(),
  ]).refine((val) => val > 0, { message: 'El precio debe ser mayor a 0' }),
  durationMinutes: z.union([
    z.string().transform((val) => {
      const num = Number(val);
      if (isNaN(num)) throw new Error('La duración debe ser un número');
      return num;
    }),
    z.number(),
  ]).refine((val) => val >= 5 && val <= 480, { 
    message: 'La duración debe estar entre 5 y 480 minutos' 
  }),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('').transform(() => undefined)),
});

export const updateServiceSchema = createServiceSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;