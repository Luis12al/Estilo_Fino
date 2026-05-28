// backend/src/modules/products/products.dto.ts
import { z } from "zod";
import { ProductCategory, ProductAvailability } from "@prisma/client";

export const productCategoryValues = Object.values(ProductCategory) as [
  string,
  ...string[]
];
export const productAvailabilityValues = Object.values(
  ProductAvailability
) as [string, ...string[]];

const productBaseSchema = {
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(150, "El nombre no puede exceder 150 caracteres"),
  description: z
    .string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .optional()
    .nullable(),
  price: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "El precio debe ser mayor a 0",
    }),
  category: z.enum(productCategoryValues, {
    errorMap: () => ({ message: "Categoría inválida" }),
  }),
  stock: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: "El stock no puede ser negativo",
    })
    .default(0),
  imageUrl: z
    .string()
    .url("La URL de la imagen no es válida")
    .max(500)
    .optional()
    .nullable(),
  availability: z.enum(productAvailabilityValues, {
    errorMap: () => ({ message: "Tipo de disponibilidad inválido" }),
  }),
  limitedUntil: z
    .union([z.string(), z.date(), z.null()])
    .transform((val) => (val ? new Date(val) : null))
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
};

export const createProductSchema = z
  .object(productBaseSchema)
  .refine(
    (data) => {
      if (data.availability === ProductAvailability.LIMITED) {
        return data.limitedUntil !== null && data.limitedUntil !== undefined;
      }
      return true;
    },
    {
      message: "Los productos limitados deben tener una fecha límite",
      path: ["limitedUntil"],
    }
  )
  .refine(
    (data) => {
      if (
        data.availability === ProductAvailability.LIMITED &&
        data.limitedUntil
      ) {
        return data.limitedUntil > new Date();
      }
      return true;
    },
    {
      message: "La fecha límite debe ser futura",
      path: ["limitedUntil"],
    }
  );

export const updateProductSchema = z
  .object({
    ...productBaseSchema,
    name: productBaseSchema.name.optional(),
    price: productBaseSchema.price.optional(),
    category: productBaseSchema.category.optional(),
    availability: productBaseSchema.availability.optional(),
  })
  .partial()
  .refine(
    (data) => {
      if (
        data.availability === ProductAvailability.LIMITED &&
        data.limitedUntil !== undefined
      ) {
        return data.limitedUntil !== null;
      }
      return true;
    },
    {
      message: "Los productos limitados deben tener una fecha límite",
      path: ["limitedUntil"],
    }
  )
  .refine(
    (data) => {
      if (
        data.availability === ProductAvailability.LIMITED &&
        data.limitedUntil
      ) {
        return data.limitedUntil > new Date();
      }
      return true;
    },
    {
      message: "La fecha límite debe ser futura",
      path: ["limitedUntil"],
    }
  );

export const productQuerySchema = z.object({
  category: z.enum(productCategoryValues).optional(),
  availability: z.enum(productAvailabilityValues).optional(),
  isActive: z
    .union([z.string(), z.boolean()])
    .transform((val) => (typeof val === "string" ? val === "true" : val))
    .optional(),
  search: z.string().optional(),
  page: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .pipe(z.number().min(1).default(1))
    .optional(),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .pipe(z.number().min(1).max(100).default(20))
    .optional(),
  includeInactive: z
    .union([z.string(), z.boolean()])
    .transform((val) => (typeof val === "string" ? val === "true" : val))
    .optional(),
});

export const productIdParamSchema = z.object({
  id: z.string().uuid("ID de producto inválido"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;