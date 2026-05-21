"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./shared/middlewares/error.middleware");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const service_routes_1 = __importDefault(require("./modules/services/service.routes"));
const barber_routes_1 = __importDefault(require("./modules/barbers/barber.routes"));
const appointment_routes_1 = __importDefault(require("./modules/appointments/appointment.routes"));
const offers_routes_1 = __importDefault(require("./modules/offers/offers.routes"));
const app = (0, express_1.default)();
// ← FIX: Orígenes permitidos (local + producción)
const allowedOrigins = [
    env_1.env.CLIENT_URL, // Desde .env (localhost o producción)
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Alternativo local
    'https://estilo-fino-web.onrender.com', // Producción Render (fallback)
];
app.use((0, helmet_1.default)());
// ← FIX: CORS dinámico con múltiples orígenes
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permitir requests sin origin (Postman, server-to-server, curl)
        if (!origin)
            return callback(null, true);
        // Permitir si está en la lista
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // En desarrollo, permitir cualquier localhost
        if (env_1.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
            return callback(null, true);
        }
        // Log para debug
        console.warn(`⚠️ CORS bloqueado para origen: ${origin}`);
        callback(new Error(`No autorizado por CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
// ← FIX: Manejo explícito de OPTIONS (preflight)
app.options('*', (0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: env_1.env.NODE_ENV,
    });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/services', service_routes_1.default);
app.use('/api/barbers', barber_routes_1.default);
app.use('/api/appointments', appointment_routes_1.default);
app.use('/api/offers', offers_routes_1.default);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});
// Error handler (siempre último)
app.use(error_middleware_1.errorHandler);
exports.default = app;
