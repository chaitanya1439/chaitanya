/// <reference types="qs" />
import { Request, Response } from 'express';
export declare const getFacilities: (res: Response<any, Record<string, any>>) => Promise<Response<any, Record<string, any>>>;
export declare const updateFacility: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>) => Promise<Response<any, Record<string, any>>>;
