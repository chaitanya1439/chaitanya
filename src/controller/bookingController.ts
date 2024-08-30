import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get available rooms
export const getAvailableRooms = async (req: Request, res: Response): Promise<Response> => {
  try {
    const rooms = await prisma.room.findMany({ where: { availability: true } });
    return res.json(rooms);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Book a room
export const bookRoom = async (req: Request, res: Response): Promise<Response> => {
  const { roomId, startDate, endDate } = req.body;
  const userId = (req.user as { id: number }).id;

  try {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room || !room.availability) {
      return res.status(400).json({ error: 'Room not available' });
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        roomId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    await prisma.room.update({
      where: { id: roomId },
      data: { availability: false },
    });

    return res.status(201).json(booking);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Cancel a booking
export const cancelBooking = async (req: Request, res: Response): Promise<Response> => {
  const { bookingId } = req.body;
  const userId = (req.user as { id: number }).id;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { Room: true }, // Use the correct model name
    });

    if (!booking || booking.userId !== userId) {
      return res.status(400).json({ error: 'Invalid booking' });
    }

    await prisma.booking.delete({ where: { id: bookingId } });

    await prisma.room.update({
      where: { id: booking.roomId },
      data: { availability: true },
    });

    return res.status(200).json({ message: 'Booking cancelled' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
