// frontend/src/api/product.api.ts
import { api } from './axios.config';
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters
} from '../types/product.types';
import type { ApiResponse } from 'src/types/auth.types';

// ── PÚBLICO: Tienda ──
const getAllPublic = async (filters?: ProductFilters): Promise<ApiResponse<Product[]>> => {
  const { data } = await api.get('/products', { params: filters });
  return data;
};

const getById = async (id: string): Promise<ApiResponse<Product>> => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

// ── ADMIN: CRUD ──
const getAllAdmin = async (filters?: ProductFilters): Promise<ApiResponse<Product[]>> => {
  const { data } = await api.get('/products/admin/all', { params: filters });
  return data;
};

const getByIdAdmin = async (id: string): Promise<ApiResponse<Product>> => {
  const { data } = await api.get(`/products/admin/${id}`);
  return data;
};

const create = async (input: CreateProductInput): Promise<ApiResponse<Product>> => {
  const { data } = await api.post('/products/admin', input);
  return data;
};

const update = async (id: string, input: UpdateProductInput): Promise<ApiResponse<Product>> => {
  const { data } = await api.put(`/products/admin/${id}`, input);
  return data;
};

const softDelete = async (id: string): Promise<ApiResponse<Product>> => {
  const { data } = await api.patch(`/products/admin/${id}/deactivate`);
  return data;
};

const reactivate = async (id: string): Promise<ApiResponse<Product>> => {
  const { data } = await api.patch(`/products/admin/${id}/reactivate`);
  return data;
};

const toggleActive = async (id: string): Promise<ApiResponse<Product>> => {
  const { data } = await api.patch(`/products/admin/${id}/toggle`);
  return data;
};

const decrementStock = async (id: string, quantity: number): Promise<ApiResponse<Product>> => {
  const { data } = await api.patch(`/products/admin/${id}/stock`, { quantity });
  return data;
};

export const productApi = {
  getAllPublic,
  getById,
  getAllAdmin,
  getByIdAdmin,
  create,
  update,
  softDelete,
  reactivate,
  toggleActive,
  decrementStock,
};