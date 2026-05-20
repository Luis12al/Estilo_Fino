/**
 * Formato estandarizado de respuestas API.
 * Toda respuesta del backend usa esta estructura.
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
export declare const successResponse: <T>(data: T, message?: string) => ApiResponse<T>;
export declare const errorResponse: (error: string, message?: string) => ApiResponse<never>;
//# sourceMappingURL=api-response.utils.d.ts.map