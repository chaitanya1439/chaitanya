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
const express_validator_1 = require("express-validator");
const dataController_1 = require("../controller/dataController");
const router = express_1.Router();
// Log ride data
router.post('/rides', [
    express_validator_1.body('userId').isInt(),
    express_validator_1.body('driverId').isInt(),
    express_validator_1.body('startTime').isISO8601(),
    express_validator_1.body('endTime').isISO8601(),
    express_validator_1.body('distance').isFloat(),
    express_validator_1.body('fare').isFloat(),
    express_validator_1.body('status').isString(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        yield dataController_1.logRide(req, res);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Log user behavior
router.post('/user-behavior', [
    express_validator_1.body('userId').isInt(),
    express_validator_1.body('action').isString(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        yield dataController_1.logUserBehavior(req, res);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Log driver performance
router.post('/driver-performance', [
    express_validator_1.body('driverId').isInt(),
    express_validator_1.body('rating').isFloat({ min: 0, max: 5 }),
    express_validator_1.body('completedRides').isInt(),
    express_validator_1.body('feedback').optional().isString(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        yield dataController_1.logDriverPerformance(req, res);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
