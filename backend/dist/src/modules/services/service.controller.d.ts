import { Request, Response, NextFunction } from 'express';
export declare class ServiceController {
    getAll(_req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllAdmin(_req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    hardDelete(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    reactivate(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const serviceController: ServiceController;
//# sourceMappingURL=service.controller.d.ts.map