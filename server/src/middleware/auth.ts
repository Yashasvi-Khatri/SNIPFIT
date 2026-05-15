import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyAccessToken } from '../lib/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No token provided', statusCode: 401 });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify access token
    const decoded = verifyAccessToken(token);

    // Find user in database to ensure they still exist and aren't deleted
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        deletedAt: true,
        passwordHash: true,
      },
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'User not found', statusCode: 401 });
      return;
    }

    if (user.deletedAt) {
      res.status(401).json({ success: false, error: 'Account has been deleted', statusCode: 401 });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token', statusCode: 401 });
  }
};

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated', statusCode: 401 });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Insufficient permissions', statusCode: 403 });
      return;
    }

    next();
  };
};

// Role-specific middleware shortcuts
export const adminOnly = requireRole('ADMIN');
export const staffOnly = requireRole('ADMIN', 'TRAINER');
export const memberOrAbove = requireRole('ADMIN', 'TRAINER', 'MEMBER');
