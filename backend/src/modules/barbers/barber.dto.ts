// backend/src/modules/barbers/barber.dto.ts
import { z } from 'zod';

export const updateScheduleSchema = z.object({
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
  isActive: z.boolean().default(true),
}).refine((data) => {
  // Validar que endTime > startTime
  const [startH, startM] = data.startTime.split(':').map(Number);
  const [endH, endM] = data.endTime.split(':').map(Number);
  return (endH * 60 + endM) > (startH * 60 + startM);
}, {
  message: 'La hora de fin debe ser mayor que la hora de inicio',
  path: ['endTime'],
});

export const createBreakSchema = z.object({
  dayOfWeek: z.coerce.number().min(0).max(6),  // ← z.coerce.number()
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
}).refine((data) => {
  const [startH, startM] = data.startTime.split(':').map(Number);
  const [endH, endM] = data.endTime.split(':').map(Number);
  return (endH * 60 + endM) > (startH * 60 + startM);
}, {
  message: 'El descanso debe tener duración válida',
  path: ['endTime'],
});

// ← CORREGIDO: date como string YYYY-MM-DD, no datetime
export const createDayOffSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  reason: z.string().max(255).optional(),
});

export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type CreateBreakInput = z.infer<typeof createBreakSchema>;
export type CreateDayOffInput = z.infer<typeof createDayOffSchema>;