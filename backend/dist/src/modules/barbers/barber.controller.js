"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.barberController = exports.BarberController = void 0;
const barber_service_1 = require("./barber.service");
const api_response_utils_1 = require("../../../shared/utils/api-response.utils");
const error_middleware_1 = require("../../../shared/middlewares/error.middleware");
const database_1 = require("../../../config/database");
class BarberController {
    // ── Público ──
    async getAll(_req, res, next) {
        try {
            const barbers = await barber_service_1.barberService.findAll();
            res.status(200).json((0, api_response_utils_1.successResponse)(barbers));
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = String(req.params.id);
            const barber = await barber_service_1.barberService.findById(id);
            res.status(200).json((0, api_response_utils_1.successResponse)(barber));
        }
        catch (error) {
            next(error);
        }
    }
    // ← NUEVO: Obtener MI perfil (para el panel admin)
    async getMyProfile(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new error_middleware_1.AppError(401, 'Authentication required');
            }
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            res.status(200).json((0, api_response_utils_1.successResponse)(profile));
        }
        catch (error) {
            next(error);
        }
    }
    // ── Protegido: Gestión de agenda ──
    async updateSchedule(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            // ← CORREGIDO: Buscar barberProfile por userId, no usar param de URL
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const schedule = await barber_service_1.barberService.updateSchedule(profile.id, req.body);
            res.status(200).json((0, api_response_utils_1.successResponse)(schedule, 'Horario actualizado'));
        }
        catch (error) {
            next(error);
        }
    }
    async createBreak(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const breakItem = await barber_service_1.barberService.createBreak(profile.id, req.body);
            res.status(201).json((0, api_response_utils_1.successResponse)(breakItem, 'Descanso creado'));
        }
        catch (error) {
            next(error);
        }
    }
    async deleteBreak(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const breakId = String(req.params.breakId);
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            await barber_service_1.barberService.deleteBreak(breakId, profile.id);
            res.status(200).json((0, api_response_utils_1.successResponse)(null, 'Descanso eliminado'));
        }
        catch (error) {
            next(error);
        }
    }
    async createDayOff(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const dayOff = await barber_service_1.barberService.createDayOff(profile.id, req.body);
            res.status(201).json((0, api_response_utils_1.successResponse)(dayOff, 'Día libre creado'));
        }
        catch (error) {
            next(error);
        }
    }
    async deleteDayOff(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const dayOffId = String(req.params.dayOffId);
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            await barber_service_1.barberService.deleteDayOff(dayOffId, profile.id);
            res.status(200).json((0, api_response_utils_1.successResponse)(null, 'Día libre eliminado'));
        }
        catch (error) {
            next(error);
        }
    }
    async updateMyProfile(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const { bio, avatarUrl, defaultSlotDuration } = req.body;
            const updated = await database_1.prisma.barberProfile.update({
                where: { id: profile.id },
                data: {
                    ...(bio !== undefined && { bio: bio.trim() || null }),
                    ...(avatarUrl !== undefined && { avatarUrl: avatarUrl.trim() || null }),
                    ...(defaultSlotDuration !== undefined && { defaultSlotDuration }),
                },
                include: {
                    user: true,
                    schedules: true,
                    breaks: true,
                },
            });
            res.status(200).json((0, api_response_utils_1.successResponse)({
                id: updated.id,
                userId: updated.userId,
                firstName: updated.user.firstName,
                lastName: updated.user.lastName,
                email: updated.user.email,
                phone: updated.user.phone,
                bio: updated.bio,
                avatarUrl: updated.avatarUrl,
                defaultSlotDuration: updated.defaultSlotDuration,
                schedules: updated.schedules,
                breaks: updated.breaks,
            }, 'Perfil actualizado'));
        }
        catch (error) {
            next(error);
        }
    }
    async getMyStats(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const [totalAppointments, completedThisMonth, totalRevenue, user] = await Promise.all([
                database_1.prisma.appointment.count({ where: { barberId: profile.id } }),
                database_1.prisma.appointment.count({
                    where: {
                        barberId: profile.id,
                        status: 'COMPLETED',
                        startTime: { gte: startOfMonth }
                    }
                }),
                database_1.prisma.appointment.aggregate({
                    where: { barberId: profile.id, status: 'COMPLETED' },
                    _sum: { totalPrice: true }
                }),
                database_1.prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } })
            ]);
            res.status(200).json((0, api_response_utils_1.successResponse)({
                totalAppointments,
                completedThisMonth,
                totalRevenue: totalRevenue._sum.totalPrice || 0,
                rating: 4.8,
                memberSince: user?.createdAt || new Date(),
            }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BarberController = BarberController;
exports.barberController = new BarberController();
