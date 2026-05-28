"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = exports.ProductService = void 0;
// backend/src/modules/products/products.service.ts
const database_1 = require("../../config/database");
const error_middleware_1 = require("../../shared/middlewares/error.middleware");
const client_1 = require("@prisma/client");
class ProductService {
    // ── Helpers ──
    async checkOwnership(productId, barberId) {
        const product = await database_1.prisma.product.findFirst({
            where: { id: productId, deletedAt: null },
        });
        if (!product) {
            throw new error_middleware_1.AppError(404, "Producto no encontrado");
        }
        if (barberId && product.barberId && product.barberId !== barberId) {
            throw new error_middleware_1.AppError(403, "No tienes permiso para modificar este producto");
        }
        return product;
    }
    buildWhereClause(query, barberId) {
        const where = { deletedAt: null };
        if (barberId) {
            where.OR = [{ barberId }, { barberId: null }];
        }
        if (query.category) {
            where.category = query.category;
        }
        if (query.availability) {
            where.availability = query.availability;
        }
        if (query.isActive !== undefined) {
            where.isActive = query.isActive;
        }
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: "insensitive" } },
                { description: { contains: query.search, mode: "insensitive" } },
            ];
        }
        return where;
    }
    // ── Crear ──
    async create(data, barberId) {
        if (data.availability === client_1.ProductAvailability.LIMITED &&
            !data.limitedUntil) {
            throw new error_middleware_1.AppError(400, "Los productos limitados requieren una fecha límite");
        }
        return database_1.prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                price: String(data.price),
                category: data.category,
                stock: data.stock,
                imageUrl: data.imageUrl,
                availability: data.availability,
                limitedUntil: data.limitedUntil,
                isActive: data.isActive ?? true,
                barberId: barberId || null,
            },
        });
    }
    // ── Listar público ──
    async findAllPublic(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = this.buildWhereClause(query);
        const publicWhere = {
            ...where,
            isActive: true,
            OR: [
                { availability: client_1.ProductAvailability.PERMANENT },
                {
                    availability: client_1.ProductAvailability.LIMITED,
                    limitedUntil: { gte: new Date() },
                },
            ],
        };
        const [data, total] = await Promise.all([
            database_1.prisma.product.findMany({
                where: publicWhere,
                skip,
                take: limit,
                orderBy: [{ category: "asc" }, { name: "asc" }],
            }),
            database_1.prisma.product.count({ where: publicWhere }),
        ]);
        return {
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    // ── Listar admin ──
    async findAllAdmin(query, barberId) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = this.buildWhereClause(query, barberId);
        if (!query.includeInactive) {
            where.isActive = true;
        }
        const [data, total] = await Promise.all([
            database_1.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            database_1.prisma.product.count({ where }),
        ]);
        return {
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    // ── Obtener por ID (público) ──
    async findById(id) {
        const product = await database_1.prisma.product.findFirst({
            where: {
                id,
                deletedAt: null,
                OR: [
                    { availability: client_1.ProductAvailability.PERMANENT },
                    {
                        availability: client_1.ProductAvailability.LIMITED,
                        limitedUntil: { gte: new Date() },
                    },
                ],
            },
        });
        if (!product) {
            throw new error_middleware_1.AppError(404, "Producto no encontrado");
        }
        return product;
    }
    // ── Obtener por ID (admin) ──
    async findByIdAdmin(id, barberId) {
        const product = await database_1.prisma.product.findFirst({
            where: { id, deletedAt: null },
        });
        if (!product) {
            throw new error_middleware_1.AppError(404, "Producto no encontrado");
        }
        if (barberId && product.barberId && product.barberId !== barberId) {
            throw new error_middleware_1.AppError(403, "No tienes permiso para ver este producto");
        }
        return product;
    }
    // ── Actualizar ──
    async update(id, barberId, data) {
        await this.checkOwnership(id, barberId);
        if (data.availability === client_1.ProductAvailability.LIMITED &&
            data.limitedUntil === undefined) {
            const existing = await database_1.prisma.product.findUnique({ where: { id } });
            if (!existing?.limitedUntil) {
                throw new error_middleware_1.AppError(400, "Los productos limitados requieren una fecha límite");
            }
        }
        return database_1.prisma.product.update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.price !== undefined && { price: String(data.price) }),
                ...(data.category !== undefined && {
                    category: data.category,
                }),
                ...(data.stock !== undefined && { stock: data.stock }),
                ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
                ...(data.availability !== undefined && {
                    availability: data.availability,
                }),
                ...(data.limitedUntil !== undefined && {
                    limitedUntil: data.limitedUntil,
                }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
            },
        });
    }
    // ── Soft delete ──
    async softDelete(id, barberId) {
        await this.checkOwnership(id, barberId);
        return database_1.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }
    // ── Reactivar ──
    async reactivate(id, barberId) {
        await this.checkOwnership(id, barberId);
        return database_1.prisma.product.update({
            where: { id },
            data: { deletedAt: null, isActive: true },
        });
    }
    // ── Toggle activo/inactivo ──
    async toggleActive(id, barberId) {
        const existing = await this.checkOwnership(id, barberId);
        return database_1.prisma.product.update({
            where: { id },
            data: { isActive: !existing.isActive },
        });
    }
    // ── Reducir stock ──
    async decrementStock(id, quantity) {
        const product = await database_1.prisma.product.findUnique({ where: { id } });
        if (!product || product.deletedAt) {
            throw new error_middleware_1.AppError(404, "Producto no encontrado");
        }
        if (product.stock < quantity) {
            throw new error_middleware_1.AppError(400, "Stock insuficiente");
        }
        return database_1.prisma.product.update({
            where: { id },
            data: { stock: { decrement: quantity } },
        });
    }
    // ── Verificar expirados (para cron) ──
    async checkExpiredProducts() {
        const result = await database_1.prisma.product.updateMany({
            where: {
                availability: client_1.ProductAvailability.LIMITED,
                limitedUntil: { lt: new Date() },
                isActive: true,
                deletedAt: null,
            },
            data: { isActive: false },
        });
        return result.count;
    }
}
exports.ProductService = ProductService;
exports.productService = new ProductService();
