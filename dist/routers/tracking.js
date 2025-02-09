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
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const trackingController_1 = require("../controller/trackingController");
const validateRequest_1 = __importDefault(require("../utils/validateRequest"));
// Initialize router
const router = (0, express_1.Router)();
// Route to track driver location
router.put('/driver/:id/location', [
    (0, express_validator_1.param)('id').isUUID().withMessage('Invalid driver ID'),
    (0, express_validator_1.body)('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    (0, express_validator_1.body)('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180')
], validateRequest_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, trackingController_1.trackDriverLocation)(req, res, next);
    }
    catch (error) {
        next(error); // Pass the error to the global error handler
    }
}));
// Route to track rider location
router.put('/rider/:id/location', [
    (0, express_validator_1.param)('id').isInt().withMessage('Rider ID must be an integer'),
    (0, express_validator_1.body)('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    (0, express_validator_1.body)('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180')
], validateRequest_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, trackingController_1.trackRiderLocation)(req, res, next);
    }
    catch (error) {
        next(error); // Pass the error to the global error handler
    }
}));
// Route to get ETA (Estimated Time of Arrival) between two locations
router.post('/eta', [
    (0, express_validator_1.body)('pickupLat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Pickup latitude must be between -90 and 90'),
    (0, express_validator_1.body)('pickupLong')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Pickup longitude must be between -180 and 180'),
    (0, express_validator_1.body)('dropoffLat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Dropoff latitude must be between -90 and 90'),
    (0, express_validator_1.body)('dropoffLong')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Dropoff longitude must be between -180 and 180')
], validateRequest_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, trackingController_1.getETA)(req, res, next);
    }
    catch (error) {
        next(error); // Pass the error to the global error handler
    }
}));
exports.default = router;
