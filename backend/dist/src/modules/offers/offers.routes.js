"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/modules/offers/offer.routes.ts
const express_1 = require("express");
const offers_controller_1 = require("./offers.controller");
const router = (0, express_1.Router)();
router.get('/', offers_controller_1.offerController.getAll);
exports.default = router;
//# sourceMappingURL=offers.routes.js.map