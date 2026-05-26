import { useState, useCallback, useEffect, useRef } from 'react';
import { appointmentApi, type Appointment } from '@api/appointment.api';

interface UseBarberAppointmentsOptions {
  date?: string; // Si se pasa, modo Dashboard. Si no, modo Lista General.
  autoFetch?: boolean;
}

interface TodayStatsData {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export const useBarberAppointments = (options: UseBarberAppointmentsOptions = {}) => {
  const { date, autoFetch = true } = options;

  // ── Estados principales ──
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<TodayStatsData>({
    total: 0, pending: 0, confirmed: 0, inProgress: 0, completed: 0, cancelled: 0,
  });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // ── Estados de filtros (solo modo lista) ──
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Refs para control ──
  const isMounted = useRef(true);
  const isInitialLoadDone = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => { 
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ── Cancelar petición anterior ──
  const cancelPrevious = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
  }, []);

  // ── Fetch citas del día (modo Dashboard) ──
  const fetchTodayAppointments = useCallback(async () => {
    if (!date || !isMounted.current) return;
    
    cancelPrevious();
    setLoading(true);
    setError(null);

    try {
      const response = await appointmentApi.getMyBarberAppointments(date);
      if (isMounted.current) {
        if (response.success && response.data) {
          setAppointments(response.data);
          setError(null);
        } else {
          setError(response.message || 'Error al cargar citas');
          setAppointments([]);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return; // Ignorar cancelaciones
      if (isMounted.current) {
        setError(err.response?.data?.message || 'Error de conexión');
        setAppointments([]);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [date, cancelPrevious]);

  // ── Fetch stats del día ──
  const fetchStats = useCallback(async () => {
    if (!isMounted.current) return;
    try {
      const response = await appointmentApi.getTodayStats();
      if (response.success && response.data && isMounted.current) {
        const data = response.data;
        setStats({
          total: Number(data.total) || 0,
          pending: Number(data.pending) || 0,
          confirmed: Number(data.confirmed) || 0,
          inProgress: Number(data.inProgress) || 0,
          completed: Number(data.completed) || 0,
          cancelled: Number(data.cancelled) || 0,
        });
      }
    } catch (err: any) {
      console.error('Error cargando stats:', err);
      if (isMounted.current) {
        setStats({ total: 0, pending: 0, confirmed: 0, inProgress: 0, completed: 0, cancelled: 0 });
      }
    }
  }, []);

  // ── Fetch TODAS las citas (modo Lista) ──
  const fetchAllAppointments = useCallback(async (params?: {
    status?: string;
    from?: string;
    to?: string;
    search?: string;
  }) => {
    if (!isMounted.current) return;
    
    cancelPrevious();
    setLoading(true);
    setError(null);
    
    try {
      // ← FIX: Solo enviar parámetros que tengan valor real
      const cleanParams: Record<string, string> = {};
      if (params?.status?.trim()) cleanParams.status = params.status.trim();
      if (params?.from?.trim()) cleanParams.from = params.from.trim();
      if (params?.to?.trim()) cleanParams.to = params.to.trim();
      if (params?.search?.trim()) cleanParams.search = params.search.trim();

      console.log('🔄 [Hook] fetchAllAppointments params:', cleanParams);

      const response = await appointmentApi.getAllMyAppointments(
        Object.keys(cleanParams).length > 0 ? cleanParams : undefined
      );
      
      console.log('✅ [Hook] Respuesta:', response.success, 'data length:', response.data?.length);
      
      if (isMounted.current) {
        if (response.success && response.data) {
          setAppointments(response.data);
          setError(null);
        } else {
          setError(response.message || 'Error al cargar citas');
          setAppointments([]);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('❌ [Hook] Error:', err);
      if (isMounted.current) {
        setError(err.response?.data?.message || 'Error al cargar citas');
        setAppointments([]);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [cancelPrevious]);

  // ── Efecto de carga inicial ÚNICO ──
  // ← FIX: Solo se ejecuta UNA VEZ al montar, o cuando cambia date
  useEffect(() => {
    if (!autoFetch || isInitialLoadDone.current) return;
    
    isInitialLoadDone.current = true;
    
    if (date) {
      // Modo Dashboard
      fetchTodayAppointments();
      fetchStats();
    } else {
      // Modo Lista: cargar TODAS sin filtros
      fetchAllAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, date]);

  // ── Efecto para filtros (solo modo lista, NO en primera carga) ──
  // ← FIX: Debounce con 500ms y solo ejecutar después de la carga inicial
  useEffect(() => {
    if (!autoFetch || date || !isInitialLoadDone.current) return;
    
    const timeout = setTimeout(() => {
      fetchAllAppointments({
        status: filterStatus || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        search: searchQuery || undefined,
      });
    }, 500); // ← Aumentado a 500ms para evitar múltiples llamadas rápidas

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, dateFrom, dateTo, searchQuery]);

  // ── Refrescar según modo actual ──
  const refresh = useCallback(() => {
    if (date) {
      fetchTodayAppointments();
      fetchStats();
    } else {
      fetchAllAppointments({
        status: filterStatus || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        search: searchQuery || undefined,
      });
    }
  }, [date, filterStatus, dateFrom, dateTo, searchQuery, fetchTodayAppointments, fetchStats, fetchAllAppointments]);

  // ── Acciones ──
  const updateStatus = useCallback(async (
    id: string,
    payload: { status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'; reason?: string }
  ) => {
    if (!isMounted.current) return;
    setActionLoading(id);
    setError(null);

    try {
      const response = await appointmentApi.updateStatus(id, payload);
      if (response.success) {
        await refresh();
        return response.data;
      }
      throw new Error(response.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al actualizar estado';
      if (isMounted.current) setError(msg);
      throw new Error(msg);
    } finally {
      if (isMounted.current) setActionLoading(null);
    }
  }, [refresh]);

  const extend = useCallback(async (id: string, additionalMinutes: number = 20) => {
    if (!isMounted.current) return;
    setActionLoading(id);
    setError(null);

    try {
      const response = await appointmentApi.extend(id, additionalMinutes);
      if (response.success) {
        await refresh();
        return response.data;
      }
      throw new Error(response.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al extender cita';
      if (isMounted.current) setError(msg);
      throw new Error(msg);
    } finally {
      if (isMounted.current) setActionLoading(null);
    }
  }, [refresh]);

  const createManual = useCallback(async (data: {
    guestName: string;
    guestPhone: string;
    startTime: string;
    serviceIds: string[];
    notes?: string;
  }) => {
    if (!isMounted.current) return;
    setActionLoading('manual-booking');
    setError(null);

    try {
      const response = await appointmentApi.createManual(data);
      if (response.success) {
        await refresh();
        return response.data;
      }
      throw new Error(response.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al agendar cita';
      if (isMounted.current) setError(msg);
      throw new Error(msg);
    } finally {
      if (isMounted.current) setActionLoading(null);
    }
  }, [refresh]);

  return {
    appointments,
    stats,
    loading,
    actionLoading,
    error,
    refresh,
    updateStatus,
    extend,
    filterStatus,
    setFilterStatus,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    searchQuery,
    setSearchQuery,
    fetchAllAppointments,
    createManual
  };
};