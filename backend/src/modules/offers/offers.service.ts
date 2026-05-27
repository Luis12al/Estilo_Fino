import { prisma } from '@config/database';
import { AppError } from '@shared/middlewares/error.middleware';
import { CreateOfferInput, UpdateOfferInput } from './offers.dto';
import { OfferType } from '@prisma/client';

export class OfferService {

     /**
   * Calcular precio final basado en precio original y descuento
   */
  private calculateFinalPrice(originalPrice: number, discountPercent?: number, overrideFinalPrice?: number): number {
    // Si hay override de precio final, usarlo
    if (overrideFinalPrice !== undefined) {
      return overrideFinalPrice;
    }
    
    // Si hay descuento porcentual, calcular
    if (discountPercent && discountPercent > 0) {
      const discount = (originalPrice * discountPercent) / 100;
      return Math.round((originalPrice - discount) * 100) / 100; // Redondear a 2 decimales
    }
    
    // Sin descuento, precio original
    return originalPrice;
  }

  /**
   * Crear oferta
   */
  async create(data: CreateOfferInput, barberId: string) {
    // Validación: si es LIMITED_TIME, debe tener fechas
    if (data.type === OfferType.LIMITED_TIME) {
      if (!data.validFrom || !data.validUntil) {
        throw new AppError(400, 'Las ofertas por tiempo limitado requieren fecha de inicio y fin');
      }
      const from = new Date(data.validFrom);
      const to = new Date(data.validUntil);
      if (from > to) {
        throw new AppError(400, 'La fecha de inicio no puede ser posterior a la fecha de fin');
      }
    }

    const finalPrice = this.calculateFinalPrice(
      data.originalPrice,
      data.discountPercent,
      data.finalPrice
    );

    return prisma.offer.create({
      data: {
        barberId,
        title: data.title,
        description: data.description,
        originalPrice: String(data.originalPrice), // ← NUEVO campo en schema
        discountPercent: data.discountPercent,
        finalPrice: String(finalPrice), // ← NUEVO campo calculado
        type: data.type,
        validFrom: data.validFrom ? new Date(data.validFrom) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        imageUrl: data.imageUrl,
      },
      include: {
        barber: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }
  /**
   * Obtener todas las ofertas activas (público)
   */
  async findAllPublic() {
    const now = new Date();
    
    return prisma.offer.findMany({
      where: {
        isActive: true,
        OR: [
          { type: 'PERMANENT' },
          {
            type: 'LIMITED_TIME',
            validFrom: { lte: now },
            validUntil: { gte: now },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        barber: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  /**
   * Obtener todas las ofertas del barbero (admin)
   */
  async findAllByBarber(barberId: string, includeInactive = false) {
    return prisma.offer.findMany({
      where: {
        barberId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        barber: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  /**
   * Obtener una oferta por ID
   */
  async findById(id: string, barberId?: string) {
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        barber: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!offer) {
      throw new AppError(404, 'Oferta no encontrada');
    }

    if (barberId && offer.barberId !== barberId) {
      throw new AppError(403, 'No tienes permiso para ver esta oferta');
    }

    return offer;
  }

  /**
   * Actualizar oferta
   */
    async update(id: string, barberId: string, data: UpdateOfferInput) {
    const offer = await this.findById(id, barberId) as any; // ← FIX temporal

    // Recalcular precio final si cambia originalPrice o discountPercent
    let finalPrice = (offer as any).finalPrice;
    if (data.originalPrice !== undefined || data.discountPercent !== undefined) {
      const original = data.originalPrice ?? Number((offer as any).originalPrice);
      const discount = data.discountPercent ?? (offer as any).discountPercent ?? 0;
      finalPrice = String(this.calculateFinalPrice(original, discount));
    }

    // Validación de fechas si se actualiza a LIMITED_TIME
    if (data.type === OfferType.LIMITED_TIME || (data.type === undefined && offer.type === OfferType.LIMITED_TIME)) {
      const validFrom = data.validFrom ? new Date(data.validFrom) : offer.validFrom;
      const validUntil = data.validUntil ? new Date(data.validUntil) : offer.validUntil;
      
      if (validFrom && validUntil && validFrom > validUntil) {
        throw new AppError(400, 'La fecha de inicio no puede ser posterior a la fecha de fin');
      }
    }

    return prisma.offer.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.originalPrice !== undefined && { originalPrice: String(data.originalPrice) }),
        ...(data.discountPercent !== undefined && { discountPercent: data.discountPercent }),
        ...(finalPrice !== undefined && { finalPrice: String(finalPrice) }),
        ...(data.type && { type: data.type }),
        ...(data.validFrom !== undefined && { validFrom: data.validFrom ? new Date(data.validFrom) : null }),
        ...(data.validUntil !== undefined && { validUntil: data.validUntil ? new Date(data.validUntil) : null }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        barber: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  /**
   * Soft delete (desactivar)
   */
  async deactivate(id: string, barberId: string) {
    await this.findById(id, barberId);
    
    return prisma.offer.update({
      where: { id },
      data: { isActive: false },
      include: {
        barber: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  /**
   * Reactivar oferta
   */
  async reactivate(id: string, barberId: string) {
    await this.findById(id, barberId);
    
    return prisma.offer.update({
      where: { id },
      data: { isActive: true },
      include: {
        barber: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  /**
   * Eliminar permanentemente (solo Super Admin)
   */
  async deletePermanent(id: string) {
    const offer = await prisma.offer.findUnique({ where: { id } });
    if (!offer) throw new AppError(404, 'Oferta no encontrada');
    
    return prisma.offer.delete({ where: { id } });
  }
}

export const offerService = new OfferService();