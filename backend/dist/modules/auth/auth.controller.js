"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const api_response_utils_1 = require("../../shared/utils/api-response.utils");
const error_middleware_1 = require("../../shared/middlewares/error.middleware");
class AuthController {
    async register(req, res, next) {
        try {
            const result = await auth_service_1.authService.register(req.body);
            res.status(201).json((0, api_response_utils_1.successResponse)(result, 'User registered successfully'));
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const result = await auth_service_1.authService.login(req.body);
            res.status(200).json((0, api_response_utils_1.successResponse)(result, 'Login successful'));
        }
        catch (error) {
            next(error);
        }
    }
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await auth_service_1.authService.refresh(refreshToken);
            res.status(200).json((0, api_response_utils_1.successResponse)(result));
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const userId = req.user?.userId;
            if (!userId) {
                throw new error_middleware_1.AppError(401, 'Authentication required');
            }
            await auth_service_1.authService.logout(refreshToken, userId);
            res.status(200).json((0, api_response_utils_1.successResponse)(null, 'Logged out successfully'));
        }
        catch (error) {
            next(error);
        }
    }
    async getMe(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new error_middleware_1.AppError(401, 'Authentication required');
            }
            const user = await auth_service_1.authService.getMe(userId);
            res.status(200).json((0, api_response_utils_1.successResponse)(user));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
