// frontend/src/hooks/useAuth.ts
import { useCallback } from 'react';
import { useAuthStore } from '@stores/auth.store';
import { authApi } from '@api/auth.api';
import type { LoginInput, RegisterInput } from 'src/types/auth.types';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setAuth, logout, setAuthenticated, setLoading } = useAuthStore();

  const login = useCallback(async (data: LoginInput) => {
    const response = await authApi.login(data);
    if (response.success && response.data) {
      const { user, tokens } = response.data;
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      return { success: true, role: user.role };
    }
    return { success: false, error: response.message || 'Login failed' };
  }, [setAuth]);

  const register = useCallback(async (data: RegisterInput) => {
    const response = await authApi.register(data);
    if (response.success && response.data) {
      const { user, tokens } = response.data;
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      return { success: true, role: user.role };
    }
    return { success: false, error: response.message || 'Register failed' };
  }, [setAuth]);

  const logoutUser = useCallback(async () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Ignorar error de logout
      }
    }
    logout();
  }, [logout]);

  const checkAuth = useCallback(async () => {
    const store = useAuthStore.getState();
    if (!store.accessToken) {
      store.setLoading(false);
      store.setAuthenticated(false);
      return;
    }

    try {
      const response = await authApi.getMe();
      if (response.success && response.data) {
        store.setUser(response.data);
        store.setAuthenticated(true); // ← FIX: Marcar autenticado
      } else {
        logout();
      }
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        logout();
      } else {
        // Error de red: mantener sesión
        store.setAuthenticated(true);
      }
    } finally {
      store.setLoading(false);
    }
  }, [logout, setAuthenticated, setLoading]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout: logoutUser,
    checkAuth,
    role: user?.role,
  };
};