import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
  // POST /auth/login
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    // Find user with role information
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw createError('Invalid credentials', 401);
    }

    // Check if account is active
    if (user.status !== 'ACTIVE') {
      throw createError('Account is not active', 401);
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw createError('Account is temporarily locked', 423);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment login attempts
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: user.loginAttempts + 1,
          lockedUntil: user.loginAttempts >= 4 ? new Date(Date.now() + 15 * 60 * 1000) : null, // Lock for 15 minutes after 5 attempts
        },
      });

      throw createError('Invalid credentials', 401);
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw createError('JWT secret not configured', 500);
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role.name,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // Reset login attempts and update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Return user data without sensitive information
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.name,
          status: user.status,
        },
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    });
  }

  // POST /auth/register (Admin only)
  async register(req: Request, res: Response) {
    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw createError('User already exists with this email', 409);
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Get default member role
    const memberRole = await prisma.role.findUnique({
      where: { name: 'MEMBER' },
    });

    if (!memberRole) {
      throw createError('Default role not found', 500);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
        phone,
        roleId: memberRole.id,
        status: 'ACTIVE', // Auto-activate for admin-created accounts
        emailVerifiedAt: new Date(),
      },
      include: {
        role: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.name,
          status: user.status,
        },
      },
    });
  }

  // POST /auth/logout
  async logout(req: Request, res: Response) {
    // In a stateless JWT system, logout is handled client-side
    // Here we could implement token blacklisting if needed
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  // POST /auth/refresh
  async refreshToken(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Refresh token required', 401);
    }

    const token = authHeader.substring(7);
    
    if (!process.env.JWT_SECRET) {
      throw createError('JWT secret not configured', 500);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true }) as any;
      
      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { role: true },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw createError('User not found or inactive', 401);
      }

      // Generate new token
      const newToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role.name,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        },
      });
    } catch (error) {
      throw createError('Invalid refresh token', 401);
    }
  }

  // GET /auth/profile
  async getProfile(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        role: true,
        member: {
          include: {
            cell: true,
          },
        },
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          address: user.address,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
          profilePictureUrl: user.profilePicture,
          role: user.role.name,
          status: user.status,
          lastLoginAt: user.lastLoginAt,
          member: user.member ? {
            id: user.member.id,
            membershipId: user.member.membershipId,
            membershipStatus: user.member.membershipStatus,
            joinDate: user.member.joinDate,
            cell: user.member.cell ? {
              id: user.member.cell.id,
              name: user.member.cell.name,
            } : null,
          } : null,
        },
      },
    });
  }

  // PUT /auth/profile
  async updateProfile(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      zipCode,
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(zipCode && { zipCode }),
      },
      include: {
        role: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone,
          dateOfBirth: updatedUser.dateOfBirth,
          gender: updatedUser.gender,
          address: updatedUser.address,
          city: updatedUser.city,
          state: updatedUser.state,
          zipCode: updatedUser.zipCode,
          role: updatedUser.role.name,
          status: updatedUser.status,
        },
      },
    });
  }

  // POST /auth/change-password
  async changePassword(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw createError('Current password is incorrect', 400);
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        password: newPasswordHash,
      },
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  }
}
