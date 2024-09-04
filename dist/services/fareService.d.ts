interface CalculateFareParams {
    distance: number;
    demand?: number;
    surgeFactor: number;
}
export declare function calculateFare(params: CalculateFareParams): Promise<number>;
export {};
