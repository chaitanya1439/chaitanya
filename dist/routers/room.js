"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roomController_1 = require("../controller/roomController");
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
// Get all rooms
router.get('/rooms', roomController_1.getRooms);
// Update room information (authentication required)
router.put('/room/:id', passport_1.default.authenticate('jwt', { session: false }), roomController_1.updateRoom);
exports.default = router;
