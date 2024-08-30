import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { generateToken } from '../config/passport';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types/authenticatedRequest';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Define the user schema
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const parsedData = userSchema.parse(req.body); 
    const { email, password, name } = parsedData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = generateToken(createdUser);
    return res.status(201).json({ 
      message: 'User registered successfully', 
      user: { ...createdUser, password: undefined }, 
      token 
    });
  } catch (error) {
    console.error('Error in register:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Login a user
export const login = async (req: Request, res: Response) => {
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    return res.status(200).json({ 
      message: 'Login successful', 
      user: { ...user, password: undefined }, 
      token 
    });
  } catch (error) {
    console.error('Error in login:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Logout a user
export const logout = async (req: Request, res: Response) => {
  try {
    // Invalidate the token if you're storing it in a database or cache
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      // Decode the token to find the user ID (assuming the token contains this info)
      const decoded = jwt.decode(token) as { id: string };
      if (decoded?.id) {
        // Optionally, store invalidated tokens or remove them from a token store
        // await prisma.invalidatedTokens.create({ data: { token } });
      }
    }

    // Clear any authentication-related cookies (if used)
    res.clearCookie('token'); // Assuming you're using cookies to store the token

    // Perform the logout operation
    req.logout((err: unknown) => {
      if (err) {
        console.error('Error in logout:', err);
        return res.status(500).json({ message: 'Logout failed', error: (err as Error).message });
      }
      return res.status(200).json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    console.error('Error in logout:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
// Get user profile
export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { Order: true, Reward: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update user profile
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  const updateSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
  });

  try {
    const { name } = updateSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
