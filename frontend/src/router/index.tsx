import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthGuard } from './guards/AuthGuard';
import { RoleGuard } from './guards/RoleGuard';
import { PublicGuard } from './guards/PublicGuard';

// Pages Admin
import AdminServices from '@pages/admin/Services';
import AdminSchedule from '@pages/admin/Schedule';
import AdminDashboard from '@pages/admin/Dashboard';
import Appointments from '@pages/admin/Appointments';
import BarberProfile from '@pages/admin/BarberProfile';


// Pages Public
import Home from '@pages/public/Home';
import Login from '@pages/public/Login';
import Register from '@pages/public/Register';


// Pages Client
import ClientDashboard from '@pages/client/Dashboard';
import ClientBarbers from '@pages/client/Barbers';
import ClientBooking from '@pages/client/Booking';
import ClientAppointments from '@pages/client/MyAppointments';
import ClientProfile from '@pages/client/Profile';



const router = createBrowserRouter([
  // Públicas (accesibles sin login)
  {
    element: <PublicGuard />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },

  // Protegidas (requieren login)
  {
    element: <AuthGuard />,
    children: [
      // Área Cliente
      {
        element: <RoleGuard allowedRoles={['CLIENT']} fallback="/admin/dashboard" />,
        children: [
          { path: '/client/dashboard', element: <ClientDashboard /> },
          { path: '/client/barbers', element: <ClientBarbers /> }, // ← NUEVO
          { path: '/client/booking', element: <ClientBooking /> },
          { path: '/client/appointments', element: <ClientAppointments /> },
          { path: '/client/profile', element: <ClientProfile /> },
        ],
      },

      // Área Barbero/Admin
      {
        element: <RoleGuard allowedRoles={['BARBER', 'SUPER_ADMIN']} fallback="/client/dashboard" />,
        children: [
          { path: '/admin/dashboard', element: <AdminDashboard /> },
          { path: '/admin/services', element: <AdminServices /> }, // ← NUEVO AdminSchedule Appointments
          { path: '/admin/schedule', element: <AdminSchedule /> },
          { path: '/admin/appointments', element: <Appointments /> },
          { path: '/admin/profile', element: <BarberProfile /> }

        ],
      },
    ],
  },

  // 404
  { path: '*', element: <div className="p-8 text-center">Página no encontrada</div> },
]);

export const AppRouter = () => <RouterProvider router={router} />;