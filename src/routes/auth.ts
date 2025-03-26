import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import authMiddleware from '../middleware/auth';
import cookie from 'cookie';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import twilio from 'twilio';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your_google_client_id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret';
const TWILIO_SID = process.env.TWILIO_SID || 'your_twilio_sid';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'your_twilio_auth_token';
const TWILIO_PHONE = process.env.TWILIO_PHONE || 'your_twilio_phone';

const prisma = new PrismaClient();
const router = Router();

// Define a custom user interface for authentication
interface AuthUser {
  id: number;
  username: string;
  name: string;
  password: string;
  phoneNumber: string;
}
export function isValidPhoneNumber(phone: string): boolean {
  const phoneNumber = parsePhoneNumberFromString(phone);
  return phoneNumber ? phoneNumber.isValid() : false;
}
// Extend Express.User so that req.user is correctly typed.
declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

// Passport Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: 'username' },
    async (
      username: string,
      password: string,
      done: (error: any, user?: AuthUser | false, info?: any) => void
    ) => {
      try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        // If the user was created via OAuth and has no password, disallow local login.
        if (!user.password) {
          return done(null, false, { message: 'No password set for this user' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: 'Invalid password' });
        }

        return done(null, user as AuthUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Passport Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3001',
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any, // using any because the Profile type is not exported
      done: (error: any, user?: AuthUser | false) => void
    ) => {
      try {
        // Use the first email as the username.
        const email = profile.emails && profile.emails[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'));
        }

        let user = await prisma.user.findUnique({ where: { username: email } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              name: profile.displayName,
              username: email,
              password: '', 
              phoneNumber: '',
            },
          });
        }
        return done(null, user as AuthUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize and Deserialize User
passport.serializeUser((user: AuthUser, done) => done(null, user.id));

passport.deserializeUser(
  async (id: number, done: (error: any, user?: AuthUser | false) => void) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (user) {
        done(null, user as AuthUser);
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error);
    }
  }
);

// Signup Route
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, username, password,  phoneNumber } = req.body;
    if (!name || !username || !password || !phoneNumber) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    if (!isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'User exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, username, password: hashedPassword,  phoneNumber },
    });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login Route
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'local',
    { session: false },
    (err: any, user: AuthUser | false, info: any) => {
      if (err || !user) {
        return res.status(400).json({ message: info?.message || 'Login failed' });
      }
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: '1h',
      });
      res.json({ token });
    }
  )(req, res, next);
});

// Google Auth Route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Auth Callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        password: user.password, // caution: including the password (even hashed) is not recommended.
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    // Set token as an HTTP-only cookie
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.SECRET_KEY === 'production',
        maxAge: 3600, // 1 hour
        path: '/',
      })
    );
    // Redirect to the home page
    const redirectUrl = process.env.NODE_ENV === 'production'
  ? 'https://www.shelteric.com/home'
  : 'http://localhost:3000/home';
res.redirect(redirectUrl);

  }
);
// Get Current User
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authUser = req.user as AuthUser;
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.post(
  '/location',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
    try {
      // The authenticated user is available as req.user (populated by Passport)
      const user = req.user as { id: number };

      const { latitude, longitude } = req.body;

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res
          .status(400)
          .json({ error: 'Latitude and Longitude must be numbers.' });
      }

      // Update the user's current location in the database.
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          currentLatitude: latitude,
          currentLongitude: longitude,
        },
      });

      res.json({
        message: 'Location updated successfully.',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Error updating location:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Validate phone number format
    if (!isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    const user = await prisma.user.findUnique({ where: { phoneNumber } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // Store OTP in the User model
    await prisma.user.update({
      where: { phoneNumber },
      data: { otp, otpExpiresAt: expiresAt },
    });

    // Send OTP via Twilio
    const twilioClient = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
    await twilioClient.messages.create({
      body: `Your verification code is: ${otp}`,
      from: TWILIO_PHONE,
      to: phoneNumber,
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP and Change Password
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otp, newPassword } = req.body;

    if (!phoneNumber || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find user by phone number
    const user = await prisma.user.findUnique({ where: { phoneNumber } });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP has expired
    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear OTP fields
    await prisma.user.update({
      where: { phoneNumber },
      data: { password: hashedPassword, otp: null, otpExpiresAt: null },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});


export default router;