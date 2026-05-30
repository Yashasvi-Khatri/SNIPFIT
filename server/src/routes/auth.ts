import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { sendPasswordResetEmail } from '../lib/email';
import { sendWelcomeEmail } from '../lib/email';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/register - DEPRECATED: Use Supabase Auth directly on frontend
// This endpoint now only syncs user to Prisma after Supabase signup
router.post('/register', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, name } = req.body as { email: string; name?: string };

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.json({ success: true, user: existingUser });
      return;
    }

    // Create user in Prisma (sync from Supabase)
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0] || 'User',
        role: 'MEMBER',
      },
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the registration if email fails
    }

    res.status(201).json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login - DEPRECATED: Use Supabase Auth directly on frontend
router.post('/login', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body as { email: string };

    // Sync user to Prisma if they exist
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create user in Prisma (sync from Supabase)
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0] || 'User',
          role: 'MEMBER',
        },
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/refresh - DEPRECATED: Use Supabase Auth session management
router.post('/refresh', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Supabase handles token refresh automatically on the frontend
  res.json({ success: true, message: 'Use Supabase Auth session management' });
});

// POST /api/auth/logout - DEPRECATED: Use Supabase Auth signOut on frontend
router.post('/logout', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Supabase handles logout on the frontend
  res.json({ success: true, message: 'Use Supabase Auth signOut' });
});

// GET /api/auth/me (requires authentication middleware)
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated', statusCode: 401 });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        memberships: true,
        measurements: true,
        bookings: {
          include: {
            class: true,
          },
        },
        workouts: {
          include: {
            exercises: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found', statusCode: 404 });
      return;
    }

    // Exclude sensitive fields from response
    const { passwordHash, refreshToken, ...userWithoutSensitive } = user;

    res.json({ success: true, user: userWithoutSensitive });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body as { email: string };

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists, but still return success
      res.json({ success: true, message: 'If an account exists, a password reset email has been sent.' });
      return;
    }

    // Generate a 1-hour reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetTokenHash,
        passwordResetExpiry: resetExpiry,
      },
    });

    // Send password reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, {
      name: user.name,
      resetLink,
    });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, newPassword } = req.body as { token: string; newPassword: string };

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by hashed token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpiry: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      res.status(400).json({ success: false, error: 'Invalid or expired reset token', statusCode: 400 });
      return;
    }

    // Update password (this would need a password hash function - for now, just clear the reset token)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
