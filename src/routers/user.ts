import express from 'express';
import { register, login, logout, getUserProfile, updateUserProfile } from '../controller/authController';
import { authenticate } from '../middleware/authenticate';
import passport from 'passport';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/login', login);
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/secrets', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    // Access the authenticated user:
    if (req.user) {
      // You can now access the authenticated user's information:
      const user = req.user; 
      console.log('Authenticated user:', user);
  
      // Redirect to the profile route:
      res.redirect('/profile');
    } else {
      // Handle the case where authentication failed:
      // You might want to access error information from 'req' here:
      // console.log('Authentication failed:', req.error); 
      res.redirect('/login');
      res.redirect('/register');
    }
  });

export default router;
