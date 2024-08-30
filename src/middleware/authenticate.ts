import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/authenticatedRequest';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

// Middleware for JWT authentication using Passport
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: Error | null, user: { id: number } | false) => {
    if (err) {
      console.error('Authentication error:', err);
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    (req as AuthenticatedRequest).user = user; // Attach the full user object
    next();
  })(req, res, next);
};

// Middleware for token verification and attachment of user ID
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).json({ message: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Token is missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    if (typeof decoded.id === 'number') {
      (req as AuthenticatedRequest).userId = decoded.id; // Attach userId to the request object
      return next();
    } else {
      return res.status(403).json({ message: 'Invalid token payload' });
    }
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ message: 'Token verification failed' });
  }
};
