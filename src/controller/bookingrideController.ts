import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const bookingSchema = z.object({
  userId: z.number(),
  roomId: z.number(),
  startDate: z.date(),
  endDate: z.date(),
});

// Infer the type from the Zod schema
type BookingData = z.infer<typeof bookingSchema>;

export const createBooking = async (data: BookingData) => {
  const parsedData = bookingSchema.safeParse(data);
  if (!parsedData.success) {
    throw new Error('Validation failed: ' + parsedData.error.errors.map(e => e.message).join(', '));
  }

  const booking = await prisma.booking.create({
    data: {
      userId: parsedData.data.userId,
      roomId: parsedData.data.roomId,
      startDate: parsedData.data.startDate,
      endDate: parsedData.data.endDate,
    },
  });

  return booking;
};

export const getBooking = async (id: number) => {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    throw new Error('Booking not found');
  }
  return booking;
};
