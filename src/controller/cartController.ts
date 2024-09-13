import { Request, Response } from 'express';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export const addToCart = async (req: Request, res: Response) => {
  const { menuItemId, quantity } = req.body;
  const userId = (req.user as User).id;

  try {
    let cart = await prisma.cart.findFirst({
      where: { userId, status: 'Active' },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          status: 'Active',
        },
        include: { items: true },
      });
    }

    const existingCartItem = cart.items.find(item => item.menuItemId === menuItemId);

    if (existingCartItem) {
      const updatedCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
      return res.status(200).json(updatedCartItem);
    } else {
      const newCartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          menuItemId,
          quantity,
        },
      });
      return res.status(201).json(newCartItem);
    }
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  const { menuItemId, quantity } = req.body;
  const userId = (req.user as User).id;

  try {
    const cart = await prisma.cart.findFirst({
      where: { userId, status: 'Active' },
      include: { items: true },
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const existingCartItem = cart.items.find(item => item.menuItemId === menuItemId);

    if (!existingCartItem) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    if (existingCartItem.quantity > quantity) {
      const updatedCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity - quantity },
      });
      return res.status(200).json(updatedCartItem);
    } else {
      await prisma.cartItem.delete({
        where: { id: existingCartItem.id },
      });
      return res.status(200).json({ message: 'Item removed from cart' });
    }
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
  }
};

export const getCart = async (req: Request, res: Response) => {
  const userId = (req.user as User).id;

  try {
    const cart = await prisma.cart.findFirst({
      where: { userId, status: 'Active' },
      include: { items: { include: { menuItem: true } } },
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
  }
};

export const checkoutCart = async (req: Request, res: Response) => {
    const userId = (req.user as User).id;
  
    try {
      // Find the active cart for the user
      const cart = await prisma.cart.findFirst({
        where: { userId, status: 'Active' },
        include: { items: { include: { menuItem: true } } },
      });
  
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }
  
      // Calculate the total amount
      const totalAmount = cart.items.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
  
      // Create the order
      const order = await prisma.order.create({
        data: {
          userId,
          totalAmount,
          status: 'Pending',
          menuItemId: cart.items[0].menuItemId, // Use the first menuItemId for this example
        },
      });
  
      // Create order items
      await prisma.orderItem.createMany({
        data: cart.items.map(item => ({
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
      });
  
      // Mark the cart as completed
      await prisma.cart.update({
        where: { id: cart.id },
        data: { status: 'Completed' },
      });
  
      return res.status(201).json(order);
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  };
  