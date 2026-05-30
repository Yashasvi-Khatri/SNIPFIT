import '../config/env';
import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type SupabaseTokenClaims = {
  sub?: string;
  email?: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
  };
  exp?: number;
  iss?: string;
};

const getUserFromTokenFallback = (token: string): { email: string; name: string } | null => {
  const decoded = jwt.decode(token) as SupabaseTokenClaims | null;

  if (!decoded?.email || !decoded.sub) {
    return null;
  }

  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    return null;
  }

  return {
    email: decoded.email,
    name: decoded.user_metadata?.name || decoded.user_metadata?.full_name || decoded.email.split('@')[0] || 'User',
  };
};

const getUserFromDevHeaders = (req: Request): { email: string; name: string } | null => {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const email = req.header('X-Snipfit-User-Email');
  const name = req.header('X-Snipfit-User-Name');

  if (!email || !email.includes('@')) {
    return null;
  }

  return {
    email,
    name: name || email.split('@')[0] || 'User',
  };
};

const getFallbackRequestUser = (authUser: { email: string; name: string }) => ({
  id: authUser.email,
  email: authUser.email,
  role: 'MEMBER' as Role,
  name: authUser.name,
});

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

    const { data: { user }, error } = await supabase.auth.getUser(token);

    const fallbackUser = error || !user?.email
      ? getUserFromTokenFallback(token) || getUserFromDevHeaders(req)
      : null;
    const authUser = user?.email
      ? {
          email: user.email,
          name: user.user_metadata?.name || user.email.split('@')[0] || 'User',
        }
      : fallbackUser;

    if (!authUser) {
      res.status(401).json({ success: false, error: 'Invalid token', statusCode: 401 });
      return;
    }

    try {
      // Find or sync user in Prisma database
      let dbUser = await prisma.user.findUnique({
        where: { email: authUser.email },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          deletedAt: true,
        },
      });

      // If user doesn't exist in Prisma, create them
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: authUser.email,
            name: authUser.name,
            role: 'MEMBER',
          },
          select: {
            id: true,
            email: true,
            role: true,
            name: true,
            deletedAt: true,
          },
        });
      }

      if (dbUser.deletedAt) {
        res.status(401).json({ success: false, error: 'Account has been deleted', statusCode: 401 });
        return;
      }

      // Attach user to request
      req.user = {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        name: dbUser.name,
      };
    } catch (dbError: any) {
      if (process.env.NODE_ENV === 'production') {
        throw dbError;
      }

      console.warn('Database unavailable during auth sync; using session identity:', dbError?.message);
      req.user = getFallbackRequestUser(authUser);
    }

    next();
  } catch (error) {
    next(error);
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
