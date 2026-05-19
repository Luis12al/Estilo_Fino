// frontend/src/hooks/useAvailability.ts
import { useState, useCallback } from 'react';
import { appointmentApi, type AvailabilityResponse } from '@api/appointment.api';

export const useAvailability = () => {
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = useCallback(async (
    barberId: string,
    date: string,
    durationMinutes: number
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await appointmentApi.getAvailability(barberId, date, durationMinutes);
      if (response.success && response.data) {
        setAvailability(response.data);
        return response.data;
      } else {
        setError(response.message || 'No se pudo obtener disponibilidad');
        setAvailability(null);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al consultar disponibilidad';
      setError(message);
      setAvailability(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ← NUEVO: Limpiar disponibilidad (útil al cambiar de barbero)
  const clearAvailability = useCallback(() => {
    setAvailability(null);
    setError(null);
    setLoading(false);
  }, []);

  return { availability, loading, error, checkAvailability, clearAvailability };
};