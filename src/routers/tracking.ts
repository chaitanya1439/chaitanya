import { Router } from 'express';
import { trackDriverLocation, trackRiderLocation, getEstimatedETA } from '../controller/trackingController';
import { body, param } from 'express-validator';

const router = Router();

// Route to track driver location
router.post(
  '/drivers/:id/location',
  [
    param('id').isInt().withMessage('Driver ID must be an integer'),
    body('latitude').isFloat().withMessage('Latitude must be a float'),
    body('longitude').isFloat().withMessage('Longitude must be a float'),
  ],
  trackDriverLocation
);

// Route to track rider location
router.post(
  '/riders/:id/location',
  [
    param('id').isInt().withMessage('Rider ID must be an integer'),
    body('latitude').isFloat().withMessage('Latitude must be a float'),
    body('longitude').isFloat().withMessage('Longitude must be a float'),
  ],
  trackRiderLocation
);

// Route to get ETA between two locations
router.post(
  '/eta',
  [
    body('pickupLat').isFloat().withMessage('Pickup latitude must be a float'),
    body('pickupLong').isFloat().withMessage('Pickup longitude must be a float'),
    body('dropoffLat').isFloat().withMessage('Dropoff latitude must be a float'),
    body('dropoffLong').isFloat().withMessage('Dropoff longitude must be a float'),
  ],
  getEstimatedETA
);

export default router;
