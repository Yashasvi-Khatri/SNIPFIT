import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting specifically for admin login attempts
const adminLoginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { success: false, error: 'Too many admin login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Store rate limit data in memory (for production, use Redis)
const adminLoginAttempts = new Map<string, { count: number; resetTime: number }>();

// Check if account is locked
const isAccountLocked = (user: any): boolean => {
  if (!user.accountLockedUntil) return false;
  return new Date(user.accountLockedUntil) > new Date();
};

// Increment failed login attempts and lock account if necessary
const handleFailedLogin = async (userId: string, ipAddress?: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return;

  const newAttempts = (user.failedLoginAttempts || 0) + 1;
  const updateData: any = {
    failedLoginAttempts: newAttempts,
    lastFailedLoginAt: new Date(),
  };

  // Lock account after 5 failed attempts for 30 minutes
  if (newAttempts >= 5) {
    updateData.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  // Log the failed attempt
  await logAdminLoginAttempt(userId, ipAddress, false, 'Invalid security code');
};

// Reset failed login attempts on successful login
const resetFailedLogins = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lastFailedLoginAt: null,
      accountLockedUntil: null,
    },
  });
};

// Log admin login attempt
const logAdminLoginAttempt = async (
  userId: string,
  ipAddress: string | undefined,
  success: boolean,
  failureReason?: string
) => {
  try {
    await prisma.adminLoginLog.create({
      data: {
        userId,
        ipAddress: ipAddress || 'unknown',
        userAgent: 'web', // Could be extracted from request headers
        success,
        failureReason: failureReason || null,
      },
    });
  } catch (error) {
    console.error('Failed to log admin login attempt:', error);
  }
};

// Verify admin security code
const verifyAdminSecurityCode = (user: any, providedCode: string): boolean => {
  if (!user.adminSecurityCode) {
    // If no security code is set, allow admin login (for initial setup)
    return true;
  }
  
  // Compare the provided code with the stored code
  // In production, use proper hashing comparison with timing-safe equality
  return user.adminSecurityCode === providedCode;
};

// POST /api/admin-auth/verify-security-code
// Verify admin security code before allowing admin dashboard access
router.post('/verify-security-code', adminLoginRateLimit, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, securityCode } = req.body as { email: string; securityCode: string };
    const ipAddress = req.ip || req.socket.remoteAddress;

    if (!email || !securityCode) {
      res.status(400).json({ success: false, error: 'Email and security code are required', statusCode: 400 });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists for security
      await new Promise(resolve => setTimeout(resolve, 1000)); // Slow down response
      res.status(401).json({ success: false, error: 'Invalid credentials', statusCode: 401 });
      return;
    }

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      await logAdminLoginAttempt(user.id, ipAddress, false, 'User is not an admin');
      res.status(403).json({ success: false, error: 'Access denied', statusCode: 403 });
      return;
    }

    // Check if account is locked
    if (isAccountLocked(user)) {
      await logAdminLoginAttempt(user.id, ipAddress, false, 'Account is locked');
      res.status(423).json({ 
        success: false, 
        error: 'Account is temporarily locked due to too many failed attempts. Please try again later.', 
        statusCode: 423 
      });
      return;
    }

    // Verify security code
    if (!verifyAdminSecurityCode(user, securityCode)) {
      await handleFailedLogin(user.id, ipAddress);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Slow down response
      res.status(401).json({ success: false, error: 'Invalid security code', statusCode: 401 });
      return;
    }

    // Successful verification
    await resetFailedLogins(user.id);
    await logAdminLoginAttempt(user.id, ipAddress, true);

    res.json({ 
      success: true, 
      message: 'Security code verified successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/admin-auth/set-security-code
// Set or update admin security code (requires existing admin authentication)
router.post('/set-security-code', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, currentCode, newCode } = req.body as { userId: string; currentCode?: string; newCode: string };

    if (!userId || !newCode) {
      res.status(400).json({ success: false, error: 'User ID and new security code are required', statusCode: 400 });
      return;
    }

    // Validate security code format (at least 6 characters, alphanumeric)
    if (newCode.length < 6 || !/^[a-zA-Z0-9]+$/.test(newCode)) {
      res.status(400).json({ 
        success: false, 
        error: 'Security code must be at least 6 alphanumeric characters', 
        statusCode: 400 
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found', statusCode: 404 });
      return;
    }

    if (user.role !== 'ADMIN') {
      res.status(403).json({ success: false, error: 'Only admins can set security codes', statusCode: 403 });
      return;
    }

    // If user already has a security code, verify the current one
    if (user.adminSecurityCode && currentCode !== user.adminSecurityCode) {
      res.status(401).json({ success: false, error: 'Current security code is incorrect', statusCode: 401 });
      return;
    }

    // Update security code
    await prisma.user.update({
      where: { id: userId },
      data: { adminSecurityCode: newCode },
    });

    res.json({ success: true, message: 'Security code updated successfully' });

  } catch (error) {
    next(error);
  }
});

// GET /api/admin-auth/login-history/:userId
// Get admin login history (for audit purposes)
router.get('/login-history/:userId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId;

    const logs = await prisma.adminLoginLog.findMany({
      where: { userId: userId as string },
      orderBy: { createdAt: 'desc' as const },
      take: 50, // Limit to last 50 attempts
    });

    res.json({ success: true, logs });

  } catch (error) {
    next(error);
  }
});

export default router;
