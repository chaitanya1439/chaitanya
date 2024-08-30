import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define a User type based on the structure of your user object
interface User {
  id: number;
  email?: string;  // Add other fields as needed
}

export const createOrder = async (req: Request, res: Response) => {
  const { menuItemId } = req.body;
  const userId = (req.user as User).id;

  try {
    // Retrieve menu item details to get the price
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Calculate total amount (assuming price is a field in MenuItem)
    const totalAmount = menuItem.price;

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId,
        menuItemId,
        totalAmount,
        status: 'Pending',
      },
    });

    return res.status(201).json(order); // Ensure response is returned here
  } catch (error) {
    return res.status(500).json({ error: error.message }); // Ensure response is returned here
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  const { orderId, status } = req.body;

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return res.status(200).json(order); // Ensure response is returned here
  } catch (error) {
    return res.status(500).json({ error: error.message }); // Ensure response is returned here
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  const { orderId } = req.body;

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'Cancelled' },
    });

    return res.status(200).json(order); // Ensure response is returned here
  } catch (error) {
    return res.status(500).json({ error: error.message }); // Ensure response is returned here
  }
};
