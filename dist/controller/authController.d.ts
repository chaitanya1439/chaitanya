/// <reference types="qs" />
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/authenticatedRequest';
export declare const register: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>) => Promise<any>;
export declare const login: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>) => Promise<any>;
export declare const logout: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>) => Promise<any>;
export declare const getUserProfile: (req: AuthenticatedRequest, res: Response<any, Record<string, any>>) => Promise<any>;
export declare const updateUserProfile: (req: AuthenticatedRequest, res: Response<any, Record<string, any>>) => Promise<any>;
