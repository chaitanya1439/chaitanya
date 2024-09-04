import { Request, Response } from 'express';
interface User {
    id: number;
}
interface AuthenticatedRequest extends Request {
    user?: User;
}
export declare const submitRating: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getRatings: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
