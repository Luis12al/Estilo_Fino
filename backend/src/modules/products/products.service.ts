// backend/src/modules/products/products.service.ts
import { prisma } from "@config/database";
import { AppError } from "@shared/middlewares/error.middleware";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
} from "./products.dto";
import { Product, ProductAvailability, ProductCategory } from "@prisma/client";

interface PaginatedProducts {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ProductService {
  // ── Helpers ──
  private async checkOwnership(
    productId: string,
    barberId?: string
  ): Promise<Product> {
    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!product) {
      throw new AppError(404, "Producto no encontrado");
    }

    if (barberId && product.barberId && product.barberId !== barberId) {
      throw new AppError(403, "No tienes permiso para modificar este producto");
    }

    return product;
  }

  private buildWhereClause(
    query: ProductQueryInput,
    barberId?: string
  ): Record<string, unknown> {
    const where: Record<string, unknown> = { deletedAt: null };

    if (barberId) {
      where.OR = [{ barberId }, { barberId: null }];
    }

    if (query.category) {
      where.category = query.category as ProductCategory;
    }

    if (query.availability) {
      where.availability = query.availability as ProductAvailability;
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
  async create(data: CreateProductInput, barberId?: string) {
    if (
      data.availability === ProductAvailability.LIMITED &&
      !data.limitedUntil
    ) {
      throw new AppError(
        400,
        "Los productos limitados requieren una fecha límite"
      );
    }

    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: String(data.price),
        category: data.category as ProductCategory,
        stock: data.stock,
        imageUrl: data.imageUrl,
        availability: data.availability as ProductAvailability,
        limitedUntil: data.limitedUntil,
        isActive: data.isActive ?? true,
        barberId: barberId || null,
      },
    });
  }

  // ── Listar público ──
  async findAllPublic(query: ProductQueryInput): Promise<PaginatedProducts> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(query);
    const publicWhere = {
      ...where,
      isActive: true,
      OR: [
        { availability: ProductAvailability.PERMANENT },
        {
          availability: ProductAvailability.LIMITED,
          limitedUntil: { gte: new Date() },
        },
      ],
    };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where: publicWhere,
        skip,
        take: limit,
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
      prisma.product.count({ where: publicWhere }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Listar admin ──
  async findAllAdmin(
    query: ProductQueryInput,
    barberId?: string
  ): Promise<PaginatedProducts> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(query, barberId);
    if (!query.includeInactive) {
      where.isActive = true;
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Obtener por ID (público) ──
  async findById(id: string) {
    const product = await prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { availability: ProductAvailability.PERMANENT },
          {
            availability: ProductAvailability.LIMITED,
            limitedUntil: { gte: new Date() },
          },
        ],
      },
    });

    if (!product) {
      throw new AppError(404, "Producto no encontrado");
    }

    return product;
  }

  // ── Obtener por ID (admin) ──
  async findByIdAdmin(id: string, barberId?: string) {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
    });

    if (!product) {
      throw new AppError(404, "Producto no encontrado");
    }

    if (barberId && product.barberId && product.barberId !== barberId) {
      throw new AppError(403, "No tienes permiso para ver este producto");
    }

    return product;
  }

  // ── Actualizar ──
  async update(id: string, barberId: string, data: UpdateProductInput) {
    await this.checkOwnership(id, barberId);

    if (
      data.availability === ProductAvailability.LIMITED &&
      data.limitedUntil === undefined
    ) {
      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing?.limitedUntil) {
        throw new AppError(
          400,
          "Los productos limitados requieren una fecha límite"
        );
      }
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: String(data.price) }),
        ...(data.category !== undefined && {
          category: data.category as ProductCategory,
        }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.availability !== undefined && {
          availability: data.availability as ProductAvailability,
        }),
        ...(data.limitedUntil !== undefined && {
          limitedUntil: data.limitedUntil,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  // ── Soft delete ──
  async softDelete(id: string, barberId?: string) {
    await this.checkOwnership(id, barberId);

    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  // ── Reactivar ──
  async reactivate(id: string, barberId?: string) {
    await this.checkOwnership(id, barberId);

    return prisma.product.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });
  }

  // ── Toggle activo/inactivo ──
  async toggleActive(id: string, barberId?: string) {
    const existing = await this.checkOwnership(id, barberId);

    return prisma.product.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
  }

  // ── Reducir stock ──
  async decrementStock(id: string, quantity: number) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product || product.deletedAt) {
      throw new AppError(404, "Producto no encontrado");
    }

    if (product.stock < quantity) {
      throw new AppError(400, "Stock insuficiente");
    }

    return prisma.product.update({
      where: { id },
      data: { stock: { decrement: quantity } },
    });
  }

  // ── Verificar expirados (para cron) ──
  async checkExpiredProducts(): Promise<number> {
    const result = await prisma.product.updateMany({
      where: {
        availability: ProductAvailability.LIMITED,
        limitedUntil: { lt: new Date() },
        isActive: true,
        deletedAt: null,
      },
      data: { isActive: false },
    });

    return result.count;
  }
}

export const productService = new ProductService();