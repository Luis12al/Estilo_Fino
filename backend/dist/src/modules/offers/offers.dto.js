"use strict";
// backend/src/modules/offers/offers.dto.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerIdParamSchema = exports.updateOfferSchema = exports.createOfferSchema = exports.offerTypeValues = void 0;
const zod_1 = require("zod");
exports.offerTypeValues = ['PERMANENT', 'LIMITED_TIME'];
exports.createOfferSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'El título debe tener al menos 2 caracteres').max(150),
    description: zod_1.z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
    originalPrice: zod_1.z.number().min(0, 'El precio original debe ser mayor o igual a 0'),
    discountPercent: zod_1.z.number().int().min(0).max(100).optional(),
    finalPrice: zod_1.z.number().min(0).optional(), // ← Se calcula automáticamente, pero puede venir del frontend
    type: zod_1.z.enum(exports.offerTypeValues, {
        errorMap: () => ({ message: 'Tipo inválido. Use PERMANENT o LIMITED_TIME' }),
    }),
    validFrom: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
    validUntil: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
    imageUrl: zod_1.z.string().url('URL inválida').max(500).optional(),
});
exports.updateOfferSchema = exports.createOfferSchema.partial().extend({
    isActive: zod_1.z.boolean().optional(),
});
exports.offerIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('ID de oferta inválido'),
});
