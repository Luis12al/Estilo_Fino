"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceService = exports.ServiceService = void 0;
// backend/src/modules/services/service.service.ts
const database_1 = require("@config/database");
const error_middleware_1 = require("@shared/middlewares/error.middleware");
class ServiceService {
    // Público: solo activos
    async findAll() {
        return database_1.prisma.service.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    // Admin: todos (activos e inactivos)
    async findAllAdmin() {
        return database_1.prisma.service.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id) {
        const service = await database_1.prisma.service.findUnique({
            where: { id },
        });
        if (!service) {
            throw new error_middleware_1.AppError(404, 'Servicio no encontrado');
        }
        return service;
    }
    // ← CORREGIDO: barberId opcional (NULL = servicio global)
    async create(data, barberId) {
        return database_1.prisma.service.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                durationMinutes: data.durationMinutes,
                imageUrl: data.imageUrl,
                isActive: true,
                barberId: barberId || null, // NULL = global para todos
            },
        });
    }
    // ← CORREGIDO: Verificar propiedad antes de actualizar
    async update(id, data, barberId) {
        const service = await database_1.prisma.service.findUnique({
            where: { id },
        });
        if (!service) {
            throw new error_middleware_1.AppError(404, 'Servicio no encontrado');
        }
        // Si el servicio tiene barberId, solo el dueño puede editarlo
        // Si es global (barberId = null), cualquier barbero puede editar
        if (service.barberId && service.barberId !== barberId) {
            throw new error_middleware_1.AppError(403, 'No tienes permiso para editar este servicio');
        }
        return database_1.prisma.service.update({
            where: { id },
            data,
        });
    }
    async hardDelete(id, barberId) {
        const service = await database_1.prisma.service.findUnique({
            where: { id },
            include: {
                appointmentServices: true,
            },
        });
        if (!service) {
            throw new error_middleware_1.AppError(404, 'Servicio no encontrado');
        }
        // Verificar propiedad
        if (service.barberId && service.barberId !== barberId) {
            throw new error_middleware_1.AppError(403, 'No tienes permiso para eliminar este servicio');
        }
        // Verificar que no tenga citas asociadas
        if (service.appointmentServices.length > 0) {
            throw new error_middleware_1.AppError(409, 'No se puede eliminar: el servicio tiene citas asociadas. Desactívalo en su lugar.');
        }
        return database_1.prisma.service.delete({
            where: { id },
        });
    }
    // Soft delete (desactivar)
    async delete(id, barberId) {
        const service = await database_1.prisma.service.findUnique({
            where: { id },
        });
        if (!service) {
            throw new error_middleware_1.AppError(404, 'Servicio no encontrado');
        }
        // Misma lógica de propiedad
        if (service.barberId && service.barberId !== barberId) {
            throw new error_middleware_1.AppError(403, 'No tienes permiso para desactivar este servicio');
        }
        return database_1.prisma.service.update({
            where: { id },
            data: { isActive: false },
        });
    }
    // Reactivar servicio
    async reactivate(id, barberId) {
        const service = await database_1.prisma.service.findUnique({
            where: { id },
        });
        if (!service) {
            throw new error_middleware_1.AppError(404, 'Servicio no encontrado');
        }
        if (service.barberId && service.barberId !== barberId) {
            throw new error_middleware_1.AppError(403, 'No tienes permiso para reactivar este servicio');
        }
        return database_1.prisma.service.update({
            where: { id },
            data: { isActive: true },
        });
    }
}
exports.ServiceService = ServiceService;
exports.serviceService = new ServiceService();
//# sourceMappingURL=service.service.js.map