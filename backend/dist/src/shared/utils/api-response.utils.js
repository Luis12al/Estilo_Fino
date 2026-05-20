"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (data, message) => ({
    success: true,
    data,
    message,
});
exports.successResponse = successResponse;
const errorResponse = (error, message) => ({
    success: false,
    error,
    message,
});
exports.errorResponse = errorResponse;
//# sourceMappingURL=api-response.utils.js.map