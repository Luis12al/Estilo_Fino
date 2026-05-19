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

  // ← FIX: Estados separados para Dashboard vs Lista
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  
  const [stats, setStats] = useState<TodayStatsData>({
    total: 0,
    pending: 0,
    confirmed: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ── Fetch citas del día (solo para dashboard) ──
  const fetchTodayAppointments = useCallback(async () => {
    if (!date || !isMounted.current) return;
    setLoading(true);
    setError(null);

    try {
      const response = await appointmentApi.getMyBarberAppointments(date);
      if (response.success && response.data) {
        if (isMounted.current) setTodayAppointments(response.data);
      } else {
        if (isMounted.current) setError(response.message || 'Error al cargar citas');
      }
    } catch (err: any) {
      if (isMounted.current) setError(err.response?.data?.message || 'Error de conexión');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [date]);

  // ── Fetch stats del día ──
  const fetchStats = useCallback(async () => {
    if (!isMounted.current) return;
    try {
      const response = await appointmentApi.getTodayStats();
      if (response.success && response.data) {
        const data = response.data;
        const safeStats: TodayStatsData = {
          total: Number(data.total) || 0,
          pending: Number(data.pending) || 0,
          confirmed: Number(data.confirmed) || 0,
          inProgress: Number(data.inProgress) || 0,
          completed: Number(data.completed) || 0,
          cancelled: Number(data.cancelled) || 0,
        };
        if (isMounted.current) setStats(safeStats);
      }
    } catch (err: any) {
      console.error('Error cargando stats:', err);
      if (isMounted.current) setStats({
        total: 0, pending: 0, confirmed: 0, inProgress: 0, completed: 0, cancelled: 0,
      });
    }
  }, []);

  // ── Fetch TODAS las citas (para página de citas) ──
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
      console.log('🔄 Llamando fetchAllAppointments con params:', params);
      const response = await appointmentApi.getAllMyAppointments({
        status: params?.status || filterStatus || undefined,
        from: params?.from || dateFrom || undefined,
        to: params?.to || dateTo || undefined,
        search: params?.search || undefined,
      });
      
      console.log('✅ Respuesta fetchAllAppointments:', response);
      
      if (response.success && response.data) {
        if (isMounted.current) setAllAppointments(response.data);
      } else {
        if (isMounted.current) setError(response.message || 'Error al cargar citas');
      }
    } catch (err: any) {
      console.error('❌ Error fetchAllAppointments:', err);
      if (isMounted.current) setError(err.response?.data?.message || 'Error al cargar citas');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [filterStatus, dateFrom, dateTo]);

  // ← FIX: useEffect separado para cada modo
  useEffect(() => {
    if (!autoFetch) return;

    if (date) {
      // Modo Dashboard
      fetchTodayAppointments();
      fetchStats();
    } else {
      // Modo Lista de Citas
      fetchAllAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, date]);

  // ← FIX: Refrescar lista cuando cambian filtros
  useEffect(() => {
    if (!autoFetch || date) return;
    const timeout = setTimeout(() => {
      fetchAllAppointments();
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, dateFrom, dateTo]);

  // ── Retornar appointments según el modo ──
  const appointments = date ? todayAppointments : allAppointments;

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
        if (date) {
          await fetchTodayAppointments();
          await fetchStats();
        } else {
          await fetchAllAppointments();
        }
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
  }, [date, fetchTodayAppointments, fetchStats, fetchAllAppointments]);

  const extend = useCallback(async (id: string, additionalMinutes: number = 20) => {
    if (!isMounted.current) return;
    setActionLoading(id);
    setError(null);

    try {
      const response = await appointmentApi.extend(id, additionalMinutes);
      if (response.success) {
        if (date) {
          await fetchTodayAppointments();
        } else {
          await fetchAllAppointments();
        }
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
  }, [date, fetchTodayAppointments, fetchAllAppointments]);

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
        if (date) {
          await fetchTodayAppointments();
          await fetchStats();
        } else {
          await fetchAllAppointments();
        }
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
  }, [date, fetchTodayAppointments, fetchStats, fetchAllAppointments]);

  return {
    appointments,
    stats,
    loading,
    actionLoading,
    error,
    refresh: date ? fetchTodayAppointments : fetchAllAppointments,
    updateStatus,
    extend,
    filterStatus,
    setFilterStatus,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    fetchAllAppointments,
    createManual
  };
};