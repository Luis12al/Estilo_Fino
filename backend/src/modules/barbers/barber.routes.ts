// backend/src/modules/barbers/barber.routes.ts
import { Router } from 'express';
import { barberController } from './barber.controller';
import { validateBody } from '@shared/middlewares/validate.middleware';
import { authenticate } from '@shared/middlewares/auth.middleware';
import { restrictTo } from '@shared/middlewares/role.middleware';
import { updateScheduleSchema, createBreakSchema, createDayOffSchema } from './barber.dto';

const router = Router();

// ── Público ──
router.get('/', barberController.getAll);
router.get('/:id', barberController.getById);

// ── Protegido: Barbero (gestión de MI agenda) ──
router.get(
  '/me/profile',
  authenticate,
  restrictTo('BARBER'),
  barberController.getMyProfile
);

router.put(
  '/me/schedule',
  authenticate,
  restrictTo('BARBER'),
  validateBody(updateScheduleSchema),
  barberController.updateSchedule
);

router.post(
  '/me/breaks',
  authenticate,
  restrictTo('BARBER'),
  validateBody(createBreakSchema),
  barberController.createBreak
);

router.delete(
  '/me/breaks/:breakId',
  authenticate,
  restrictTo('BARBER'),
  barberController.deleteBreak
);

router.post(
  '/me/days-off',
  authenticate,
  restrictTo('BARBER'),
  validateBody(createDayOffSchema),
  barberController.createDayOff
);

router.delete(
  '/me/days-off/:dayOffId',
  authenticate,
  restrictTo('BARBER'),
  barberController.deleteDayOff
);

router.put(
  '/me/profile',
  authenticate,
  restrictTo('BARBER'),
  barberController.updateMyProfile
);

router.get('/me/stats', authenticate, restrictTo('BARBER'), barberController.getMyStats);

export default router;