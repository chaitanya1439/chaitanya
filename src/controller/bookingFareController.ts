import { Request, Response } from 'express';
import { calculateFare } from '../services/fareService';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const bookingSchema = z.object({
  userId: z.number().positive(),
  roomId: z.number().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  distance: z.number().positive().optional(),
  demand: z.number().positive().optional(),
  surgeFactor: z.number().nonnegative().optional()
});

export async function createBooking(req: Request, res: Response) {
  const parsed = bookingSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.errors });
  }

  const { userId, roomId, startDate, endDate, distance, demand, surgeFactor } = parsed.data;

  try {
    let fare: number | null = null;
    if (distance !== undefined && demand !== undefined && surgeFactor !== undefined) {
      fare = await calculateFare({ distance, demand, surgeFactor });
    }

    // Create booking record
    const booking = await prisma.booking.create({
      data: {
        userId,
        roomId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        BookingFare: {
          create: {
            distance: distance ?? 0,
            demand: demand ?? 0,
            surgeFactor: surgeFactor ?? 0,
            fare: fare ?? 0
          }
        }
      }
    });

    return res.status(201).json(booking); // Ensure that the function returns a response
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
