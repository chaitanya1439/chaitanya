"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistance = exports.getETAFromGoogle = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const GOOGLE_API_KEY = process.env.GOOGLE_KEY;
if (!GOOGLE_API_KEY) {
    throw new Error('Google API key is not set');
}
const getETAFromGoogle = (pickupLat, pickupLong, dropoffLat, dropoffLong) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const response = yield axios_1.default.get(`https://maps.googleapis.com/maps/api/distancematrix/json`, {
            params: {
                origins: `${pickupLat},${pickupLong}`,
                destinations: `${dropoffLat},${dropoffLong}`,
                key: GOOGLE_API_KEY,
            },
        });
        const element = (_a = response.data.rows[0]) === null || _a === void 0 ? void 0 : _a.elements[0];
        if ((element === null || element === void 0 ? void 0 : element.status) === 'OK') {
            const durationInSeconds = element.duration.value; // Duration in seconds
            const durationInMinutes = Math.ceil(durationInSeconds / 60); // Convert to minutes
            return durationInMinutes;
        }
        else {
            throw new Error(`API Error: ${(element === null || element === void 0 ? void 0 : element.status) || 'Unknown status'}`);
        }
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error('Error fetching ETA from Google Maps API:', error.message);
        }
        else if (error instanceof Error) {
            console.error('Error:', error.message);
        }
        else {
            console.error('Unexpected error:', error);
        }
        throw new Error('Error fetching ETA from Google Maps API');
    }
});
exports.getETAFromGoogle = getETAFromGoogle;
// Helper function to calculate distance in kilometers between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    // Validate input values
    if (!isValidCoordinate(lat1) || !isValidCoordinate(lat2) || !isValidCoordinate(lon1) || !isValidCoordinate(lon2)) {
        throw new Error('Invalid coordinates');
    }
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}
exports.calculateDistance = calculateDistance;
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
function isValidCoordinate(coord) {
    return typeof coord === 'number' && coord >= -90 && coord <= 90;
}
