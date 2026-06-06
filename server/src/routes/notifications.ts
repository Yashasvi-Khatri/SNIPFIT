import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/notifications - List notifications
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;

    const notifications = await prisma.notification.findMany({
      where: { userId: userId! },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId!,
        read: false,
      },
    });

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications', statusCode: 500 });
  }
});

// PATCH /api/notifications/:id/read - Mark as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    await prisma.notification.updateMany({
      where: {
        id,
        userId: userId!,
      },
      data: { read: true },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notification as read', statusCode: 500 });
  }
});

// PATCH /api/notifications/mark-all-read - Mark all as read
router.patch('/mark-all-read', async (req, res) => {
  try {
    const userId = req.user?.id;

    await prisma.notification.updateMany({
      where: {
        userId: userId!,
        read: false,
      },
      data: { read: true },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark all notifications as read', statusCode: 500 });
  }
});

export default router;