import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient, MembershipPlan, BookingStatus, PaymentStatus } from '@prisma/client';
import { authenticate, adminOnly, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(adminOnly);

// GET /api/admin/stats - Get admin dashboard statistics
router.get('/stats', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const weekEndDate = new Date(now);
    weekEndDate.setDate(weekEndDate.getDate() + 7);

    // Member stats
    const totalMembers = await prisma.user.count({ where: { role: 'MEMBER' } });
    const activeMembers = await prisma.membership.count({
      where: {
        status: 'ACTIVE',
        endDate: { gte: now },
      },
    });
    const newThisMonth = await prisma.user.count({
      where: {
        role: 'MEMBER',
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    });
    const expiringIn7Days = await prisma.membership.count({
      where: {
        status: 'ACTIVE',
        endDate: { gte: now, lte: weekEndDate },
      },
    });

    // Revenue stats
    const thisMonthRevenue = await prisma.payment.aggregate({
      where: {
        status: PaymentStatus.COMPLETED,
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    });

    const lastMonthStart = new Date(monthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const lastMonthEnd = new Date(monthStart);
    lastMonthEnd.setDate(0);

    const lastMonthRevenue = await prisma.payment.aggregate({
      where: {
        status: PaymentStatus.COMPLETED,
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { amount: true },
    });

    const totalRevenue = await prisma.payment.aggregate({
      where: { status: PaymentStatus.COMPLETED },
      _sum: { amount: true },
    });

    // Revenue by plan
    const revenueByPlan = await prisma.payment.groupBy({
      by: ['plan'],
      where: { status: PaymentStatus.COMPLETED },
      _sum: { amount: true },
    });

    // Class stats
    const classesToday = await prisma.gymClass.count({
      where: {
        cancelledAt: null,
        startTime: {
          gte: new Date(now.setHours(0, 0, 0, 0)),
          lte: new Date(now.setHours(23, 59, 59, 999)),
        },
      },
    });

    const classesThisWeek = await prisma.gymClass.count({
      where: {
        cancelledAt: null,
        startTime: { gte: now, lte: weekEndDate },
      },
    });

    // Average occupancy for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentClasses = await prisma.gymClass.findMany({
      where: {
        cancelledAt: null,
        startTime: { gte: thirtyDaysAgo },
      },
      include: {
        _count: { select: { bookings: { where: { status: BookingStatus.CONFIRMED } } } },
      },
    });

    const avgOccupancy = recentClasses.length > 0
      ? recentClasses.reduce((sum, cls) => sum + (cls._count.bookings / cls.capacity) * 100, 0) / recentClasses.length
      : 0;

    // Recent activity (last 10 events)
    const recentPayments = await prisma.payment.findMany({
      where: { status: PaymentStatus.COMPLETED },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { name: true } } },
    });

    const recentMembers = await prisma.user.findMany({
      where: { role: 'MEMBER' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentBookings = await prisma.booking.findMany({
      where: { status: BookingStatus.CONFIRMED },
      orderBy: { bookedAt: 'desc' },
      take: 5,
      include: {
        user: { select: { name: true } },
        class: { select: { name: true } },
      },
    });

    const recentActivity: Array<{ type: string; description: string; timestamp: string }> = [];

    recentPayments.forEach((p) => {
      recentActivity.push({
        type: 'PAYMENT',
        description: `${p.user.name} made a ${p.plan} payment of ₹${p.amount}`,
        timestamp: p.createdAt.toISOString(),
      });
    });

    recentMembers.forEach((u) => {
      recentActivity.push({
        type: 'NEW_MEMBER',
        description: `${u.name} joined SNIPFIT`,
        timestamp: u.createdAt.toISOString(),
      });
    });

    recentBookings.forEach((b) => {
      recentActivity.push({
        type: 'BOOKING',
        description: `${b.user.name} booked ${b.class.name}`,
        timestamp: b.bookedAt.toISOString(),
      });
    });

    // Sort by timestamp and take latest 10
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      success: true,
      members: {
        total: totalMembers,
        active: activeMembers,
        newThisMonth,
        expiringIn7Days,
      },
      revenue: {
        thisMonth: thisMonthRevenue._sum.amount || 0,
        lastMonth: lastMonthRevenue._sum.amount || 0,
        total: totalRevenue._sum.amount || 0,
        byPlan: revenueByPlan.map((r) => ({ plan: r.plan, amount: r._sum.amount || 0 })),
      },
      classes: {
        today: classesToday,
        thisWeek: classesThisWeek,
        avgOccupancy: Math.round(avgOccupancy),
      },
      recentActivity: recentActivity.slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/members - Get all members with filtering, searching, pagination
router.get('/members', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(String(req.query.page || '1'), 10) || 1;
    const limit = parseInt(String(req.query.limit || '20'), 10) || 20;
    const q = req.query.q ? String(req.query.q) : '';
    const plan = req.query.plan ? String(req.query.plan) : '';
    const status = req.query.status ? String(req.query.status) : '';
    const sort = String(req.query.sort || 'createdAt');
    const order = req.query.order === 'asc' ? 'asc' : 'desc';
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { role: 'MEMBER' };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
      ];
    }

    if (plan || status) {
      where.memberships = {
        some: {},
      };
      if (plan) {
        where.memberships.some.plan = plan;
      }
      if (status === 'active') {
        where.memberships.some.status = 'ACTIVE';
        where.memberships.some.endDate = { gte: new Date() };
      } else if (status === 'expired') {
        where.memberships.some.endDate = { lt: new Date() };
      }
    }

    if (status === 'no_membership') {
      delete where.memberships;
      where.memberships = { none: {} };
    }

    const total = await prisma.user.count({ where });
    const members = await prisma.user.findMany({
      where,
      orderBy: { [sort === 'name' ? 'name' : sort === 'expiry' ? 'memberships' : 'createdAt']: order },
      skip,
      take: limit,
      include: {
        memberships: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            bookings: true,
            workouts: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      members: members.map((m) => {
        const latestMembership = m.memberships[0];
        const isExpiring = latestMembership && latestMembership.status === 'ACTIVE' &&
          latestMembership.endDate > new Date() &&
          latestMembership.endDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        return {
          id: m.id,
          name: m.name,
          email: m.email,
          phone: m.phone,
          role: m.role,
          avatarUrl: m.avatarUrl,
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
          deletedAt: m.deletedAt,
          plan: latestMembership?.plan || null,
          status: latestMembership?.endDate && latestMembership.endDate > new Date() && latestMembership.status === 'ACTIVE'
            ? (isExpiring ? 'EXPIRING' : 'ACTIVE')
            : (latestMembership && latestMembership.status === 'ACTIVE' ? 'EXPIRED' : 'NONE'),
          endDate: latestMembership?.endDate?.toISOString() || null,
          bookingsCount: m._count.bookings,
          workoutsCount: m._count.workouts,
        };
      }),
      total,
      page,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/members/expiring - Get memberships expiring in next 7 days
router.get('/members/expiring', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const now = new Date();
    const weekLater = new Date(now);
    weekLater.setDate(weekLater.getDate() + 7);

    const expiring = await prisma.membership.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { gte: now, lte: weekLater },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { endDate: 'asc' },
    });

    res.json({
      success: true,
      expiring: expiring.map((m) => ({
        membershipId: m.id,
        userId: m.user.id,
        name: m.user.name,
        email: m.user.email,
        phone: m.user.phone,
        plan: m.plan,
        expiryDate: m.endDate.toISOString(),
        daysLeft: Math.ceil((m.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/members/:id/role - Update member role
router.patch('/members/:id/role', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { role } = req.body;

    // Cannot change your own role
    if (id === req.user!.id) {
      res.status(400).json({ success: false, error: 'Cannot change your own role', statusCode: 400 });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/members/:id/membership - Create or update membership
router.patch('/members/:id/membership', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = String(req.params.id);
    const { plan, startDate, endDate, status } = req.body;

    // Check existing active membership
    const existing = await prisma.membership.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    let membership;
    if (existing) {
      // Update existing
      membership = await prisma.membership.update({
        where: { id: existing.id },
        data: {
          ...(plan ? { plan } : {}),
          ...(startDate ? { startDate: new Date(startDate) } : {}),
          ...(endDate ? { endDate: new Date(endDate) } : {}),
          ...(status ? { status } : {}),
        },
      });
    } else {
      // Create new
      membership = await prisma.membership.create({
        data: {
          userId,
          plan: plan || 'INTRO',
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          price: 0,
        },
      });
    }

    res.json({ success: true, membership });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/members/:id - Soft delete a member
router.delete('/members/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);

    if (id === req.user!.id) {
      res.status(400).json({ success: false, error: 'Cannot delete yourself', statusCode: 400 });
      return;
    }

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/revenue/monthly - Get last 12 months revenue
router.get('/revenue/monthly', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const payments = await prisma.payment.findMany({
      where: {
        status: PaymentStatus.COMPLETED,
        createdAt: { gte: twelveMonthsAgo },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by month
    const monthlyData: Record<string, { revenue: number; newMembers: number }> = {};

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = { revenue: 0, newMembers: 0 };
    }

    payments.forEach((p) => {
      const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key]) {
        monthlyData[key].revenue += p.amount;
      }
    });

    // Get new members per month
    const newMembers = await prisma.user.findMany({
      where: {
        role: 'MEMBER',
        createdAt: { gte: twelveMonthsAgo },
      },
      select: { createdAt: true },
    });

    newMembers.forEach((m) => {
      const key = `${m.createdAt.getFullYear()}-${String(m.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key]) {
        monthlyData[key].newMembers += 1;
      }
    });

    const result = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      newMembers: data.newMembers,
    }));

    res.json({ success: true, monthly: result });
  } catch (error) {
    next(error);
  }
});

export default router;