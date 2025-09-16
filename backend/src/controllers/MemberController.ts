import { Response } from 'express';
import { prisma } from '../index';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class MemberController {
  // POST /members - Create new member
  async createMember(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      zipCode,
      cellId,
      membershipStatus = 'ACTIVE',
      joinDate,
    } = req.body;

    // Check if email already exists
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        throw createError('User already exists with this email', 409);
      }
    }

    // Validate cell exists if provided
    if (cellId) {
      const cell = await prisma.cell.findUnique({
        where: { id: cellId },
      });

      if (!cell) {
        throw createError('Cell not found', 404);
      }
    }

    // Generate unique membership ID
    const membershipId = await this.generateMembershipId();

    // Create user first if email is provided
    let userId: string | null = null;
    if (email) {
      const memberRole = await prisma.role.findUnique({
        where: { name: 'MEMBER' },
      });

      if (!memberRole) {
        throw createError('Member role not found', 500);
      }

      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          firstName,
          lastName,
          phone,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender,
          address,
          city,
          state,
          zipCode,
          roleId: memberRole.id,
          status: 'PENDING', // Will be activated when they set their password
          password: '', // Will be set when they complete registration
        },
      });

      userId = newUser.id;
    }

    // Create member record
    const member = await prisma.member.create({
      data: {
        firstName,
        lastName,
        email: email?.toLowerCase(),
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        city,
        state,
        zipCode,
        membershipId,
        membershipStatus,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
        cellId,
        userId,
        createdById: req.user.id,
      },
      include: {
        cell: true,
        user: {
          include: {
            role: true,
          },
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: {
        member: {
          id: member.id,
          membershipId: member.membershipId,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          phone: member.phone,
          dateOfBirth: member.dateOfBirth,
          gender: member.gender,
          address: member.address,
          city: member.city,
          state: member.state,
          zipCode: member.zipCode,
          membershipStatus: member.membershipStatus,
          joinDate: member.joinDate,
          cell: member.cell ? {
            id: member.cell.id,
            name: member.cell.name,
          } : null,
          user: member.user ? {
            id: member.user.id,
            status: member.user.status,
            role: member.user.role.name,
          } : null,
          createdBy: member.createdBy ? {
            name: `${member.createdBy.firstName} ${member.createdBy.lastName}`,
          } : null,
          createdAt: member.createdAt,
        },
      },
    });
  }

  // GET /members - List all members with filtering and pagination
  async getMembers(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const {
      page = '1',
      limit = '20',
      search,
      status,
      cellId,
      gender,
      sortBy = 'firstName',
      sortOrder = 'asc',
    } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { membershipId: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.membershipStatus = status;
    }

    if (cellId) {
      where.cellId = cellId;
    }

    if (gender) {
      where.gender = gender;
    }

    // Get total count for pagination
    const totalMembers = await prisma.member.count({ where });

    // Get members
    const members = await prisma.member.findMany({
      where,
      skip,
      take: limitNumber,
      orderBy: {
        [sortBy as string]: sortOrder,
      },
      include: {
        cell: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            status: true,
            lastLoginAt: true,
          },
        },
        _count: {
          select: {
            attendance: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(totalMembers / limitNumber);

    res.json({
      success: true,
      data: {
        members: members.map((member: any) => ({
          id: member.id,
          membershipId: member.membershipId,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          phone: member.phone,
          dateOfBirth: member.dateOfBirth,
          gender: member.gender,
          membershipStatus: member.membershipStatus,
          joinDate: member.joinDate,
          cell: member.cell,
          userStatus: member.user?.status || null,
          lastLoginAt: member.user?.lastLoginAt || null,
          attendanceCount: member._count.attendance,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
        })),
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalMembers,
          hasNextPage: pageNumber < totalPages,
          hasPreviousPage: pageNumber > 1,
        },
      },
    });
  }

  // GET /members/:id - Get member by ID
  async getMemberById(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        cell: true,
        user: {
          include: {
            role: true,
          },
        },
        attendance: {
          include: {
            session: {
              select: {
                id: true,
                name: true,
                sessionType: true,
                startTime: true,
                endTime: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // Last 10 attendance records
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!member) {
      throw createError('Member not found', 404);
    }

    res.json({
      success: true,
      data: {
        member: {
          id: member.id,
          membershipId: member.membershipId,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          phone: member.phone,
          dateOfBirth: member.dateOfBirth,
          gender: member.gender,
          address: member.address,
          city: member.city,
          state: member.state,
          zipCode: member.zipCode,
          membershipStatus: member.membershipStatus,
          joinDate: member.joinDate,
          cell: member.cell,
          user: member.user ? {
            id: member.user.id,
            status: member.user.status,
            role: member.user.role.name,
            lastLoginAt: member.user.lastLoginAt,
            emailVerifiedAt: member.user.emailVerifiedAt,
          } : null,
          recentAttendance: member.attendance.map((record: any) => ({
            id: record.id,
            status: record.status,
            checkedInAt: record.checkedInAt,
            session: record.session,
          })),
          createdBy: member.createdBy ? {
            name: `${member.createdBy.firstName} ${member.createdBy.lastName}`,
          } : null,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
        },
      },
    });
  }

  // PUT /members/:id - Update member
  async updateMember(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      zipCode,
      cellId,
      membershipStatus,
    } = req.body;

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingMember) {
      throw createError('Member not found', 404);
    }

    // Check if email is being changed and if it conflicts
    if (email && email.toLowerCase() !== existingMember.email) {
      const emailConflict = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (emailConflict && emailConflict.id !== existingMember.userId) {
        throw createError('Email already exists', 409);
      }
    }

    // Validate cell exists if provided
    if (cellId) {
      const cell = await prisma.cell.findUnique({
        where: { id: cellId },
      });

      if (!cell) {
        throw createError('Cell not found', 404);
      }
    }

    // Update member
    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email: email.toLowerCase() }),
        ...(phone && { phone }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(zipCode && { zipCode }),
        ...(cellId !== undefined && { cellId }),
        ...(membershipStatus && { membershipStatus }),
      },
      include: {
        cell: true,
        user: {
          include: {
            role: true,
          },
        },
      },
    });

    // Update associated user if exists and email changed
    if (updatedMember.user && email && email.toLowerCase() !== existingMember.email) {
      await prisma.user.update({
        where: { id: updatedMember.user.id },
        data: {
          email: email.toLowerCase(),
          firstName: firstName || updatedMember.firstName,
          lastName: lastName || updatedMember.lastName,
          phone: phone || updatedMember.phone,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : updatedMember.dateOfBirth,
          gender: gender || updatedMember.gender,
          address: address || updatedMember.address,
          city: city || updatedMember.city,
          state: state || updatedMember.state,
          zipCode: zipCode || updatedMember.zipCode,
        },
      });
    }

    res.json({
      success: true,
      message: 'Member updated successfully',
      data: {
        member: {
          id: updatedMember.id,
          membershipId: updatedMember.membershipId,
          firstName: updatedMember.firstName,
          lastName: updatedMember.lastName,
          email: updatedMember.email,
          phone: updatedMember.phone,
          dateOfBirth: updatedMember.dateOfBirth,
          gender: updatedMember.gender,
          address: updatedMember.address,
          city: updatedMember.city,
          state: updatedMember.state,
          zipCode: updatedMember.zipCode,
          membershipStatus: updatedMember.membershipStatus,
          joinDate: updatedMember.joinDate,
          cell: updatedMember.cell,
          user: updatedMember.user ? {
            id: updatedMember.user.id,
            status: updatedMember.user.status,
            role: updatedMember.user.role.name,
          } : null,
          updatedAt: updatedMember.updatedAt,
        },
      },
    });
  }

  // DELETE /members/:id - Soft delete member
  async deleteMember(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!member) {
      throw createError('Member not found', 404);
    }

    // Soft delete member by setting status to INACTIVE
    await prisma.member.update({
      where: { id },
      data: {
        membershipStatus: 'INACTIVE',
      },
    });

    // Also deactivate associated user account
    if (member.user) {
      await prisma.user.update({
        where: { id: member.user.id },
        data: {
          status: 'INACTIVE',
        },
      });
    }

    res.json({
      success: true,
      message: 'Member deactivated successfully',
    });
  }

  // Private helper method to generate unique membership ID
  private async generateMembershipId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `NECF${year}`;
    
    // Get the last membership ID for this year
    const lastMember = await prisma.member.findFirst({
      where: {
        membershipId: {
          startsWith: prefix,
        },
      },
      orderBy: {
        membershipId: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastMember) {
      const lastNumber = parseInt(lastMember.membershipId.replace(prefix, ''));
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }
}
