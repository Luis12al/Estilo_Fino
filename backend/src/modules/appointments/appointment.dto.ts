// backend/src/modules/appointments/appointment.dto.ts
import { z } from 'zod';

export const availabilityQuerySchema = z.object({
  barberId: z.string().uuid('ID de barbero inválido'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha: YYYY-MM-DD'),
  durationMinutes: z.union([
    z.string().transform((val) => {
      const num = Number(val);
      if (isNaN(num)) throw new Error('durationMinutes debe ser un número');
      return num;
    }),
    z.number(),
  ]).refine((val) => val >= 5 && val <= 480, {
    message: 'La duración debe estar entre 5 y 480 minutos',
  }).default(60),
});

// Schema para crear cita
export const createAppointmentSchema = z.object({
  barberId: z.string().uuid('ID de barbero inválido'),
  startTime: z.string().datetime('Formato de fecha inválido'),
  serviceIds: z.array(z.string().uuid()).min(1, 'Selecciona al menos un servicio'),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
  paymentReference: z.string().max(50, 'Máximo 50 caracteres').optional(),
});

// Schema para extender cita
export const extendAppointmentSchema = z.object({
  additionalMinutes: z.number().int().min(5).max(60).default(20),
});

// Schema para cambio de estado (valida transiciones permitidas)
export const updateStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  reason: z.string().max(500).optional(), // Para cancelaciones
});


// ============================================
// NUEVO: Schema para agendamiento manual por barbero
// ============================================

export const manualBookingSchema = z.object({
  guestName: z.string().min(2, 'Nombre mínimo 2 caracteres').max(150, 'Máximo 150 caracteres'),
  guestPhone: z.string()
    .min(7, 'Teléfono inválido')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[0-9+\-\s()]+$/, 'Formato de teléfono inválido'),
  startTime: z.string().datetime('Formato de fecha inválido (ISO 8601 requerido)'),
  serviceIds: z.array(z.string().uuid('ID de servicio inválido')).min(1, 'Selecciona al menos un servicio'),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
});


export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type ExtendAppointmentInput = z.infer<typeof extendAppointmentSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ManualBookingInput = z.infer<typeof manualBookingSchema>;