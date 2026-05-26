"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const database_1 = require("../../../config/database");
const error_middleware_1 = require("../../../shared/middlewares/error.middleware");
const api_response_utils_1 = require("../../../shared/utils/api-response.utils");
const password_utils_1 = require("../../../shared/utils/password.utils");
class UserController {
    async getMe(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const user = await database_1.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            if (!user)
                throw new error_middleware_1.AppError(404, 'Usuario no encontrado');
            res.status(200).json((0, api_response_utils_1.successResponse)(user));
        }
        catch (error) {
            next(error);
        }
    }
    async updateMe(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, 'Authentication required');
            const { firstName, lastName, phone, currentPassword, newPassword } = req.body;
            const user = await database_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user)
                throw new error_middleware_1.AppError(404, 'Usuario no encontrado');
            const updateData = {};
            if (firstName !== undefined)
                updateData.firstName = firstName.trim();
            if (lastName !== undefined)
                updateData.lastName = lastName.trim();
            if (phone !== undefined)
                updateData.phone = phone.trim() || null;
            // Cambio de contraseña
            if (newPassword) {
                if (!currentPassword) {
                    throw new error_middleware_1.AppError(400, 'Debes proporcionar tu contraseña actual');
                }
                const isValid = await (0, password_utils_1.comparePassword)(currentPassword, user.passwordHash);
                if (!isValid) {
                    throw new error_middleware_1.AppError(400, 'Contraseña actual incorrecta');
                }
                updateData.passwordHash = await (0, password_utils_1.hashPassword)(newPassword);
            }
            const updated = await database_1.prisma.user.update({
                where: { id: userId },
                data: updateData,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            res.status(200).json((0, api_response_utils_1.successResponse)(updated, 'Perfil actualizado exitosamente'));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
