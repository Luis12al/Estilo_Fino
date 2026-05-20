import { CreateServiceInput, UpdateServiceInput } from './service.dto';
export declare class ServiceService {
    findAll(): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        barberId: string | null;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        imageUrl: string | null;
        durationMinutes: number;
    }[]>;
    findAllAdmin(): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        barberId: string | null;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        imageUrl: string | null;
        durationMinutes: number;
    }[]>;
    findById(id: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        barberId: string | null;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        imageUrl: string | null;
        durationMinutes: number;
    }>;
    create(data: CreateServiceInput, barberId?: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        barberId: string | null;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        imageUrl: string | null;
        durationMinutes: number;
    }>;
    update(id: string, data: UpdateServiceInput, barberId?: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        barberId: string | null;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        imageUrl: string | null;
        durationMinutes: number;
    }>;
    hardDelete(id: string, barberId?: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        barberId: string | null;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        imageUrl: string | null;
        durationMinutes: number;
    }>;
    delete(id: string, barberId?: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        barberId: string | null;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        imageUrl: string | null;
        durationMinutes: number;
    }>;
    reactivate(id: string, barberId?: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        barberId: string | null;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        imageUrl: string | null;
        durationMinutes: number;
    }>;
}
export declare const serviceService: ServiceService;
//# sourceMappingURL=service.service.d.ts.map