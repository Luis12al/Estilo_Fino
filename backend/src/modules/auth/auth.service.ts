import { prisma } from '@config/database';
import { hashPassword, comparePassword } from '@shared/utils/password.utils';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@shared/utils/jwt.utils';
import { AppError } from '@shared/middlewares/error.middleware';
import { RegisterInput, LoginInput } from './auth.dto';
import { AuthResponse } from './auth.types';
import crypto from 'crypto';

export class AuthService {
  /**
   * Registro de nuevo usuario.
   * Si el rol es BARBER, crea automáticamente el BarberProfile.
   */
    async register(data: RegisterInput): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(409, 'Email already registered');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: 'CLIENT', // ← SIEMPRE CLIENT, no se puede elegir
      },
    });

    // No se crea BarberProfile automáticamente — solo CLIENT
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Login: valida credenciales y genera tokens.
   */
  async login(data: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'Invalid credentials');
    }

    const isValidPassword = await comparePassword(data.password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Refresh: valida refresh token, genera nuevo access token.
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(401, 'Invalid refresh token');
    }

    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        userId: decoded.userId,
        token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      throw new AppError(401, 'Refresh token expired or revoked');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'User not found or inactive');
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { accessToken };
  }

  /**
   * Logout: elimina refresh token de la BD.
   */
  async logout(refreshToken: string, userId: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: tokenHash,
      },
    });
  }

  /**
   * Obtener datos del usuario actual.
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        barberProfile: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return this.sanitizeUser(user);
  }

  // ========== MÉTODOS PRIVADOS ==========

  private async generateTokens(
    userId: string,
    email: string,
    role: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = generateAccessToken({ userId, email, role });
    const refreshToken = generateRefreshToken({ userId });

    // Guardar hash del refresh token (no el token en claro)
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshTokenHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}

export const authService = new AuthService();