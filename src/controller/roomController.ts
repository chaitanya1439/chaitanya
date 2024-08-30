import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all rooms
export const getRooms = async ( res: Response ): Promise<Response> => {
  try {
    const rooms = await prisma.room.findMany();
    return res.json(rooms);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update room information
export const updateRoom = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  try {
    const updatedRoom = await prisma.room.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),           // Only include fields that are provided
        ...(description && { description }),
        ...(price !== undefined && { price })
      },
    });
    return res.json(updatedRoom);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
