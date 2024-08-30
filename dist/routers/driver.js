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
const router = express_1.Router();
router.post('/register', [
    express_validator_1.body('name').notEmpty(),
    express_validator_1.body('vehicle').notEmpty(),
    express_validator_1.body('licenseNumber').isLength({ min: 5 }),
    express_validator_1.body('workerId').notEmpty() // Validate workerId
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const workerId = req.body.workerId; // Get workerId from req.body
        const driver = yield driverController_1.registerDriver(req.body, workerId); // Pass workerId
        return res.status(201).json(driver); // Explicitly return after sending the response
    }
    catch (error) {
        return res.status(400).json({ message: error.message }); // Explicitly return after sending the response
    }
}));
router.get('/:id', express_validator_1.param('id').isUUID(), // Validate ID as UUID
(req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const driverId = req.params.id; // Use ID as a string
        const driver = yield driverController_1.getDriver(driverId); // Pass the ID as a string
        return res.status(200).json(driver); // Explicitly return after sending the response
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
}));
exports.default = router;
