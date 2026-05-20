"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceController = exports.ServiceController = void 0;
const database_1 = require("@config/database");
const service_service_1 = require("./service.service");
const api_response_utils_1 = require("@shared/utils/api-response.utils");
const error_middleware_1 = require("@shared/middlewares/error.middleware");
const service_dto_1 = require("./service.dto");
class ServiceController {
    // GET /api/services - Público (solo activos)
    async getAll(_req, res, next) {
        try {
            const services = await service_service_1.serviceService.findAll();
            res.status(200).json((0, api_response_utils_1.successResponse)(services));
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/services/admin - Admin (todos)
    async getAllAdmin(_req, res, next) {
        try {
            const services = await service_service_1.serviceService.findAllAdmin();
            res.status(200).json((0, api_response_utils_1.successResponse)(services));
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/services/:id
    async getById(req, res, next) {
        try {
            const id = String(req.params.id);
            const service = await service_service_1.serviceService.findById(id);
            res.status(200).json((0, api_response_utils_1.successResponse)(service));
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/services
    async create(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new error_middleware_1.AppError(401, 'Authentication required');
            }
            // Buscar barberProfile del usuario logueado
            const barberProfile = await database_1.prisma.barberProfile.findUnique({
                where: { userId },
            });
            // Si no tiene perfil de barbero, crear servicio global (barberId = null)
            const barberId = barberProfile?.id;
            const validated = service_dto_1.createServiceSchema.parse(req.body);
            const service = await service_service_1.serviceService.create(validated, barberId);
            res.status(201).json((0, api_response_utils_1.successResponse)(service, 'Servicio creado exitosamente'));
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/services/:id (cambio de PATCH a PUT)
    async update(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new error_middleware_1.AppError(401, 'Authentication required');
            }
            const barberProfile = await database_1.prisma.barberProfile.findUnique({
                where: { userId },
            });
            const id = String(req.params.id);
            const validated = service_dto_1.updateServiceSchema.parse(req.body);
            const service = await service_service_1.serviceService.update(id, validated, barberProfile?.id);
            res.status(200).json((0, api_response_utils_1.successResponse)(service, 'Servicio actualizado exitosamente'));
        }
        catch (error) {
            next(error);
        }
    }
    async hardDelete(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new error_middleware_1.AppError(401, 'Authentication required');
            }
            const barberProfile = await database_1.prisma.barberProfile.findUnique({
                where: { userId },
            });
            const id = String(req.params.id);
            await service_service_1.serviceService.hardDelete(id, barberProfile?.id);
            res.status(200).json((0, api_response_utils_1.successResponse)(null, 'Servicio eliminado permanentemente'));
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/services/:id (soft delete)
    async delete(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new error_middleware_1.AppError(401, 'Authentication required');
            }
            const barberProfile = await database_1.prisma.barberProfile.findUnique({
                where: { userId },
            });
            const id = String(req.params.id);
            await service_service_1.serviceService.delete(id, barberProfile?.id);
            res.status(200).json((0, api_response_utils_1.successResponse)(null, 'Servicio desactivado'));
        }
        catch (error) {
            next(error);
        }
    }
    // PATCH /api/services/:id/reactivate
    async reactivate(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new error_middleware_1.AppError(401, 'Authentication required');
            }
            const barberProfile = await database_1.prisma.barberProfile.findUnique({
                where: { userId },
            });
            const id = String(req.params.id);
            const service = await service_service_1.serviceService.reactivate(id, barberProfile?.id);
            res.status(200).json((0, api_response_utils_1.successResponse)(service, 'Servicio reactivado'));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ServiceController = ServiceController;
exports.serviceController = new ServiceController();
//# sourceMappingURL=service.controller.js.map