import express from 'express';
import { getRooms, updateRoom } from '../controller/roomController';
import passport from 'passport';

const router = express.Router();

// Get all rooms
router.get('/rooms', getRooms);

// Update room information (authentication required)
router.put('/room/:id', passport.authenticate('jwt', { session: false }), updateRoom);

export default router;
