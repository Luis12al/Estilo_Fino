/**
 * Formato estandarizado de respuestas API.
 * Toda respuesta del backend usa esta estructura.
 * 
 / backend/src/shared/utils/api-response.utils.ts
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
});

export const errorResponse = (error: string, message?: string): ApiResponse<never> => ({
  success: false,
  error,
  message,
});