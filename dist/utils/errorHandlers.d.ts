/// <reference types="qs" />
import { Request, Response } from 'express';
interface CustomError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare const handleValidationErrors: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>) => boolean;
export declare const handleErrorResponse: (res: Response<any, Record<string, any>>, error: CustomError) => Response<any, Record<string, any>>;
export {};
