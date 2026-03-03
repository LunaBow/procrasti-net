import type { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: {
        id: number;
    };
}
export declare class AuthController {
    register(req: AuthRequest, res: Response): Promise<void>;
    login(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCurrentUser(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare class SkillController {
    getAll(req: Request, res: Response): Promise<void>;
    getOne(req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}
export declare class TodoController {
    getAll(req: AuthRequest, res: Response): Promise<void>;
    getOne(req: AuthRequest, res: Response): Promise<void>;
    create(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    delete(req: AuthRequest, res: Response): Promise<void>;
}
export declare class RoutineController {
    getAll(req: AuthRequest, res: Response): Promise<void>;
    getOne(req: AuthRequest, res: Response): Promise<void>;
    create(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    delete(req: AuthRequest, res: Response): Promise<void>;
    complete(req: AuthRequest, res: Response): Promise<void>;
}
export declare class CheckinController {
    getAll(req: AuthRequest, res: Response): Promise<void>;
    getOne(req: AuthRequest, res: Response): Promise<void>;
    create(req: AuthRequest, res: Response): Promise<void>;
    delete(req: AuthRequest, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=index.d.ts.map