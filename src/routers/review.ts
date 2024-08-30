import express from 'express';
import { getReviewsForRoom, createReview } from '../controller/reviewController';
import passport from 'passport';

const router = express.Router();

// Get all reviews for a room
router.get('/reviews/:roomId', getReviewsForRoom);

// Create review (authentication required)
router.post('/review', passport.authenticate('jwt', { session: false }), createReview);

export default router;
