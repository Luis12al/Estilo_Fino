// frontend/src/hooks/useBarberAppointments.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { appointmentApi, type Appointment } from '@api/appointment.api';

interface UseBarberAppointmentsOptions {
  date?: string;
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

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<TodayStatsData>({
    total: 0, pending: 0, confirmed: 0, inProgress: 0, completed: 0, cancelled: 0,
  });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ── Fetch citas del día (Dashboard) ──
  const fetchTodayAppointments = useCallback(async (targetDate?: string) => {
    const queryDate = targetDate || date;
    if (!queryDate || !isMounted.current) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await appointmentApi.getMyBarberAppointments(queryDate);
      if (isMounted.current) {
        if (response.success && response.data) {
          setAppointments(response.data);
        } else {
          setError(response.message || 'Error al cargar citas');
          setAppointments([]);
        }
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.response?.data?.message || 'Error de conexión');
        setAppointments([]);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [date]);

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

  // ── Fetch TODAS las citas (Lista con filtros) ──
  const fetchAllAppointments = useCallback(async (params?: {
    status?: string;
    from?: string;
    to?: string;
    search?: string;
  }) => {
    if (!isMounted.current) return;
    setLoading(true);
    setError(null);
    
    try {
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
        } else {
          setError(response.message || 'Error al cargar citas');
          setAppointments([]);
        }
      }
    } catch (err: any) {
      console.error('❌ [Hook] Error:', err);
      if (isMounted.current) {
        setError(err.response?.data?.message || 'Error al cargar citas');
        setAppointments([]);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  // Efecto de carga inicial
  useEffect(() => {
    if (!autoFetch) return;
    if (date) {
      fetchTodayAppointments(date);
      fetchStats();
    } else {
      fetchAllAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, date]);

  // Efecto para filtros (solo modo lista)
  useEffect(() => {
    if (!autoFetch || date) return;
    
    const timeout = setTimeout(() => {
      fetchAllAppointments({
        status: filterStatus || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        search: searchQuery || undefined,
      });
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, dateFrom, dateTo, searchQuery]);

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