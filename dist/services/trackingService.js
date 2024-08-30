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
const client_1 = require("@prisma/client");
const calculateDistance_1 = require("../utils/calculateDistance");
const prisma = new client_1.PrismaClient();
function trackDriver(driverId, latitude, longitude) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if the driver exists
            const driver = yield prisma.driver.findUnique({
                where: { id: driverId },
            });
            if (!driver) {
                throw new Error('Driver not found');
            }
            // Update driver location
            return yield prisma.driver.update({
                where: { id: driverId },
                data: { latitude, longitude },
            });
        }
        catch (error) {
            throw new Error(error.message || 'An error occurred while updating driver location');
        }
    });
}
exports.trackDriver = trackDriver;
function trackRider(riderId, latitude, longitude) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if the rider exists
            const rider = yield prisma.user.findUnique({
                where: { id: riderId },
            });
            if (!rider) {
                throw new Error('Rider not found');
            }
            // Update rider location
            return yield prisma.user.update({
                where: { id: riderId },
                data: { latitude, longitude },
            });
        }
        catch (error) {
            throw new Error(error.message || 'An error occurred while updating rider location');
        }
    });
}
exports.trackRider = trackRider;
function calculateETA(pickupLat, pickupLong, dropoffLat, dropoffLong) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const distance = calculateDistance_1.calculateDistance(pickupLat, pickupLong, dropoffLat, dropoffLong);
            const averageSpeed = 50; // Average speed in km/h
            return Math.ceil((distance / averageSpeed) * 60); // ETA in minutes
        }
        catch (error) {
            throw new Error('An error occurred while calculating ETA');
        }
    });
}
exports.calculateETA = calculateETA;
