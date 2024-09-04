import { z } from 'zod';
declare const bookingSchema: z.ZodObject<{
    userId: z.ZodNumber;
    roomId: z.ZodNumber;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    roomId: number;
    startDate: Date;
    endDate: Date;
    userId: number;
}, {
    roomId: number;
    startDate: Date;
    endDate: Date;
    userId: number;
}>;
type BookingData = z.infer<typeof bookingSchema>;
export declare const createBooking: (data: BookingData) => Promise<{
    id: number;
    userId: number;
    roomId: number;
    startDate: Date;
    endDate: Date;
}>;
export declare const getBooking: (id: number) => Promise<{
    id: number;
    userId: number;
    roomId: number;
    startDate: Date;
    endDate: Date;
}>;
export {};
