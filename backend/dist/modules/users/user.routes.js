"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const role_middleware_1 = require("../../shared/middlewares/role.middleware");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authenticate);
// Solo barberos pueden acceder
router.get('/barbers-only', (0, role_middleware_1.restrictTo)('BARBER'), (_req, res) => {
    res.json({ message: 'Barber area' });
});
// Solo clientes pueden acceder
router.get('/clients-only', (0, role_middleware_1.restrictTo)('CLIENT'), (_req, res) => {
    res.json({ message: 'Client area' });
});
router.get('/me', auth_middleware_1.authenticate, user_controller_1.userController.getMe);
router.put('/me', auth_middleware_1.authenticate, user_controller_1.userController.updateMe);
exports.default = router;
