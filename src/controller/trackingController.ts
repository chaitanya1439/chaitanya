import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { trackDriver, trackRider } from '../services/trackingService';
import { Client } from '@googlemaps/google-maps-services-js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({});

// Track driver location
export const trackDriverLocation = async (req: Request, res: Response): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { latitude, longitude } = req.body;
    const driverId = req.params.id; // Keep id as a string
    const driver = await trackDriver(driverId, latitude, longitude);
    return res.status(200).json(driver);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Track rider location
export const trackRiderLocation = async (req: Request, res: Response): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { latitude, longitude } = req.body;
    const riderId = parseInt(req.params.id, 10); // Convert id to number
    if (isNaN(riderId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const rider = await trackRider(riderId, latitude, longitude);
    return res.status(200).json(rider);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get ETA (Estimated Time of Arrival) using Google Distance Matrix API
export const getEstimatedETA = async (req: Request, res: Response): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { pickupLat, pickupLong, dropoffLat, dropoffLong } = req.body;

    // Retrieve the Google API key
    const googleApiKey = process.env.GOOGLE_KEY;
    if (!googleApiKey) {
      return res.status(500).json({ message: 'Google API key not set' });
    }

    // Call Google Distance Matrix API
    const response = await client.distancematrix({
      params: {
        origins: [{ lat: pickupLat, lng: pickupLong }],
        destinations: [{ lat: dropoffLat, lng: dropoffLong }],
        key: googleApiKey,
      },
    });

    // Check if the response is OK and extract the duration (in seconds)
    if (response.data.rows[0].elements[0].status === 'OK') {
      const duration = response.data.rows[0].elements[0].duration.value; // Duration in seconds
      return res.status(200).json({ eta: duration });
    } else {
      throw new Error('Unable to calculate ETA');
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
