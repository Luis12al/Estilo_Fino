import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AppError } from './error.middleware';

export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'));
    }

    const userRole = req.user.role as string;
    const allowedRoles = roles.map(r => r.toString());

    if (!allowedRoles.includes(userRole)) {
      return next(new AppError(403, 'Insufficient permissions'));
    }

    next();
  };
};