import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '@shared/utils/jwt.utils';
import { AppError } from './error.middleware';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'Access token required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded as any; // ← CORREGIDO: evita conflicto de tipos entre string y UserRole
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired access token'));
  }
};