import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const assignDelivery = async (req: Request, res: Response) => {
  const { orderId, deliveryPersonnelId } = req.body;

  try {
    const delivery = await prisma.delivery.create({
      data: {
        orderId,
        deliveryPersonnelId,
        status: 'Assigned',
      },
    });

    res.status(201).json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDeliveryStatus = async (req: Request, res: Response) => {
  const { deliveryId, status, location } = req.body;

  try {
    const delivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: { status, location },
    });

    res.status(200).json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDeliveries = async (req: Request, res: Response) => {
  try {
    const deliveries = await prisma.delivery.findMany({
      include: {
        order: true,
        deliveryPersonnel: true,
      },
    });

    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
