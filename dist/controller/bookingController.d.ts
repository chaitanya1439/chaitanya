import { Request, Response } from 'express';
export declare const getAvailableRooms: (req: Request, res: Response) => Promise<Response>;
export declare const bookRoom: (req: Request, res: Response) => Promise<Response>;
export declare const cancelBooking: (req: Request, res: Response) => Promise<Response>;
