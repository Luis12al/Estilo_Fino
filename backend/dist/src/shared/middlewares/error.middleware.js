"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const api_response_utils_1 = require("@shared/utils/api-response.utils");
const zod_1 = require("zod");
class AppError extends Error {
    statusCode;
    message;
    isOperational;
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
const errorHandler = (err, _req, res, _next) => {
    // Errores operacionales (controlados)
    if (err instanceof AppError) {
        res.status(err.statusCode).json((0, api_response_utils_1.errorResponse)(err.message));
        return;
    }
    // Errores de validación Zod
    if (err instanceof zod_1.ZodError) {
        const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        res.status(400).json((0, api_response_utils_1.errorResponse)('Validation error', messages));
        return;
    }
    // Errores de Prisma (ej: unique constraint)
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err;
        if (prismaError.code === 'P2002') {
            res.status(409).json((0, api_response_utils_1.errorResponse)('Resource already exists'));
            return;
        }
        if (prismaError.code === 'P2025') {
            res.status(404).json((0, api_response_utils_1.errorResponse)('Resource not found'));
            return;
        }
    }
    // Error no controlado → log y respuesta genérica
    console.error('UNEXPECTED ERROR:', err);
    res.status(500).json((0, api_response_utils_1.errorResponse)('Internal server error'));
};
exports.errorHandler = errorHandler;
