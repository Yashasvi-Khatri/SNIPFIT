import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { adminOnly, authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/admin/classes - List classes
router.get('/', adminOnly, async (req, res) => {
  try {
    const classes = await prisma.gymClass.findMany({
      where: {
        cancelledAt: null,
      },
      orderBy: {
        startTime: 'asc',
      },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
          },
        },
        bookings: {
          where: {
            status: 'CONFIRMED',
          },
          select: {
            id: true,
          },
        },
      },
    });

    const formattedClasses = classes.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      trainerId: c.trainerId,
      trainerName: c.trainer.name,
      startTime: c.startTime,
      endTime: c.endTime,
      capacity: c.capacity,
      enrolled: c.bookings.length,
      location: c.location,
      description: c.description,
      isRecurring: c.isRecurring,
      cancelledAt: c.cancelledAt,
    }));

    res.json(formattedClasses);
  } catch (error: any) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch classes', statusCode: 500 });
  }
});

// GET /api/admin/trainers - List trainers
router.get('/trainers', adminOnly, async (req, res) => {
  try {
    const trainers = await prisma.user.findMany({
      where: {
        role: 'TRAINER',
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.json(trainers);
  } catch (error: any) {
    console.error('Error fetching trainers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch trainers', statusCode: 500 });
  }
});

// POST /api/admin/classes - Create class
router.post('/', adminOnly, async (req, res) => {
  try {
    const { id: idInput } = req.params;
    const id = typeof idInput === 'string' ? idInput : String(idInput);
    const {
      name,
      type,
      trainerId: trainerIdInput,
      startTime,
      endTime,
      capacity,
      location,
      description,
      isRecurring,
    } = req.body;

    const trainerId = typeof trainerIdInput === 'string' ? trainerIdInput : String(trainerIdInput);

    const newClass = await prisma.gymClass.create({
      data: {
        name,
        type,
        trainerId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        capacity: parseInt(capacity),
        location,
        description,
        isRecurring: isRecurring || false,
      },
    });

    res.status(201).json({ success: true, class: newClass });
  } catch (error: any) {
    console.error('Error creating class:', error);
    res.status(500).json({ success: false, error: 'Failed to create class', statusCode: 500 });
  }
});

// PUT /api/admin/classes/:id - Update class
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const { id: idInput } = req.params;
    const id = typeof idInput === 'string' ? idInput : String(idInput);
    const {
      name,
      type,
      trainerId: trainerIdInput,
      startTime,
      endTime,
      capacity,
      location,
      description,
      isRecurring,
    } = req.body;

    const trainerId = typeof trainerIdInput === 'string' ? trainerIdInput : String(trainerIdInput);

    const updatedClass = await prisma.gymClass.update({
      where: { id },
      data: {
        name,
        type,
        trainerId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        capacity: parseInt(capacity),
        location,
        description,
        isRecurring,
      },
    });

    res.json({ success: true, class: updatedClass });
  } catch (error: any) {
    console.error('Error updating class:', error);
    res.status(500).json({ success: false, error: 'Failed to update class', statusCode: 500 });
  }
});

// PATCH /api/admin/classes/:id/cancel - Cancel class
router.patch('/:id/cancel', adminOnly, async (req, res) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : String(req.params.id);
    const idStr = typeof id === 'string' ? id : String(id);

    // Get confirmed bookings count
    const bookings = await prisma.booking.count({
      where: {
        classId: idStr,
        status: 'CONFIRMED',
      },
    });

    // Cancel the class
    await prisma.gymClass.update({
      where: { id: idStr },
      data: { cancelledAt: new Date() },
    });

    // Create notifications for all confirmed bookings
    const confirmedBookings = await prisma.booking.findMany({
      where: {
        classId: idStr,
        status: 'CONFIRMED',
      },
      include: {
        user: true,
        class: {
          select: {
            name: true,
          },
        },
      },
    });

    for (const booking of confirmedBookings) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          type: 'CLASS_CANCELLED',
          title: 'Class Cancelled',
          message: `The class "${booking.class.name}" has been cancelled.`,
        },
      });
    }

    res.json({ 
      success: true, 
      affectedMembers: bookings 
    });
  } catch (error: any) {
    console.error('Error cancelling class:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel class', statusCode: 500 });
  }
});

// DELETE /api/admin/classes/:id - Delete class
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const { id: idInput } = req.params;
    const id = typeof idInput === 'string' ? idInput : String(idInput);

    await prisma.gymClass.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting class:', error);
    res.status(500).json({ success: false, error: 'Failed to delete class', statusCode: 500 });
  }
});

// POST /api/admin/classes/:id/attendance - Mark attendance
router.post('/:id/attendance', adminOnly, async (req, res) => {
  try {
    const { id: idInput } = req.params;
    const id = typeof idInput === 'string' ? idInput : String(idInput);
    const { bookings } = req.body;

    for (const booking of bookings) {
      await prisma.booking.update({
        where: { id: booking.bookingId },
        data: { 
          status: booking.status,
          updatedAt: new Date(),
        },
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ success: false, error: 'Failed to mark attendance', statusCode: 500 });
  }
});

export default router;