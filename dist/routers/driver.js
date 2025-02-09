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
const express_1 = require("express");
const driverController_1 = require("../controller/driverController");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.post('/register', [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('vehicle').notEmpty().withMessage('Vehicle is required'),
    (0, express_validator_1.body)('licenseNumber').isLength({ min: 5 }).withMessage('License number must be at least 5 characters long'),
    (0, express_validator_1.body)('workerId').notEmpty().withMessage('Worker ID is required'),
    (0, express_validator_1.body)('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a valid number between -90 and 90'),
    (0, express_validator_1.body)('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a valid number between -180 and 180'),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { name, vehicle, licenseNumber, workerId, latitude, longitude } = req.body;
        // Pass the latitude and longitude as optional fields
        const driver = yield (0, driverController_1.registerDriver)({ name, vehicle, licenseNumber, latitude, longitude }, workerId);
        return res.status(201).json(driver);
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
}));
router.get('/:id', (0, express_validator_1.param)('id').isUUID().withMessage('Invalid driver ID'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const driverId = req.params.id;
        const driver = yield (0, driverController_1.getDriver)(driverId);
        return res.status(200).json(driver);
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
}));
exports.default = router;
