import { Router } from 'express';
import { authController } from './auth.controller';
import { validateBody } from '@shared/middlewares/validate.middleware';
import { authenticate } from '@shared/middlewares/auth.middleware';
import { registerSchema, loginSchema, refreshSchema } from './auth.dto';

const router = Router();

// Públicos
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/refresh', validateBody(refreshSchema), authController.refresh);

// Protegidos
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;