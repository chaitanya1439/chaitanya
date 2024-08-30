import express from 'express';
import { getFacilities, updateFacility } from '../controller/facilityController';
import passport from 'passport';

const router = express.Router();

// Get all facilities
router.get('/facilities', getFacilities);

// Update facility information (authentication required)
router.put('/facility/:id', passport.authenticate('jwt', { session: false }), updateFacility);

export default router;
