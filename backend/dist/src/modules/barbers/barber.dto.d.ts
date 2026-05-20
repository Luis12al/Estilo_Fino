import { z } from 'zod';
export declare const updateScheduleSchema: z.ZodEffects<z.ZodObject<{
    dayOfWeek: z.ZodNumber;
    startTime: z.ZodString;
    endTime: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive: boolean;
    startTime: string;
    endTime: string;
    dayOfWeek: number;
}, {
    startTime: string;
    endTime: string;
    dayOfWeek: number;
    isActive?: boolean | undefined;
}>, {
    isActive: boolean;
    startTime: string;
    endTime: string;
    dayOfWeek: number;
}, {
    startTime: string;
    endTime: string;
    dayOfWeek: number;
    isActive?: boolean | undefined;
}>;
export declare const createBreakSchema: z.ZodEffects<z.ZodObject<{
    dayOfWeek: z.ZodNumber;
    startTime: z.ZodString;
    endTime: z.ZodString;
}, "strip", z.ZodTypeAny, {
    startTime: string;
    endTime: string;
    dayOfWeek: number;
}, {
    startTime: string;
    endTime: string;
    dayOfWeek: number;
}>, {
    startTime: string;
    endTime: string;
    dayOfWeek: number;
}, {
    startTime: string;
    endTime: string;
    dayOfWeek: number;
}>;
export declare const createDayOffSchema: z.ZodObject<{
    date: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    date: string;
    reason?: string | undefined;
}, {
    date: string;
    reason?: string | undefined;
}>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type CreateBreakInput = z.infer<typeof createBreakSchema>;
export type CreateDayOffInput = z.infer<typeof createDayOffSchema>;
//# sourceMappingURL=barber.dto.d.ts.map