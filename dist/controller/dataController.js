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
const prisma = new client_1.PrismaClient();
exports.logRide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { riderId, driverId, pickupLat, pickupLong, dropoffLat, dropoffLong, status, estimatedTime } = req.body;
    try {
        const ride = yield prisma.ride.create({
            data: {
                riderId: riderId,
                driverId: (driverId),
                pickupLat,
                pickupLong,
                dropoffLat,
                dropoffLong,
                status,
                estimatedTime,
            },
        });
        res.status(201).json(ride);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.logUserBehavior = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, action } = req.body;
    try {
        const behavior = yield prisma.userBehavior.create({
            data: {
                userId: Number(userId),
                action,
            },
        });
        res.status(201).json(behavior);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.logDriverPerformance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { driverId, rating, completedRides, feedback } = req.body;
    try {
        const performance = yield prisma.driverPerformance.create({
            data: {
                driverId: (driverId),
                rating,
                completedRides,
                feedback,
            },
        });
        res.status(201).json(performance);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
