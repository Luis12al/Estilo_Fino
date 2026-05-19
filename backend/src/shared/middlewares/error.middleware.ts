import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '@shared/utils/api-response.utils';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Errores operacionales (controlados)
  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.message));
    return;
  }

  // Errores de validación Zod
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    res.status(400).json(errorResponse('Validation error', messages));
    return;
  }

  // Errores de Prisma (ej: unique constraint)
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      res.status(409).json(errorResponse('Resource already exists'));
      return;
    }
    if (prismaError.code === 'P2025') {
      res.status(404).json(errorResponse('Resource not found'));
      return;
    }
  }

  // Error no controlado → log y respuesta genérica
  console.error('UNEXPECTED ERROR:', err);
  res.status(500).json(errorResponse('Internal server error'));
};