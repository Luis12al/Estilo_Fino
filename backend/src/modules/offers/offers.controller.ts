import { Request, Response, NextFunction } from 'express';
import { offerService } from './offers.service';
import { barberService } from '../barbers/barber.service';
import { successResponse } from '@shared/utils/api-response.utils';
import { AppError } from '@shared/middlewares/error.middleware';
import { createOfferSchema, updateOfferSchema, offerIdParamSchema } from './offers.dto';

export class OfferController {
  
  /**
   * GET /api/offers — Público: ofertas activas vigentes
   */
  async getAllPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const offers = await offerService.findAllPublic();
      res.status(200).json(successResponse(offers));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/offers/admin — Admin: todas las ofertas del barbero
   */
  async getMyOffers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const { includeInactive } = req.query;
      
      const offers = await offerService.findAllByBarber(
        profile.id,
        includeInactive === 'true'
      );
      
      res.status(200).json(successResponse(offers));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/offers/admin/:id — Admin: una oferta específica
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const { id } = offerIdParamSchema.parse(req.params);
      
      const offer = await offerService.findById(id, profile.id);
      res.status(200).json(successResponse(offer));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/offers/admin — Crear oferta
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const validated = createOfferSchema.parse(req.body);
      
      const offer = await offerService.create(validated, profile.id);
      res.status(201).json(successResponse(offer, 'Oferta creada exitosamente'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/offers/admin/:id — Actualizar oferta
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const { id } = offerIdParamSchema.parse(req.params);
      const validated = updateOfferSchema.parse(req.body);
      
      const offer = await offerService.update(id, profile.id, validated);
      res.status(200).json(successResponse(offer, 'Oferta actualizada exitosamente'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/offers/admin/:id/deactivate — Desactivar (soft delete)
   */
  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const { id } = offerIdParamSchema.parse(req.params);
      
      const offer = await offerService.deactivate(id, profile.id);
      res.status(200).json(successResponse(offer, 'Oferta desactivada'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/offers/admin/:id/reactivate — Reactivar
   */
  async reactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const profile = await barberService.findMyProfile(userId);
      const { id } = offerIdParamSchema.parse(req.params);
      
      const offer = await offerService.reactivate(id, profile.id);
      res.status(200).json(successResponse(offer, 'Oferta reactivada'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/offers/admin/:id — Eliminar permanentemente (Super Admin)
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = offerIdParamSchema.parse(req.params);
      
      await offerService.deletePermanent(id);
      res.status(200).json(successResponse(null, 'Oferta eliminada permanentemente'));
    } catch (error) {
      next(error);
    }
  }
}

export const offerController = new OfferController();