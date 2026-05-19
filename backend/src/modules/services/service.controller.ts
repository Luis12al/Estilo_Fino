// backend/src/modules/services/service.controller.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '@config/database';
import { serviceService } from './service.service';
import { successResponse } from '@shared/utils/api-response.utils';
import { AppError } from '@shared/middlewares/error.middleware';
import { createServiceSchema, updateServiceSchema } from './service.dto';

export class ServiceController {
  
  // GET /api/services - Público (solo activos)
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const services = await serviceService.findAll();
      res.status(200).json(successResponse(services));
    } catch (error) {
      next(error);
    }
  }

  // GET /api/services/admin - Admin (todos)
  async getAllAdmin(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const services = await serviceService.findAllAdmin();
      res.status(200).json(successResponse(services));
    } catch (error) {
      next(error);
    }
  }

  // GET /api/services/:id
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const service = await serviceService.findById(id);
      res.status(200).json(successResponse(service));
    } catch (error) {
      next(error);
    }
  }

  // POST /api/services
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      // Buscar barberProfile del usuario logueado
      const barberProfile = await prisma.barberProfile.findUnique({
        where: { userId },
      });

      // Si no tiene perfil de barbero, crear servicio global (barberId = null)
      const barberId = barberProfile?.id;

      const validated = createServiceSchema.parse(req.body);
      const service = await serviceService.create(validated, barberId);
      
      res.status(201).json(successResponse(service, 'Servicio creado exitosamente'));
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/services/:id (cambio de PATCH a PUT)
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const barberProfile = await prisma.barberProfile.findUnique({
        where: { userId },
      });

      const id = String(req.params.id);
      const validated = updateServiceSchema.parse(req.body);
      
      const service = await serviceService.update(id, validated, barberProfile?.id);
      res.status(200).json(successResponse(service, 'Servicio actualizado exitosamente'));
    } catch (error) {
      next(error);
    }
  }

  async hardDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const barberProfile = await prisma.barberProfile.findUnique({
        where: { userId },
      });

      const id = String(req.params.id);
      await serviceService.hardDelete(id, barberProfile?.id);
      
      res.status(200).json(successResponse(null, 'Servicio eliminado permanentemente'));
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/services/:id (soft delete)
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const barberProfile = await prisma.barberProfile.findUnique({
        where: { userId },
      });

      const id = String(req.params.id);
      await serviceService.delete(id, barberProfile?.id);
      
      res.status(200).json(successResponse(null, 'Servicio desactivado'));
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/services/:id/reactivate
  async reactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const barberProfile = await prisma.barberProfile.findUnique({
        where: { userId },
      });

      const id = String(req.params.id);
      const service = await serviceService.reactivate(id, barberProfile?.id);
      
      res.status(200).json(successResponse(service, 'Servicio reactivado'));
    } catch (error) {
      next(error);
    }
  }
}

export const serviceController = new ServiceController();