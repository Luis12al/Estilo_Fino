"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentController = exports.AppointmentController = void 0;
const appointment_service_1 = require("./appointment.service");
const barber_service_1 = require("../barbers/barber.service");
const api_response_utils_1 = require("@shared/utils/api-response.utils");
const error_middleware_1 = require("@shared/middlewares/error.middleware");
const database_1 = require("@config/database");
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
     * POST /api/appointments
     */
    async create(req, res, next) {
        try {
            // ← CORREGIDO: tu req.user tiene 'userId', no 'id'
            const clientId = req.user?.userId;
            if (!clientId) {
                throw new error_middleware_1.AppError(401, 'Authentication required');
            }
            const appointment = await appointment_service_1.appointmentService.create(req.body, clientId);
            res.status(201).json((0, api_response_utils_1.successResponse)(appointment, 'Cita creada exitosamente'));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/appointments/my
     */
    async getMyAppointments(req, res, next) {
        try {
            // ← CORREGIDO: tu req.user tiene 'userId', no 'id'
            const clientId = req.user?.userId;
            if (!clientId) {
                throw new error_middleware_1.AppError(401, 'Authentication required');
            }
            const appointments = await appointment_service_1.appointmentService.getClientAppointments(clientId);
            res.status(200).json((0, api_response_utils_1.successResponse)(appointments));
        }
        catch (error) {
            next(error);
        }
    }
    async getMyBarberAppointments(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new error_middleware_1.AppError(401, 'Authentication required');
            }
            // Buscar barberProfile por userId
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
     * GET /api/appointments/barber/:id
     */
    async getBarberAppointments(req, res, next) {
        try {
            // ← CORREGIDO: req.params.id puede ser string | string[], forzamos a string
            const barberId = String(req.params.id);
            const { date } = req.query;
            const appointments = await appointment_service_1.appointmentService.getBarberAppointments(barberId, date);
            res.status(200).json((0, api_response_utils_1.successResponse)(appointments));
        }
        catch (error) {
            next(error);
        }
    }
    async updateStatus(req, res, next) {
        try {
            console.log('🔍 BODY RECIBIDO:', req.body);
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const id = String(req.params.id); // ← FIX: forzar a string
            const validated = appointment_dto_1.updateStatusSchema.parse(req.body);
            console.log('✅ VALIDADO:', validated);
            const updated = await appointment_service_1.appointmentService.updateStatus(id, profile.id, validated.status, validated.reason);
            res.status(200).json((0, api_response_utils_1.successResponse)(updated, `Cita actualizada a ${validated.status}`));
        }
        catch (error) {
            console.log('❌ ERROR EN UPDATE STATUS:', error);
            next(error);
        }
    }
    /**
     * POST /api/appointments/:id/extend
     * Extender cita +20min
     */
    async extend(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const id = String(req.params.id); // ← FIX: forzar a string
            const validated = appointment_dto_1.extendAppointmentSchema.parse(req.body);
            const extended = await appointment_service_1.appointmentService.extend(id, profile.id, validated.additionalMinutes);
            res.status(200).json((0, api_response_utils_1.successResponse)(extended, `Cita extendida +${validated.additionalMinutes}min`));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/appointments/barber/stats
     * Estadísticas del día
     */
    // En getTodayStats, asegurar que devuelva stats correctas:
    async getTodayStats(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const stats = await appointment_service_1.appointmentService.getTodayStats(profile.id);
            // ← FIX: Asegurar que stats nunca sea null
            const safeStats = stats || {
                total: 0,
                pending: 0,
                confirmed: 0,
                inProgress: 0,
                completed: 0,
                cancelled: 0,
            };
            res.status(200).json((0, api_response_utils_1.successResponse)(safeStats));
        }
        catch (error) {
            next(error);
        }
    }
    /**
    * GET /api/appointments/barber/all
    * Todas las citas del barbero (sin filtro de fecha)
    */
    async getAllMyAppointments(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            console.log('🔍 getAllMyAppointments - profile.id:', profile.id);
            const { status, from, to, search } = req.query;
            // ← FIX: Construir WHERE dinámicamente
            let whereClause = `WHERE a.barber_id = '${profile.id}'`;
            if (status) {
                whereClause += ` AND a.status = '${String(status)}'`;
            }
            if (from) {
                whereClause += ` AND a.start_time >= '${String(from)}T00:00:00'::timestamp`;
            }
            if (to) {
                whereClause += ` AND a.start_time <= '${String(to)}T23:59:59'::timestamp`;
            }
            if (search) {
                const searchStr = String(search).toLowerCase();
                whereClause += ` AND (
          LOWER(u.first_name) LIKE '%${searchStr}%' OR
          LOWER(u.last_name) LIKE '%${searchStr}%' OR
          LOWER(a.guest_name) LIKE '%${searchStr}%' OR
          LOWER(a.guest_phone) LIKE '%${searchStr}%'
        )`;
            }
            // ← FIX: Query RAW para evitar problemas de Prisma
            const rawAppointments = await database_1.prisma.$queryRawUnsafe(`
        SELECT 
          a.id, a.client_id, a.guest_name, a.guest_phone, 
          a.barber_id, a.start_time, a.end_time, 
          a.total_price, a.total_duration, a.status::text as status, a.notes,
          a.created_at, a.updated_at
        FROM appointments a
        LEFT JOIN users u ON a.client_id = u.id
        ${whereClause}
        ORDER BY a.start_time DESC
      `);
            console.log('🔍 Raw query - count:', rawAppointments.length);
            // ← FIX: Obtener servicios para cada cita
            const appointmentsWithDetails = await Promise.all(rawAppointments.map(async (apt) => {
                const [client, services] = await Promise.all([
                    apt.client_id ? database_1.prisma.user.findUnique({
                        where: { id: apt.client_id },
                        select: { id: true, firstName: true, lastName: true, phone: true },
                    }) : null,
                    database_1.prisma.appointmentService.findMany({
                        where: { appointmentId: apt.id },
                        include: {
                            service: {
                                select: { id: true, name: true, price: true, durationMinutes: true },
                            },
                        },
                    }),
                ]);
                return {
                    ...apt,
                    client,
                    services,
                };
            }));
            res.status(200).json((0, api_response_utils_1.successResponse)(appointmentsWithDetails));
        }
        catch (error) {
            console.error('❌ Error en getAllMyAppointments:', error);
            next(error);
        }
    }
    /**
     * POST /api/appointments/barber/create-for-client
     * Barbero agenda cita para un cliente
     */
    async createForClient(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            // Body: { clientId, startTime, serviceIds[], notes? }
            const { clientId, startTime, serviceIds, notes } = req.body;
            // Validar que el cliente existe
            const client = await database_1.prisma.user.findFirst({
                where: { id: clientId, role: 'CLIENT' },
            });
            if (!client)
                throw new error_middleware_1.AppError(404, 'Cliente no encontrado');
            // Usar el mismo método create del service pero con el clientId proporcionado
            const appointment = await appointment_service_1.appointmentService.create({ barberId: profile.id, startTime, serviceIds, notes }, clientId);
            res.status(201).json((0, api_response_utils_1.successResponse)(appointment, 'Cita agendada para el cliente'));
        }
        catch (error) {
            next(error);
        }
    }
    /**
    * POST /api/appointments/barber/quick-book
    * Barbero agenda cita para cliente no registrado (walk-in)
    */
    async createManual(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            // Validar body con Zod
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
