"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentController = exports.AppointmentController = void 0;
const appointment_service_1 = require("./appointment.service");
const barber_service_1 = require("../barbers/barber.service");
const api_response_utils_1 = require("../../../shared/utils/api-response.utils");
const error_middleware_1 = require("../../../shared/middlewares/error.middleware");
const database_1 = require("../../../config/database");
const appointment_dto_1 = require("./appointment.dto");
class AppointmentController {
    /**
     * GET /api/appointments/availability?barberId=X&date=Y&durationMinutes=Z
     */
    async getAvailability(req, res, next) {
        try {
            const validatedQuery = appointment_dto_1.availabilityQuerySchema.parse(req.query);
            const availability = await appointment_service_1.appointmentService.getAvailability(validatedQuery);
            res.status(200).json((0, api_response_utils_1.successResponse)(availability));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/appointments — Cliente crea cita
     */
    async create(req, res, next) {
        try {
            const clientId = req.user?.userId;
            if (!clientId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const appointment = await appointment_service_1.appointmentService.create(req.body, clientId);
            res.status(201).json((0, api_response_utils_1.successResponse)(appointment, 'Cita creada exitosamente'));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/appointments/my — Citas del cliente logueado
     */
    async getMyAppointments(req, res, next) {
        try {
            const clientId = req.user?.userId;
            if (!clientId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const appointments = await appointment_service_1.appointmentService.getClientAppointments(clientId);
            res.status(200).json((0, api_response_utils_1.successResponse)(appointments));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/appointments/barber/me — Citas del barbero logueado (por fecha)
     */
    async getMyBarberAppointments(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const { date } = req.query;
            const appointments = await appointment_service_1.appointmentService.getBarberAppointments(profile.id, date);
            res.status(200).json((0, api_response_utils_1.successResponse)(appointments));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/appointments/barber/:id — Citas de un barbero específico
     */
    async getBarberAppointments(req, res, next) {
        try {
            const barberId = String(req.params.id);
            const { date } = req.query;
            const appointments = await appointment_service_1.appointmentService.getBarberAppointments(barberId, date);
            res.status(200).json((0, api_response_utils_1.successResponse)(appointments));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/appointments/barber/all — TODAS las citas del barbero logueado (con filtros)
     * ← MÉTODO RECONSTRUIDO DESDE CERO
     */
    async getAllMyAppointments(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const barberId = profile.id;
            // Extraer filtros de query params
            const { status, from, to, search } = req.query;
            // Construir WHERE dinámico
            const where = { barberId };
            // ← FIX: Validar que status no sea string vacío
            if (status && String(status).trim() && String(status).trim() !== '') {
                where.status = String(status).trim();
            }
            if (from && String(from).trim() && String(from).trim() !== '') {
                const fromDate = new Date(String(from) + 'T00:00:00');
                if (!isNaN(fromDate.getTime())) {
                    where.startTime = { ...where.startTime, gte: fromDate };
                }
            }
            if (to && String(to).trim() && String(to).trim() !== '') {
                const toDate = new Date(String(to) + 'T23:59:59.999');
                if (!isNaN(toDate.getTime())) {
                    where.startTime = { ...where.startTime, lte: toDate };
                }
            }
            if (search && String(search).trim() && String(search).trim() !== '') {
                const searchStr = String(search).trim();
                where.OR = [
                    { client: { firstName: { contains: searchStr, mode: 'insensitive' } } },
                    { client: { lastName: { contains: searchStr, mode: 'insensitive' } } },
                    { guestName: { contains: searchStr, mode: 'insensitive' } },
                    { guestPhone: { contains: searchStr, mode: 'insensitive' } },
                ];
            }
            // ← FIX: Si no hay status en el where, asegurar que no se filtre por status vacío
            console.log('🔍 [getAllMyAppointments] barberId:', barberId);
            console.log('🔍 [getAllMyAppointments] WHERE:', JSON.stringify(where, null, 2));
            const appointments = await database_1.prisma.appointment.findMany({
                where,
                include: {
                    services: {
                        include: {
                            service: {
                                select: {
                                    id: true,
                                    name: true,
                                    price: true,
                                    durationMinutes: true,
                                },
                            },
                        },
                    },
                    client: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                        },
                    },
                    barber: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    startTime: 'desc',
                },
            });
            console.log('✅ [getAllMyAppointments] Encontradas:', appointments.length, 'citas');
            res.status(200).json((0, api_response_utils_1.successResponse)(appointments));
        }
        catch (error) {
            console.error('❌ [getAllMyAppointments] Error:', error);
            next(error);
        }
    }
    /**
     * GET /api/appointments/barber/stats — Estadísticas del día
     */
    async getTodayStats(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const stats = await appointment_service_1.appointmentService.getTodayStats(profile.id);
            const safeStats = stats || {
                total: 0, pending: 0, confirmed: 0, inProgress: 0, completed: 0, cancelled: 0,
            };
            res.status(200).json((0, api_response_utils_1.successResponse)(safeStats));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PATCH /api/appointments/:id/status — Cambiar estado
     */
    async updateStatus(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const id = String(req.params.id);
            const validated = appointment_dto_1.updateStatusSchema.parse(req.body);
            const updated = await appointment_service_1.appointmentService.updateStatus(id, profile.id, validated.status, validated.reason);
            res.status(200).json((0, api_response_utils_1.successResponse)(updated, `Cita actualizada a ${validated.status}`));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/appointments/:id/extend — Extender cita
     */
    async extend(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const id = String(req.params.id);
            const validated = appointment_dto_1.extendAppointmentSchema.parse(req.body);
            const extended = await appointment_service_1.appointmentService.extend(id, profile.id, validated.additionalMinutes);
            res.status(200).json((0, api_response_utils_1.successResponse)(extended, `Cita extendida +${validated.additionalMinutes}min`));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/appointments/barber/create-for-client — Agendar para cliente registrado
     */
    async createForClient(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const { clientId, startTime, serviceIds, notes } = req.body;
            const client = await database_1.prisma.user.findFirst({
                where: { id: clientId, role: 'CLIENT' },
            });
            if (!client)
                throw new error_middleware_1.AppError(404, 'Cliente no encontrado');
            const appointment = await appointment_service_1.appointmentService.create({ barberId: profile.id, startTime, serviceIds, notes }, clientId);
            res.status(201).json((0, api_response_utils_1.successResponse)(appointment, 'Cita agendada para el cliente'));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/appointments/barber/manual — Agendar walk-in (cliente no registrado)
     */
    async createManual(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const validated = appointment_dto_1.manualBookingSchema.parse(req.body);
            const appointment = await appointment_service_1.appointmentService.createManual(validated, profile.id);
            res.status(201).json((0, api_response_utils_1.successResponse)(appointment, 'Cita agendada exitosamente'));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AppointmentController = AppointmentController;
exports.appointmentController = new AppointmentController();
