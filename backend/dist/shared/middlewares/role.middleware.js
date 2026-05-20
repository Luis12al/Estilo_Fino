"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = void 0;
const error_middleware_1 = require("./error.middleware");
// Definir el enum localmente para evitar dependencia de Prisma Client
const UserRoleValues = ['CLIENT', 'BARBER', 'SUPER_ADMIN'];
const restrictTo = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new error_middleware_1.AppError(401, 'Authentication required'));
        }
        const userRole = req.user.role;
        const allowedRoles = roles.map((r) => r.toString());
        if (!allowedRoles.includes(userRole)) {
            return next(new error_middleware_1.AppError(403, 'Insufficient permissions'));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
