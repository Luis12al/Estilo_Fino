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
      const rawAppointments = await prisma.$queryRawUnsafe<any[]>(`
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
      const appointmentsWithDetails = await Promise.all(
        rawAppointments.map(async (apt) => {
          const [client, services] = await Promise.all([
            apt.client_id ? prisma.user.findUnique({
              where: { id: apt.client_id },
              select: { id: true, firstName: true, lastName: true, phone: true },
            }) : null,
            prisma.appointmentService.findMany({
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
        })
      );

      res.status(200).json(successResponse(appointmentsWithDetails));
    } catch (error) {
      console.error('❌ Error en getAllMyAppointments:', error);
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