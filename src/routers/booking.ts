import { Router } from 'express';
import { getAvailableRooms, bookRoom, cancelBooking } from '../controller/bookingController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/available-rooms', authenticate, getAvailableRooms);
router.post('/book-room', authenticate, bookRoom);
router.post('/cancel-booking', authenticate, cancelBooking);

export default router;
