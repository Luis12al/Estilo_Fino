import { api } from './axios.config';
import type { LoginInput, RegisterInput, AuthResponse, ApiResponse } from 'src/types/auth.types';

export const authApi = {
  login: (data: LoginInput) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data).then((res) => res.data),

  register: (data: RegisterInput) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data).then((res) => res.data),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', { refreshToken }).then((res) => res.data),

  logout: (refreshToken: string) =>
    api.post<ApiResponse<null>>('/auth/logout', { refreshToken }).then((res) => res.data),

  getMe: () =>
    api.get<ApiResponse<any>>('/auth/me').then((res) => res.data),
};