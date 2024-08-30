"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const facilityController_1 = require("../controller/facilityController");
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
// Get all facilities
router.get('/facilities', facilityController_1.getFacilities);
// Update facility information (authentication required)
router.put('/facility/:id', passport_1.default.authenticate('jwt', { session: false }), facilityController_1.updateFacility);
exports.default = router;
