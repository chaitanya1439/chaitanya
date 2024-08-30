import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all reviews for a room
export const getReviewsForRoom = async (req: Request, res: Response): Promise<Response> => {
  const { roomId } = req.params;

  try {
    const reviews = await prisma.review.findMany({
      where: { roomId: Number(roomId) },
      include: { User: true, Room: true },
    });
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create review
export const createReview = async (req: Request, res: Response): Promise<Response> => {
  const { roomId, rating, comment } = req.body;
  const userId = (req.user as { id: number }).id;

  try {
    const review = await prisma.review.create({
      data: {
        userId,
        roomId,
        rating,
        comment,
      },
    });
    return res.status(201).json(review);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
