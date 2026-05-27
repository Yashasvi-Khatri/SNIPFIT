import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient, MembershipPlan, MembershipStatus, ClassType, BookingStatus } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to get time-based greeting
const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// GET /api/members/me/dashboard - Get member dashboard data
router.get('/me/dashboard', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get user with latest membership
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        memberships: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found', statusCode: 404 });
      return;
    }

    // Get current month's date range
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get classes attended this month
    const classesThisMonth = await prisma.booking.count({
      where: {
        userId,
        status: BookingStatus.ATTENDED,
        bookedAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // Get workouts this month
    const workoutsThisMonth = await prisma.workout.count({
      where: {
        userId,
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // Get total workouts
    const totalWorkouts = await prisma.workout.count({
      where: { userId },
    });

    // Calculate streak days (consecutive days with workout or class attendance)
    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    const attendedBookings = await prisma.booking.findMany({
      where: {
        userId,
        status: BookingStatus.ATTENDED,
      },
      orderBy: { bookedAt: 'desc' },
      select: { bookedAt: true },
    });

    // Combine all activity dates
    const activityDates = [
      ...workouts.map(w => w.createdAt.toDateString()),
      ...attendedBookings.map(b => b.bookedAt.toDateString()),
    ];

    // Calculate streak
    let streakDays = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    // Check if there's activity today or yesterday to start the streak
    if (activityDates.includes(today) || activityDates.includes(yesterday)) {
      streakDays = 1;
      let checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - 1); // Start from yesterday

      // Count consecutive days backwards
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const dateStr = checkDate.toDateString();
        
        if (activityDates.includes(dateStr)) {
          streakDays++;
        } else {
          break;
        }
      }
    }

    // Get upcoming classes (next 3 confirmed bookings in the future)
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        userId,
        status: BookingStatus.CONFIRMED,
        class: {
          startTime: {
            gte: new Date(),
          },
        },
      },
      include: {
        class: {
          include: {
            trainer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        class: {
          startTime: 'asc',
        },
      },
      take: 3,
    });

    const upcomingClasses = upcomingBookings.map(booking => ({
      bookingId: booking.id,
      className: booking.class.name,
      type: booking.class.type,
      trainerName: booking.class.trainer.name,
      startTime: booking.class.startTime.toISOString(),
      endTime: booking.class.endTime.toISOString(),
      location: booking.class.location,
    }));

    // Get recent workouts (last 5)
    const recentWorkouts = await prisma.workout.findMany({
      where: { userId },
      include: {
        exercises: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentWorkoutsData = recentWorkouts.map(workout => ({
      id: workout.id,
      date: workout.date.toISOString(),
      exerciseCount: workout.exercises.length,
      duration: workout.duration,
      notes: workout.notes,
    }));

    // Get latest measurement
    const latestMeasurement = await prisma.measurement.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    // Process membership data
    const latestMembership = user.memberships[0];
    let membershipData = null;

    if (latestMembership) {
      const startDate = latestMembership.startDate;
      const endDate = latestMembership.endDate;
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const percentUsed = ((totalDays - daysRemaining) / totalDays) * 100;

      membershipData = {
        plan: latestMembership.plan as MembershipPlan,
        status: latestMembership.status as MembershipStatus,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        daysRemaining: Math.max(0, daysRemaining),
        totalDays,
        percentUsed: Math.max(0, Math.min(100, percentUsed)),
      };
    }

    // Build response
    const dashboardData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      membership: membershipData,
      stats: {
        classesThisMonth,
        workoutsThisMonth,
        totalWorkouts,
        streakDays,
      },
      upcomingClasses,
      recentWorkouts: recentWorkoutsData,
      latestMeasurement: latestMeasurement ? {
        date: latestMeasurement.date.toISOString(),
        weightKg: latestMeasurement.weightKg,
        bodyFatPct: latestMeasurement.bodyFatPct,
      } : null,
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    next(error);
  }
});

// GET /api/members/me/card - Get digital membership card data
router.get('/me/card', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get user with latest membership
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        memberships: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found', statusCode: 404 });
      return;
    }

    // Get latest membership
    const latestMembership = user.memberships[0];
    const membershipId = latestMembership?.id ?? 'NO_MEMBERSHIP';

    // Generate QR data
    const qrData = `SNIPFIT:MEMBER:${userId}:${membershipId}`;

    // Build response
    const cardData = {
      memberId: user.id,
      name: user.name,
      email: user.email,
      plan: latestMembership?.plan ?? null,
      expiryDate: latestMembership?.endDate.toISOString() ?? null,
      memberSince: user.createdAt.toISOString(),
      qrData,
    };

    res.json({ success: true, data: cardData });
  } catch (error) {
    next(error);
  }
});

export default router;
