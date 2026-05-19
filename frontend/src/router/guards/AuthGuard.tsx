import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@stores/auth.store';

export const AuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return null; // ← Loader global manejado en App, no aquí
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};