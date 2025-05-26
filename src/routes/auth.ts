import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// --- PHONE OTP → JWT ---
router.post('/phone-jwt', async (req: Request, res: Response, next: NextFunction) => {
  const { phoneNumber, uid } = req.body;
  if (!phoneNumber || !uid) {
    return res.status(400).json({ message: 'Missing phoneNumber or uid' });
  }

  try {
    let user = await prisma.user.findUnique({ where: { uid } });
    if (!user) {
      user = await prisma.user.create({
        data: { uid, phoneNumber, name: '', username: '' }
      });
    }
    const token = jwt.sign({ id: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, phoneNumber: user.phoneNumber } });
  } catch (err) {
    next(err);
  }
});

// --- GOOGLE OAUTH → JWT ---
router.post('/google-jwt', async (req: Request, res: Response, next: NextFunction) => {
  const { name, username } = req.body;
  if (!name || !username) {
    return res.status(400).json({ message: 'Name and username are required' });
  }

  try {
    let user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      user = await prisma.user.create({
        data: { username, name, uid: `google-${username}`, phoneNumber: '' }
      });
    }
    const token = jwt.sign({ id: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (err) {
    next(err);
  }
});

// --- PROTECTED ROUTES ---
router.use(authMiddleware);

// GET CURRENT USER
router.get('/me', async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(400).json({ message: 'User ID missing' });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ user });
});

// UPDATE PROFILE (only if incomplete)
router.put('/update', async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.userId!;
  const { name, username, phoneNumber } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent updates if already complete
    if (user.name && user.username && user.phoneNumber) {
      return res.status(403).json({ message: 'Profile already completed' });
    }

    // Check uniqueness
    if (phoneNumber) {
      const conflict = await prisma.user.findUnique({ where: { phoneNumber } });
      if (conflict && conflict.id !== userId) {
        return res.status(409).json({ message: 'Phone number in use' });
      }
    }
    if (username) {
      const conflict = await prisma.user.findUnique({ where: { username } });
      if (conflict && conflict.id !== userId) {
        return res.status(409).json({ message: 'Username in use' });
      }
    }

    const data: Partial<typeof user> = {};
    if (name) data.name = name;
    if (username) data.username = username;
    if (phoneNumber) data.phoneNumber = phoneNumber;

    const updated = await prisma.user.update({ where: { id: userId }, data });
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
});

// GET USER RIDES
router.get('/get-rides', async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.userId!;
  try {
    const rides = await prisma.ride.findMany({
      where: { userId },
      include: { user: true, driver: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ rides });
  } catch (err) {
    next(err);
  }
});

export default router;