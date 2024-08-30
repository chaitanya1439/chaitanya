import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define the expected shape of the request body for submitting a rating
interface SubmitRatingRequestBody {
  rateeId: string;
  rating: number;
  comment?: string; // Optional comment
}

// Define the expected shape of the request params for getting ratings
interface GetRatingsRequestParams {
  userId: string; // Assuming userId is a string, adjust if it's a number
}

// Update `req.user` typing with a proper user type
interface AuthenticatedRequest extends Request {
  user?: { id: number }; // Adjust based on your actual user type
}

export const submitRating = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { rateeId, rating, comment }: SubmitRatingRequestBody = req.body;
  const raterId = req.user?.id; // Ensure user is defined

  if (!raterId) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  try {
    // Ensure rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    const ratingEntry = await prisma.rating.create({
      data: {
        raterId,
        rateeId,
        rating,
        comment,
      },
    });

    res.status(201).json(ratingEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRatings = async (req: Request<GetRatingsRequestParams>, res: Response): Promise<void> => {
  const { userId } = req.params;

  try {
    const ratings = await prisma.rating.findMany({
      where: { rateeId: (userId) }, // Convert userId to number if necessary
      include: {
        rater: true, // Include rater details if needed
      },
    });

    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
