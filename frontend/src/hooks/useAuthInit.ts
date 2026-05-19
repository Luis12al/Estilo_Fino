// frontend/src/hooks/useAuthInit.ts
import { useEffect } from 'react';
import { useAuthStore } from '@stores/auth.store';
import { authApi } from '@api/auth.api';

export const useAuthInit = () => {
  const { accessToken, setUser, logout, setLoading, setAuthenticated, isRehydrated } = useAuthStore();

  useEffect(() => {
    // ← CRÍTICO: Esperar a que Zustand rehidrate desde localStorage
    if (!isRehydrated) return;

    const init = async () => {
      // Si no hay token post-rehidratación, no estamos autenticados
      if (!accessToken) {
        setLoading(false);
        setAuthenticated(false);
        return;
      }

      // Validar token con el backend
      try {
        const response = await authApi.getMe();
        if (response.success && response.data) {
          setUser(response.data);
          setAuthenticated(true); // ← NUEVO: Marcar como autenticado
        } else {
          // Token inválido pero no expirado (raro) → logout
          logout();
        }
      } catch (err: any) {
        // ← CRÍTICO: Solo hacer logout si es 401/403, NO por errores de red
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          logout();
        } else {
          // Error de red (servidor caído): mantener sesión, reintentar después
          console.warn('Auth init failed due to network error, keeping session');
          setAuthenticated(true); // ← Mantener autenticado, el token puede ser válido
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [isRehydrated, accessToken]); // ← Dependencias correctas
};