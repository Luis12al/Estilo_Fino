"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const zod_1 = require("zod");
const api_response_utils_1 = require("@shared/utils/api-response.utils");
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                res.status(400).json((0, api_response_utils_1.errorResponse)('Validation error', messages));
                return;
            }
            next(error);
        }
    };
};
exports.validateBody = validateBody;
//# sourceMappingURL=validate.middleware.js.map