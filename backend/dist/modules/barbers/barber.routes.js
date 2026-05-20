"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/modules/barbers/barber.routes.ts
const express_1 = require("express");
const barber_controller_1 = require("./barber.controller");
const validate_middleware_1 = require("@shared/middlewares/validate.middleware");
const auth_middleware_1 = require("@shared/middlewares/auth.middleware");
const role_middleware_1 = require("@shared/middlewares/role.middleware");
const barber_dto_1 = require("./barber.dto");
const router = (0, express_1.Router)();
// ── Público ──
router.get('/', barber_controller_1.barberController.getAll);
router.get('/:id', barber_controller_1.barberController.getById);
// ── Protegido: Barbero (gestión de MI agenda) ──
router.get('/me/profile', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER'), barber_controller_1.barberController.getMyProfile);
router.put('/me/schedule', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER'), (0, validate_middleware_1.validateBody)(barber_dto_1.updateScheduleSchema), barber_controller_1.barberController.updateSchedule);
router.post('/me/breaks', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER'), (0, validate_middleware_1.validateBody)(barber_dto_1.createBreakSchema), barber_controller_1.barberController.createBreak);
router.delete('/me/breaks/:breakId', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER'), barber_controller_1.barberController.deleteBreak);
router.post('/me/days-off', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER'), (0, validate_middleware_1.validateBody)(barber_dto_1.createDayOffSchema), barber_controller_1.barberController.createDayOff);
router.delete('/me/days-off/:dayOffId', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER'), barber_controller_1.barberController.deleteDayOff);
router.put('/me/profile', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER'), barber_controller_1.barberController.updateMyProfile);
router.get('/me/stats', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER'), barber_controller_1.barberController.getMyStats);
exports.default = router;
