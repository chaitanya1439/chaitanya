import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all facilities
export const getFacilities = async (res: Response): Promise<Response> => {
  try {
    const facilities = await prisma.facility.findMany();
    return res.json(facilities);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update facility information
export const updateFacility = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const updatedFacility = await prisma.facility.update({
      where: { id: Number(id) },
      data: { name, description },
    });
    return res.json(updatedFacility);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
