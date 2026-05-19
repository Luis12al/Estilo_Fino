import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@config/env';
import { errorHandler } from '@shared/middlewares/error.middleware';
import authRoutes from '@modules/auth/auth.routes';
import userRoutes from '@modules/users/user.routes';
import serviceRoutes from '@modules/services/service.routes';
import barberRoutes from '@modules/barbers/barber.routes';
import appointmentRoutes from '@modules/appointments/appointment.routes';
import offerRoutes from '@modules/offers/offers.routes';

const app = express();

// ← FIX: Orígenes permitidos (local + producción)
const allowedOrigins = [
  env.CLIENT_URL,                          // Desde .env (localhost o producción)
  'http://localhost:5173',                 // Vite dev server
  'http://localhost:3000',                 // Alternativo local
  'https://estilo-fino-web.onrender.com',  // Producción Render (fallback)
];

app.use(helmet());

// ← FIX: CORS dinámico con múltiples orígenes
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (Postman, server-to-server, curl)
      if (!origin) return callback(null, true);
      
      // Permitir si está en la lista
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // En desarrollo, permitir cualquier localhost
      if (env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      
      // Log para debug
      console.warn(`⚠️ CORS bloqueado para origen: ${origin}`);
      callback(new Error(`No autorizado por CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ← FIX: Manejo explícito de OPTIONS (preflight)
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/offers', offerRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler (siempre último)
app.use(errorHandler);

export default app;