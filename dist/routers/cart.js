"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cartController_1 = require("../controller/cartController");
const router = (0, express_1.Router)();
// Middleware to check authentication (if needed)
// Example: router.use(authMiddleware);
// Route to add items to the cart
router.post('/add', cartController_1.addToCart);
// Route to remove items from the cart
router.post('/remove', cartController_1.removeFromCart);
// Route to get the current cart
router.get('/', cartController_1.getCart);
// Route to checkout the cart
router.post('/checkout', cartController_1.checkoutCart);
exports.default = router;
