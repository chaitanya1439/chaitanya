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
exports.getETA = exports.trackRiderLocation = exports.trackDriverLocation = void 0;
const trackingService_1 = require("../services/trackingService");
const errorHandlers_1 = require("../utils/errorHandlers");
// Track driver location
const trackDriverLocation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(0, errorHandlers_1.handleValidationErrors)(req, res))
        return;
    try {
        const { latitude, longitude } = req.body;
        const driverId = req.params.id;
        // Validate latitude and longitude
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            res.status(400).json({ message: 'Invalid latitude or longitude format' });
            return;
        }
        const driver = yield (0, trackingService_1.trackDriver)(driverId, latitude, longitude);
        res.status(200).json(driver);
    }
    catch (error) {
        next(error); // Pass error to the error-handling middleware
    }
});
exports.trackDriverLocation = trackDriverLocation;
// Track rider location
const trackRiderLocation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(0, errorHandlers_1.handleValidationErrors)(req, res))
        return;
    try {
        const { latitude, longitude } = req.body;
        const riderId = parseInt(req.params.id, 10);
        // Validate rider ID and coordinates
        if (isNaN(riderId)) {
            res.status(400).json({ message: 'Invalid rider ID format' });
            return;
        }
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            res.status(400).json({ message: 'Invalid latitude or longitude format' });
            return;
        }
        const rider = yield (0, trackingService_1.trackRider)(riderId, latitude, longitude);
        res.status(200).json(rider);
    }
    catch (error) {
        next(error); // Pass error to the error-handling middleware
    }
});
exports.trackRiderLocation = trackRiderLocation;
// Get ETA
const getETA = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(0, errorHandlers_1.handleValidationErrors)(req, res))
        return;
    try {
        const { pickupLat, pickupLong, dropoffLat, dropoffLong } = req.body;
        // Validate coordinates
        if (typeof pickupLat !== 'number' || typeof pickupLong !== 'number' ||
            typeof dropoffLat !== 'number' || typeof dropoffLong !== 'number') {
            res.status(400).json({ message: 'Invalid coordinate format' });
            return;
        }
        const eta = yield (0, trackingService_1.getETA)(pickupLat, pickupLong, dropoffLat, dropoffLong);
        res.status(200).json({ eta });
    }
    catch (error) {
        next(error); // Pass error to the error-handling middleware
    }
});
exports.getETA = getETA;
