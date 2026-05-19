import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@stores/auth.store';

interface RoleGuardProps {
  allowedRoles: Array<'CLIENT' | 'BARBER' | 'SUPER_ADMIN'>;
  fallback?: string;
}

export const RoleGuard = ({ allowedRoles, fallback = '/' }: RoleGuardProps) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return null;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};