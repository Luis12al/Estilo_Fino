"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/modules/appointments/appointment.routes.ts
const express_1 = require("express");
const appointment_controller_1 = require("./appointment.controller");
const validate_middleware_1 = require("@shared/middlewares/validate.middleware");
const auth_middleware_1 = require("@shared/middlewares/auth.middleware");
const role_middleware_1 = require("@shared/middlewares/role.middleware");
const appointment_dto_1 = require("./appointment.dto");
const router = (0, express_1.Router)();
// Público - Ver disponibilidad
router.get('/availability', appointment_controller_1.appointmentController.getAvailability);
// Protegido - Cliente
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('CLIENT'), (0, validate_middleware_1.validateBody)(appointment_dto_1.createAppointmentSchema), appointment_controller_1.appointmentController.create);
router.get('/my', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('CLIENT'), appointment_controller_1.appointmentController.getMyAppointments);
// ← NUEVO: Protegido - Barbero (ver MIS citas)
router.get('/barber/me', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER'), appointment_controller_1.appointmentController.getMyBarberAppointments);
// Protegido - Barbero/Admin (ver citas de un barbero específico)
router.get('/barber/:id', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), appointment_controller_1.appointmentController.getBarberAppointments);
// GET /api/appointments/barber/stats - Estadísticas del día
router.get('/barber/stats', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), appointment_controller_1.appointmentController.getTodayStats);
// PATCH /api/appointments/:id/status - Iniciar, Finalizar, Cancelar
router.patch('/:id/status', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), (0, validate_middleware_1.validateBody)(appointment_dto_1.updateStatusSchema), appointment_controller_1.appointmentController.updateStatus);
// POST /api/appointments/:id/extend - Extender +20min
router.post('/:id/extend', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), (0, validate_middleware_1.validateBody)(appointment_dto_1.extendAppointmentSchema), appointment_controller_1.appointmentController.extend);
// GET /api/appointments/barber/all - Todas las citas del barbero
router.get('/barber/all', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), appointment_controller_1.appointmentController.getAllMyAppointments);
// POST /api/appointments/barber/create-for-client - Agendar para cliente
router.post('/barber/create-for-client', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), (0, validate_middleware_1.validateBody)(appointment_dto_1.createAppointmentSchema), // Reutilizamos el mismo schema
appointment_controller_1.appointmentController.createForClient);
// ============================================
// NUEVO: Barbero agenda cita manual (walk-in)
// ============================================
router.post('/barber/manual', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), (0, validate_middleware_1.validateBody)(appointment_dto_1.manualBookingSchema), appointment_controller_1.appointmentController.createManual);
exports.default = router;
//# sourceMappingURL=appointment.routes.js.map