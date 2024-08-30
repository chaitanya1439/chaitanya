import express, { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { Client as GoogleMapsClient } from '@googlemaps/google-maps-services-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();
const googleMapsClient = new GoogleMapsClient({});

const FareSchema = z.object({
  pickupLat: z.number(),
  pickupLong: z.number(),
  dropoffLat: z.number(),
  dropoffLong: z.number(),
  demand: z.number(),
});

router.post('/calculate-fare', async (req: Request, res: Response) => {
  try {
    // Validate input
    const { pickupLat, pickupLong, dropoffLat, dropoffLong, demand } = FareSchema.parse(req.body);

    // Calculate distance using Google Maps Distance Matrix API
    const distanceResponse = await googleMapsClient.distancematrix({
      params: {
        origins: [`${pickupLat},${pickupLong}`],
        destinations: [`${dropoffLat},${dropoffLong}`],
        key: 'process.env.GOOGLE_KEY',
      },
    });

    const distance = distanceResponse.data.rows[0].elements[0].distance.value / 1000; // distance in km

    // Fetch fare details from the database
    const fareData = await prisma.fare.findFirst();

    if (!fareData) {
      return res.status(500).json({ message: 'Fare data not found' });
    }

    const { baseFare, perKmRate, surgeMultiplier } = fareData;

    // Calculate fare
    const surgeFactor = surgeMultiplier; // Example: a static multiplier
    const totalFare = baseFare + (perKmRate * distance * surgeFactor * demand);

    return res.status(200).json({ distance, totalFare });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
