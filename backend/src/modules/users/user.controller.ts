// backend/src/modules/users/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '@config/database';
import { AppError } from '@shared/middlewares/error.middleware';
import { successResponse } from '@shared/utils/api-response.utils';
import { hashPassword, comparePassword } from '@shared/utils/password.utils';

export class UserController {
  
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) throw new AppError(404, 'Usuario no encontrado');

      res.status(200).json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Authentication required');

      const { firstName, lastName, phone, currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) throw new AppError(404, 'Usuario no encontrado');

      const updateData: any = {};

      if (firstName !== undefined) updateData.firstName = firstName.trim();
      if (lastName !== undefined) updateData.lastName = lastName.trim();
      if (phone !== undefined) updateData.phone = phone.trim() || null;

      // Cambio de contraseña
      if (newPassword) {
        if (!currentPassword) {
          throw new AppError(400, 'Debes proporcionar tu contraseña actual');
        }
        const isValid = await comparePassword(currentPassword, user.passwordHash);
        if (!isValid) {
          throw new AppError(400, 'Contraseña actual incorrecta');
        }
        updateData.passwordHash = await hashPassword(newPassword);
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(200).json(successResponse(updated, 'Perfil actualizado exitosamente'));
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();