/// <reference types="qs" />
import { Request, Response } from 'express';
export declare const getRooms: (res: Response<any, Record<string, any>>) => Promise<Response<any, Record<string, any>>>;
export declare const updateRoom: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>) => Promise<Response<any, Record<string, any>>>;
