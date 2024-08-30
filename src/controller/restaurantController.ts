import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define the User interface
interface User {
  id: number;
  // Add other fields as needed
}

// Extend the Express Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: User; // Optional if not always present
}

export const createRestaurant = async (req: AuthenticatedRequest, res: Response) => {
  const { name, address } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        address,
        userId,
      },
    });

    return res.status(201).json({ message: 'Restaurant created successfully', restaurant });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getRestaurants = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { userId },
      include: { menu: true },
    });

    return res.status(200).json({ restaurants });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const addMenuItem = async (req: Request, res: Response) => {
  const { restaurantId, name, description, price } = req.body;

  try {
    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price,
        restaurantId,
      },
    });

    return res.status(201).json({ message: 'Menu item added successfully', menuItem });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getMenuItems = async (req: Request, res: Response) => {
  const { restaurantId } = req.params;

  try {
    const menuItems = await prisma.menuItem.findMany({
      where: { restaurantId: parseInt(restaurantId) },
    });

    return res.status(200).json({ menuItems });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
