// backend/src/modules/barbers/barber.controller.ts
import { Request, Response, NextFunction } from 'express';
import { barberService } from './barber.service';
import { successResponse } from '@shared/utils/api-response.utils';
import { AppError } from '@shared/middlewares/error.middleware';
import { prisma } from '@config/database';

export class BarberController {
  
  // ── Público ──
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const barbers = await barberService.findAll();
      res.status(200).json(successResponse(barbers));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const barber = await barberService.findById(id);
      res.status(200).json(successResponse(barber));
    } catch (error) {
      next(error);
    }
  }

  // ← NUEVO: Obtener MI perfil (para el panel admin)
  async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const profile = await barberService.findMyProfile(userId);
      res.status(200).json(successResponse(profile));
    } catch (error) {
      next(error);
    }
  }

  // ── Protegido: Gestión de agenda ──
  async updateSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      // ← CORREGIDO: Buscar barberProfile por userId, no usar param de URL
      const profile = await barberService.findMyProfile(userId);
      const schedule = await barberService.updateSchedule(profile.id, req.body);
      
      res.status(200).json(successResponse(schedule, 'Horario actualizado'));
    } catch (error) {
      next(error);
    }
  }

  async createBreak(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const breakItem = await barberService.createBreak(profile.id, req.body);
      
      res.status(201).json(successResponse(breakItem, 'Descanso creado'));
    } catch (error) {
      next(error);
    }
  }

  async deleteBreak(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const breakId = String(req.params.breakId);
      const profile = await barberService.findMyProfile(userId);
      
      await barberService.deleteBreak(breakId, profile.id);
      res.status(200).json(successResponse(null, 'Descanso eliminado'));
    } catch (error) {
      next(error);
    }
  }

  async createDayOff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const dayOff = await barberService.createDayOff(profile.id, req.body);
      
      res.status(201).json(successResponse(dayOff, 'Día libre creado'));
    } catch (error) {
      next(error);
    }
  }

  async deleteDayOff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const dayOffId = String(req.params.dayOffId);
      const profile = await barberService.findMyProfile(userId);
      
      await barberService.deleteDayOff(dayOffId, profile.id);
      res.status(200).json(successResponse(null, 'Día libre eliminado'));
    } catch (error) {
      next(error);
    }
  }

async updateMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const { bio, avatarUrl, defaultSlotDuration } = req.body;

      const updated = await prisma.barberProfile.update({
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

      res.status(200).json(successResponse({
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
    } catch (error) {
      next(error);
    }
  }


async getMyStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError(401, 'Authentication required');

    const profile = await barberService.findMyProfile(userId);
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [totalAppointments, completedThisMonth, totalRevenue, user] = await Promise.all([
      prisma.appointment.count({ where: { barberId: profile.id } }),
      prisma.appointment.count({ 
        where: { 
          barberId: profile.id, 
          status: 'COMPLETED',
          startTime: { gte: startOfMonth }
        } 
      }),
      prisma.appointment.aggregate({
        where: { barberId: profile.id, status: 'COMPLETED' },
        _sum: { totalPrice: true }
      }),
      prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } })
    ]);

    res.status(200).json(successResponse({
      totalAppointments,
      completedThisMonth,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      rating: 4.8,
      memberSince: user?.createdAt || new Date(),
    }));
  } catch (error) {
    next(error);
  }
}

}

export const barberController = new BarberController();