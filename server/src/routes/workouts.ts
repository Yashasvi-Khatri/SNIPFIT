import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = express.Router();
const prisma = new PrismaClient();

// Zod schemas for validation
const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  sets: z.number().int().min(1, 'Sets must be at least 1'),
  reps: z.number().int().min(1, 'Reps must be at least 1'),
  weightKg: z.number().min(0).optional(),
  notes: z.string().optional(),
  order: z.number().int().min(0),
});

const createWorkoutSchema = z.object({
  body: z.object({
    date: z.string().datetime({ message: 'Invalid date format' }),
    notes: z.string().optional(),
    duration: z.number().int().min(1).optional(),
    exercises: z.array(exerciseSchema).min(1, 'At least one exercise is required'),
  }),
});

const updateWorkoutSchema = z.object({
  body: z.object({
    date: z.string().datetime().optional(),
    notes: z.string().optional(),
    duration: z.number().int().min(1).optional(),
    exercises: z.array(exerciseSchema).min(1).optional(),
  }),
});

// POST /api/workouts - Create a new workout
router.post('/', authenticate, validate(createWorkoutSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { date, notes, duration, exercises } = req.body as {
      date: string;
      notes?: string;
      duration?: number;
      exercises: Array<{
        name: string;
        sets: number;
        reps: number;
        weightKg?: number;
        notes?: string;
        order: number;
      }>;
    };

    // Create Workout + all WorkoutExercises in a Prisma transaction
    const workout = await prisma.$transaction(async (tx) => {
      const created = await tx.workout.create({
        data: {
          userId,
          date: new Date(date),
          notes: notes || null,
          duration: duration || null,
          exercises: {
            create: exercises.map((ex) => ({
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              weightKg: ex.weightKg || null,
              notes: ex.notes || null,
              order: ex.order,
            })),
          },
        },
        include: {
          exercises: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return created;
    });

    res.status(201).json({ success: true, workout });
  } catch (error) {
    next(error);
  }
});

// GET /api/workouts - Get paginated workouts
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = parseInt(String(req.query.page || '1'), 10) || 1;
    const limit = parseInt(String(req.query.limit || '10'), 10) || 10;
    const startDate = req.query.startDate !== undefined ? String(req.query.startDate) : undefined;
    const endDate = req.query.endDate !== undefined ? String(req.query.endDate) : undefined;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: { userId: string; date?: { gte?: Date; lte?: Date } } = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    // Get total count for pagination
    const total = await prisma.workout.count({ where });

    // Get workouts with exercise count (not exercises themselves for performance)
    const workouts = await prisma.workout.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        _count: {
          select: { exercises: true },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      workouts: workouts.map((w) => ({
        id: w.id,
        date: w.date.toISOString(),
        notes: w.notes,
        duration: w.duration,
        exerciseCount: w._count.exercises,
        createdAt: w.createdAt.toISOString(),
      })),
      total,
      page,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/workouts/stats - Get workout statistics
router.get('/stats', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Total workouts
    const totalWorkouts = await prisma.workout.count({ where: { userId } });

    // This month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date();
    monthEnd.setMonth(monthEnd.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const thisMonth = await prisma.workout.count({
      where: {
        userId,
        date: { gte: monthStart, lte: monthEnd },
      },
    });

    // This week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const thisWeek = await prisma.workout.count({
      where: {
        userId,
        date: { gte: weekStart, lte: weekEnd },
      },
    });

    // Most common exercises (top 5)
    const mostCommonExercises = await prisma.workoutExercise.groupBy({
      by: ['name'],
      where: {
        workout: { userId },
      },
      _count: { name: true },
      orderBy: { _count: { name: 'desc' } },
      take: 5,
    });

    res.json({
      success: true,
      stats: {
        totalWorkouts,
        thisMonth,
        thisWeek,
        mostCommonExercises: mostCommonExercises.map((ex) => ({
          name: ex.name,
          count: ex._count.name,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/workouts/:id - Get full workout details
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const workout = await prisma.workout.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!workout) {
      res.status(404).json({ success: false, error: 'Workout not found', statusCode: 404 });
      return;
    }

    // Verify ownership
    if (workout.userId !== userId) {
      res.status(403).json({ success: false, error: 'Access denied', statusCode: 403 });
      return;
    }

    res.json({ success: true, workout });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/workouts/:id - Update a workout
router.patch('/:id', authenticate, validate(updateWorkoutSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);
    const { date, notes, duration, exercises } = req.body as {
      date?: string;
      notes?: string;
      duration?: number;
      exercises?: Array<{
        name: string;
        sets: number;
        reps: number;
        weightKg?: number;
        notes?: string;
        order: number;
      }>;
    };

    // Check ownership
    const existing = await prisma.workout.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Workout not found', statusCode: 404 });
      return;
    }
    if (existing.userId !== userId) {
      res.status(403).json({ success: false, error: 'Access denied', statusCode: 403 });
      return;
    }

    // Update in transaction - delete old exercises and create new ones if provided
    const workout = await prisma.$transaction(async (tx) => {
      // If exercises provided, delete old ones first
      if (exercises) {
        await tx.workoutExercise.deleteMany({ where: { workoutId: id } });
      }

      const updated = await tx.workout.update({
        where: { id },
        data: {
          ...(date ? { date: new Date(date) } : {}),
          ...(notes !== undefined ? { notes } : {}),
          ...(duration !== undefined ? { duration } : {}),
          ...(exercises
            ? {
                exercises: {
                  create: exercises.map((ex) => ({
                    name: ex.name,
                    sets: ex.sets,
                    reps: ex.reps,
                    weightKg: ex.weightKg || null,
                    notes: ex.notes || null,
                    order: ex.order,
                  })),
                },
              }
            : {}),
        },
        include: {
          exercises: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return updated;
    });

    res.json({ success: true, workout });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/workouts/:id - Delete a workout
router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    // Check ownership
    const existing = await prisma.workout.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Workout not found', statusCode: 404 });
      return;
    }
    if (existing.userId !== userId) {
      res.status(403).json({ success: false, error: 'Access denied', statusCode: 403 });
      return;
    }

    await prisma.workout.delete({ where: { id } });

    res.json({ success: true, message: 'Workout deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;