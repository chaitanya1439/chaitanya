import express from 'express';
import { assignDelivery, updateDeliveryStatus, getDeliveries } from '../controller/deliveryController';
import { authenticate } from '../middleware/authenticate';

const router = express.Router();

router.post('/assign', authenticate, assignDelivery);
router.put('/update-status', authenticate, updateDeliveryStatus);
router.get('/deliveries', authenticate, getDeliveries);

export default router;
