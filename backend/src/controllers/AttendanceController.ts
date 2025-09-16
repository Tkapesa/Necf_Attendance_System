import { Response } from 'express';
import { prisma } from '../index';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class AttendanceController {
  // POST /scan - Record attendance via QR code scan
  async scanQRCode(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { token, sessionId, latitude, longitude } = req.body;

    if (!token) {
      throw createError('QR code token is required', 400);
    }

    if (!sessionId) {
      throw createError('Session ID is required', 400);
    }

    // Find and validate QR token
    const qrToken = await prisma.qRToken.findUnique({
      where: { token },
      include: {
        member: true,
      },
    });

    if (!qrToken) {
      throw createError('Invalid QR code', 400);
    }

    // Check if token is expired
    if (qrToken.expiresAt < new Date()) {
      throw createError('QR code has expired', 400);
    }

    // Check if token is already used
    if (qrToken.usedAt) {
      throw createError('QR code has already been used', 400);
    }

    // Check if member is active
    if (qrToken.member.membershipStatus !== 'ACTIVE') {
      throw createError('Member is not active', 400);
    }

    // Find and validate session
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw createError('Session not found', 404);
    }

    // Check if session is active
    if (session.status !== 'ACTIVE') {
      throw createError('Session is not active', 400);
    }

    // Check if session is currently ongoing
    const now = new Date();
    if (now < session.startTime || now > session.endTime) {
      throw createError('Session is not currently active', 400);
    }

    // Check if member already has attendance for this session
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        memberId: qrToken.member.id,
        sessionId: sessionId,
      },
    });

    if (existingAttendance) {
      throw createError('Attendance already recorded for this session', 409);
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        memberId: qrToken.member.id,
        sessionId: sessionId,
        status: 'PRESENT',
        checkedInAt: now,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        // qrTokenId: qrToken.id,
        recordedById: req.user.id,
      },
      include: {
        member: {
          select: {
            id: true,
            membershipId: true,
            firstName: true,
            lastName: true,
          },
        },
        session: {
          select: {
            id: true,
            name: true,
            sessionType: true,
            startTime: true,
            endTime: true,
          },
        },
        recordedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Mark QR token as used
    await prisma.qRToken.update({
      where: { id: qrToken.id },
      data: {
        usedAt: now,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: {
        attendance: {
          id: attendance.id,
          status: attendance.status,
          checkedInAt: attendance.checkedInAt,
          member: attendance.member,
          session: attendance.session,
          recordedBy: attendance.recordedBy ? {
            name: `${attendance.recordedBy.firstName} ${attendance.recordedBy.lastName}`,
          } : null,
          location: attendance.latitude && attendance.longitude ? {
            latitude: attendance.latitude,
            longitude: attendance.longitude,
          } : null,
        },
      },
    });
  }

  // POST /attendance/manual - Record manual attendance (for admins/leaders)
  async recordManualAttendance(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { memberId, sessionId, status = 'PRESENT', notes } = req.body;

    if (!memberId) {
      throw createError('Member ID is required', 400);
    }

    if (!sessionId) {
      throw createError('Session ID is required', 400);
    }

    // Validate member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw createError('Member not found', 404);
    }

    // Validate session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw createError('Session not found', 404);
    }

    // Check for existing attendance
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        memberId: memberId,
        sessionId: sessionId,
      },
    });

    if (existingAttendance) {
      throw createError('Attendance already recorded for this session', 409);
    }

    // Create manual attendance record
    const attendance = await prisma.attendance.create({
      data: {
        memberId: memberId,
        sessionId: sessionId,
        status: status,
        checkedInAt: status === 'PRESENT' ? new Date() : null,
        notes: notes,
        isManualEntry: true,
        recordedById: req.user.id,
      },
      include: {
        member: {
          select: {
            id: true,
            membershipId: true,
            firstName: true,
            lastName: true,
          },
        },
        session: {
          select: {
            id: true,
            name: true,
            sessionType: true,
            startTime: true,
            endTime: true,
          },
        },
        recordedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Manual attendance recorded successfully',
      data: {
        attendance: {
          id: attendance.id,
          status: attendance.status,
          checkedInAt: attendance.checkedInAt,
          notes: attendance.notes,
          isManualEntry: attendance.isManualEntry,
          member: attendance.member,
          session: attendance.session,
          recordedBy: attendance.recordedBy ? {
            name: `${attendance.recordedBy.firstName} ${attendance.recordedBy.lastName}`,
          } : null,
        },
      },
    });
  }

  // GET /attendance - Get attendance records with filtering
  async getAttendanceRecords(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const {
      page = '1',
      limit = '20',
      sessionId,
      memberId,
      status,
      startDate,
      endDate,
      sortBy = 'checkedInAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    // Build where clause
    const where: any = {};

    if (sessionId) {
      where.sessionId = sessionId;
    }

    if (memberId) {
      where.memberId = memberId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    // Get total count
    const totalRecords = await prisma.attendance.count({ where });

    // Get attendance records
    const attendance = await prisma.attendance.findMany({
      where,
      skip,
      take: limitNumber,
      orderBy: {
        [sortBy as string]: sortOrder,
      },
      include: {
        member: {
          select: {
            id: true,
            membershipId: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        session: {
          select: {
            id: true,
            name: true,
            sessionType: true,
            startTime: true,
            endTime: true,
          },
        },
        recordedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        // qrToken: {
        //   select: {
        //     id: true,
        //     token: true,
        //   },
        // },
      },
    });

    const totalPages = Math.ceil(totalRecords / limitNumber);

    res.json({
      success: true,
      data: {
        attendance: attendance.map((record: any) => ({
          id: record.id,
          status: record.status,
          checkedInAt: record.checkedInAt,
          notes: record.notes,
          isManualEntry: record.isManualEntry,
          member: record.member,
          session: record.session,
          recordedBy: record.recordedBy ? {
            name: `${record.recordedBy.firstName} ${record.recordedBy.lastName}`,
          } : null,
          qrToken: record.qrToken,
          location: record.latitude && record.longitude ? {
            latitude: record.latitude,
            longitude: record.longitude,
          } : null,
          createdAt: record.createdAt,
        })),
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalRecords,
          hasNextPage: pageNumber < totalPages,
          hasPreviousPage: pageNumber > 1,
        },
      },
    });
  }

  // GET /attendance/session/:sessionId - Get attendance for specific session
  async getSessionAttendance(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { sessionId } = req.params;

    // Validate session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw createError('Session not found', 404);
    }

    // Get attendance records for session
    const attendance = await prisma.attendance.findMany({
      where: { sessionId },
      include: {
        member: {
          select: {
            id: true,
            membershipId: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        recordedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        checkedInAt: 'asc',
      },
    });

    // Get session statistics
    const totalPresent = attendance.filter((r: any) => r.status === 'PRESENT').length;
    const totalAbsent = attendance.filter((r: any) => r.status === 'ABSENT').length;
    const totalLate = attendance.filter((r: any) => r.status === 'LATE').length;

    res.json({
      success: true,
      data: {
        session: {
          id: session.id,
          name: session.name,
          sessionType: session.sessionType,
          startTime: session.startTime,
          endTime: session.endTime,
          status: session.status,
        },
        statistics: {
          totalAttendance: attendance.length,
          totalPresent,
          totalAbsent,
          totalLate,
          attendanceRate: attendance.length > 0 ? 
            ((totalPresent + totalLate) / attendance.length * 100).toFixed(2) : '0.00',
        },
        attendance: attendance.map((record: any) => ({
          id: record.id,
          status: record.status,
          checkedInAt: record.checkedInAt,
          notes: record.notes,
          isManualEntry: record.isManualEntry,
          member: record.member,
          recordedBy: record.recordedBy ? {
            name: `${record.recordedBy.firstName} ${record.recordedBy.lastName}`,
          } : null,
          location: record.latitude && record.longitude ? {
            latitude: record.latitude,
            longitude: record.longitude,
          } : null,
          createdAt: record.createdAt,
        })),
      },
    });
  }

  // PUT /attendance/:id - Update attendance record
  async updateAttendance(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        member: {
          select: {
            id: true,
            membershipId: true,
            firstName: true,
            lastName: true,
          },
        },
        session: {
          select: {
            id: true,
            name: true,
            sessionType: true,
          },
        },
      },
    });

    if (!attendance) {
      throw createError('Attendance record not found', 404);
    }

    // Update attendance record
    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(status === 'PRESENT' && !attendance.checkedInAt && { checkedInAt: new Date() }),
      },
      include: {
        member: {
          select: {
            id: true,
            membershipId: true,
            firstName: true,
            lastName: true,
          },
        },
        session: {
          select: {
            id: true,
            name: true,
            sessionType: true,
          },
        },
        recordedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Attendance record updated successfully',
      data: {
        attendance: {
          id: updatedAttendance.id,
          status: updatedAttendance.status,
          checkedInAt: updatedAttendance.checkedInAt,
          notes: updatedAttendance.notes,
          isManualEntry: updatedAttendance.isManualEntry,
          member: updatedAttendance.member,
          session: updatedAttendance.session,
          recordedBy: updatedAttendance.recordedBy ? {
            name: `${updatedAttendance.recordedBy.firstName} ${updatedAttendance.recordedBy.lastName}`,
          } : null,
          updatedAt: updatedAttendance.updatedAt,
        },
      },
    });
  }

  // DELETE /attendance/:id - Delete attendance record
  async deleteAttendance(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { id } = req.params;

    const attendance = await prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      throw createError('Attendance record not found', 404);
    }

    await prisma.attendance.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Attendance record deleted successfully',
    });
  }
}
