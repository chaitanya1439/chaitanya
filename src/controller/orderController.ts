import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface User {
  id: number;
  email?: string;  // Add other fields as needed
}

export const createOrder = async (req: Request, res: Response) => {
  const { menuItemId } = req.body;
  const userId = (req.user as User).id;

  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const totalAmount = menuItem.price;

    const order = await prisma.order.create({
      data: {
        userId,
        menuItemId,
        totalAmount,
        status: 'Pending',
      },
    });

    return res.status(201).json(order);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'An unknown error occurred' });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  const { orderId, status } = req.body;

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return res.status(200).json(order);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'An unknown error occurred' });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  const { orderId } = req.body;

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'Cancelled' },
    });

    return res.status(200).json(order);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'An unknown error occurred' });
  }
};
