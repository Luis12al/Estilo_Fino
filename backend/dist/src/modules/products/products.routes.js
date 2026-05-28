"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/modules/products/products.routes.ts
const express_1 = require("express");
const products_controller_1 = require("./products.controller");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
const role_middleware_1 = require("../../../shared/middlewares/role.middleware");
const validate_middleware_1 = require("../../../shared/middlewares/validate.middleware");
const products_dto_1 = require("./products.dto");
const router = (0, express_1.Router)();
// ── PÚBLICO: Tienda ──
router.get("/", products_controller_1.productController.findAllPublic);
router.get("/:id", products_controller_1.productController.findById);
// ── ADMIN: CRUD de productos ──
router.use(auth_middleware_1.authenticate, (0, role_middleware_1.restrictTo)("BARBER", "SUPER_ADMIN"));
router.get("/admin/all", products_controller_1.productController.findAllAdmin);
router.get("/admin/:id", products_controller_1.productController.findByIdAdmin);
router.post("/admin", (0, validate_middleware_1.validateBody)(products_dto_1.createProductSchema), products_controller_1.productController.create);
router.put("/admin/:id", (0, validate_middleware_1.validateBody)(products_dto_1.updateProductSchema), products_controller_1.productController.update);
router.patch("/admin/:id/deactivate", products_controller_1.productController.softDelete);
router.patch("/admin/:id/reactivate", products_controller_1.productController.reactivate);
router.patch("/admin/:id/toggle", products_controller_1.productController.toggleActive);
router.patch("/admin/:id/stock", products_controller_1.productController.decrementStock);
exports.default = router;
