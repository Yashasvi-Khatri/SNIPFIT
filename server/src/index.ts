import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import contactRoutes from './routes/contact';
import classesRoutes from './routes/classes';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';
import { validate } from './middleware/validate';
import { z } from 'zod';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/classes', classesRoutes);

// User routes (protected)
app.get('/api/users', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        memberships: true,
        measurements: true,
      },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

app.get('/api/users/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        memberships: true,
        measurements: true,
        workouts: true,
        bookings: {
          include: {
            class: true,
          },
        },
      },
    });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found', statusCode: 404 });
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Membership routes (protected)
app.get('/api/memberships', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const memberships = await prisma.membership.findMany({
      include: {
        user: true,
      },
    });
    res.json(memberships);
  } catch (error) {
    next(error);
  }
});

const membershipSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    plan: z.enum(['INTRO', 'PLUS', 'PREMIUM', 'MAX']),
    startDate: z.string().datetime().or(z.string().min(1)),
    endDate: z.string().datetime().or(z.string().min(1)),
    price: z.number().positive().optional(),
  }),
});

const PLAN_PRICES: Record<string, number> = {
  INTRO: 3999,
  PLUS: 7999,
  PREMIUM: 14999,
  MAX: 24999,
};

app.post('/api/memberships', authenticate, validate(membershipSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, plan, startDate, endDate, price } = req.body as {
      userId: string;
      plan: 'INTRO' | 'PLUS' | 'PREMIUM' | 'MAX';
      startDate: string;
      endDate: string;
      price?: number;
    };
    
    const membership = await prisma.membership.create({
      data: {
        userId,
        plan,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        price: price ?? PLAN_PRICES[plan] ?? 0,
      },
      include: {
        user: true,
      },
    });
    
    res.json(membership);
  } catch (error) {
    next(error);
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
