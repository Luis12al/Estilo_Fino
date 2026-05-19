// frontend/src/hooks/useProfile.ts
import { useState, useCallback } from 'react';
import { userApi, type UpdateProfileInput } from '@api/user.api';
import { useAuthStore } from '@stores/auth.store';
import type { User } from 'src/types/auth.types';

export const useProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const authSetUser = useAuthStore((state) => state.setUser);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userApi.getMe();
      if (response.success && response.data) {
        setUser(response.data);
        authSetUser(response.data); // Sincronizar con auth store
      } else {
        setError(response.message || 'Error al cargar perfil');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [authSetUser]);

  const updateProfile = useCallback(async (data: UpdateProfileInput) => {
    setUpdating(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await userApi.updateMe(data);
      if (response.success && response.data) {
        setUser(response.data);
        authSetUser(response.data); // Sincronizar con auth store
        setSuccess('Perfil actualizado exitosamente');
        return response.data;
      } else {
        setError(response.message || 'Error al actualizar perfil');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error de conexión');
    } finally {
      setUpdating(false);
    }
  }, [authSetUser]);

  return {
    user,
    loading,
    updating,
    error,
    success,
    fetchProfile,
    updateProfile,
    clearMessages: () => { setError(null); setSuccess(null); },
  };
};