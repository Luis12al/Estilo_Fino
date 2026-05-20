import { z } from 'zod';
export declare const createServiceSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodEffects<z.ZodLiteral<"">, undefined, "">]>;
    price: z.ZodEffects<z.ZodUnion<[z.ZodEffects<z.ZodString, number, string>, z.ZodNumber]>, number, string | number>;
    durationMinutes: z.ZodEffects<z.ZodUnion<[z.ZodEffects<z.ZodString, number, string>, z.ZodNumber]>, number, string | number>;
    imageUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodEffects<z.ZodLiteral<"">, undefined, "">]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    price: number;
    durationMinutes: number;
    description?: string | undefined;
    imageUrl?: string | undefined;
}, {
    name: string;
    price: string | number;
    durationMinutes: string | number;
    description?: string | undefined;
    imageUrl?: string | undefined;
}>;
export declare const updateServiceSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodEffects<z.ZodLiteral<"">, undefined, "">]>>;
    price: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodEffects<z.ZodString, number, string>, z.ZodNumber]>, number, string | number>>;
    durationMinutes: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodEffects<z.ZodString, number, string>, z.ZodNumber]>, number, string | number>>;
    imageUrl: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodEffects<z.ZodLiteral<"">, undefined, "">]>>;
} & {
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    description?: string | undefined;
    price?: number | undefined;
    imageUrl?: string | undefined;
    durationMinutes?: number | undefined;
}, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    description?: string | undefined;
    price?: string | number | undefined;
    imageUrl?: string | undefined;
    durationMinutes?: string | number | undefined;
}>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
//# sourceMappingURL=service.dto.d.ts.map