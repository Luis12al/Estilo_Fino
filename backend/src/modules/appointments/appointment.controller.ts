// backend/src/modules/appointments/appointment.controller.ts
import { Request, Response, NextFunction } from 'express';
import { appointmentService } from './appointment.service';
import { barberService } from '../barbers/barber.service';
import { successResponse } from '@shared/utils/api-response.utils';
import { AppError } from '@shared/middlewares/error.middleware';
import { AppointmentStatus } from '@prisma/client';
import { prisma } from '@config/database';

import { 
  updateStatusSchema, 
  extendAppointmentSchema, 
  availabilityQuerySchema, 
  manualBookingSchema 
} from './appointment.dto';

export class AppointmentController {
  
  /**
   * GET /api/appointments/availability?barberId=X&date=Y&durationMinutes=Z
   */
  async getAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = availabilityQuerySchema.parse(req.query);
      const availability = await appointmentService.getAvailability(validatedQuery);
      res.status(200).json(successResponse(availability));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/appointments — Cliente crea cita
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientId = req.user?.userId;
      if (!clientId) throw new AppError(401, 'Authentication required');

      const appointment = await appointmentService.create(req.body, clientId);
      res.status(201).json(successResponse(appointment, 'Cita creada exitosamente'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/appointments/my — Citas del cliente logueado
   */
  async getMyAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientId = req.user?.userId;
      if (!clientId) throw new AppError(401, 'Authentication required');

      const appointments = await appointmentService.getClientAppointments(clientId);
      res.status(200).json(successResponse(appointments));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/appointments/barber/me — Citas del barbero logueado (por fecha)
   */
  async getMyBarberAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const { date } = req.query as { date?: string };
      
      const appointments = await appointmentService.getBarberAppointments(profile.id, date);
      res.status(200).json(successResponse(appointments));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/appointments/barber/:id — Citas de un barbero específico
   */
  async getBarberAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const barberId = String(req.params.id);
      const { date } = req.query as { date?: string };
      
      const appointments = await appointmentService.getBarberAppointments(barberId, date);
      res.status(200).json(successResponse(appointments));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/appointments/barber/all — TODAS las citas del barbero logueado (con filtros)
   * ← MÉTODO RECONSTRUIDO DESDE CERO
   */
  async getAllMyAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const barberId = profile.id;

      // Extraer filtros de query params
      const { status, from, to, search } = req.query;

      // Construir WHERE dinámico
      const where: any = { barberId };

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

      const appointments = await prisma.appointment.findMany({
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

      res.status(200).json(successResponse(appointments));
    } catch (error) {
      console.error('❌ [getAllMyAppointments] Error:', error);
      next(error);
    }
  }

  /**
   * GET /api/appointments/barber/stats — Estadísticas del día
   */
  async getTodayStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const stats = await appointmentService.getTodayStats(profile.id);
      
      const safeStats = stats || {
        total: 0, pending: 0, confirmed: 0, inProgress: 0, completed: 0, cancelled: 0,
      };
      
      res.status(200).json(successResponse(safeStats));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/appointments/:id/status — Cambiar estado
   */
  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const id = String(req.params.id);
      const validated = updateStatusSchema.parse(req.body);

      const updated = await appointmentService.updateStatus(
        id,
        profile.id,
        validated.status as AppointmentStatus,
        validated.reason
      );

      res.status(200).json(successResponse(updated, `Cita actualizada a ${validated.status}`));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/appointments/:id/extend — Extender cita
   */
  async extend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const id = String(req.params.id);
      const validated = extendAppointmentSchema.parse(req.body);

      const extended = await appointmentService.extend(
        id,
        profile.id,
        validated.additionalMinutes
      );

      res.status(200).json(successResponse(extended, `Cita extendida +${validated.additionalMinutes}min`));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/appointments/barber/create-for-client — Agendar para cliente registrado
   */
  async createForClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const { clientId, startTime, serviceIds, notes } = req.body;

      const client = await prisma.user.findFirst({
        where: { id: clientId, role: 'CLIENT' },
      });
      if (!client) throw new AppError(404, 'Cliente no encontrado');

      const appointment = await appointmentService.create(
        { barberId: profile.id, startTime, serviceIds, notes },
        clientId
      );

      res.status(201).json(successResponse(appointment, 'Cita agendada para el cliente'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/appointments/barber/manual — Agendar walk-in (cliente no registrado)
   */
  async createManual(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const validated = manualBookingSchema.parse(req.body);

      const appointment = await appointmentService.createManual(validated, profile.id);

      res.status(201).json(successResponse(appointment, 'Cita agendada exitosamente'));
    } catch (error) {
      next(error);
    }
  }
}

export const appointmentController = new AppointmentController();