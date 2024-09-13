export declare const createBooking: (data: {
    roomId: number;
    startDate: Date;
    endDate: Date;
    userId: number;
}) => Promise<any>;
export declare const getBooking: (id: number) => Promise<any>;
