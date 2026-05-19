import { Router } from 'express';
import { authenticate } from '@shared/middlewares/auth.middleware';
import { restrictTo } from '@shared/middlewares/role.middleware';
import { userController } from './user.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Solo barberos pueden acceder
router.get('/barbers-only', restrictTo('BARBER'), (_req, res) => {
  res.json({ message: 'Barber area' });
});

// Solo clientes pueden acceder
router.get('/clients-only', restrictTo('CLIENT'), (_req, res) => {
  res.json({ message: 'Client area' });
});

router.get('/me', authenticate, userController.getMe);
router.put('/me', authenticate, userController.updateMe);

export default router;