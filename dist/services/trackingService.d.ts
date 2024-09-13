export declare const trackDriver: (driverId: string, latitude: number, longitude: number) => Promise<any>;
export declare const trackRider: (riderId: number, latitude: number, longitude: number) => Promise<any>;
export declare const calculateETA: (pickupLat: number, pickupLong: number, dropoffLat: number, dropoffLong: number) => Promise<number>;
export declare const getETA: (pickupLat: number, pickupLong: number, dropoffLat: number, dropoffLong: number) => Promise<number>;
