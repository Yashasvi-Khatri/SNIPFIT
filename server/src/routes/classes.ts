import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const classes = await prisma.gymClass.findMany({
      where: {
        cancelledAt: null,
        startTime: { gte: new Date() },
      },
      include: {
        trainer: {
          select: { id: true, name: true, role: true },
        },
        _count: { select: { bookings: true } },
      },
      orderBy: { startTime: 'asc' },
    });
    res.json({ success: true, classes });
  } catch (error) {
    next(error);
  }
});

export default router;
