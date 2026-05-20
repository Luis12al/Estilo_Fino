import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
export declare const restrictTo: (...roles: UserRole[]) => (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=role.middleware.d.ts.map