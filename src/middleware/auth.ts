import { RequestHandler, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

/**
 * Extends Express Request to include authenticated IDs
 */
export interface AuthRequest extends Request {
  userId?: number;
  driverId?: string;
}

/**
 * Express middleware to authenticate JWT and attach userId or driverId
 */
export const authMiddleware: RequestHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as any;

    if (payload.role === 'user') {
      const user = await prisma.user.findUnique({ where: { id: Number(payload.id) } });
      if (!user) return res.status(404).json({ message: 'User not found' });
      req.userId = user.id;
    } else if (payload.role === 'driver') {
      const driver = await prisma.driver.findUnique({ where: { id: String(payload.id) } });
      if (!driver) return res.status(404).json({ message: 'Driver not found' });
      req.driverId = driver.id;
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
