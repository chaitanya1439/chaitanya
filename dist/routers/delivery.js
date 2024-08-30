"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const deliveryController_1 = require("../controller/deliveryController");
const authenticate_1 = require("../middleware/authenticate");
const router = express_1.default.Router();
router.post('/assign', authenticate_1.authenticate, deliveryController_1.assignDelivery);
router.put('/update-status', authenticate_1.authenticate, deliveryController_1.updateDeliveryStatus);
router.get('/deliveries', authenticate_1.authenticate, deliveryController_1.getDeliveries);
exports.default = router;
