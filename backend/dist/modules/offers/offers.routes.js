"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const offers_controller_1 = require("./offers.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const role_middleware_1 = require("../../shared/middlewares/role.middleware");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const offers_dto_1 = require("./offers.dto");
const router = (0, express_1.Router)();
// ── PÚBLICO: Ofertas activas (sin autenticación) ──
router.get('/', offers_controller_1.offerController.getAllPublic);
// ── ADMIN: CRUD de ofertas ──
router.get('/admin', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), offers_controller_1.offerController.getMyOffers);
router.get('/admin/:id', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), offers_controller_1.offerController.getById);
router.post('/admin', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), (0, validate_middleware_1.validateBody)(offers_dto_1.createOfferSchema), offers_controller_1.offerController.create);
router.put('/admin/:id', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), (0, validate_middleware_1.validateBody)(offers_dto_1.updateOfferSchema), offers_controller_1.offerController.update);
router.patch('/admin/:id/deactivate', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), offers_controller_1.offerController.deactivate);
router.patch('/admin/:id/reactivate', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('BARBER', 'SUPER_ADMIN'), offers_controller_1.offerController.reactivate);
// Solo Super Admin puede eliminar permanentemente
router.delete('/admin/:id', auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)('SUPER_ADMIN'), offers_controller_1.offerController.delete);
exports.default = router;
