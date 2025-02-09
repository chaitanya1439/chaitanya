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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getETA = exports.calculateETA = exports.trackRider = exports.trackDriver = void 0;
const client_1 = require("@prisma/client");
const calculateDistance_1 = require("../utils/calculateDistance");
const prisma = new client_1.PrismaClient();
// Track driver location and update in the database
const trackDriver = (driverId, latitude, longitude) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if the driver exists
        const driver = yield prisma.driver.findUnique({
            where: { id: driverId },
        });
        if (!driver) {
            throw new Error('Driver not found');
        }
        // Update driver location in the database
        const updatedDriver = yield prisma.driver.update({
            where: { id: driverId },
            data: { latitude, longitude },
        });
        return updatedDriver;
    }
    catch (error) {
        // Improved error handling
        console.error('Error updating driver location:', error);
        throw new Error(error instanceof Error ? error.message : 'An unknown error occurred while updating driver location');
    }
});
exports.trackDriver = trackDriver;
// Track rider location and update in the database
const trackRider = (riderId, latitude, longitude) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if the rider exists
        const rider = yield prisma.user.findUnique({
            where: { id: riderId },
        });
        if (!rider) {
            throw new Error('Rider not found');
        }
        // Update rider location in the database
        const updatedRider = yield prisma.user.update({
            where: { id: riderId },
            data: { latitude, longitude },
        });
        return updatedRider;
    }
    catch (error) {
        // Improved error handling
        console.error('Error updating rider location:', error);
        throw new Error(error instanceof Error ? error.message : 'An unknown error occurred while updating rider location');
    }
});
exports.trackRider = trackRider;
// Calculate ETA based on distance and average speed
const calculateETA = (pickupLat, pickupLong, dropoffLat, dropoffLong) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const distance = (0, calculateDistance_1.calculateDistance)(pickupLat, pickupLong, dropoffLat, dropoffLong);
        const averageSpeed = 50; // Assume an average speed in km/h
        const etaInMinutes = Math.ceil((distance / averageSpeed) * 60); // ETA in minutes
        return etaInMinutes;
    }
    catch (error) {
        // Improved error handling
        console.error('Error calculating ETA:', error);
        throw new Error(error instanceof Error ? 'Error calculating ETA: ' + error.message : 'An unknown error occurred while calculating ETA');
    }
});
exports.calculateETA = calculateETA;
// Get ETA from Google Maps API
const getETA = (pickupLat, pickupLong, dropoffLat, dropoffLong) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const etaInMinutes = yield (0, calculateDistance_1.getETAFromGoogle)(pickupLat, pickupLong, dropoffLat, dropoffLong);
        return etaInMinutes;
    }
    catch (error) {
        // Improved error handling
        console.error('Error fetching ETA from Google Maps API:', error);
        throw new Error(error instanceof Error ? 'Error fetching ETA from Google Maps API: ' + error.message : 'An unknown error occurred while fetching ETA from Google Maps API');
    }
});
exports.getETA = getETA;
