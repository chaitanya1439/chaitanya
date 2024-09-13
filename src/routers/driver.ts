import { Router, Request, Response } from 'express';
import { registerDriver, getDriver } from '../controller/driverController';
import { body, param, validationResult } from 'express-validator';

const router = Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('vehicle').notEmpty().withMessage('Vehicle is required'),
    body('licenseNumber').isLength({ min: 5 }).withMessage('License number must be at least 5 characters long'),
    body('workerId').notEmpty().withMessage('Worker ID is required'),
    body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a valid number between -90 and 90'),
    body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a valid number between -180 and 180'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, vehicle, licenseNumber, workerId, latitude, longitude } = req.body;
      // Pass the latitude and longitude as optional fields
      const driver = await registerDriver({ name, vehicle, licenseNumber, latitude, longitude }, workerId);
      return res.status(201).json(driver);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  }
);

router.get(
  '/:id',
  param('id').isUUID().withMessage('Invalid driver ID'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const driverId = req.params.id;
      const driver = await getDriver(driverId);
      return res.status(200).json(driver);
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  }
);

export default router;
