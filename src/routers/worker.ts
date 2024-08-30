import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req: Request, res: Response) => {
  const { email, role, name, phone } = req.body;

  if (!email || !role || !phone) {
    return res.status(400).json({ message: 'Email, role, and phone are required' });
  }

  try {
    const worker = await prisma.worker.create({
      data: {
        email,
        role,
        name,
        phone, 
      },
    });
    return res.status(201).json({ message: 'Worker created', worker });
  } catch (error) {
    console.error('Error in register:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
