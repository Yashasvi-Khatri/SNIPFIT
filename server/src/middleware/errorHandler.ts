import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ZodError } from 'zod';

interface ErrorResponse {
  success: false;
  error: string;
  statusCode: number;
  details?: any;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error occurred:', err);
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // Unique constraint violation
      res.status(409).json({
        success: false,
        error: 'A record with this value already exists',
        statusCode: 409,
        details: err.meta,
      });
      return;
    }
    if (err.code === 'P2025') {
      // Record not found
      res.status(404).json({
        success: false,
        error: 'Record not found',
        statusCode: 404,
      });
      return;
    }
  }

  // JWT errors
  if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      success: false,
      error: 'Invalid token',
      statusCode: 401,
    });
    return;
  }

  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      success: false,
      error: 'Token expired',
      statusCode: 401,
    });
    return;
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      statusCode: 400,
      details: err.errors,
    });
    return;
  }

  // Generic error
  const statusCode = (err as any).statusCode || 500;
  const message = err.message || 'Internal server error';

  const response: ErrorResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'An error occurred' : message,
    statusCode,
  };

  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.details = { stack: err.stack };
  }

  res.status(statusCode).json(response);
};
