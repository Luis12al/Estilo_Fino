"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_utils_1 = require("@shared/utils/jwt.utils");
const error_middleware_1 = require("./error.middleware");
const authenticate = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new error_middleware_1.AppError(401, 'Access token required'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = (0, jwt_utils_1.verifyAccessToken)(token);
        req.user = decoded; // ← CORREGIDO: evita conflicto de tipos entre string y UserRole
        next();
    }
    catch {
        next(new error_middleware_1.AppError(401, 'Invalid or expired access token'));
    }
};
exports.authenticate = authenticate;
