import { User, UserRole } from '@prisma/client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone: string | null;
  };
  tokens: AuthTokens;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export type SafeUser = Omit<User, 'passwordHash'>;