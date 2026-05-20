"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerController = exports.OfferController = void 0;
const api_response_utils_1 = require("@shared/utils/api-response.utils");
class OfferController {
    async getAll(_req, res, next) {
        try {
            // Por ahora devolver array vacío hasta implementar el módulo completo
            res.status(200).json((0, api_response_utils_1.successResponse)([]));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.OfferController = OfferController;
exports.offerController = new OfferController();
//# sourceMappingURL=offers.controller.js.map