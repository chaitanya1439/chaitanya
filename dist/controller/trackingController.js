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
const express_validator_1 = require("express-validator");
const trackingService_1 = require("../services/trackingService");
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = new google_maps_services_js_1.Client({});
// Track driver location
exports.trackDriverLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { latitude, longitude } = req.body;
        const driverId = req.params.id; // Keep id as a string
        const driver = yield trackingService_1.trackDriver(driverId, latitude, longitude);
        return res.status(200).json(driver);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
// Track rider location
exports.trackRiderLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { latitude, longitude } = req.body;
        const riderId = parseInt(req.params.id, 10); // Convert id to number
        if (isNaN(riderId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        const rider = yield trackingService_1.trackRider(riderId, latitude, longitude);
        return res.status(200).json(rider);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
// Get ETA (Estimated Time of Arrival) using Google Distance Matrix API
exports.getEstimatedETA = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { pickupLat, pickupLong, dropoffLat, dropoffLong } = req.body;
        // Retrieve the Google API key
        const googleApiKey = process.env.GOOGLE_KEY;
        if (!googleApiKey) {
            return res.status(500).json({ message: 'Google API key not set' });
        }
        // Call Google Distance Matrix API
        const response = yield client.distancematrix({
            params: {
                origins: [{ lat: pickupLat, lng: pickupLong }],
                destinations: [{ lat: dropoffLat, lng: dropoffLong }],
                key: googleApiKey,
            },
        });
        // Check if the response is OK and extract the duration (in seconds)
        if (response.data.rows[0].elements[0].status === 'OK') {
            const duration = response.data.rows[0].elements[0].duration.value; // Duration in seconds
            return res.status(200).json({ eta: duration });
        }
        else {
            throw new Error('Unable to calculate ETA');
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
