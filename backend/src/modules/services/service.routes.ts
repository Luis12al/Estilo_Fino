// backend/src/modules/services/service.routes.ts
import { Router } from 'express';
import { serviceController } from './service.controller';
import { validateBody } from '@shared/middlewares/validate.middleware';
import { authenticate } from '@shared/middlewares/auth.middleware';
import { restrictTo } from '@shared/middlewares/role.middleware';
import { createServiceSchema, updateServiceSchema } from './service.dto';

const router = Router();

// Público
router.get('/', serviceController.getAll);
router.get('/:id', serviceController.getById);

// Admin - Listar todos (incluye inactivos)
router.get('/admin/all', authenticate, restrictTo('BARBER', 'SUPER_ADMIN'), serviceController.getAllAdmin);

// Protegido - CRUD
router.post('/', authenticate, restrictTo('BARBER', 'SUPER_ADMIN'), validateBody(createServiceSchema), serviceController.create);
router.put('/:id', authenticate, restrictTo('BARBER', 'SUPER_ADMIN'), validateBody(updateServiceSchema), serviceController.update);
router.delete('/:id', authenticate, restrictTo('BARBER', 'SUPER_ADMIN'), serviceController.delete);
router.patch('/:id/reactivate', authenticate, restrictTo('BARBER', 'SUPER_ADMIN'), serviceController.reactivate);
router.delete('/:id/permanent', authenticate, restrictTo('SUPER_ADMIN'), serviceController.hardDelete);
export default router;