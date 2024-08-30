"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controller/orderController");
const authenticate_1 = require("../middleware/authenticate");
const router = express_1.default.Router();
router.post('/create', authenticate_1.authenticate, orderController_1.createOrder);
router.put('/update', authenticate_1.authenticate, orderController_1.updateOrder);
router.put('/cancel', authenticate_1.authenticate, orderController_1.cancelOrder);
exports.default = router;
