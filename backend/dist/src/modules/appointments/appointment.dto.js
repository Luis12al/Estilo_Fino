"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualBookingSchema = exports.updateStatusSchema = exports.extendAppointmentSchema = exports.createAppointmentSchema = exports.availabilityQuerySchema = void 0;
// backend/src/modules/appointments/appointment.dto.ts
const zod_1 = require("zod");
exports.availabilityQuerySchema = zod_1.z.object({
    barberId: zod_1.z.string().uuid('ID de barbero inválido'),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha: YYYY-MM-DD'),
    durationMinutes: zod_1.z.union([
        zod_1.z.string().transform((val) => {
            const num = Number(val);
            if (isNaN(num))
                throw new Error('durationMinutes debe ser un número');
            return num;
        }),
        zod_1.z.number(),
    ]).refine((val) => val >= 5 && val <= 480, {
        message: 'La duración debe estar entre 5 y 480 minutos',
    }).default(60),
});
// Schema para crear cita
exports.createAppointmentSchema = zod_1.z.object({
    barberId: zod_1.z.string().uuid('ID de barbero inválido'),
    startTime: zod_1.z.string().datetime('Formato de fecha inválido'),
    serviceIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, 'Selecciona al menos un servicio'),
    notes: zod_1.z.string().max(500, 'Máximo 500 caracteres').optional(),
    paymentReference: zod_1.z.string().max(50, 'Máximo 50 caracteres').optional(),
});
// Schema para extender cita
exports.extendAppointmentSchema = zod_1.z.object({
    additionalMinutes: zod_1.z.number().int().min(5).max(60).default(20),
});
// Schema para cambio de estado (valida transiciones permitidas)
exports.updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    reason: zod_1.z.string().max(500).optional(), // Para cancelaciones
});
// ============================================
// NUEVO: Schema para agendamiento manual por barbero
// ============================================
exports.manualBookingSchema = zod_1.z.object({
    guestName: zod_1.z.string().min(2, 'Nombre mínimo 2 caracteres').max(150, 'Máximo 150 caracteres'),
    guestPhone: zod_1.z.string()
        .min(7, 'Teléfono inválido')
        .max(20, 'Máximo 20 caracteres')
        .regex(/^[0-9+\-\s()]+$/, 'Formato de teléfono inválido'),
    startTime: zod_1.z.string().datetime('Formato de fecha inválido (ISO 8601 requerido)'),
    serviceIds: zod_1.z.array(zod_1.z.string().uuid('ID de servicio inválido')).min(1, 'Selecciona al menos un servicio'),
    notes: zod_1.z.string().max(500, 'Máximo 500 caracteres').optional(),
});
