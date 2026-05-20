"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.barberService = exports.BarberService = void 0;
// backend/src/modules/barbers/barber.service.ts
const database_1 = require("@config/database");
const error_middleware_1 = require("@shared/middlewares/error.middleware");
class BarberService {
    // ── Listar todos los barberos activos ──
    async findAll() {
        const barbers = await database_1.prisma.user.findMany({
            where: {
                role: 'BARBER',
                isActive: true,
            },
            include: {
                barberProfile: {
                    include: {
                        schedules: true,
                        breaks: true,
                    },
                },
            },
        });
        // ← CORREGIDO: Filtrar solo los que tienen barberProfile
        return barbers
            .filter((user) => user.barberProfile !== null)
            .map((user) => ({
            id: user.barberProfile.id,
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            bio: user.barberProfile.bio,
            avatarUrl: user.barberProfile.avatarUrl,
            defaultSlotDuration: user.barberProfile.defaultSlotDuration,
            schedules: user.barberProfile.schedules,
            breaks: user.barberProfile.breaks,
        }));
    }
    // ── Obtener un barbero específico ──
    async findById(barberId) {
        const barberProfile = await database_1.prisma.barberProfile.findUnique({
            where: { id: barberId },
            include: {
                user: true,
                schedules: true,
                breaks: true,
                daysOff: {
                    where: {
                        date: { gte: new Date() }, // Solo futuros
                    },
                    orderBy: { date: 'asc' },
                },
            },
        });
        if (!barberProfile) {
            throw new error_middleware_1.AppError(404, 'Barbero no encontrado');
        }
        return {
            id: barberProfile.id,
            userId: barberProfile.userId,
            firstName: barberProfile.user.firstName,
            lastName: barberProfile.user.lastName,
            email: barberProfile.user.email,
            phone: barberProfile.user.phone,
            bio: barberProfile.bio,
            avatarUrl: barberProfile.avatarUrl,
            defaultSlotDuration: barberProfile.defaultSlotDuration,
            schedules: barberProfile.schedules,
            breaks: barberProfile.breaks,
            daysOff: barberProfile.daysOff,
        };
    }
    // ← NUEVO: Obtener MI perfil como barbero (por userId)
    async findMyProfile(userId) {
        const barberProfile = await database_1.prisma.barberProfile.findUnique({
            where: { userId },
            include: {
                user: true,
                schedules: true,
                breaks: true,
                daysOff: {
                    where: { date: { gte: new Date() } },
                    orderBy: { date: 'asc' },
                },
            },
        });
        if (!barberProfile) {
            throw new error_middleware_1.AppError(404, 'Perfil de barbero no encontrado');
        }
        return {
            id: barberProfile.id,
            userId: barberProfile.userId,
            firstName: barberProfile.user.firstName,
            lastName: barberProfile.user.lastName,
            email: barberProfile.user.email,
            phone: barberProfile.user.phone,
            bio: barberProfile.bio,
            avatarUrl: barberProfile.avatarUrl,
            defaultSlotDuration: barberProfile.defaultSlotDuration,
            schedules: barberProfile.schedules,
            breaks: barberProfile.breaks,
            daysOff: barberProfile.daysOff,
        };
    }
    // ── Actualizar horario de trabajo ──
    async updateSchedule(barberId, data) {
        // Validar que no exista conflicto con breaks
        const conflictingBreak = await database_1.prisma.break.findFirst({
            where: {
                barberId,
                dayOfWeek: data.dayOfWeek,
                OR: [
                    {
                        startTime: { lte: data.startTime },
                        endTime: { gte: data.startTime },
                    },
                    {
                        startTime: { lte: data.endTime },
                        endTime: { gte: data.endTime },
                    },
                ],
            },
        });
        if (conflictingBreak) {
            throw new error_middleware_1.AppError(409, 'Existe un descanso que conflicta con este horario');
        }
        return database_1.prisma.workSchedule.upsert({
            where: {
                barberId_dayOfWeek: {
                    barberId,
                    dayOfWeek: data.dayOfWeek,
                },
            },
            update: {
                startTime: data.startTime,
                endTime: data.endTime,
                isActive: data.isActive,
            },
            create: {
                barberId,
                dayOfWeek: data.dayOfWeek,
                startTime: data.startTime,
                endTime: data.endTime,
                isActive: data.isActive,
            },
        });
    }
    // ── Agregar descanso ──
    async createBreak(barberId, data) {
        // Validar que no se solape con otro break
        const existingBreak = await database_1.prisma.break.findFirst({
            where: {
                barberId,
                dayOfWeek: data.dayOfWeek,
                OR: [
                    {
                        startTime: { lte: data.startTime },
                        endTime: { gt: data.startTime },
                    },
                    {
                        startTime: { lt: data.endTime },
                        endTime: { gte: data.endTime },
                    },
                    {
                        startTime: { gte: data.startTime },
                        endTime: { lte: data.endTime },
                    },
                ],
            },
        });
        if (existingBreak) {
            throw new error_middleware_1.AppError(409, 'Ya existe un descanso en ese horario');
        }
        // Validar que esté dentro del horario laboral
        const schedule = await database_1.prisma.workSchedule.findUnique({
            where: {
                barberId_dayOfWeek: {
                    barberId,
                    dayOfWeek: data.dayOfWeek,
                },
            },
        });
        if (schedule) {
            const [wsStartH, wsStartM] = schedule.startTime.split(':').map(Number);
            const [wsEndH, wsEndM] = schedule.endTime.split(':').map(Number);
            const [bStartH, bStartM] = data.startTime.split(':').map(Number);
            const [bEndH, bEndM] = data.endTime.split(':').map(Number);
            const wsStart = wsStartH * 60 + wsStartM;
            const wsEnd = wsEndH * 60 + wsEndM;
            const bStart = bStartH * 60 + bStartM;
            const bEnd = bEndH * 60 + bEndM;
            if (bStart < wsStart || bEnd > wsEnd) {
                throw new error_middleware_1.AppError(400, 'El descanso debe estar dentro del horario laboral');
            }
        }
        return database_1.prisma.break.create({
            data: {
                barberId,
                ...data,
            },
        });
    }
    // ── Eliminar descanso ──
    async deleteBreak(breakId, barberId) {
        const breakItem = await database_1.prisma.break.findFirst({
            where: { id: breakId, barberId },
        });
        if (!breakItem) {
            throw new error_middleware_1.AppError(404, 'Descanso no encontrado');
        }
        return database_1.prisma.break.delete({
            where: { id: breakId },
        });
    }
    // ── Agregar día libre ──
    async createDayOff(barberId, data) {
        const date = new Date(data.date + 'T00:00:00');
        // Validar que no sea fecha pasada
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
            throw new error_middleware_1.AppError(400, 'No puedes agregar días libres en el pasado');
        }
        // Validar que no exista ya
        const existing = await database_1.prisma.dayOff.findUnique({
            where: {
                barberId_date: { barberId, date },
            },
        });
        if (existing) {
            throw new error_middleware_1.AppError(409, 'Ya existe un día libre en esta fecha');
        }
        // Validar que no tenga citas agendadas
        const appointments = await database_1.prisma.appointment.findFirst({
            where: {
                barberId,
                startTime: {
                    gte: new Date(data.date + 'T00:00:00'),
                    lt: new Date(data.date + 'T23:59:59.999'),
                },
                status: { notIn: ['CANCELLED', 'NO_SHOW'] },
            },
        });
        if (appointments) {
            throw new error_middleware_1.AppError(409, 'No puedes agregar día libre: tienes citas agendadas');
        }
        return database_1.prisma.dayOff.create({
            data: {
                barberId,
                date,
                reason: data.reason,
            },
        });
    }
    // ── Eliminar día libre ──
    async deleteDayOff(dayOffId, barberId) {
        const dayOff = await database_1.prisma.dayOff.findFirst({
            where: { id: dayOffId, barberId },
        });
        if (!dayOff) {
            throw new error_middleware_1.AppError(404, 'Día libre no encontrado');
        }
        return database_1.prisma.dayOff.delete({
            where: { id: dayOffId },
        });
    }
}
exports.BarberService = BarberService;
exports.barberService = new BarberService();
