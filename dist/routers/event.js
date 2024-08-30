"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const eventController_1 = require("../controller/eventController");
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
// Get all events
router.get('/events', eventController_1.getEvents);
// Update event information (authentication required)
router.put('/event/:id', passport_1.default.authenticate('jwt', { session: false }), eventController_1.updateEvent);
exports.default = router;
