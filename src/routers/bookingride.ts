import { Request, Response,Router } from 'express'
import { createBooking, getBooking } from '../controller/bookingrideController';
import { check, param, validationResult } from 'express-validator';

const router = Router();

router.post(
  '/create',
  [
    check('userId').isUUID(),
    check('driverId').isUUID(),
    check('pickupLocation').notEmpty(),
    check('dropoffLocation').notEmpty(),
    check('status').isIn(['PENDING', 'ONGOING', 'COMPLETED']),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const booking = await createBooking(req.body);
      return res.status(201).json(booking);  // Add 'return' here
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });  // Ensure 'return' is used
    }
  }
);


router.get(
  '/:id',
  param('id').isInt(), // Ensure that the id is an integer
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const bookingId = parseInt((req.params as { id: string }).id, 10); // Convert id from string to number
      const booking = await getBooking(bookingId);
      return res.status(200).json(booking);  // Add 'return' here
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });  // Ensure 'return' is used
    }
  }
);
