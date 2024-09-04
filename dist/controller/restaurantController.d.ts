import { Request, Response } from 'express';
interface User {
    id: number;
}
interface AuthenticatedRequest extends Request {
    user?: User;
}
export declare const createRestaurant: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getRestaurants: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addMenuItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMenuItems: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
