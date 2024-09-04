export declare function trackDriver(driverId: string, latitude: number, longitude: number): Promise<{
    id: string;
    workerId: string;
    name: string;
    vehicle: string;
    latitude: number | null;
    longitude: number | null;
    licenseNumber: string;
}>;
export declare function trackRider(riderId: number, latitude: number, longitude: number): Promise<{
    id: number;
    email: string;
    password: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
    latitude: number | null;
    longitude: number | null;
}>;
export declare function calculateETA(pickupLat: number, pickupLong: number, dropoffLat: number, dropoffLong: number): Promise<number>;
