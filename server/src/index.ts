import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

// @ts-ignore
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// User routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        membership: true,
        measurements: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        membership: true,
        measurements: true,
        workouts: true,
        dietPlans: true,
        enrollments: {
          include: {
            gymClass: true,
          },
        },
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Membership routes
app.get('/api/memberships', async (req, res) => {
  try {
    const memberships = await prisma.membership.findMany({
      include: {
        user: true,
        payments: true,
      },
    });
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch memberships' });
  }
});

app.post('/api/memberships', async (req, res) => {
  try {
    const { userId, plan, startDate, endDate } = req.body;
    
    const membership = await prisma.membership.create({
      data: {
        userId,
        plan,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      include: {
        user: true,
      },
    });
    
    res.json(membership);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create membership' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
