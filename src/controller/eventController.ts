import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all events
export const getEvents = async (req: Request, res: Response): Promise<Response> => {
  try {
    const events = await prisma.event.findMany();
    return res.json(events);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update event information
export const updateEvent = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { name, description, date, roomId } = req.body;

  try {
    const updatedEvent = await prisma.event.update({
      where: { id: Number(id) },
      data: { name, description, date: new Date(date), roomId },
    });
    return res.json(updatedEvent);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
