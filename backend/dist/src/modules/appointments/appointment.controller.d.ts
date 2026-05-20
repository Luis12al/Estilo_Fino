import { Request, Response, NextFunction } from 'express';
export declare class AppointmentController {
    /**
     * GET /api/appointments/availability?barberId=X&date=Y&durationMinutes=Z
     */
    getAvailability(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/appointments
     */
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/appointments/my
     */
    getMyAppointments(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMyBarberAppointments(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/appointments/barber/:id
     */
    getBarberAppointments(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/appointments/:id/extend
     * Extender cita +20min
     */
    extend(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/appointments/barber/stats
     * Estadísticas del día
     */
    getTodayStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
    * GET /api/appointments/barber/all
    * Todas las citas del barbero (sin filtro de fecha)
    */
    getAllMyAppointments(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/appointments/barber/create-for-client
     * Barbero agenda cita para un cliente
     */
    createForClient(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
    * POST /api/appointments/barber/quick-book
    * Barbero agenda cita para cliente no registrado (walk-in)
    */
    createManual(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const appointmentController: AppointmentController;
//# sourceMappingURL=appointment.controller.d.ts.map