import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError | ZodError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  // Default error
  let error: AppError = {
    name: err.name,
    message: err.message,
    statusCode: 500,
    isOperational: true,
  };

  // Zod validation errors
  if (err instanceof ZodError) {
    error = {
      name: 'ValidationError',
      message: 'Invalid input data',
      statusCode: 400,
      isOperational: true,
    };
    
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Invalid input data',
      details: err.issues.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code,
      })),
    });
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    switch (prismaError.code) {
      case 'P2002':
        error = {
          name: 'DuplicateError',
          message: 'Resource already exists',
          statusCode: 409,
          isOperational: true,
        };
        break;
      case 'P2025':
        error = {
          name: 'NotFoundError',
          message: 'Resource not found',
          statusCode: 404,
          isOperational: true,
        };
        break;
      case 'P2003':
        error = {
          name: 'ForeignKeyError',
          message: 'Invalid reference to related resource',
          statusCode: 400,
          isOperational: true,
        };
        break;
      default:
        error = {
          name: 'DatabaseError',
          message: 'Database operation failed',
          statusCode: 500,
          isOperational: true,
        };
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      name: 'AuthenticationError',
      message: 'Invalid token',
      statusCode: 401,
      isOperational: true,
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      name: 'AuthenticationError',
      message: 'Token expired',
      statusCode: 401,
      isOperational: true,
    };
  }

  // Use existing error properties if available
  if ('statusCode' in err && err.statusCode) {
    error.statusCode = err.statusCode;
  }

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Details:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode: error.statusCode,
    });
  }

  // Send error response
  return res.status(error.statusCode || 500).json({
    success: false,
    error: error.name,
    message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
