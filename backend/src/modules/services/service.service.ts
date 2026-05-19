// backend/src/modules/services/service.service.ts
import { prisma } from '@config/database';
import { AppError } from '@shared/middlewares/error.middleware';
import { CreateServiceInput, UpdateServiceInput } from './service.dto';

export class ServiceService {
  
  // Público: solo activos
  async findAll() {
    return prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Admin: todos (activos e inactivos)
  async findAllAdmin() {
    return prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new AppError(404, 'Servicio no encontrado');
    }

    return service;
  }

  // ← CORREGIDO: barberId opcional (NULL = servicio global)
  async create(data: CreateServiceInput, barberId?: string) {
    return prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        durationMinutes: data.durationMinutes,
        imageUrl: data.imageUrl,
        isActive: true,
        barberId: barberId || null, // NULL = global para todos
      },
    });
  }

  // ← CORREGIDO: Verificar propiedad antes de actualizar
  async update(id: string, data: UpdateServiceInput, barberId?: string) {
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new AppError(404, 'Servicio no encontrado');
    }

    // Si el servicio tiene barberId, solo el dueño puede editarlo
    // Si es global (barberId = null), cualquier barbero puede editar
    if (service.barberId && service.barberId !== barberId) {
      throw new AppError(403, 'No tienes permiso para editar este servicio');
    }

    return prisma.service.update({
      where: { id },
      data,
    });
  }


  async hardDelete(id: string, barberId?: string) {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        appointmentServices: true,
      },
    });

    if (!service) {
      throw new AppError(404, 'Servicio no encontrado');
    }

    // Verificar propiedad
    if (service.barberId && service.barberId !== barberId) {
      throw new AppError(403, 'No tienes permiso para eliminar este servicio');
    }

    // Verificar que no tenga citas asociadas
    if (service.appointmentServices.length > 0) {
      throw new AppError(409, 'No se puede eliminar: el servicio tiene citas asociadas. Desactívalo en su lugar.');
    }

    return prisma.service.delete({
      where: { id },
    });
  }

  // Soft delete (desactivar)
  async delete(id: string, barberId?: string) {
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new AppError(404, 'Servicio no encontrado');
    }

    // Misma lógica de propiedad
    if (service.barberId && service.barberId !== barberId) {
      throw new AppError(403, 'No tienes permiso para desactivar este servicio');
    }

    return prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Reactivar servicio
  async reactivate(id: string, barberId?: string) {
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new AppError(404, 'Servicio no encontrado');
    }

    if (service.barberId && service.barberId !== barberId) {
      throw new AppError(403, 'No tienes permiso para reactivar este servicio');
    }

    return prisma.service.update({
      where: { id },
      data: { isActive: true },
    });
  }
}

export const serviceService = new ServiceService();