// frontend/src/hooks/useBookingServices.ts
import { useState, useCallback, useMemo } from 'react';
import { useServices } from './useServices';
import type { Service } from '@api/service.api';

export interface SelectedService extends Service {
  quantity: number;
}

export const useBookingServices = () => {
  const { services, loading, error, refresh } = useServices({ mode: 'public', autoFetch: true });
  const [selected, setSelected] = useState<SelectedService[]>([]);

  // Solo servicios activos y disponibles
  const availableServices = useMemo(() => 
    services.filter(s => s.isActive),
    [services]
  );

  const totalDuration = useMemo(() => 
    selected.reduce((sum, s) => sum + (s.durationMinutes * s.quantity), 0),
    [selected]
  );

  const totalPrice = useMemo(() => 
    selected.reduce((sum, s) => sum + (s.price * s.quantity), 0),
    [selected]
  );

  const addService = useCallback((service: Service) => {
    setSelected(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.map(s => 
          s.id === service.id 
            ? { ...s, quantity: s.quantity + 1 }
            : s
        );
      }
      return [...prev, { ...service, quantity: 1 }];
    });
  }, []);

  const removeService = useCallback((serviceId: string) => {
    setSelected(prev => {
      const exists = prev.find(s => s.id === serviceId);
      if (exists && exists.quantity > 1) {
        return prev.map(s => 
          s.id === serviceId 
            ? { ...s, quantity: s.quantity - 1 }
            : s
        );
      }
      return prev.filter(s => s.id !== serviceId);
    });
  }, []);

  const clearServices = useCallback(() => {
    setSelected([]);
  }, []);

  return {
    availableServices,
    selectedServices: selected,
    loading,
    error,
    totalDuration,
    totalPrice,
    addService,
    removeService,
    clearServices,
    refresh,
  };
};