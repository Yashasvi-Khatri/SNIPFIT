import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { adminOnly, authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/admin/members - List members with filters and pagination
router.get('/', adminOnly, async (req, res) => {
  try {
    const {
      search = '',
      planType = '',
      status = '',
      page = '1',
      pageSize = '20'
    } = req.query;

    const pageNum = parseInt(page as string);
    const sizeNum = parseInt(pageSize as string);
    const skip = (pageNum - 1) * sizeNum;

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (planType && typeof planType === 'string') {
      where.memberships = {
        some: {
          plan: planType as 'INTRO' | 'PLUS' | 'PREMIUM' | 'MAX',
        },
      };
    }

    if (status && typeof status === 'string') {
      const membershipStatus = status;
      if (membershipStatus === 'NONE') {
        // Handle NONE case separately since it's not in the enum
        where.memberships = {
          none: {
            status: 'ACTIVE',
          },
        };
      } else if (['ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING'].includes(membershipStatus)) {
        where.memberships = {
          some: {
            status: membershipStatus,
          },
        };
      }
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get members with pagination
    const members = await prisma.user.findMany({
      where,
      skip,
      take: sizeNum,
      include: {
        memberships: {
          where: {
            status: 'ACTIVE',
          },
          orderBy: {
            endDate: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response
    const formattedMembers = members.map((member: any) => {
      const activeMembership = member.memberships && member.memberships.length > 0 ? member.memberships[0] : null;
      return {
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: member.role,
        planType: activeMembership?.plan || null,
        membershipStatus: activeMembership?.status || 'NONE',
        membershipExpiry: activeMembership?.endDate || null,
        joinDate: member.createdAt,
        avatarUrl: null, // Will be added when avatar feature is implemented
      };
    });

    res.json({
      members: formattedMembers,
      total,
      page: pageNum,
      pageSize: sizeNum,
    });
  } catch (error: any) {
    console.error('Error fetching members:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch members', statusCode: 500 });
  }
});

// GET /api/admin/members/:id - Get member details
router.get('/:id', adminOnly, async (req, res) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : String(req.params.id);

    const member = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        memberships: {
          orderBy: {
            startDate: 'desc',
          },
        },
      },
    });

    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found', statusCode: 404 });
    }

    const activeMembership = member.memberships && member.memberships.length > 0 ? member.memberships.find((m: any) => m.status === 'ACTIVE') : null;

    res.json({
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      planType: activeMembership?.plan || null,
      membershipStatus: activeMembership?.status || 'NONE',
      membershipExpiry: activeMembership?.endDate || null,
      joinDate: member.createdAt,
      avatarUrl: null,
      isSuspended: false,
    });
  } catch (error: any) {
    console.error('Error fetching member:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch member', statusCode: 500 });
  }
});

// PATCH /api/admin/members/:id/role - Change member role
router.patch('/:id/role', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['MEMBER', 'TRAINER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role', statusCode: 400 });
    }

    const member = await prisma.user.update({
      where: { id: typeof id === 'string' ? id : String(id), deletedAt: null },
      data: { role: role as 'MEMBER' | 'TRAINER' | 'ADMIN' },
    });

    res.json({ success: true, member });
  } catch (error: any) {
    console.error('Error changing role:', error);
    res.status(500).json({ success: false, error: 'Failed to change role', statusCode: 500 });
  }
});

// DELETE /api/admin/members/:id - Delete member (soft delete)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const idStr = typeof id === 'string' ? id : String(id);

    await prisma.user.update({
      where: { id: idStr, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting member:', error);
    res.status(500).json({ success: false, error: 'Failed to delete member', statusCode: 500 });
  }
});

