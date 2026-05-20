"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/modules/services/service.routes.ts
const express_1 = require("express");
const service_controller_1 = require("./service.controller");
const validate_middleware_1 = require("@shared/middlewares/validate.middleware");
const auth_middleware_1 = require("@shared/middlewares/auth.middleware");
const role_middleware_1 = require("@shared/middlewares/role.middleware");
const service_dto_1 = require("./service.dto");
const router = (0, express_1.Router)();
// Público
router.get('/', service_controller_1.serviceController.getAll);
router.get('/:id', service_controller_1.serviceController.getById);
// Admin - Listar todos (incluye inactivos)
router.get('/admin/all', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), service_controller_1.serviceController.getAllAdmin);
// Protegido - CRUD
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), (0, validate_middleware_1.validateBody)(service_dto_1.createServiceSchema), service_controller_1.serviceController.create);
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), (0, validate_middleware_1.validateBody)(service_dto_1.updateServiceSchema), service_controller_1.serviceController.update);
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), service_controller_1.serviceController.delete);
router.patch('/:id/reactivate', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), service_controller_1.serviceController.reactivate);
router.delete('/:id/permanent', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('SUPER_ADMIN'), service_controller_1.serviceController.hardDelete);
exports.default = router;
