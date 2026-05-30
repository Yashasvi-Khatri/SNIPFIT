import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendExpiryWarning } from '../lib/email';

const prisma = new PrismaClient();

// Run every day at 9:00 AM IST (3:30 AM UTC)
cron.schedule('30 3 * * *', async () => {
  try {
    console.log('Starting membership reminder cron job...');
    
    const now = new Date();
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    
    const oneDayLater = new Date(now);
    oneDayLater.setDate(oneDayLater.getDate() + 1);

    // 1. Find all memberships expiring in exactly 7 days
    const expiringIn7Days = await prisma.membership.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: now,
          lte: sevenDaysLater,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // 2. Find all memberships expiring in exactly 1 day
    const expiringIn1Day = await prisma.membership.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: now,
          lte: oneDayLater,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    let emailsSent = 0;

    // Send emails for 7-day warnings
    for (const membership of expiringIn7Days) {
      const daysLeft = Math.ceil((new Date(membership.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft === 7) {
        try {
          await sendExpiryWarning(membership.user.email, {
            name: membership.user.name,
            plan: membership.plan,
            expiryDate: membership.endDate.toISOString(),
            daysLeft,
          });
          emailsSent++;
        } catch (error) {
          console.error(`Failed to send 7-day warning to ${membership.user.email}:`, error);
        }
      }
    }

    // Send emails for 1-day warnings
    for (const membership of expiringIn1Day) {
      const daysLeft = Math.ceil((new Date(membership.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft === 1) {
        try {
          await sendExpiryWarning(membership.user.email, {
            name: membership.user.name,
            plan: membership.plan,
            expiryDate: membership.endDate.toISOString(),
            daysLeft,
          });
          emailsSent++;
        } catch (error) {
          console.error(`Failed to send 1-day warning to ${membership.user.email}:`, error);
        }
      }
    }

    console.log(`Reminder cron completed: Sent ${emailsSent} emails`);
  } catch (error) {
    console.error('Error in reminder cron job:', error);
  }
}, {
  timezone: 'Asia/Kolkata'
});

console.log('Membership reminder cron job scheduled to run daily at 9:00 AM IST');
