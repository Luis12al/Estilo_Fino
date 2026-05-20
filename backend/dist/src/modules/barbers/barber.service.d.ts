export declare class BarberService {
    findAll(): Promise<{
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
        bio: string | null;
        avatarUrl: string | null;
        defaultSlotDuration: number;
        schedules: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            barberId: string;
            startTime: string;
            endTime: string;
            dayOfWeek: number;
        }[];
        breaks: {
            id: string;
            createdAt: Date;
            barberId: string;
            startTime: string;
            endTime: string;
            dayOfWeek: number;
            isRecurring: boolean;
        }[];
    }[]>;
    findById(barberId: string): Promise<{
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
        bio: string | null;
        avatarUrl: string | null;
        defaultSlotDuration: number;
        schedules: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            barberId: string;
            startTime: string;
            endTime: string;
            dayOfWeek: number;
        }[];
        breaks: {
            id: string;
            createdAt: Date;
            barberId: string;
            startTime: string;
            endTime: string;
            dayOfWeek: number;
            isRecurring: boolean;
        }[];
        daysOff: {
            date: Date;
            id: string;
            createdAt: Date;
            barberId: string;
            reason: string | null;
        }[];
    }>;
    findMyProfile(userId: string): Promise<{
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
        bio: string | null;
        avatarUrl: string | null;
        defaultSlotDuration: number;
        schedules: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            barberId: string;
            startTime: string;
            endTime: string;
            dayOfWeek: number;
        }[];
        breaks: {
            id: string;
            createdAt: Date;
            barberId: string;
            startTime: string;
            endTime: string;
            dayOfWeek: number;
            isRecurring: boolean;
        }[];
        daysOff: {
            date: Date;
            id: string;
            createdAt: Date;
            barberId: string;
            reason: string | null;
        }[];
    }>;
    updateSchedule(barberId: string, data: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        barberId: string;
        startTime: string;
        endTime: string;
        dayOfWeek: number;
    }>;
    createBreak(barberId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        barberId: string;
        startTime: string;
        endTime: string;
        dayOfWeek: number;
        isRecurring: boolean;
    }>;
    deleteBreak(breakId: string, barberId: string): Promise<{
        id: string;
        createdAt: Date;
        barberId: string;
        startTime: string;
        endTime: string;
        dayOfWeek: number;
        isRecurring: boolean;
    }>;
    createDayOff(barberId: string, data: any): Promise<{
        date: Date;
        id: string;
        createdAt: Date;
        barberId: string;
        reason: string | null;
    }>;
    deleteDayOff(dayOffId: string, barberId: string): Promise<{
        date: Date;
        id: string;
        createdAt: Date;
        barberId: string;
        reason: string | null;
    }>;
}
export declare const barberService: BarberService;
//# sourceMappingURL=barber.service.d.ts.map