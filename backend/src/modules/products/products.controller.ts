// backend/src/modules/products/products.controller.ts
import { Request, Response, NextFunction } from "express";
import { productService } from "./products.service";
import { barberService } from "../barbers/barber.service";
import { successResponse } from "@shared/utils/api-response.utils";
import { AppError } from "@shared/middlewares/error.middleware";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  productIdParamSchema,
} from "./products.dto";

export class ProductController {
  // ── Crear ──
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, "Authentication required");

      const profile = await barberService.findMyProfile(userId);
      const validated = createProductSchema.parse(req.body);

      const product = await productService.create(validated, profile.id);
      res.status(201).json(successResponse(product, "Producto creado exitosamente"));
    } catch (error) {
      next(error);
    }
  }

  // ── Listar público ──
  async findAllPublic(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validated = productQuerySchema.parse(req.query);
      const result = await productService.findAllPublic(validated);

      res.status(200).json(successResponse(result.data, "Productos obtenidos exitosamente"));
    } catch (error) {
      next(error);
    }
  }

  // ── Listar admin ──
  async findAllAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, "Authentication required");

      const profile = await barberService.findMyProfile(userId);
      const validated = productQuerySchema.parse(req.query);

      const result = await productService.findAllAdmin(validated, profile.id);
      res.status(200).json(successResponse(result.data, "Productos obtenidos exitosamente"));
    } catch (error) {
      next(error);
    }
  }

  // ── Obtener por ID (público) ──
  async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = productIdParamSchema.parse(req.params);
      const product = await productService.findById(id);

      res.status(200).json(successResponse(product, "Producto obtenido exitosamente"));
    } catch (error) {
      next(error);
    }
  }

  // ── Obtener por ID (admin) ──
  async findByIdAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, "Authentication required");

      const profile = await barberService.findMyProfile(userId);
      const { id } = productIdParamSchema.parse(req.params);

      const product = await productService.findByIdAdmin(id, profile.id);
      res.status(200).json(successResponse(product, "Producto obtenido exitosamente"));
    } catch (error) {
      next(error);
    }
  }

  // ── Actualizar ──
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, "Authentication required");

      const profile = await barberService.findMyProfile(userId);
      const { id } = productIdParamSchema.parse(req.params);
      const validated = updateProductSchema.parse(req.body);

      const product = await productService.update(id, profile.id, validated);
      res.status(200).json(successResponse(product, "Producto actualizado exitosamente"));
    } catch (error) {
      next(error);
    }
  }

  // ── Soft delete ──
  async softDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, "Authentication required");

      const profile = await barberService.findMyProfile(userId);
      const { id } = productIdParamSchema.parse(req.params);

      const product = await productService.softDelete(id, profile.id);
      res.status(200).json(successResponse(product, "Producto eliminado exitosamente"));
    } catch (error) {
      next(error);
    }
  }

  // ── Reactivar ──
  async reactivate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, "Authentication required");

      const profile = await barberService.findMyProfile(userId);
      const { id } = productIdParamSchema.parse(req.params);

      const product = await productService.reactivate(id, profile.id);
      res.status(200).json(successResponse(product, "Producto reactivado exitosamente"));
    } catch (error) {
      next(error);
    }
  }

  // ── Toggle activo/inactivo ──
  async toggleActive(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, "Authentication required");

      const profile = await barberService.findMyProfile(userId);
      const { id } = productIdParamSchema.parse(req.params);

      const product = await productService.toggleActive(id, profile.id);
      res.status(200).json(
        successResponse(
          product,
          `Producto ${product.isActive ? "activado" : "desactivado"} exitosamente`
        )
      );
    } catch (error) {
      next(error);
    }
  }

  // ── Reducir stock ──
  async decrementStock(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = productIdParamSchema.parse(req.params);
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        throw new AppError(400, "La cantidad debe ser mayor a 0");
      }

      const product = await productService.decrementStock(id, Number(quantity));
      res.status(200).json(successResponse(product, "Stock actualizado exitosamente"));
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();