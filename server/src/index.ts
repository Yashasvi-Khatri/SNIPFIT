import './config/env';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import adminAuthRoutes from './routes/adminAuth';
import adminInvitationRoutes from './routes/adminInvitations';
import dashboardRoutes from './routes/dashboard';
import contactRoutes from './routes/contact';
import classesRoutes from './routes/classes';
import membersRoutes from './routes/members';
import workoutsRoutes from './routes/workouts';
import measurementsRoutes from './routes/measurements';
import adminRoutes from './routes/admin';
import adminMembersRoutes from './routes/adminMembers';
import adminClassesRoutes from './routes/adminClasses';
import settingsRoutes from './routes/settings';
import notificationsRoutes from './routes/notifications';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';
import { validate } from './middleware/validate';
import { z } from 'zod';
import './jobs/reminderCron';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins during development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // Allow the configured frontend URL
    if (origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
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
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/admin-invitations', adminInvitationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/measurements', measurementsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/members', adminMembersRoutes);
app.use('/api/admin/classes', adminClassesRoutes);
app.use('/api/members/me', settingsRoutes);
app.use('/api/auth/change-password', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);

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
