"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointment_controller_1 = require("./appointment.controller");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const role_middleware_1 = require("../../shared/middlewares/role.middleware");
const appointment_dto_1 = require("./appointment.dto");
const router = (0, express_1.Router)();
// Público - Ver disponibilidad
router.get('/availability', appointment_controller_1.appointmentController.getAvailability);
// Protegido - Cliente
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('CLIENT'), (0, validate_middleware_1.validateBody)(appointment_dto_1.createAppointmentSchema), appointment_controller_1.appointmentController.create);
router.get('/my', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('CLIENT'), appointment_controller_1.appointmentController.getMyAppointments);
// ============================================
// ← FIX CRÍTICO: Rutas ESTÁTICAS primero, luego DINÁMICAS
// ============================================
// GET /api/appointments/barber/me — Citas del día del barbero logueado
router.get('/barber/me', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER'), appointment_controller_1.appointmentController.getMyBarberAppointments);
// GET /api/appointments/barber/stats — Estadísticas del día
router.get('/barber/stats', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), appointment_controller_1.appointmentController.getTodayStats);
// GET /api/appointments/barber/all — TODAS las citas del barbero (CON FILTROS)
router.get('/barber/all', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), appointment_controller_1.appointmentController.getAllMyAppointments);
// POST /api/appointments/barber/manual — Agendar walk-in
router.post('/barber/manual', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), (0, validate_middleware_1.validateBody)(appointment_dto_1.manualBookingSchema), appointment_controller_1.appointmentController.createManual);
// POST /api/appointments/barber/create-for-client — Agendar para cliente registrado
router.post('/barber/create-for-client', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), (0, validate_middleware_1.validateBody)(appointment_dto_1.createAppointmentSchema), appointment_controller_1.appointmentController.createForClient);
// ============================================
// ← RUTAS DINÁMICAS AL FINAL (siempre después de las estáticas)
// ============================================
// GET /api/appointments/barber/:id — Citas de un barbero específico
router.get('/barber/:id', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), appointment_controller_1.appointmentController.getBarberAppointments);
// PATCH /api/appointments/:id/status — Cambiar estado
router.patch('/:id/status', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), (0, validate_middleware_1.validateBody)(appointment_dto_1.updateStatusSchema), appointment_controller_1.appointmentController.updateStatus);
// POST /api/appointments/:id/extend — Extender cita
router.post('/:id/extend', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), (0, validate_middleware_1.validateBody)(appointment_dto_1.extendAppointmentSchema), appointment_controller_1.appointmentController.extend);
exports.default = router;
