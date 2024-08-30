import { Router } from 'express';
import { createBooking } from '../controller/bookingFareController';

const router = Router();

router.post('/bookings', createBooking);

export default router;
