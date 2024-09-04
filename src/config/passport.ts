import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import bcrypt from 'bcrypt';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ExtendedUser } from '../types/user'; // Import the extended User type

dotenv.config();

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || (() => { throw new Error("JWT_SECRET is not defined in environment variables"); })();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || (() => { throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables"); })();
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || (() => { throw new Error("GOOGLE_CLIENT_SECRET is not defined in environment variables"); })();

interface JwtPayload {
  id: number;
}

// Local Strategy for email and password authentication
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email: string, password: string, done: (err: Error | null, user?: ExtendedUser | false, info?: { message: string }) => void) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return done(null, false, { message: 'Incorrect email.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        const userWithToken: ExtendedUser = { ...user, token };
        return done(null, userWithToken);
      } catch (err) {
        if (err instanceof Error) {
          console.error('Error in LocalStrategy:', err);
          return done(err);
        } else {
          return done(new Error('An unknown error occurred'));
        }
      }
    }
  )
);

// Google Strategy for OAuth2 authentication
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'production' ? "www.shelteric.com" : "http://localhost:3000/home", 
      scope: ['profile', 'email'],
    },
    async (_accessToken: string, _refreshToken: string, profile: passport.Profile, done: (err: Error | null, user?: PrismaUser | false, info?: { message: string }) => void) => {
      try {
        const result = await prisma.user.findUnique({ where: { email: profile.emails?.[0].value } });
        if (!result) {
          const newUser = await prisma.user.create({
            data: {
              email: profile.emails?.[0].value || '', // Use the email provided by Google
              password: 'google', // Password should be handled properly in production
            },
          });
          return done(null, newUser);
        } else {
          return done(null, result);
        }
      } catch (err) {
        if (err instanceof Error) {
          console.error('Error in GoogleStrategy:', err);
          return done(err, false);
        } else {
          return done(new Error('An unknown error occurred'), false);
        }
      }
    }
  )
);


// Serialize user for session
passport.serializeUser((user: PrismaUser, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) {
      const userWithToken: ExtendedUser = { ...user, token: jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' }) };
      done(null, userWithToken);
    } else {
      done(null, false);
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error in deserializeUser:', err);
      done(err);
    } else {
      done(new Error('An unknown error occurred'));
    }
  }
});

// JWT Strategy for token authentication
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (jwtPayload: JwtPayload, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { id: jwtPayload.id } });
        if (user) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'User not found.' });
        }
      } catch (err) {
        if (err instanceof Error) {
          console.error('Error in JwtStrategy:', err);
          return done(err, false);
        } else {
          return done(new Error('An unknown error occurred'), false);
        }
      }
    }
  )
);

// Export a function to generate JWT tokens
export const generateToken = (user: { id: number }) => {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
};

export default passport;
