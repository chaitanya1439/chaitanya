import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import {
  trackDriverLocation,
  trackRiderLocation,
  getETA
} from '../controller/trackingController';
import validateRequest from '../utils/validateRequest'; 

// Initialize router
const router = Router();



// Route to track driver location
router.put(
  '/driver/:id/location',
  [
    param('id').isUUID().withMessage('Invalid driver ID'),
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180')
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await trackDriverLocation(req, res, next);
    } catch (error) {
      next(error); // Pass the error to the global error handler
    }
  }
);

// Route to track rider location
router.put(
  '/rider/:id/location',
  [
    param('id').isInt().withMessage('Rider ID must be an integer'),
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180')
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await trackRiderLocation(req, res, next);
    } catch (error) {
      next(error); // Pass the error to the global error handler
    }
  }
);

// Route to get ETA (Estimated Time of Arrival) between two locations
router.post(
  '/eta',
  [
    body('pickupLat')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Pickup latitude must be between -90 and 90'),
    body('pickupLong')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Pickup longitude must be between -180 and 180'),
    body('dropoffLat')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Dropoff latitude must be between -90 and 90'),
    body('dropoffLong')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Dropoff longitude must be between -180 and 180')
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getETA(req, res, next);
    } catch (error) {
      next(error); // Pass the error to the global error handler
    }
  }
);

export default router;
