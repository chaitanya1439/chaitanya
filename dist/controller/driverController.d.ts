import { z } from 'zod';
declare const driverSchema: z.ZodObject<{
    name: z.ZodString;
    vehicle: z.ZodString;
    licenseNumber: z.ZodString;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    vehicle: string;
    licenseNumber: string;
    latitude?: number | undefined;
    longitude?: number | undefined;
}, {
    name: string;
    vehicle: string;
    licenseNumber: string;
    latitude?: number | undefined;
    longitude?: number | undefined;
}>;
type RegisterDriverData = z.infer<typeof driverSchema>;
export declare const registerDriver: (data: RegisterDriverData, workerId: string) => Promise<{
    id: string;
    workerId: string;
    name: string;
    vehicle: string;
    latitude: number | null;
    longitude: number | null;
    licenseNumber: string;
}>;
export declare const getDriver: (id: string) => Promise<{
    id: string;
    workerId: string;
    name: string;
    vehicle: string;
    latitude: number | null;
    longitude: number | null;
    licenseNumber: string;
}>;
export {};
