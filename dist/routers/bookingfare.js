"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingFareController_1 = require("../controller/bookingFareController");
const router = express_1.Router();
router.post('/bookings', bookingFareController_1.createBooking);
exports.default = router;
