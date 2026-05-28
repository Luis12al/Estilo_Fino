"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = exports.ProductController = void 0;
const products_service_1 = require("./products.service");
const barber_service_1 = require("../barbers/barber.service");
const api_response_utils_1 = require("../../../shared/utils/api-response.utils");
const error_middleware_1 = require("../../../shared/middlewares/error.middleware");
const products_dto_1 = require("./products.dto");
class ProductController {
    // ── Crear ──
    async create(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, "Authentication required");
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const validated = products_dto_1.createProductSchema.parse(req.body);
            const product = await products_service_1.productService.create(validated, profile.id);
            res.status(201).json((0, api_response_utils_1.successResponse)(product, "Producto creado exitosamente"));
        }
        catch (error) {
            next(error);
        }
    }
    // ── Listar público ──
    async findAllPublic(req, res, next) {
        try {
            const validated = products_dto_1.productQuerySchema.parse(req.query);
            const result = await products_service_1.productService.findAllPublic(validated);
            res.status(200).json((0, api_response_utils_1.successResponse)(result.data, "Productos obtenidos exitosamente"));
        }
        catch (error) {
            next(error);
        }
    }
    // ── Listar admin ──
    async findAllAdmin(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, "Authentication required");
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const validated = products_dto_1.productQuerySchema.parse(req.query);
            const result = await products_service_1.productService.findAllAdmin(validated, profile.id);
            res.status(200).json((0, api_response_utils_1.successResponse)(result.data, "Productos obtenidos exitosamente"));
        }
        catch (error) {
            next(error);
        }
    }
    // ── Obtener por ID (público) ──
    async findById(req, res, next) {
        try {
            const { id } = products_dto_1.productIdParamSchema.parse(req.params);
            const product = await products_service_1.productService.findById(id);
            res.status(200).json((0, api_response_utils_1.successResponse)(product, "Producto obtenido exitosamente"));
        }
        catch (error) {
            next(error);
        }
    }
    // ── Obtener por ID (admin) ──
    async findByIdAdmin(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, "Authentication required");
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const { id } = products_dto_1.productIdParamSchema.parse(req.params);
            const product = await products_service_1.productService.findByIdAdmin(id, profile.id);
            res.status(200).json((0, api_response_utils_1.successResponse)(product, "Producto obtenido exitosamente"));
        }
        catch (error) {
            next(error);
        }
    }
    // ── Actualizar ──
    async update(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, "Authentication required");
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const { id } = products_dto_1.productIdParamSchema.parse(req.params);
            const validated = products_dto_1.updateProductSchema.parse(req.body);
            const product = await products_service_1.productService.update(id, profile.id, validated);
            res.status(200).json((0, api_response_utils_1.successResponse)(product, "Producto actualizado exitosamente"));
        }
        catch (error) {
            next(error);
        }
    }
    // ── Soft delete ──
    async softDelete(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, "Authentication required");
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const { id } = products_dto_1.productIdParamSchema.parse(req.params);
            const product = await products_service_1.productService.softDelete(id, profile.id);
            res.status(200).json((0, api_response_utils_1.successResponse)(product, "Producto eliminado exitosamente"));
        }
        catch (error) {
            next(error);
        }
    }
    // ── Reactivar ──
    async reactivate(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, "Authentication required");
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const { id } = products_dto_1.productIdParamSchema.parse(req.params);
            const product = await products_service_1.productService.reactivate(id, profile.id);
            res.status(200).json((0, api_response_utils_1.successResponse)(product, "Producto reactivado exitosamente"));
        }
        catch (error) {
            next(error);
        }
    }
    // ── Toggle activo/inactivo ──
    async toggleActive(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new error_middleware_1.AppError(401, "Authentication required");
            const profile = await barber_service_1.barberService.findMyProfile(userId);
            const { id } = products_dto_1.productIdParamSchema.parse(req.params);
            const product = await products_service_1.productService.toggleActive(id, profile.id);
            res.status(200).json((0, api_response_utils_1.successResponse)(product, `Producto ${product.isActive ? "activado" : "desactivado"} exitosamente`));
        }
        catch (error) {
            next(error);
        }
    }
    // ── Reducir stock ──
    async decrementStock(req, res, next) {
        try {
            const { id } = products_dto_1.productIdParamSchema.parse(req.params);
            const { quantity } = req.body;
            if (!quantity || quantity < 1) {
                throw new error_middleware_1.AppError(400, "La cantidad debe ser mayor a 0");
            }
            const product = await products_service_1.productService.decrementStock(id, Number(quantity));
            res.status(200).json((0, api_response_utils_1.successResponse)(product, "Stock actualizado exitosamente"));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ProductController = ProductController;
exports.productController = new ProductController();
