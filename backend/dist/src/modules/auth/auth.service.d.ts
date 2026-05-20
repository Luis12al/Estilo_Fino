import { RegisterInput, LoginInput } from './auth.dto';
import { AuthResponse } from './auth.types';
export declare class AuthService {
    /**
     * Registro de nuevo usuario.
     * Si el rol es BARBER, crea automáticamente el BarberProfile.
     */
    register(data: RegisterInput): Promise<AuthResponse>;
    /**
     * Login: valida credenciales y genera tokens.
     */
    login(data: LoginInput): Promise<AuthResponse>;
    /**
     * Refresh: valida refresh token, genera nuevo access token.
     */
    refresh(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    /**
     * Logout: elimina refresh token de la BD.
     */
    logout(refreshToken: string, userId: string): Promise<void>;
    /**
     * Obtener datos del usuario actual.
     */
    getMe(userId: string): Promise<any>;
    private generateTokens;
    private sanitizeUser;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map