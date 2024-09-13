import { Router } from 'express';
import { addToCart, removeFromCart, getCart, checkoutCart } from '../controller/cartController';

const router = Router();

// Middleware to check authentication (if needed)
// Example: router.use(authMiddleware);

// Route to add items to the cart
router.post('/add', addToCart);

// Route to remove items from the cart
router.post('/remove', removeFromCart);

// Route to get the current cart
router.get('/', getCart);

// Route to checkout the cart
router.post('/checkout', checkoutCart);

export default router;
