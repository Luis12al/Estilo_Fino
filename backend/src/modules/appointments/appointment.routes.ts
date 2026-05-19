// backend/src/modules/appointments/appointment.routes.ts
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

// ← NUEVO: Protegido - Barbero (ver MIS citas)
router.get(
  '/barber/me',
  authenticate,
  restrictTo('BARBER'),
  appointmentController.getMyBarberAppointments
);

// Protegido - Barbero/Admin (ver citas de un barbero específico)
router.get(
  '/barber/:id',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  appointmentController.getBarberAppointments
);

// GET /api/appointments/barber/stats - Estadísticas del día
router.get(
  '/barber/stats',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  appointmentController.getTodayStats
);

// PATCH /api/appointments/:id/status - Iniciar, Finalizar, Cancelar
router.patch(
  '/:id/status',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  validateBody(updateStatusSchema),
  appointmentController.updateStatus
);

// POST /api/appointments/:id/extend - Extender +20min
router.post(
  '/:id/extend',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  validateBody(extendAppointmentSchema),
  appointmentController.extend
);

// GET /api/appointments/barber/all - Todas las citas del barbero
router.get(
  '/barber/all',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  appointmentController.getAllMyAppointments
);

// POST /api/appointments/barber/create-for-client - Agendar para cliente
router.post(
  '/barber/create-for-client',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  validateBody(createAppointmentSchema), // Reutilizamos el mismo schema
  appointmentController.createForClient
);

// ============================================
// NUEVO: Barbero agenda cita manual (walk-in)
// ============================================
router.post(
  '/barber/manual',
  authenticate,
  restrictTo('BARBER', 'SUPER_ADMIN'),
  validateBody(manualBookingSchema),
  appointmentController.createManual
);

export default router;