import { Router } from 'express';
import { offerController } from './offers.controller';
import { authenticate } from '@shared/middlewares/auth.middleware';
import { restrictTo } from '@shared/middlewares/role.middleware';
import { validateBody } from '@shared/middlewares/validate.middleware';
import { createOfferSchema, updateOfferSchema } from './offers.dto';

const router = Router();

// ── PÚBLICO: Ofertas activas (sin autenticación) ──
router.get('/', offerController.getAllPublic);

// ── ADMIN: CRUD de ofertas ──
router.get(
  '/admin',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  offerController.getMyOffers
);

router.get(
  '/admin/:id',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  offerController.getById
);

router.post(
  '/admin',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  validateBody(createOfferSchema),
  offerController.create
);

router.put(
  '/admin/:id',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  validateBody(updateOfferSchema),
  offerController.update
);

router.patch(
  '/admin/:id/deactivate',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  offerController.deactivate
);

router.patch(
  '/admin/:id/reactivate',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  offerController.reactivate
);

// Solo Super Admin puede eliminar permanentemente
router.delete(
  '/admin/:id',
  authenticate,
  restrictTo('SUPER_ADMIN'),
  offerController.delete
);

export default router;