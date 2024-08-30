import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const logRide = async (req: Request, res: Response): Promise<void> => {
    const { riderId, driverId, pickupLat, pickupLong, dropoffLat, dropoffLong, status, estimatedTime } = req.body;
  
    try {
      const ride = await prisma.ride.create({
        data: {
          riderId: riderId, // Use riderId instead of userId
          driverId: (driverId), // Ensure driverId is a number
          pickupLat,
          pickupLong,
          dropoffLat,
          dropoffLong,
          status,
          estimatedTime,
        },
      });
  
      res.status(201).json(ride);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
export const logUserBehavior = async (req: Request, res: Response): Promise<void> => {
  const { userId, action } = req.body;

  try {
    const behavior = await prisma.userBehavior.create({
      data: {
        userId: Number(userId),  // Ensure userId is a number
        action,
      },
    });

    res.status(201).json(behavior);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const logDriverPerformance = async (req: Request, res: Response): Promise<void> => {
  const { driverId, rating, completedRides, feedback } = req.body;

  try {
    const performance = await prisma.driverPerformance.create({
      data: {
        driverId: (driverId),  // Ensure driverId is a number
        rating,
        completedRides,
        feedback,
      },
    });

    res.status(201).json(performance);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
