/// <reference types="qs" />
import { Request, Response } from 'express';
interface User {
    id: number;
}
interface AuthenticatedRequest extends Request {
    user?: User;
}
export declare const submitRating: (req: AuthenticatedRequest, res: Response<any, Record<string, any>>) => Promise<any>;
export declare const getRatings: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>) => Promise<any>;
export {};
