import express from 'express';
import passport from 'passport';
import { createRestaurant, getRestaurants, addMenuItem, getMenuItems } from '../controller/restaurantController';

const router = express.Router();

router.post('/create', passport.authenticate('jwt', { session: false }), createRestaurant);
router.get('/', passport.authenticate('jwt', { session: false }), getRestaurants);
router.post('/menu', passport.authenticate('jwt', { session: false }), addMenuItem);
router.get('/menu/:restaurantId', passport.authenticate('jwt', { session: false }), getMenuItems);

export default router;
