import { Request, Response, NextFunction } from 'express';
import { trackDriver, trackRider, getETA as getETAFromService } from '../services/trackingService';
import { handleValidationErrors } from '../utils/errorHandlers';

// Track driver location
export const trackDriverLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!handleValidationErrors(req, res)) return;

  try {
    const { latitude, longitude } = req.body;
    const driverId = req.params.id;

    // Validate latitude and longitude
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      res.status(400).json({ message: 'Invalid latitude or longitude format' });
      return;
    }

    const driver = await trackDriver(driverId, latitude, longitude);
    res.status(200).json(driver);
  } catch (error) {
    next(error); // Pass error to the error-handling middleware
  }
};

// Track rider location
export const trackRiderLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!handleValidationErrors(req, res)) return;

  try {
    const { latitude, longitude } = req.body;
    const riderId = parseInt(req.params.id, 10);

    // Validate rider ID and coordinates
    if (isNaN(riderId)) {
      res.status(400).json({ message: 'Invalid rider ID format' });
      return;
    }
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      res.status(400).json({ message: 'Invalid latitude or longitude format' });
      return;
    }

    const rider = await trackRider(riderId, latitude, longitude);
    res.status(200).json(rider);
  } catch (error) {
    next(error); // Pass error to the error-handling middleware
  }
};

// Get ETA
export const getETA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!handleValidationErrors(req, res)) return;

  try {
    const { pickupLat, pickupLong, dropoffLat, dropoffLong } = req.body;

    // Validate coordinates
    if (
      typeof pickupLat !== 'number' || typeof pickupLong !== 'number' ||
      typeof dropoffLat !== 'number' || typeof dropoffLong !== 'number'
    ) {
      res.status(400).json({ message: 'Invalid coordinate format' });
      return;
    }

    const eta = await getETAFromService(pickupLat, pickupLong, dropoffLat, dropoffLong);
    res.status(200).json({ eta });
  } catch (error) {
    next(error); // Pass error to the error-handling middleware
  }
};
