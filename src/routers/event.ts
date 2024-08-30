import express from 'express';
import { getEvents, updateEvent } from '../controller/eventController';
import passport from 'passport';

const router = express.Router();

// Get all events
router.get('/events', getEvents);

// Update event information (authentication required)
router.put('/event/:id', passport.authenticate('jwt', { session: false }), updateEvent);

export default router;
