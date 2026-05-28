// frontend/src/types/product.types.ts
export type ProductCategory = 'HAIR' | 'BEARD' | 'SKIN' | 'ACCESSORIES' | 'OTHER';
export type ProductAvailability = 'PERMANENT' | 'LIMITED';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string; // Decimal del backend viene como string
  category: ProductCategory;
  stock: number;
  imageUrl: string | null;
  availability: ProductAvailability;
  limitedUntil: string | null; // ISO date string
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  description?: string | null;
  price: number;
  category: ProductCategory;
  stock: number;
  imageUrl?: string | null;
  availability: ProductAvailability;
  limitedUntil?: string | null;
  isActive?: boolean;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface ProductFilters {
  category?: ProductCategory;
  availability?: ProductAvailability;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  includeInactive?: boolean;
}

export interface PaginatedProducts {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'HAIR', label: 'Cabello' },
  { value: 'BEARD', label: 'Barba' },
  { value: 'SKIN', label: 'Piel' },
  { value: 'ACCESSORIES', label: 'Accesorios' },
  { value: 'OTHER', label: 'Otros' },
];

export const PRODUCT_AVAILABILITY: { value: ProductAvailability; label: string }[] = [
  { value: 'PERMANENT', label: 'Permanente' },
  { value: 'LIMITED', label: 'Por tiempo limitado' },
];

export const getCategoryLabel = (category: ProductCategory): string => {
  return PRODUCT_CATEGORIES.find((c) => c.value === category)?.label || category;
};

export const getAvailabilityLabel = (availability: ProductAvailability): string => {
  return PRODUCT_AVAILABILITY.find((a) => a.value === availability)?.label || availability;
};