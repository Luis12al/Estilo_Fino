"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_middleware_1 = require("../../../shared/middlewares/validate.middleware");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
const auth_dto_1 = require("./auth.dto");
const router = (0, express_1.Router)();
// Públicos
router.post('/register', (0, validate_middleware_1.validateBody)(auth_dto_1.registerSchema), auth_controller_1.authController.register);
router.post('/login', (0, validate_middleware_1.validateBody)(auth_dto_1.loginSchema), auth_controller_1.authController.login);
router.post('/refresh', (0, validate_middleware_1.validateBody)(auth_dto_1.refreshSchema), auth_controller_1.authController.refresh);
// Protegidos
router.post('/logout', auth_middleware_1.authenticate, auth_controller_1.authController.logout);
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.authController.getMe);
exports.default = router;
