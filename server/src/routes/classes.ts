import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient, ClassType, BookingStatus } from '@prisma/client';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { sendBookingConfirmation } from '../lib/email';
import { sendBookingCancellation } from '../lib/email';

const router = express.Router();
const prisma = new PrismaClient();

const createClassSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.nativeEnum(ClassType),
    trainerId: z.string().min(1),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    capacity: z.number().int().min(1).optional().default(20),
    location: z.string().optional().default('Main Floor'),
    description: z.string().optional(),
    isRecurring: z.boolean().optional().default(false),
  }),
});

// GET /api/classes (public, no auth required)
// Returns classes with available spots and booking status if user is authenticated
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate, type, trainerId } = req.query;
    const userId = (req as any).user?.id; // Only if authenticated

    // Default: current week (Monday to Sunday)
    const now = new Date();
    const defaultStart = new Date(now);
    defaultStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    defaultStart.setHours(0, 0, 0, 0);
    
    const defaultEnd = new Date(defaultStart);
    defaultEnd.setDate(defaultStart.getDate() + 6); // Sunday
    defaultEnd.setHours(23, 59, 59, 999);

    const start = startDate ? new Date(String(startDate)) : defaultStart;
    const end = endDate ? new Date(String(endDate)) : defaultEnd;

    // Build where clause
    const where: any = {
      cancelledAt: null,
      startTime: { gte: start, lte: end },
    };

    if (type) where.type = String(type);
    if (trainerId) where.trainerId = String(trainerId);

    const classes = await prisma.gymClass.findMany({
      where,
      include: {
        trainer: {
          select: { id: true, name: true },
        },
        bookings: {
          where: { status: BookingStatus.CONFIRMED },
          select: { id: true, userId: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // Transform response with spots available and booking status
    const classesWithSpots = classes.map((cls) => ({
      id: cls.id,
      name: cls.name,
      type: cls.type,
      trainer: cls.trainer,
      startTime: cls.startTime.toISOString(),
      endTime: cls.endTime.toISOString(),
      capacity: cls.capacity,
      spotsAvailable: cls.capacity - cls.bookings.length,
      location: cls.location,
      description: cls.description,
      isRecurring: cls.isRecurring,
      isBooked: userId ? cls.bookings.some((b) => b.userId === userId) : false,
    }));

    res.json({ success: true, classes: classesWithSpots });
  } catch (error) {
    next(error);
  }
});

// POST /api/classes/:id/book - Book a class (requires auth)
router.post('/:id/book', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const classId = String(req.params.id);

    // Check: class exists and is not cancelled
    const gymClass = await prisma.gymClass.findUnique({
      where: { id: classId },
      include: {
        bookings: {
          where: { status: BookingStatus.CONFIRMED },
        },
      },
    });

    if (!gymClass) {
      res.status(404).json({ success: false, error: 'Class not found', statusCode: 404 });
      return;
    }

    if (gymClass.cancelledAt) {
      res.status(400).json({ success: false, error: 'This class has been cancelled', statusCode: 400 });
      return;
    }

    // Check: class hasn't started yet
    if (new Date(gymClass.startTime) <= new Date()) {
      res.status(400).json({ success: false, error: 'This class has already started', statusCode: 400 });
      return;
    }

    // Check: spots available
    if (gymClass.bookings.length >= gymClass.capacity) {
      res.status(400).json({ success: false, error: 'This class is full', statusCode: 400 });
      return;
    }

    // Check: user doesn't already have a booking for this class
    const existingBooking = await prisma.booking.findUnique({
      where: {
        userId_classId: { userId, classId },
      },
    });

    if (existingBooking && existingBooking.status === BookingStatus.CONFIRMED) {
      res.status(400).json({ success: false, error: 'You already have a booking for this class', statusCode: 400 });
      return;
    }

    // Check: user has an active membership
    const activeMembership = await prisma.membership.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
    });

    if (!activeMembership) {
      res.status(400).json({ success: false, error: 'Active membership required to book classes', statusCode: 400 });
      return;
    }

    // Upsert booking (create if doesn't exist, update if cancelled)
    const booking = await prisma.booking.upsert({
      where: {
        userId_classId: { userId, classId },
      },
      update: {
        status: BookingStatus.CONFIRMED,
      },
      create: {
        userId,
        classId,
        status: BookingStatus.CONFIRMED,
      },
      include: {
        class: {
          include: {
            trainer: {
              select: { name: true },
            },
          },
        },
      },
    });

    // Fetch user for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    res.status(201).json({
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        class: {
          name: booking.class.name,
          startTime: booking.class.startTime.toISOString(),
        },
      },
    });

    // Send booking confirmation email
    if (user) {
      try {
        await sendBookingConfirmation(user.email, {
          name: user.name,
          className: booking.class.name,
          trainerName: booking.class.trainer.name,
          date: new Date(booking.class.startTime).toLocaleDateString(),
          startTime: new Date(booking.class.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: new Date(booking.class.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: booking.class.location,
        });
      } catch (emailError) {
        console.error('Failed to send booking confirmation email:', emailError);
        // Don't fail the booking if email fails
      }
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/classes/:id/book - Cancel a booking (requires auth)
router.delete('/:id/book', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const classId = String(req.params.id);

    // Find user's booking for this class
    const booking = await prisma.booking.findUnique({
      where: {
        userId_classId: { userId, classId },
      },
      include: {
        class: { select: { startTime: true, name: true } },
      },
    });

    if (!booking) {
      res.status(404).json({ success: false, error: 'Booking not found', statusCode: 404 });
      return;
    }

    // Check: class is more than 2 hours away
    const now = new Date();
    const classStart = new Date(booking.class.startTime);
    const hoursUntilClass = (classStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilClass < 2) {
      res.status(400).json({
        success: false,
        error: 'Cannot cancel booking within 2 hours of class start time',
        statusCode: 400,
      });
      return;
    }

    // Update booking status to CANCELLED
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.CANCELLED },
    });

    // Fetch user for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    // Send cancellation email
    if (user) {
      try {
        await sendBookingCancellation(user.email, {
          name: user.name,
          className: booking.class.name,
          date: new Date(booking.class.startTime).toLocaleDateString(),
        });
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
        // Don't fail the cancellation if email fails
      }
    }

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/classes/my-bookings - Get user's bookings (requires auth)
router.get('/my-bookings', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        class: {
          include: {
            trainer: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: {
        class: {
          startTime: 'asc',
        },
      },
    });

    const now = new Date();
    const upcoming = bookings.filter((b) => b.class.startTime >= now && b.status === BookingStatus.CONFIRMED);
    const past = bookings.filter((b) => b.class.startTime < now || b.status !== BookingStatus.CONFIRMED);

    res.json({
      success: true,
      upcoming: upcoming.map((b) => ({
        id: b.id,
        status: b.status,
        className: b.class.name,
        type: b.class.type,
        trainerName: b.class.trainer.name,
        startTime: b.class.startTime.toISOString(),
        endTime: b.class.endTime.toISOString(),
        location: b.class.location,
      })),
      past: past.map((b) => ({
        id: b.id,
        status: b.status,
        className: b.class.name,
        type: b.class.type,
        trainerName: b.class.trainer.name,
        startTime: b.class.startTime.toISOString(),
        endTime: b.class.endTime.toISOString(),
        location: b.class.location,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Admin endpoints
// POST /api/admin/classes - Create a class (admin only)
router.post('/', adminOnly, validate(createClassSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, type, trainerId, startTime, endTime, capacity, location, description, isRecurring } = req.body as {
      name: string;
      type: ClassType;
      trainerId: string;
      startTime: string;
      endTime: string;
      capacity?: number;
      location?: string;
      description?: string;
      isRecurring?: boolean;
    };

    const gymClass = await prisma.gymClass.create({
      data: {
        name,
        type,
        trainerId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        capacity: capacity || 20,
        location: location || 'Main Floor',
        description: description || null,
        isRecurring: isRecurring || false,
      },
      include: {
        trainer: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ success: true, class: gymClass });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/classes/:id - Update a class (admin only)
router.patch('/:id', adminOnly, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { name, type, startTime, endTime, capacity, location, description, isRecurring } = req.body;

    const gymClass = await prisma.gymClass.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(type ? { type } : {}),
        ...(startTime ? { startTime: new Date(startTime) } : {}),
        ...(endTime ? { endTime: new Date(endTime) } : {}),
        ...(capacity ? { capacity } : {}),
        ...(location ? { location } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(isRecurring !== undefined ? { isRecurring } : {}),
      },
      include: {
        trainer: { select: { id: true, name: true } },
      },
    });

    res.json({ success: true, class: gymClass });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/classes/:id - Cancel a class (admin only)
router.delete('/:id', adminOnly, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);

    // Set cancelledAt instead of deleting
    const gymClass = await prisma.gymClass.update({
      where: { id },
      data: { cancelledAt: new Date() },
    });

    // Notify booked members (create notifications)
    const bookings = await prisma.booking.findMany({
      where: { classId: id, status: BookingStatus.CONFIRMED },
      select: { userId: true },
    });

    // Create notifications for all booked members
    if (bookings.length > 0) {
      await prisma.notification.createMany({
        data: bookings.map((b) => ({
          userId: b.userId,
          title: 'Class Cancelled',
          message: `${gymClass.name} on ${gymClass.startTime.toLocaleDateString()} has been cancelled.`,
          type: 'class_cancelled',
          link: '/schedule',
        })),
      });
    }

    res.json({ success: true, message: 'Class cancelled, members notified' });
  } catch (error) {
    next(error);
  }
});

export default router;