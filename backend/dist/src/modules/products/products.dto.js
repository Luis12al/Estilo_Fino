"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productIdParamSchema = exports.productQuerySchema = exports.updateProductSchema = exports.createProductSchema = exports.productAvailabilityValues = exports.productCategoryValues = void 0;
// backend/src/modules/products/products.dto.ts
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.productCategoryValues = Object.values(client_1.ProductCategory);
exports.productAvailabilityValues = Object.values(client_1.ProductAvailability);
const productBaseSchema = {
    name: zod_1.z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(150, "El nombre no puede exceder 150 caracteres"),
    description: zod_1.z
        .string()
        .max(1000, "La descripción no puede exceder 1000 caracteres")
        .optional()
        .nullable(),
    price: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()])
        .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
        .refine((val) => !isNaN(val) && val > 0, {
        message: "El precio debe ser mayor a 0",
    }),
    category: zod_1.z.enum(exports.productCategoryValues, {
        errorMap: () => ({ message: "Categoría inválida" }),
    }),
    stock: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()])
        .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
        .refine((val) => !isNaN(val) && val >= 0, {
        message: "El stock no puede ser negativo",
    })
        .default(0),
    imageUrl: zod_1.z
        .string()
        .url("La URL de la imagen no es válida")
        .max(500)
        .optional()
        .nullable(),
    availability: zod_1.z.enum(exports.productAvailabilityValues, {
        errorMap: () => ({ message: "Tipo de disponibilidad inválido" }),
    }),
    limitedUntil: zod_1.z
        .union([zod_1.z.string(), zod_1.z.date(), zod_1.z.null()])
        .transform((val) => (val ? new Date(val) : null))
        .optional()
        .nullable(),
    isActive: zod_1.z.boolean().default(true),
};
exports.createProductSchema = zod_1.z
    .object(productBaseSchema)
    .refine((data) => {
    if (data.availability === client_1.ProductAvailability.LIMITED) {
        return data.limitedUntil !== null && data.limitedUntil !== undefined;
    }
    return true;
}, {
    message: "Los productos limitados deben tener una fecha límite",
    path: ["limitedUntil"],
})
    .refine((data) => {
    if (data.availability === client_1.ProductAvailability.LIMITED &&
        data.limitedUntil) {
        return data.limitedUntil > new Date();
    }
    return true;
}, {
    message: "La fecha límite debe ser futura",
    path: ["limitedUntil"],
});
exports.updateProductSchema = zod_1.z
    .object({
    ...productBaseSchema,
    name: productBaseSchema.name.optional(),
    price: productBaseSchema.price.optional(),
    category: productBaseSchema.category.optional(),
    availability: productBaseSchema.availability.optional(),
})
    .partial()
    .refine((data) => {
    if (data.availability === client_1.ProductAvailability.LIMITED &&
        data.limitedUntil !== undefined) {
        return data.limitedUntil !== null;
    }
    return true;
}, {
    message: "Los productos limitados deben tener una fecha límite",
    path: ["limitedUntil"],
})
    .refine((data) => {
    if (data.availability === client_1.ProductAvailability.LIMITED &&
        data.limitedUntil) {
        return data.limitedUntil > new Date();
    }
    return true;
}, {
    message: "La fecha límite debe ser futura",
    path: ["limitedUntil"],
});
exports.productQuerySchema = zod_1.z.object({
    category: zod_1.z.enum(exports.productCategoryValues).optional(),
    availability: zod_1.z.enum(exports.productAvailabilityValues).optional(),
    isActive: zod_1.z
        .union([zod_1.z.string(), zod_1.z.boolean()])
        .transform((val) => (typeof val === "string" ? val === "true" : val))
        .optional(),
    search: zod_1.z.string().optional(),
    page: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()])
        .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
        .pipe(zod_1.z.number().min(1).default(1))
        .optional(),
    limit: zod_1.z
        .union([zod_1.z.string(), zod_1.z.number()])
        .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
        .pipe(zod_1.z.number().min(1).max(100).default(20))
        .optional(),
    includeInactive: zod_1.z
        .union([zod_1.z.string(), zod_1.z.boolean()])
        .transform((val) => (typeof val === "string" ? val === "true" : val))
        .optional(),
});
exports.productIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("ID de producto inválido"),
});
