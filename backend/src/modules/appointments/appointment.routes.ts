import { Router } from 'express';
import { appointmentController } from './appointment.controller';
import { validateBody } from '@shared/middlewares/validate.middleware';
import { authenticate } from '@shared/middlewares/auth.middleware';
import { restrictTo } from '@shared/middlewares/role.middleware';
import { updateStatusSchema, extendAppointmentSchema, createAppointmentSchema, manualBookingSchema } from './appointment.dto';

const router = Router();

// Público - Ver disponibilidad
router.get('/availability', appointmentController.getAvailability);

// Protegido - Cliente
router.post('/', authenticate, restrictTo('CLIENT'), validateBody(createAppointmentSchema), appointmentController.create);
router.get('/my', authenticate, restrictTo('CLIENT'), appointmentController.getMyAppointments);

// ============================================
// ← FIX CRÍTICO: Rutas ESTÁTICAS primero, luego DINÁMICAS
// ============================================

// GET /api/appointments/barber/me — Citas del día del barbero logueado
router.get(
  '/barber/me',
  authenticate,
  restrictTo('BARBER'),
  appointmentController.getMyBarberAppointments
);

// GET /api/appointments/barber/stats — Estadísticas del día
router.get(
  '/barber/stats',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  appointmentController.getTodayStats
);

// GET /api/appointments/barber/all — TODAS las citas del barbero (CON FILTROS)
router.get(
  '/barber/all',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  appointmentController.getAllMyAppointments
);

// POST /api/appointments/barber/manual — Agendar walk-in
router.post(
  '/barber/manual',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  validateBody(manualBookingSchema),
  appointmentController.createManual
);

// POST /api/appointments/barber/create-for-client — Agendar para cliente registrado
router.post(
  '/barber/create-for-client',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  validateBody(createAppointmentSchema),
  appointmentController.createForClient
);

// ============================================
// ← RUTAS DINÁMICAS AL FINAL (siempre después de las estáticas)
// ============================================

// GET /api/appointments/barber/:id — Citas de un barbero específico
router.get(
  '/barber/:id',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  appointmentController.getBarberAppointments
);

// PATCH /api/appointments/:id/status — Cambiar estado
router.patch(
  '/:id/status',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  validateBody(updateStatusSchema),
  appointmentController.updateStatus
);

// POST /api/appointments/:id/extend — Extender cita
router.post(
  '/:id/extend',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  validateBody(extendAppointmentSchema),
  appointmentController.extend
);

export default router;