// POST /api/admin/members/:id/renewal-reminder - Send renewal reminder
router.post('/:id/renewal-reminder', adminOnly, async (req, res) => {
  try {
    const { id: idInput } = req.params;
    const idStr = typeof idInput === 'string' ? idInput : String(idInput);

    const member = await prisma.user.findUnique({
      where: { id: idStr, deletedAt: null },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          orderBy: { endDate: 'desc' },
          take: 1,
        },
      },
    });

    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found', statusCode: 404 });
    }

    // Create notification for renewal reminder
    await prisma.notification.create({
      data: {
        userId: idStr,
        type: 'MEMBERSHIP_REMINDER',
        title: 'Membership Renewal Reminder',
        message: 'Your membership is expiring soon. Please renew to continue enjoying our services.',
        link: '/pricing',
      },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error sending reminder:', error);
    res.status(500).json({ success: false, error: 'Failed to send reminder', statusCode: 500 });
  }
});

// GET /api/admin/members/:id/memberships - Get membership history
router.get('/:id/memberships', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const idStr = typeof id === 'string' ? id : String(id);

    const memberships = await prisma.membership.findMany({
      where: { userId: idStr },
      orderBy: { startDate: 'desc' },
    });

    res.json(memberships.map(m => ({
      id: m.id,
      planType: m.plan,
      startDate: m.startDate,
      endDate: m.endDate,
      price: m.price,
      status: m.status,
      paymentRecorded: m.paymentId !== null,
    })));
  } catch (error: any) {
    console.error('Error fetching membership history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch membership history', statusCode: 500 });
  }
});

// GET /api/admin/members/:id/payments - Get payment history
router.get('/:id/payments', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const payments = await prisma.payment.findMany({
      where: { userId: typeof id === 'string' ? id : String(id) },
      orderBy: { createdAt: 'desc' },
    });

    res.json(payments.map(p => ({
      id: p.id,
      amount: p.amount,
      plan: p.plan,
      date: p.createdAt,
      paymentId: p.razorpayPaymentId,
      status: p.status,
    })));
  } catch (error: any) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch payment history', statusCode: 500 });
  }
});

// GET /api/admin/members/:id/bookings - Get booking history
router.get('/:id/bookings', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const bookings = await prisma.booking.findMany({
      where: { userId: typeof id === 'string' ? id : String(id) },
      orderBy: { bookedAt: 'desc' },
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
    });

    res.json(bookings.map((b: any) => ({
      id: b.id,
      className: b.class.name,
      trainer: b.class.trainer.name,
      date: b.class.startTime,
      status: b.status,
    })));
  } catch (error: any) {
    console.error('Error fetching booking history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch booking history', statusCode: 500 });
  }
});

// GET /api/admin/members/:id/workouts - Get workout stats
router.get('/:id/workouts', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const totalWorkouts = await prisma.workout.count({
      where: { userId: typeof id === 'string' ? id : String(id) },
    });

    const totalMeasurements = await prisma.measurement.count({
      where: { userId: typeof id === 'string' ? id : String(id) },
    });

    const lastWorkout = await prisma.workout.findFirst({
      where: { userId: typeof id === 'string' ? id : String(id) },
      orderBy: { date: 'desc' },
    });

    res.json({
      totalWorkouts,
      totalMeasurements,
      lastWorkoutDate: lastWorkout?.date,
    });
  } catch (error: any) {
    console.error('Error fetching workout stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch workout stats', statusCode: 500 });
  }
});

// PATCH /api/admin/members/:id/suspend - Toggle account suspension
router.patch('/:id/suspend', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const idStr = typeof id === 'string' ? id : String(id);

    const member = await prisma.user.findUnique({
      where: { id: idStr, deletedAt: null },
      select: { 
        accountLockedUntil: true,
      },
    });

    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found', statusCode: 404 });
    }

    // Toggle account lock instead of suspension (using existing field)
    const currentTime = new Date();
    const isLocked = member.accountLockedUntil && member.accountLockedUntil > currentTime;
    
    const updatedMember = await prisma.user.update({
      where: { id: typeof id === 'string' ? id : String(id) },
      data: { 
        accountLockedUntil: isLocked ? null : new Date(Date.now() + 24 * 60 * 60 * 1000) // Lock for 24 hours
      },
    });

    res.json({ success: true, isSuspended: updatedMember.accountLockedUntil !== null });
  } catch (error: any) {
    console.error('Error toggling suspension:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle suspension', statusCode: 500 });
  }
});

export default router;