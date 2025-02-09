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
const bookingrideController_1 = require("../controller/bookingrideController");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.post('/create', [
    (0, express_validator_1.check)('userId').isUUID(),
    (0, express_validator_1.check)('driverId').isUUID(),
    (0, express_validator_1.check)('pickupLocation').notEmpty(),
    (0, express_validator_1.check)('dropoffLocation').notEmpty(),
    (0, express_validator_1.check)('status').isIn(['PENDING', 'ONGOING', 'COMPLETED']),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const booking = yield (0, bookingrideController_1.createBooking)(req.body);
        return res.status(201).json(booking); // Add 'return' here
    }
    catch (error) {
        return res.status(400).json({ message: error.message }); // Ensure 'return' is used
    }
}));
router.get('/:id', (0, express_validator_1.param)('id').isInt(), // Ensure that the id is an integer
(req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const bookingId = parseInt(req.params.id, 10); // Convert id from string to number
        const booking = yield (0, bookingrideController_1.getBooking)(bookingId);
        return res.status(200).json(booking); // Add 'return' here
    }
    catch (error) {
        return res.status(400).json({ message: error.message }); // Ensure 'return' is used
    }
}));
