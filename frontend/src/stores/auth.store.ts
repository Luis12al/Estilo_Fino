// frontend/src/stores/auth.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from 'src/types/auth.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRehydrated: boolean; // ← NUEVO: saber cuándo Zustand terminó de leer localStorage

  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  setAuthenticated: (value: boolean) => void; // ← NUEVO
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true, // ← Empezar en true hasta rehidratar
      isRehydrated: false, // ← NUEVO

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        }),

      setAccessToken: (token) => set({ accessToken: token }),

      setUser: (user) => set({ user }),

      setAuthenticated: (value) => set({ isAuthenticated: value }), // ← NUEVO

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          isRehydrated: true,
        }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // ← NUEVO: Callback cuando Zustand termina de leer localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isRehydrated = true;
          state.isLoading = false;
        }
      },
    }
  )
);