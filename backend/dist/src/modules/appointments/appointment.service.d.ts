import { CreateAppointmentInput, AvailabilityQuery, ManualBookingInput } from './appointment.dto';
import { AppointmentStatus } from '@prisma/client';
export declare class AppointmentService {
    /**
     * 🔥 Calcular slots disponibles para un barbero en una fecha
     */
    getAvailability(query: AvailabilityQuery): Promise<{
        available: boolean;
        reason: string;
        slots: never[];
        schedule: null;
        breaks: never[];
        appointments: never[];
    } | {
        available: boolean;
        reason: string | undefined;
        schedule: {
            start: string;
            end: string;
        };
        slots: string[];
        breaks: {
            start: string;
            end: string;
        }[];
        appointments: {
            id: string;
            start: string;
            end: string;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            clientName: string;
        }[];
    }>;
    /**
     * 📊 Estadísticas del día para dashboard
     */
    getTodayStats(barberId: string): Promise<{
        total: number;
        pending: number;
        confirmed: number;
        inProgress: number;
        completed: number;
        cancelled: number;
    }>;
    /**
     * Obtener citas de un barbero (con filtro opcional por fecha)
     */
    getBarberAppointments(barberId: string, date?: string): Promise<({
        client: {
            id: string;
            firstName: string;
            lastName: string;
            phone: string | null;
        } | null;
        services: ({
            service: {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                barberId: string | null;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                durationMinutes: number;
            };
        } & {
            id: string;
            appointmentId: string;
            serviceId: string;
            priceAtBooking: import("@prisma/client/runtime/library").Decimal;
            durationAtBooking: number;
        })[];
    } & {
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string | null;
        barberId: string;
        startTime: Date;
        endTime: Date;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        totalDuration: number;
        notes: string | null;
        guestName: string | null;
        guestPhone: string | null;
    })[]>;
    /**
     * 🛡️ Crear cita con transacción atómica
     */
    create(data: CreateAppointmentInput, clientId: string): Promise<{
        client: {
            id: string;
            firstName: string;
            lastName: string;
            phone: string | null;
        } | null;
        services: ({
            service: {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                barberId: string | null;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                durationMinutes: number;
            };
        } & {
            id: string;
            appointmentId: string;
            serviceId: string;
            priceAtBooking: import("@prisma/client/runtime/library").Decimal;
            durationAtBooking: number;
        })[];
        barber: {
            user: {
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            bio: string | null;
            avatarUrl: string | null;
            defaultSlotDuration: number;
        };
    } & {
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string | null;
        barberId: string;
        startTime: Date;
        endTime: Date;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        totalDuration: number;
        notes: string | null;
        guestName: string | null;
        guestPhone: string | null;
    }>;
    /**
     * 🛡️ Crear cita MANUAL por barbero (walk-in)
     */
    createManual(data: ManualBookingInput, barberId: string): Promise<{
        client: {
            id: string;
            firstName: string;
            lastName: string;
            phone: string | null;
        } | null;
        services: ({
            service: {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                barberId: string | null;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                durationMinutes: number;
            };
        } & {
            id: string;
            appointmentId: string;
            serviceId: string;
            priceAtBooking: import("@prisma/client/runtime/library").Decimal;
            durationAtBooking: number;
        })[];
        barber: {
            user: {
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            bio: string | null;
            avatarUrl: string | null;
            defaultSlotDuration: number;
        };
    } & {
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string | null;
        barberId: string;
        startTime: Date;
        endTime: Date;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        totalDuration: number;
        notes: string | null;
        guestName: string | null;
        guestPhone: string | null;
    }>;
    /**
     * Obtener citas de un cliente
     */
    getClientAppointments(clientId: string): Promise<({
        services: ({
            service: {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                barberId: string | null;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                durationMinutes: number;
            };
        } & {
            id: string;
            appointmentId: string;
            serviceId: string;
            priceAtBooking: import("@prisma/client/runtime/library").Decimal;
            durationAtBooking: number;
        })[];
        barber: {
            user: {
                id: string;
                email: string;
                passwordHash: string;
                firstName: string;
                lastName: string;
                phone: string | null;
                role: import("@prisma/client").$Enums.UserRole;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            bio: string | null;
            avatarUrl: string | null;
            defaultSlotDuration: number;
        };
    } & {
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string | null;
        barberId: string;
        startTime: Date;
        endTime: Date;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        totalDuration: number;
        notes: string | null;
        guestName: string | null;
        guestPhone: string | null;
    })[]>;
    updateStatus(appointmentId: string, barberId: string, status: AppointmentStatus, reason?: string): Promise<{
        client: {
            firstName: string;
            lastName: string;
            phone: string | null;
        } | null;
        services: ({
            service: {
                name: string;
            };
        } & {
            id: string;
            appointmentId: string;
            serviceId: string;
            priceAtBooking: import("@prisma/client/runtime/library").Decimal;
            durationAtBooking: number;
        })[];
    } & {
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string | null;
        barberId: string;
        startTime: Date;
        endTime: Date;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        totalDuration: number;
        notes: string | null;
        guestName: string | null;
        guestPhone: string | null;
    }>;
    /**
     * ⏱️ Extender cita +20min
     */
    extend(appointmentId: string, barberId: string, additionalMinutes?: number): Promise<{
        client: {
            firstName: string;
            lastName: string;
            phone: string | null;
        } | null;
        services: ({
            service: {
                name: string;
            };
        } & {
            id: string;
            appointmentId: string;
            serviceId: string;
            priceAtBooking: import("@prisma/client/runtime/library").Decimal;
            durationAtBooking: number;
        })[];
    } & {
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string | null;
        barberId: string;
        startTime: Date;
        endTime: Date;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        totalDuration: number;
        notes: string | null;
        guestName: string | null;
        guestPhone: string | null;
    }>;
    private calculateSlots;
    private minutesToTime;
    private formatTime;
}
export declare const appointmentService: AppointmentService;
//# sourceMappingURL=appointment.service.d.ts.map