import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all feedback
export const getFeedbacks = async ( res: Response ): Promise<Response> => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: { User: true },
    });
    return res.json(feedbacks);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create feedback
export const createFeedback = async (req: Request, res: Response): Promise<Response> => {
  const { content } = req.body;
  const userId = (req.user as { id: number }).id;

  try {
    const feedback = await prisma.feedback.create({
      data: {
        userId,
        content,
      },
    });
    return res.status(201).json(feedback);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
