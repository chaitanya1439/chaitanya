import express from 'express';
import { createOrder, updateOrder, cancelOrder } from '../controller/orderController';
import { authenticate } from '../middleware/authenticate';

const router = express.Router();

router.post('/create', authenticate, createOrder);
router.put('/update', authenticate, updateOrder);
router.put('/cancel', authenticate, cancelOrder);

export default router;
