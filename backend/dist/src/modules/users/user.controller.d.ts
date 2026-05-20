import { Request, Response, NextFunction } from 'express';
export declare class UserController {
    getMe(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateMe(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const userController: UserController;
//# sourceMappingURL=user.controller.d.ts.map