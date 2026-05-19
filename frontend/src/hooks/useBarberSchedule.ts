// frontend/src/hooks/useBarberSchedule.ts
import { useState, useCallback, useEffect } from 'react';
import { barberApi, type BarberProfile} from '@api/barber.api';

export const useBarberSchedule = () => {
  const [profile, setProfile] = useState<BarberProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    clearMessages();
    
    try {
      const response = await barberApi.getMyProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.message || 'Error al cargar perfil');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [clearMessages]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateSchedule = useCallback(async (
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    isActive: boolean
  ) => {
    setSaving(true);
    clearMessages();

    try {
      const response = await barberApi.updateSchedule({ dayOfWeek, startTime, endTime, isActive });
      if (response.success) {
        setSuccessMessage('Horario actualizado');
        await loadProfile();
      } else {
        setError(response.message || 'Error al actualizar');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar horario');
    } finally {
      setSaving(false);
    }
  }, [clearMessages, loadProfile]);

  const addBreak = useCallback(async (dayOfWeek: number, startTime: string, endTime: string) => {
    setSaving(true);
    clearMessages();

    try {
      const response = await barberApi.createBreak({ dayOfWeek, startTime, endTime });
      if (response.success) {
        setSuccessMessage('Descanso agregado');
        await loadProfile();
      } else {
        setError(response.message || 'Error al crear descanso');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear descanso');
    } finally {
      setSaving(false);
    }
  }, [clearMessages, loadProfile]);

  const removeBreak = useCallback(async (breakId: string) => {
    setSaving(true);
    clearMessages();

    try {
      const response = await barberApi.deleteBreak(breakId);
      if (response.success) {
        setSuccessMessage('Descanso eliminado');
        await loadProfile();
      } else {
        setError(response.message || 'Error al eliminar descanso');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar descanso');
    } finally {
      setSaving(false);
    }
  }, [clearMessages, loadProfile]);

  const addDayOff = useCallback(async (date: string, reason?: string) => {
    setSaving(true);
    clearMessages();

    try {
      const response = await barberApi.createDayOff({ date, reason });
      if (response.success) {
        setSuccessMessage('Día libre agregado');
        await loadProfile();
      } else {
        setError(response.message || 'Error al agregar día libre');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al agregar día libre');
    } finally {
      setSaving(false);
    }
  }, [clearMessages, loadProfile]);

  const removeDayOff = useCallback(async (dayOffId: string) => {
    setSaving(true);
    clearMessages();

    try {
      const response = await barberApi.deleteDayOff(dayOffId);
      if (response.success) {
        setSuccessMessage('Día libre eliminado');
        await loadProfile();
      } else {
        setError(response.message || 'Error al eliminar día libre');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar día libre');
    } finally {
      setSaving(false);
    }
  }, [clearMessages, loadProfile]);

  return {
    profile,
    loading,
    saving,
    error,
    successMessage,
    loadProfile,
    updateSchedule,
    addBreak,
    removeBreak,
    addDayOff,
    removeDayOff,
    clearMessages,
  };
};