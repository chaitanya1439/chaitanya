import { Request, Response, NextFunction } from 'express';
export declare function getSignedUrl(req: Request, res: Response): Promise<void>;
export declare const uploadFile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const downloadFile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteFile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
