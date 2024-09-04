import { Request, Response } from 'express';
export declare const getFeedbacks: (res: Response) => Promise<Response>;
export declare const createFeedback: (req: Request, res: Response) => Promise<Response>;
