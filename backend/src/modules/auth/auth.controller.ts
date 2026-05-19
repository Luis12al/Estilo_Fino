import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { successResponse } from '@shared/utils/api-response.utils';
import { AppError } from '@shared/middlewares/error.middleware';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(successResponse(result, 'User registered successfully'));
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(successResponse(result, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      res.status(200).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      await authService.logout(refreshToken, userId);
      res.status(200).json(successResponse(null, 'Logged out successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const user = await authService.getMe(userId);
      res.status(200).json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();