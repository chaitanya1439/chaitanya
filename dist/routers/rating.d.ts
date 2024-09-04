import { Request, Response } from 'express';
interface GetRatingsRequestParams {
    userId: string;
}
interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
    };
}
export declare const submitRating: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getRatings: (req: Request<GetRatingsRequestParams>, res: Response) => Promise<void>;
export {};
