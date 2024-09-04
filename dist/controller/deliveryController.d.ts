import { Request, Response } from 'express';
export declare const assignDelivery: (req: Request, res: Response) => Promise<void>;
export declare const updateDeliveryStatus: (req: Request, res: Response) => Promise<void>;
export declare const getDeliveries: (req: Request, res: Response) => Promise<void>;
