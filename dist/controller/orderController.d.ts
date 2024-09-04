import { Request, Response } from 'express';
export declare const createOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const cancelOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
