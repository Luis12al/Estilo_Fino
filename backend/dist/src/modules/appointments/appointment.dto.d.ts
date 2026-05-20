import { z } from 'zod';
export declare const availabilityQuerySchema: z.ZodObject<{
    barberId: z.ZodString;
    date: z.ZodString;
    durationMinutes: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodEffects<z.ZodString, number, string>, z.ZodNumber]>, number, string | number>>;
}, "strip", z.ZodTypeAny, {
    date: string;
    barberId: string;
    durationMinutes: number;
}, {
    date: string;
    barberId: string;
    durationMinutes?: string | number | undefined;
}>;
export declare const createAppointmentSchema: z.ZodObject<{
    barberId: z.ZodString;
    startTime: z.ZodString;
    serviceIds: z.ZodArray<z.ZodString, "many">;
    notes: z.ZodOptional<z.ZodString>;
    paymentReference: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    barberId: string;
    startTime: string;
    serviceIds: string[];
    notes?: string | undefined;
    paymentReference?: string | undefined;
}, {
    barberId: string;
    startTime: string;
    serviceIds: string[];
    notes?: string | undefined;
    paymentReference?: string | undefined;
}>;
export declare const extendAppointmentSchema: z.ZodObject<{
    additionalMinutes: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    additionalMinutes: number;
}, {
    additionalMinutes?: number | undefined;
}>;
export declare const updateStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    reason?: string | undefined;
}, {
    status: "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    reason?: string | undefined;
}>;
export declare const manualBookingSchema: z.ZodObject<{
    guestName: z.ZodString;
    guestPhone: z.ZodString;
    startTime: z.ZodString;
    serviceIds: z.ZodArray<z.ZodString, "many">;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startTime: string;
    guestName: string;
    guestPhone: string;
    serviceIds: string[];
    notes?: string | undefined;
}, {
    startTime: string;
    guestName: string;
    guestPhone: string;
    serviceIds: string[];
    notes?: string | undefined;
}>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type ExtendAppointmentInput = z.infer<typeof extendAppointmentSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ManualBookingInput = z.infer<typeof manualBookingSchema>;
//# sourceMappingURL=appointment.dto.d.ts.map