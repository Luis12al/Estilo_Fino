// backend/src/modules/products/products.routes.ts
import { Router } from "express";
import { productController } from "./products.controller";
import { authenticate } from "@shared/middlewares/auth.middleware";
import { restrictTo } from "@shared/middlewares/role.middleware";
import { validateBody } from "@shared/middlewares/validate.middleware";
import { createProductSchema, updateProductSchema } from "./products.dto";

const router = Router();

// ── PÚBLICO: Tienda ──
router.get("/", productController.findAllPublic);
router.get("/:id", productController.findById);

// ── ADMIN: CRUD de productos ──
router.use(authenticate, restrictTo("BARBER", "SUPER_ADMIN"));

router.get("/admin/all", productController.findAllAdmin);
router.get("/admin/:id", productController.findByIdAdmin);

router.post(
  "/admin",
  validateBody(createProductSchema),
  productController.create
);

router.put(
  "/admin/:id",
  validateBody(updateProductSchema),
  productController.update
);

router.patch("/admin/:id/deactivate", productController.softDelete);
router.patch("/admin/:id/reactivate", productController.reactivate);
router.patch("/admin/:id/toggle", productController.toggleActive);
router.patch("/admin/:id/stock", productController.decrementStock);

export default router;