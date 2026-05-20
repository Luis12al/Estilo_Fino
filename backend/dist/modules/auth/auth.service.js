"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const database_1 = require("@config/database");
const password_utils_1 = require("@shared/utils/password.utils");
const jwt_utils_1 = require("@shared/utils/jwt.utils");
const error_middleware_1 = require("@shared/middlewares/error.middleware");
const crypto_1 = __importDefault(require("crypto"));
class AuthService {
    /**
     * Registro de nuevo usuario.
     * Si el rol es BARBER, crea automáticamente el BarberProfile.
     */
    async register(data) {
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new error_middleware_1.AppError(409, 'Email already registered');
        }
        const passwordHash = await (0, password_utils_1.hashPassword)(data.password);
        const user = await database_1.prisma.user.create({
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
    async login(data) {
        const user = await database_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (!user || !user.isActive) {
            throw new error_middleware_1.AppError(401, 'Invalid credentials');
        }
        const isValidPassword = await (0, password_utils_1.comparePassword)(data.password, user.passwordHash);
        if (!isValidPassword) {
            throw new error_middleware_1.AppError(401, 'Invalid credentials');
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
    async refresh(refreshToken) {
        let decoded;
        try {
            decoded = (0, jwt_utils_1.verifyRefreshToken)(refreshToken);
        }
        catch {
            throw new error_middleware_1.AppError(401, 'Invalid refresh token');
        }
        const storedToken = await database_1.prisma.refreshToken.findFirst({
            where: {
                userId: decoded.userId,
                token: crypto_1.default.createHash('sha256').update(refreshToken).digest('hex'),
                expiresAt: { gt: new Date() },
            },
        });
        if (!storedToken) {
            throw new error_middleware_1.AppError(401, 'Refresh token expired or revoked');
        }
        const user = await database_1.prisma.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user || !user.isActive) {
            throw new error_middleware_1.AppError(401, 'User not found or inactive');
        }
        const accessToken = (0, jwt_utils_1.generateAccessToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        return { accessToken };
    }
    /**
     * Logout: elimina refresh token de la BD.
     */
    async logout(refreshToken, userId) {
        const tokenHash = crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
        await database_1.prisma.refreshToken.deleteMany({
            where: {
                userId,
                token: tokenHash,
            },
        });
    }
    /**
     * Obtener datos del usuario actual.
     */
    async getMe(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                barberProfile: true,
            },
        });
        if (!user) {
            throw new error_middleware_1.AppError(404, 'User not found');
        }
        return this.sanitizeUser(user);
    }
    // ========== MÉTODOS PRIVADOS ==========
    async generateTokens(userId, email, role) {
        const accessToken = (0, jwt_utils_1.generateAccessToken)({ userId, email, role });
        const refreshToken = (0, jwt_utils_1.generateRefreshToken)({ userId });
        // Guardar hash del refresh token (no el token en claro)
        const refreshTokenHash = crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 días
        await database_1.prisma.refreshToken.create({
            data: {
                userId,
                token: refreshTokenHash,
                expiresAt,
            },
        });
        return { accessToken, refreshToken };
    }
    sanitizeUser(user) {
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
