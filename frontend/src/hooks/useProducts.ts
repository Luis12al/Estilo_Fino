// frontend/src/hooks/useProducts.ts
import { useState, useCallback } from 'react';
import { productApi } from '@api/product.api';
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
} from '../types/product.types';

interface UseProductsReturn {
  products: Product[];
  product: Product | null;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
  fetchPublic: (filters?: ProductFilters) => Promise<void>;
  fetchAdmin: (filters?: ProductFilters) => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  createProduct: (input: CreateProductInput) => Promise<Product | null>;
  updateProduct: (id: string, input: UpdateProductInput) => Promise<Product | null>;
  softDeleteProduct: (id: string) => Promise<boolean>;
  reactivateProduct: (id: string) => Promise<boolean>;
  toggleProduct: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchPublic = useCallback(async (filters?: ProductFilters) => {
    setLoading(true);
    clearError();
    try {
      const res = await productApi.getAllPublic(filters);
      if (res.success && Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error cargando productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  const fetchAdmin = useCallback(async (filters?: ProductFilters) => {
    setLoading(true);
    clearError();
    try {
      const res = await productApi.getAllAdmin(filters);
      if (res.success && Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error cargando productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  const fetchById = useCallback(async (id: string) => {
    setLoading(true);
    clearError();
    try {
      const res = await productApi.getById(id);
      if (res.success && res.data) {
        setProduct(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error cargando producto');
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  const createProduct = useCallback(async (input: CreateProductInput): Promise<Product | null> => {
    setCreating(true);
    clearError();
    try {
      const res = await productApi.create(input);
      if (res.success && res.data) {
        setProducts((prev) => [res.data!, ...prev]);
        return res.data;
      }
      return null;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creando producto');
      return null;
    } finally {
      setCreating(false);
    }
  }, [clearError]);

  const updateProduct = useCallback(async (id: string, input: UpdateProductInput): Promise<Product | null> => {
    setUpdating(true);
    clearError();
    try {
      const res = await productApi.update(id, input);
      if (res.success && res.data) {
        const updated = res.data;
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        setProduct(updated);
        return updated;
      }
      return null;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error actualizando producto');
      return null;
    } finally {
      setUpdating(false);
    }
  }, [clearError]);

  const softDeleteProduct = useCallback(async (id: string): Promise<boolean> => {
    setDeleting(true);
    clearError();
    try {
      const res = await productApi.softDelete(id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error eliminando producto');
      return false;
    } finally {
      setDeleting(false);
    }
  }, [clearError]);

  const reactivateProduct = useCallback(async (id: string): Promise<boolean> => {
    setUpdating(true);
    clearError();
    try {
      const res = await productApi.reactivate(id);
      if (res.success && res.data) {
        const reactivated = res.data;
        setProducts((prev) => prev.map((p) => (p.id === id ? reactivated : p)));
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error reactivando producto');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [clearError]);

  const toggleProduct = useCallback(async (id: string): Promise<boolean> => {
    setUpdating(true);
    clearError();
    try {
      const res = await productApi.toggleActive(id);
      if (res.success && res.data) {
        const toggled = res.data;
        setProducts((prev) => prev.map((p) => (p.id === id ? toggled : p)));
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error cambiando estado');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [clearError]);

  return {
    products,
    product,
    loading,
    creating,
    updating,
    deleting,
    error,
    fetchPublic,
    fetchAdmin,
    fetchById,
    createProduct,
    updateProduct,
    softDeleteProduct,
    reactivateProduct,
    toggleProduct,
    clearError,
  };
};