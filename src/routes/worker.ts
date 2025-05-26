import { Router, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { PrismaClient, Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

declare global {
  namespace Express {
    interface Request {
      driverId?: string;
    }
  }
}

// Public: PHONE JWT
router.post(
  '/phone-jwt',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { phoneNumber, id } = req.body;
    if (!phoneNumber || !id) {
      res.status(400).json({ message: 'Missing phoneNumber or id' });
      return;
    }
    let driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) {
      driver = await prisma.driver.create({
        data: {
          id,
          phoneNumber,
          name: '',
          email: '',
          country: '',
          registrationNumber: '',
          registrationDate: new Date(),
          drivingLicense: '',
          vehicleColor: '',
          vehicleType: '',
          rate: 0,
          notificationToken: '',
        },
      });
    }
    const token = jwt.sign({ id: driver.id, role: 'driver' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, driver: { id: driver.id, phoneNumber: driver.phoneNumber } });
  })
);

// Public: GOOGLE JWT
router.post(
  '/google-jwt',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, email } = req.body;
    if (!name || !email) {
      res.status(400).json({ message: 'Name and email are required' });
      return;
    }
    let driver = await prisma.driver.findUnique({ where: { email } });
    if (!driver) {
      driver = await prisma.driver.create({
        data: {
          id: `google-${email}`,
          name,
          email,
          phoneNumber: '',
          country: '',
          registrationNumber: '',
          registrationDate: new Date(),
          drivingLicense: '',
          vehicleColor: '',
          vehicleType: '',
          rate: 0,
          notificationToken: '',
        },
      });
    }
    const token = jwt.sign({ id: driver.id, role: 'driver' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, driver: { id: driver.id, name: driver.name, email: driver.email, phoneNumber: driver.phoneNumber } });
  })
);

// Apply auth to protected routes
router.use(authMiddleware);

// Protected: GET PROFILE
router.get(
  '/me',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const driverId = req.driverId!;
    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) {
      res.status(404).json({ message: 'Driver not found' });
      return;
    }
    res.json({ success: true, driver });
  })
);

// Protected: UPDATE PROFILE
router.put(
  '/update',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const driverId = req.driverId!;
    const updateData: Prisma.DriverUpdateInput = {};
    [
      'name', 'country', 'phoneNumber', 'email', 'vehicleType',
      'registrationNumber', 'drivingLicense', 'vehicleColor', 'notificationToken'
    ].forEach(field => {
      if (req.body[field] !== undefined) (updateData as any)[field] = req.body[field];
    });
    if (req.body.registrationDate) updateData.registrationDate = new Date(req.body.registrationDate);
    if (req.body.rate !== undefined) updateData.rate = req.body.rate;
    const updated = await prisma.driver.update({ where: { id: driverId }, data: updateData });
    res.json({ success: true, driver: updated });
  })
);

// Protected: GET DRIVERS DATA
router.get(
  '/get-drivers-data',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const idsParam = req.query.ids as string;
    if (!idsParam) {
      res.status(400).json({ message: 'No driver IDs provided' });
      return;
    }
    const ids = idsParam.split(',');
    const drivers = await prisma.driver.findMany({ where: { id: { in: ids } } });
    res.json({ success: true, drivers });
  })
);

// Protected: UPDATE STATUS
router.put(
  '/update-status',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const driverId = req.driverId!;
    const { status } = req.body;
    const driver = await prisma.driver.update({ where: { id: driverId }, data: { status } });
    res.json({ success: true, driver });
  })
);

// Protected: NEW RIDE
router.post(
  '/new-ride',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const driverId = req.driverId!;
    const { userId, charge, status, currentLocationName, destinationLocationName, distance } = req.body;
    const ride = await prisma.ride.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        driverId,
        charge: parseFloat(charge),
        status,
        currentLocationName,
        destinationLocationName,
        distance,
      },
    });
    res.json({ success: true, ride });
  })
);

// Protected: UPDATE RIDE STATUS
router.put(
  '/update-ride-status',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const driverId = req.driverId!;
    const { rideId, rideStatus } = req.body;
    if (!rideId || !rideStatus) {
      res.status(400).json({ message: 'Invalid input data' });
      return;
    }
    const existing = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!existing) {
      res.status(404).json({ message: 'Ride not found' });
      return;
    }
    const updatedRide = await prisma.ride.update({ where: { id: rideId }, data: { status: rideStatus } });
    if (rideStatus === 'Completed') {
      await prisma.driver.update({ where: { id: driverId }, data: { totalEarning: { increment: existing.charge }, totalRides: { increment: 1 } } });
    }
    res.json({ success: true, updatedRide });
  })
);

// Protected: GET RIDE LIST
router.get(
  '/get-ride',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const driverId = req.driverId!;
    const rides = await prisma.ride.findMany({ where: { driverId }, include: { user: true, driver: true } });
    res.json({ success: true, rides });
  })
);

// Protected: PENDING RIDES
router.get(
  '/pending-rides',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const driverId = req.driverId!;
    const rides = await prisma.ride.findMany({
      where: { status: 'Requested' },
      include: { user: true }
    });
    res.json({ success: true, rides });
  })
);

export default router;

