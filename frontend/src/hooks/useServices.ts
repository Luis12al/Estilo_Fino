// frontend/src/hooks/useServices.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { serviceApi, type Service, type CreateServicePayload, type UpdateServicePayload } from '@api/service.api';

type UseServicesMode = 'public' | 'admin';

interface UseServicesOptions {
  mode?: UseServicesMode;
  autoFetch?: boolean;
}

interface UseServicesReturn {
  services: Service[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createService: (data: CreateServicePayload) => Promise<Service>;
  updateService: (id: string, data: UpdateServicePayload) => Promise<Service>;
  deleteService: (id: string) => Promise<void>;
  reactivateService: (id: string) => Promise<Service>;
  hardDeleteService: (id: string) => Promise<void>;
}

export const useServices = (options: UseServicesOptions = {}): UseServicesReturn => {
  const { mode = 'public', autoFetch = true } = options;

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeSetServices = useCallback((value: Service[]) => {
    if (isMounted.current) setServices(value);
  }, []);

  const safeSetLoading = useCallback((value: boolean) => {
    if (isMounted.current) setLoading(value);
  }, []);

  const safeSetSaving = useCallback((value: boolean) => {
    if (isMounted.current) setSaving(value);
  }, []);

  const safeSetError = useCallback((value: string | null) => {
    if (isMounted.current) setError(value);
  }, []);

  const fetchServices = useCallback(async () => {
    safeSetLoading(true);
    safeSetError(null);

    try {
      const response =
        mode === 'admin'
          ? await serviceApi.getAllAdmin()
          : await serviceApi.getAll();

      if (response.success && response.data) {
        // En modo público, filtrar solo activos (doble seguridad)
        const data =
          mode === 'public'
            ? response.data.filter((s) => s.isActive)
            : response.data;
        safeSetServices(data);
      } else {
        safeSetError(response.message || 'Error al cargar servicios');
      }
    } catch (err: any) {
      safeSetError(
        err.response?.data?.message || 'Error de conexión al cargar servicios'
      );
    } finally {
      safeSetLoading(false);
    }
  }, [mode, safeSetLoading, safeSetError, safeSetServices]);

  useEffect(() => {
    if (autoFetch) {
      fetchServices();
    }
  }, [autoFetch, fetchServices]);

  const mutate = useCallback(
    async <T,>(operation: () => Promise<any>): Promise<T> => {
      safeSetSaving(true);
      safeSetError(null);

      try {
        const response = await operation();

        if (response.success) {
          await fetchServices();
          return response.data;
        }

        throw new Error(response.message || 'Operación fallida');
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Error en la operación';
        safeSetError(msg);
        throw new Error(msg);
      } finally {
        safeSetSaving(false);
      }
    },
    [fetchServices, safeSetSaving, safeSetError]
  );

  const createService = useCallback(
    async (data: CreateServicePayload): Promise<Service> => {
      return mutate<Service>(() => serviceApi.create(data));
    },
    [mutate]
  );

  const updateService = useCallback(
    async (id: string, data: UpdateServicePayload): Promise<Service> => {
      return mutate<Service>(() => serviceApi.update(id, data));
    },
    [mutate]
  );

  const deleteService = useCallback(
    async (id: string): Promise<void> => {
      await mutate<null>(() => serviceApi.delete(id));
    },
    [mutate]
  );

  const reactivateService = useCallback(
    async (id: string): Promise<Service> => {
      return mutate<Service>(() => serviceApi.reactivate(id));
    },
    [mutate]
  );

  const hardDeleteService = useCallback(
    async (id: string): Promise<void> => {
      await mutate<null>(() => serviceApi.hardDelete(id));
    },
    [mutate]
  );

  return {
    services,
    loading,
    saving,
    error,
    refresh: fetchServices,
    createService,
    updateService,
    deleteService,
    reactivateService,
    hardDeleteService,
  };
};