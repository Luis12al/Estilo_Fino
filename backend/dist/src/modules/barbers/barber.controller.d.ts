import { Request, Response, NextFunction } from 'express';
export declare class BarberController {
    getAll(_req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateSchedule(req: Request, res: Response, next: NextFunction): Promise<void>;
    createBreak(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteBreak(req: Request, res: Response, next: NextFunction): Promise<void>;
    createDayOff(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteDayOff(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateMyProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMyStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const barberController: BarberController;
//# sourceMappingURL=barber.controller.d.ts.map