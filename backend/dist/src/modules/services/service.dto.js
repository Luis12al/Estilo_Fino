"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServiceSchema = exports.createServiceSchema = void 0;
// backend/src/modules/services/service.dto.ts
const zod_1 = require("zod");
exports.createServiceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
    description: zod_1.z.string().max(500).optional().or(zod_1.z.literal('').transform(() => undefined)),
    price: zod_1.z.union([
        zod_1.z.string().transform((val) => {
            const num = Number(val);
            if (isNaN(num))
                throw new Error('El precio debe ser un número');
            return num;
        }),
        zod_1.z.number(),
    ]).refine((val) => val > 0, { message: 'El precio debe ser mayor a 0' }),
    durationMinutes: zod_1.z.union([
        zod_1.z.string().transform((val) => {
            const num = Number(val);
            if (isNaN(num))
                throw new Error('La duración debe ser un número');
            return num;
        }),
        zod_1.z.number(),
    ]).refine((val) => val >= 5 && val <= 480, {
        message: 'La duración debe estar entre 5 y 480 minutos'
    }),
    imageUrl: zod_1.z.string().url('URL inválida').optional().or(zod_1.z.literal('').transform(() => undefined)),
});
exports.updateServiceSchema = exports.createServiceSchema.partial().extend({
    isActive: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=service.dto.js.map