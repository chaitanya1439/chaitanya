/// <reference types="qs" />
import { Request, Response } from 'express';
interface GetRatingsRequestParams {
    userId: string;
}
interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
    };
}
export declare const submitRating: (req: AuthenticatedRequest, res: Response<any, Record<string, any>>) => Promise<void>;
export declare const getRatings: (req: Request<GetRatingsRequestParams, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>) => Promise<void>;
export {};
