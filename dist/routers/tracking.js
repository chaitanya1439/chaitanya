"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trackingController_1 = require("../controller/trackingController");
const express_validator_1 = require("express-validator");
const router = express_1.Router();
// Route to track driver location
router.post('/drivers/:id/location', [
    express_validator_1.param('id').isInt().withMessage('Driver ID must be an integer'),
    express_validator_1.body('latitude').isFloat().withMessage('Latitude must be a float'),
    express_validator_1.body('longitude').isFloat().withMessage('Longitude must be a float'),
], trackingController_1.trackDriverLocation);
// Route to track rider location
router.post('/riders/:id/location', [
    express_validator_1.param('id').isInt().withMessage('Rider ID must be an integer'),
    express_validator_1.body('latitude').isFloat().withMessage('Latitude must be a float'),
    express_validator_1.body('longitude').isFloat().withMessage('Longitude must be a float'),
], trackingController_1.trackRiderLocation);
// Route to get ETA between two locations
router.post('/eta', [
    express_validator_1.body('pickupLat').isFloat().withMessage('Pickup latitude must be a float'),
    express_validator_1.body('pickupLong').isFloat().withMessage('Pickup longitude must be a float'),
    express_validator_1.body('dropoffLat').isFloat().withMessage('Dropoff latitude must be a float'),
    express_validator_1.body('dropoffLong').isFloat().withMessage('Dropoff longitude must be a float'),
], trackingController_1.getEstimatedETA);
exports.default = router;
