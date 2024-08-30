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

export const submitRating = async (req: AuthenticatedRequest, res: Response) => {
  const { rateeId, rating, comment } = req.body;
  const raterId = req.user?.id;

  // Ensure user is authenticated
  if (!raterId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Ensure rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Create the rating entry
    const ratingEntry = await prisma.rating.create({
      data: {
        raterId,
        rateeId,
        rating,
        comment,
      },
    });

    // Return the newly created rating entry
    return res.status(201).json(ratingEntry);
  } catch (error) {
    // Handle any errors that occur during the rating creation
    return res.status(500).json({ error: error.message });
  }
};

export const getRatings = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const ratings = await prisma.rating.findMany({
      where: { rateeId: (userId) }, // Ensure userId is a number
      include: {
        rater: true, // Include rater details if needed
      },
    });

    return res.status(200).json(ratings);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
