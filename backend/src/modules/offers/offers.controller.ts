// backend/src/modules/offers/offer.controller.ts
import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@shared/utils/api-response.utils';

export class OfferController {
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Por ahora devolver array vacío hasta implementar el módulo completo
      res.status(200).json(successResponse([]));
    } catch (error) {
      next(error);
    }
  }
}

export const offerController = new OfferController();