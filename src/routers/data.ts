import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { logRide, logUserBehavior, logDriverPerformance } from '../controller/dataController';

const router = Router();

// Log ride data
router.post(
  '/rides',
  [
    body('userId').isInt(),
    body('driverId').isInt(),
    body('startTime').isISO8601(),
    body('endTime').isISO8601(),
    body('distance').isFloat(),
    body('fare').isFloat(),
    body('status').isString(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      await logRide(req, res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Log user behavior
router.post(
  '/user-behavior',
  [
    body('userId').isInt(),
    body('action').isString(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      await logUserBehavior(req, res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Log driver performance
router.post(
  '/driver-performance',
  [
    body('driverId').isInt(),
    body('rating').isFloat({ min: 0, max: 5 }),
    body('completedRides').isInt(),
    body('feedback').optional().isString(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      await logDriverPerformance(req, res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
