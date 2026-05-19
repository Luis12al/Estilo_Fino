// frontend/src/hooks/useBarberProfile.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { barberApi } from '@api/barber.api';
import { userApi } from '@api/user.api';
import type { BarberProfile } from '@api/barber.api';

interface BarberStats {
  totalAppointments: number;
  completedThisMonth: number;
  totalRevenue: number;
  rating: number;
  memberSince: string;
}

export const useBarberProfile = (options: { autoFetch?: boolean } = {}) => {
  const { autoFetch = true } = options;
  
  const [profile, setProfile] = useState<BarberProfile | null>(null);
  const [stats, setStats] = useState<BarberStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const clearMessages = useCallback(() => {
    if (!isMounted.current) return;
    setError(null);
    setSuccess(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    clearMessages();
    try {
      const response = await barberApi.getMyProfile();
      if (response.success && response.data) {
        if (isMounted.current) setProfile(response.data);
      } else {
        if (isMounted.current) setError(response.message || 'Error al cargar perfil');
      }
    } catch (err: any) {
      if (isMounted.current) setError(err.response?.data?.message || 'Error de conexión');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [clearMessages]);

  const fetchStats = useCallback(async () => {
    if (!isMounted.current) return;
    setStatsLoading(true);
    try {
      // Simular stats básicas hasta tener endpoint dedicado
      if (isMounted.current) {
        setStats({
          totalAppointments: 0,
          completedThisMonth: 0,
          totalRevenue: 0,
          rating: 4.8,
          memberSince: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.warn('Error cargando stats:', err);
    } finally {
      if (isMounted.current) setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchProfile();
      fetchStats();
    }
  }, [autoFetch, fetchProfile, fetchStats]);

  // ← CORREGIDO: Actualiza tanto User como BarberProfile
  const updateProfile = useCallback(async (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    avatarUrl?: string;
    defaultSlotDuration?: number;
  }) => {
    if (!isMounted.current) return;
    setUpdating(true);
    clearMessages();

    const previousProfile = profile;

    try {
      // 1. Actualizar datos de User (nombre, teléfono) si vienen
      const userData: Record<string, string | undefined> = {};
      if (data.firstName !== undefined) userData.firstName = data.firstName;
      if (data.lastName !== undefined) userData.lastName = data.lastName;
      if (data.phone !== undefined) userData.phone = data.phone;

      if (Object.keys(userData).length > 0) {
        const userResponse = await userApi.updateMe(userData);
        if (!userResponse.success) {
          throw new Error(userResponse.message || 'Error al actualizar datos de usuario');
        }
      }

      // 2. Actualizar datos de BarberProfile (bio, duración, avatar)
      const profileData: Record<string, unknown> = {};
      if (data.bio !== undefined) profileData.bio = data.bio;
      if (data.avatarUrl !== undefined) profileData.avatarUrl = data.avatarUrl;
      if (data.defaultSlotDuration !== undefined) profileData.defaultSlotDuration = data.defaultSlotDuration;

      if (Object.keys(profileData).length > 0) {
        const profileResponse = await barberApi.updateProfile(profileData as { bio?: string; avatarUrl?: string; defaultSlotDuration?: number });
        if (!profileResponse.success) {
          throw new Error(profileResponse.message || 'Error al actualizar perfil de barbero');
        }
      }

      // Refrescar perfil completo desde el servidor
      await fetchProfile();
      if (isMounted.current) setSuccess('Perfil actualizado exitosamente');
    } catch (err: any) {
      if (isMounted.current) setProfile(previousProfile);
      const msg = err.response?.data?.message || err.message || 'Error al actualizar perfil';
      if (isMounted.current) setError(msg);
      throw new Error(msg);
    } finally {
      if (isMounted.current) setUpdating(false);
    }
  }, [profile, clearMessages, fetchProfile]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!isMounted.current) return;
    setUploadingAvatar(true);
    clearMessages();
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const { url } = await response.json();
      await updateProfile({ avatarUrl: url });
      if (isMounted.current) setSuccess('Foto actualizada');
    } catch (err: any) {
      if (isMounted.current) setError('Error subiendo imagen');
    } finally {
      if (isMounted.current) setUploadingAvatar(false);
    }
  }, [updateProfile, clearMessages]);

  return {
    profile,
    stats,
    loading,
    statsLoading,
    updating,
    uploadingAvatar,
    error,
    success,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    clearMessages,
  };
};