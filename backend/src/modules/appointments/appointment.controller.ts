// backend/src/modules/appointments/appointment.controller.ts
import { Request, Response, NextFunction } from 'express';
import { appointmentService } from './appointment.service';
import { barberService } from '../barbers/barber.service';
import { successResponse } from '@shared/utils/api-response.utils';
import { AppError } from '@shared/middlewares/error.middleware';
import { AppointmentStatus } from '@prisma/client';
import { prisma } from '@config/database';

import { updateStatusSchema, extendAppointmentSchema, availabilityQuerySchema, manualBookingSchema } from './appointment.dto';

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
   * POST /api/appointments
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // ← CORREGIDO: tu req.user tiene 'userId', no 'id'
      const clientId = req.user?.userId;
      if (!clientId) {
        throw new AppError(401, 'Authentication required');
      }

      const appointment = await appointmentService.create(req.body, clientId);
      res.status(201).json(successResponse(appointment, 'Cita creada exitosamente'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/appointments/my
   */
  async getMyAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // ← CORREGIDO: tu req.user tiene 'userId', no 'id'
      const clientId = req.user?.userId;
      if (!clientId) {
        throw new AppError(401, 'Authentication required');
      }

      const appointments = await appointmentService.getClientAppointments(clientId);
      res.status(200).json(successResponse(appointments));
    } catch (error) {
      next(error);
    }
  }

  async getMyBarberAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
          throw new AppError(401, 'Authentication required');
        }
      // Buscar barberProfile por userId
      const profile = await barberService.findMyProfile(userId);
      const { date } = req.query as { date?: string };
      
      const appointments = await appointmentService.getBarberAppointments(profile.id, date);
      res.status(200).json(successResponse(appointments));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/appointments/barber/:id
   */
  async getBarberAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // ← CORREGIDO: req.params.id puede ser string | string[], forzamos a string
      const barberId = String(req.params.id);
      const { date } = req.query as { date?: string };
      
      const appointments = await appointmentService.getBarberAppointments(barberId, date);
      res.status(200).json(successResponse(appointments));
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🔍 BODY RECIBIDO:', req.body);
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const id = String(req.params.id);  // ← FIX: forzar a string
      const validated = updateStatusSchema.parse(req.body);
      console.log('✅ VALIDADO:', validated);
      const updated = await appointmentService.updateStatus(
        id,
        profile.id,
        validated.status as AppointmentStatus,
        validated.reason
      );

      res.status(200).json(successResponse(updated, `Cita actualizada a ${validated.status}`));
    } catch (error) {
      console.log('❌ ERROR EN UPDATE STATUS:', error);
      next(error);
    }
  }

  /**
   * POST /api/appointments/:id/extend
   * Extender cita +20min
   */
  async extend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const id = String(req.params.id);  // ← FIX: forzar a string
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
   * GET /api/appointments/barber/stats
   * Estadísticas del día
   */
  // En getTodayStats, asegurar que devuelva stats correctas:

async getTodayStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const stats = await appointmentService.getTodayStats(profile.id);
      
      // ← FIX: Asegurar que stats nunca sea null
      const safeStats = stats || {
        total: 0,
        pending: 0,
        confirmed: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
      };
      
      res.status(200).json(successResponse(safeStats));
    } catch (error) {
      next(error);
    }
  }


   /**
   * GET /api/appointments/barber/all
   * Todas las citas del barbero (sin filtro de fecha)
   */
    async getAllMyAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      console.log('🔍 [getAllMyAppointments] userId:', userId, '| barberId:', profile.id);

      const { status, from, to, search } = req.query;

      // ← FIX: Construir WHERE paso a paso, evitando objetos vacíos
      const where: any = {
        barberId: profile.id,
      };

      // Filtro por estado (solo si se proporciona y no está vacío)
      const statusStr = status ? String(status).trim() : '';
      if (statusStr) {
        where.status = statusStr;
      }

      // Filtro por fecha DESDE
      const fromStr = from ? String(from).trim() : '';
      if (fromStr) {
        const fromDate = new Date(fromStr + 'T00:00:00');
        where.startTime = { ...where.startTime, gte: fromDate };
      }

      // Filtro por fecha HASTA
      const toStr = to ? String(to).trim() : '';
      if (toStr) {
        const toDate = new Date(toStr + 'T23:59:59.999');
        where.startTime = { ...where.startTime, lte: toDate };
      }

      // Filtro por búsqueda de texto
      const searchStr = search ? String(search).trim() : '';
      if (searchStr) {
        where.OR = [
          { client: { firstName: { contains: searchStr, mode: 'insensitive' } } },
          { client: { lastName: { contains: searchStr, mode: 'insensitive' } } },
          { guestName: { contains: searchStr, mode: 'insensitive' } },
          { guestPhone: { contains: searchStr, mode: 'insensitive' } },
        ];
      }

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
   * POST /api/appointments/barber/create-for-client
   * Barbero agenda cita para un cliente
   */
  async createForClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      
      // Body: { clientId, startTime, serviceIds[], notes? }
      const { clientId, startTime, serviceIds, notes } = req.body;

      // Validar que el cliente existe
      const client = await prisma.user.findFirst({
        where: { id: clientId, role: 'CLIENT' },
      });
      if (!client) throw new AppError(404, 'Cliente no encontrado');

      // Usar el mismo método create del service pero con el clientId proporcionado
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
   * POST /api/appointments/barber/quick-book
   * Barbero agenda cita para cliente no registrado (walk-in)
   */

  async createManual(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      
      // Validar body con Zod
      const validated = manualBookingSchema.parse(req.body);

      const appointment = await appointmentService.createManual(validated, profile.id);

      res.status(201).json(successResponse(appointment, 'Cita agendada exitosamente'));
    } catch (error) {
      next(error);
    }
  }

}

export const appointmentController = new AppointmentController();