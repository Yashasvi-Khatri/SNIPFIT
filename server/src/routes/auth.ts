import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

// Helper function to set refresh token cookie
const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

// Helper function to clear refresh token cookie
const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
};

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body as {
      name: string;
      email: string;
      password: string;
      phone?: string;
    };

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ success: false, error: 'User already exists', statusCode: 409 });
      return;
    }

    // Hash password with bcrypt (salt rounds: 12)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone: phone || null,
        role: 'MEMBER',
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Hash refresh token and store in DB
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    // Set refresh token as httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    // Return user data and access token
    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        deletedAt: true,
      },
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid credentials', statusCode: 401 });
      return;
    }

    // Check if user is deleted
    if (user.deletedAt) {
      res.status(401).json({ success: false, error: 'Account has been deleted', statusCode: 401 });
      return;
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash || '');

    if (!isValidPassword) {
      res.status(401).json({ success: false, error: 'Invalid credentials', statusCode: 401 });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Hash refresh token and store in DB
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    // Set refresh token as httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    // Return user data and access token
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ success: false, error: 'No refresh token provided', statusCode: 401 });
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user with matching refresh token
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || !user.refreshToken) {
      res.status(401).json({ success: false, error: 'Invalid refresh token', statusCode: 401 });
      return;
    }

    // Verify the refresh token matches the stored hash
    const isValidRefreshToken = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isValidRefreshToken) {
      res.status(401).json({ success: false, error: 'Invalid refresh token', statusCode: 401 });
      return;
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Verify and get user ID
      try {
        const decoded = verifyRefreshToken(refreshToken);
        
        // Clear refresh token from DB
        await prisma.user.update({
          where: { id: decoded.id },
          data: { refreshToken: null },
        });
      } catch (error) {
        // Token verification failed, but still clear cookie
      }
    }

    // Clear the refresh token cookie
    clearRefreshTokenCookie(res);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me (requires authentication middleware)
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // This endpoint requires the authenticate middleware
    // The user will be attached to req.user by the middleware
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

export default router;
