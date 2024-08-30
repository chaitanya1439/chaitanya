import express from 'express';
import { getFeedbacks, createFeedback } from '../controller/feedbackController';
import passport from 'passport';

const router = express.Router();

// Get all feedbacks
router.get('/feedbacks', getFeedbacks);

// Create feedback (authentication required)
router.post('/feedback', passport.authenticate('jwt', { session: false }), createFeedback);

export default router;
