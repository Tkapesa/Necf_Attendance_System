import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { createError } from './errorHandler';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Access token required', 401);
    }

    const token = authHeader.substring(7);

    if (!process.env.JWT_SECRET) {
      throw createError('JWT secret not configured', 500);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw createError('User not found', 401);
    }

    if (user.status !== 'ACTIVE') {
      throw createError('User account is not active', 401);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.name,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError('Invalid token', 401);
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw createError('Token expired', 401);
    }
    throw error;
  }
};

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw createError('Insufficient permissions', 403);
    }

    next();
  };
};

// Convenience functions for common role combinations
export const requireAdmin = authorize(['SUPER_ADMIN', 'ADMIN']);
export const requirePastor = authorize(['SUPER_ADMIN', 'ADMIN', 'PASTOR']);
export const requireLeader = authorize(['SUPER_ADMIN', 'ADMIN', 'PASTOR', 'ELDER', 'LEADER']);
export const requireMember = authorize(['SUPER_ADMIN', 'ADMIN', 'PASTOR', 'ELDER', 'LEADER', 'MEMBER']);

// Optional authentication for endpoints that can work with or without auth
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }

    const token = authHeader.substring(7);

    if (!process.env.JWT_SECRET) {
      return next(); // Continue without user if JWT_SECRET not configured
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: true,
      },
    });

    if (user && user.status === 'ACTIVE') {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role.name,
      };
    }

    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};
