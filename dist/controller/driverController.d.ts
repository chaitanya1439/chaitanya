export declare const registerDriver: (data: {
    name: string;
    vehicle: string;
    licenseNumber: string;
    latitude?: number | undefined;
    longitude?: number | undefined;
}, workerId: string) => Promise<any>;
export declare const getDriver: (id: string) => Promise<any>;
