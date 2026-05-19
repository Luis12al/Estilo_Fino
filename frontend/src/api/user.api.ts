// frontend/src/api/user.api.ts
import { api } from './axios.config';
import type { ApiResponse } from 'src/types/auth.types';
import type { User } from 'src/types/auth.types';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const userApi = {
  getMe: () => api.get<ApiResponse<User>>('/users/me').then((res) => res.data),
  
  updateMe: (data: UpdateProfileInput) => 
    api.put<ApiResponse<User>>('/users/me', data).then((res) => res.data),
};