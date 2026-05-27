import { useState, useCallback, useEffect, useRef } from 'react';
import { offerApi, type Offer, type CreateOfferInput, type UpdateOfferInput } from '@api/offer.api';

interface UseOffersOptions {
  mode: 'public' | 'admin';
  autoFetch?: boolean;
}

export const useOffers = (options: UseOffersOptions = { mode: 'public' }) => {
  const { mode, autoFetch = true } = options;

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ── Fetch ──
  const fetchOffers = useCallback(async (showInactive = false) => {
    if (!isMounted.current) return;
    setLoading(true);
    setError(null);

    try {
      const response =
        mode === 'admin'
          ? await offerApi.getMyOffers(showInactive)
          : await offerApi.getAllPublic();

      if (isMounted.current) {
        if (response.success && response.data) {
          setOffers(response.data);
          setError(null);
        } else {
          setError(response.message || 'Error al cargar ofertas');
          setOffers([]);
        }
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.response?.data?.message || 'Error de conexión');
        setOffers([]);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [mode]);

  // ── Carga inicial ──
  useEffect(() => {
    if (!autoFetch) return;
    fetchOffers(includeInactive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, mode, includeInactive, fetchOffers]);

  // ── Mutaciones ──
  const create = useCallback(async (data: CreateOfferInput) => {
    if (!isMounted.current) return;
    setActionLoading('create');
    setError(null);

    try {
      const response = await offerApi.create(data);
      if (response.success) {
        await fetchOffers(includeInactive);
        return response.data;
      }
      throw new Error(response.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al crear oferta';
      if (isMounted.current) setError(msg);
      throw new Error(msg);
    } finally {
      if (isMounted.current) setActionLoading(null);
    }
  }, [fetchOffers, includeInactive]);

  const update = useCallback(async (id: string, data: UpdateOfferInput) => {
    if (!isMounted.current) return;
    setActionLoading(id);
    setError(null);

    try {
      const response = await offerApi.update(id, data);
      if (response.success) {
        await fetchOffers(includeInactive);
        return response.data;
      }
      throw new Error(response.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al actualizar oferta';
      if (isMounted.current) setError(msg);
      throw new Error(msg);
    } finally {
      if (isMounted.current) setActionLoading(null);
    }
  }, [fetchOffers, includeInactive]);

  const deactivate = useCallback(async (id: string) => {
    if (!isMounted.current) return;
    setActionLoading(id);
    setError(null);

    try {
      const response = await offerApi.deactivate(id);
      if (response.success) {
        await fetchOffers(includeInactive);
        return response.data;
      }
      throw new Error(response.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al desactivar oferta';
      if (isMounted.current) setError(msg);
      throw new Error(msg);
    } finally {
      if (isMounted.current) setActionLoading(null);
    }
  }, [fetchOffers, includeInactive]);

  const reactivate = useCallback(async (id: string) => {
    if (!isMounted.current) return;
    setActionLoading(id);
    setError(null);

    try {
      const response = await offerApi.reactivate(id);
      if (response.success) {
        await fetchOffers(includeInactive);
        return response.data;
      }
      throw new Error(response.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al reactivar oferta';
      if (isMounted.current) setError(msg);
      throw new Error(msg);
    } finally {
      if (isMounted.current) setActionLoading(null);
    }
  }, [fetchOffers, includeInactive]);

  const refresh = useCallback(() => {
    fetchOffers(includeInactive);
  }, [fetchOffers, includeInactive]);

  return {
    offers,
    loading,
    actionLoading,
    error,
    includeInactive,
    setIncludeInactive,
    fetchOffers,
    create,
    update,
    deactivate,
    reactivate,
    refresh,
  };
};