import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = express.Router();
const prisma = new PrismaClient();

// Zod schema for creating/updating measurements
const measurementSchema = z.object({
  body: z.object({
    date: z.string().datetime({ message: 'Invalid date format' }),
    weightKg: z.number().min(20).max(300).optional(),
    bodyFatPct: z.number().min(1).max(70).optional(),
    chestCm: z.number().min(30).max(200).optional(),
    waistCm: z.number().min(30).max(200).optional(),
    hipsCm: z.number().min(30).max(200).optional(),
    bicepCm: z.number().min(10).max(100).optional(),
    notes: z.string().optional(),
  }).refine(
    (data) => {
      // Require at least one measurement field (not just date and notes)
      return data.weightKg !== undefined || data.bodyFatPct !== undefined || 
             data.chestCm !== undefined || data.waistCm !== undefined || 
             data.hipsCm !== undefined || data.bicepCm !== undefined;
    },
    { message: 'At least one measurement field is required (weight, body fat, chest, waist, hips, or bicep)' }
  ),
});

// POST /api/measurements - Create a new measurement
router.post('/', authenticate, validate(measurementSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { date, weightKg, bodyFatPct, chestCm, waistCm, hipsCm, bicepCm, notes } = req.body as {
      date: string;
      weightKg?: number;
      bodyFatPct?: number;
      chestCm?: number;
      waistCm?: number;
      hipsCm?: number;
      bicepCm?: number;
      notes?: string;
    };

    const measurement = await prisma.measurement.create({
      data: {
        userId,
        date: new Date(date),
        weightKg: weightKg ?? null,
        bodyFatPct: bodyFatPct ?? null,
        chestCm: chestCm ?? null,
        waistCm: waistCm ?? null,
        hipsCm: hipsCm ?? null,
        bicepCm: bicepCm ?? null,
        notes: notes ?? null,
      },
    });

    res.status(201).json({ success: true, measurement });
  } catch (error) {
    next(error);
  }
});

// GET /api/measurements - Get all measurements for the user
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    const measurements = await prisma.measurement.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    // Calculate changes
    const firstMeasurement = measurements.length > 0 ? measurements[0] : null;
    const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;

    let weightChange: number | null = null;
    let bodyFatChange: number | null = null;

    if (firstMeasurement && latestMeasurement) {
      if (firstMeasurement.weightKg != null && latestMeasurement.weightKg != null) {
        weightChange = latestMeasurement.weightKg - firstMeasurement.weightKg;
      }
      if (firstMeasurement.bodyFatPct != null && latestMeasurement.bodyFatPct != null) {
        bodyFatChange = latestMeasurement.bodyFatPct - firstMeasurement.bodyFatPct;
      }
    }

    res.json({
      success: true,
      measurements,
      firstMeasurement,
      latestMeasurement,
      weightChange,
      bodyFatChange,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/measurements/latest - Get the single most recent measurement
router.get('/latest', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    const measurement = await prisma.measurement.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    res.json({
      success: true,
      measurement,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/measurements/:id - Delete a measurement
router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    // Check ownership
    const existing = await prisma.measurement.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Measurement not found', statusCode: 404 });
      return;
    }
    if (existing.userId !== userId) {
      res.status(403).json({ success: false, error: 'Access denied', statusCode: 403 });
      return;
    }

    await prisma.measurement.delete({ where: { id } });

    res.json({ success: true, message: 'Measurement deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Admin endpoints for viewing member measurements

// GET /api/admin/members/:userId/measurements - Get all measurements for a specific member (admin only)
router.get('/admin/members/:userId', adminOnly, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = String(req.params.userId);

    const measurements = await prisma.measurement.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    // Calculate summary statistics
    const totalMeasurements = measurements.length;
    const latestMeasurement = measurements.length > 0 ? measurements[0] : null;
    
    let weightChange: number | null = null;
    let bodyFatChange: number | null = null;
    
    if (measurements.length >= 2) {
      const latest = measurements[0];
      const previous = measurements[measurements.length - 1];
      
      if (latest && previous) {
        if (latest.weightKg != null && previous.weightKg != null) {
          weightChange = latest.weightKg - previous.weightKg;
        }
        if (latest.bodyFatPct != null && previous.bodyFatPct != null) {
          bodyFatChange = latest.bodyFatPct - previous.bodyFatPct;
        }
      }
    }

    res.json({
      success: true,
      measurements,
      summary: {
        totalMeasurements,
        latestMeasurement,
        weightChange,
        bodyFatChange,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/members/:userId/measurements/latest - Get the single most recent measurement for a member (admin only)
router.get('/admin/members/:userId/latest', adminOnly, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = String(req.params.userId);

    const measurement = await prisma.measurement.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    res.json({
      success: true,
      measurement,
    });
  } catch (error) {
    next(error);
  }
});

export default router;