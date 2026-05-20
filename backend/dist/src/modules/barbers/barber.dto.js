"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDayOffSchema = exports.createBreakSchema = exports.updateScheduleSchema = void 0;
// backend/src/modules/barbers/barber.dto.ts
const zod_1 = require("zod");
exports.updateScheduleSchema = zod_1.z.object({
    dayOfWeek: zod_1.z.coerce.number().min(0).max(6),
    startTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
    endTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
    isActive: zod_1.z.boolean().default(true),
}).refine((data) => {
    // Validar que endTime > startTime
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    return (endH * 60 + endM) > (startH * 60 + startM);
}, {
    message: 'La hora de fin debe ser mayor que la hora de inicio',
    path: ['endTime'],
});
exports.createBreakSchema = zod_1.z.object({
    dayOfWeek: zod_1.z.coerce.number().min(0).max(6), // ← z.coerce.number()
    startTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
}).refine((data) => {
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    return (endH * 60 + endM) > (startH * 60 + startM);
}, {
    message: 'El descanso debe tener duración válida',
    path: ['endTime'],
});
// ← CORREGIDO: date como string YYYY-MM-DD, no datetime
exports.createDayOffSchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
    reason: zod_1.z.string().max(255).optional(),
});
//# sourceMappingURL=barber.dto.js.map