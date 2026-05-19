import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@stores/auth.store';

export const PublicGuard = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // Mientras verificamos, mostramos nada (o un loader muy simple)
  if (isLoading) {
    return null; // ← No mostramos loader aquí, evita flash
  }

  // Si ya está autenticado, redirige a su dashboard
  if (isAuthenticated && user) {
    const redirectPath = user.role === 'BARBER' ? '/admin/dashboard' : '/client/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};