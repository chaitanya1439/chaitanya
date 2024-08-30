import { Router, Request, Response } from 'express';
import { registerDriver, getDriver } from '../controller/driverController';
import { body, param, validationResult } from 'express-validator';

const router = Router();

router.post(
  '/register',
  [
    body('name').notEmpty(),
    body('vehicle').notEmpty(),
    body('licenseNumber').isLength({ min: 5 }),
    body('workerId').notEmpty() // Validate workerId
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const workerId = req.body.workerId; // Get workerId from req.body
      const driver = await registerDriver(req.body, workerId); // Pass workerId
      return res.status(201).json(driver); // Explicitly return after sending the response
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message }); // Explicitly return after sending the response
    }
  }
);

router.get(
  '/:id',
  param('id').isUUID(), // Validate ID as UUID
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const driverId = req.params.id; // Use ID as a string
      const driver = await getDriver(driverId); // Pass the ID as a string
      return res.status(200).json(driver); // Explicitly return after sending the response
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  }
);

export default router;
