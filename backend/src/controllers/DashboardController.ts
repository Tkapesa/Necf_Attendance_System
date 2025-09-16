import { Response } from 'express';
import { prisma } from '../index';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class DashboardController {
  // GET /dashboard/summary - Get dashboard summary statistics
  async getDashboardSummary(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { period = '30' } = req.query; // days
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      // Get all statistics in parallel for better performance
      const [
        totalMembers,
        activeMembers,
        totalSessions,
        activeSessions,
        totalAttendanceThisPeriod,
        averageAttendanceRate,
        topAttendees,
        sessionsByType,
        attendanceByDay,
        membersByStatus,
        recentSessions,
        qrCodeStats,
      ] = await Promise.all([
        // Total members count
        prisma.member.count(),

        // Active members count
        prisma.member.count({
          where: { membershipStatus: 'ACTIVE' },
        }),

        // Total sessions count
        prisma.session.count(),

        // Active sessions count
        prisma.session.count({
          where: { status: 'ACTIVE' },
        }),

        // Total attendance in period
        prisma.attendance.count({
          where: {
            createdAt: { gte: startDate },
          },
        }),

        // Average attendance rate calculation
        this.getAverageAttendanceRate(startDate),

        // Top 10 attendees in period
        this.getTopAttendees(startDate, 10),

        // Sessions by type
        this.getSessionsByType(startDate),

        // Attendance by day (last 7 days)
        this.getAttendanceByDay(7),

        // Members by status
        this.getMembersByStatus(),

        // Recent sessions (last 5)
        this.getRecentSessions(5),

        // QR code statistics
        this.getQRCodeStatistics(startDate),
      ]);

      res.json({
        success: true,
        data: {
          summary: {
            totalMembers,
            activeMembers,
            inactiveMembers: totalMembers - activeMembers,
            totalSessions,
            activeSessions,
            totalAttendanceThisPeriod,
            averageAttendanceRate: parseFloat(averageAttendanceRate.toFixed(2)),
            memberGrowthRate: await this.getMemberGrowthRate(days),
          },
          charts: {
            sessionsByType,
            attendanceByDay,
            membersByStatus,
          },
          lists: {
            topAttendees: topAttendees.slice(0, 10),
            recentSessions,
          },
          qrCodeStats,
          period: {
            days,
            startDate,
            endDate: new Date(),
          },
        },
      });
    } catch (error) {
      throw createError('Failed to fetch dashboard data', 500);
    }
  }

  // GET /dashboard/analytics - Get detailed analytics
  async getAnalytics(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const {
      startDate: startDateParam,
      endDate: endDateParam,
      groupBy = 'day',
    } = req.query;

    const startDate = startDateParam ? new Date(startDateParam as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = endDateParam ? new Date(endDateParam as string) : new Date();

    try {
      const [
        attendanceTrends,
        membershipTrends,
        sessionAnalytics,
        cellAnalytics,
        ageGroupAnalytics,
        genderAnalytics,
      ] = await Promise.all([
        this.getAttendanceTrends(startDate, endDate, groupBy as string),
        this.getMembershipTrends(startDate, endDate, groupBy as string),
        this.getSessionAnalytics(startDate, endDate),
        this.getCellAnalytics(startDate, endDate),
        this.getAgeGroupAnalytics(),
        this.getGenderAnalytics(),
      ]);

      res.json({
        success: true,
        data: {
          attendanceTrends,
          membershipTrends,
          sessionAnalytics,
          cellAnalytics,
          demographics: {
            ageGroups: ageGroupAnalytics,
            gender: genderAnalytics,
          },
          period: {
            startDate,
            endDate,
            groupBy,
          },
        },
      });
    } catch (error) {
      throw createError('Failed to fetch analytics data', 500);
    }
  }

  // GET /dashboard/member/:memberId - Get member-specific dashboard
  async getMemberDashboard(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { memberId } = req.params;

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        cell: true,
        user: true,
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
          take: 20,
        },
        _count: {
          select: {
            attendance: true,
          },
        },
      },
    });

    if (!member) {
      throw createError('Member not found', 404);
    }

    // Calculate member statistics
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const last90Days = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const [
      attendanceRate30Days,
      attendanceRate90Days,
      sessionsAvailable30Days,
      memberAttendance30Days,
    ] = await Promise.all([
      this.getMemberAttendanceRate(memberId, last30Days),
      this.getMemberAttendanceRate(memberId, last90Days),
      prisma.session.count({
        where: {
          startTime: { gte: last30Days },
          status: 'ACTIVE',
        },
      }),
      prisma.attendance.count({
        where: {
          memberId,
          createdAt: { gte: last30Days },
          status: { in: ['PRESENT', 'LATE'] },
        },
      }),
    ]);

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
          membershipStatus: member.membershipStatus,
          joinDate: member.joinDate,
          cell: member.cell,
        },
        statistics: {
          totalAttendance: member._count.attendance,
          attendanceRate30Days: parseFloat(attendanceRate30Days.toFixed(2)),
          attendanceRate90Days: parseFloat(attendanceRate90Days.toFixed(2)),
          sessionsAvailable30Days,
          memberAttendance30Days,
        },
        recentAttendance: member.attendance.map((record: any) => ({
          id: record.id,
          status: record.status,
          checkedInAt: record.checkedInAt,
          session: record.session,
          createdAt: record.createdAt,
        })),
      },
    });
  }

  // Private helper methods
  private async getAverageAttendanceRate(startDate: Date): Promise<number> {
    const sessions = await prisma.session.findMany({
      where: {
        startTime: { gte: startDate },
        status: 'ACTIVE',
      },
      include: {
        _count: {
          select: {
            attendance: true,
          },
        },
      },
    });

    if (sessions.length === 0) return 0;

    const activeMembers = await prisma.member.count({
      where: { membershipStatus: 'ACTIVE' },
    });

    if (activeMembers === 0) return 0;

    const totalPossibleAttendance = sessions.length * activeMembers;
    const totalActualAttendance = sessions.reduce((sum: number, session: any) => sum + session._count.attendance, 0);

    return (totalActualAttendance / totalPossibleAttendance) * 100;
  }

  private async getTopAttendees(startDate: Date, limit: number) {
    const result = await prisma.attendance.groupBy({
      by: ['memberId'],
      where: {
        createdAt: { gte: startDate },
        status: { in: ['PRESENT', 'LATE'] },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    const memberIds = result.map((r: any) => r.memberId);
    const members = await prisma.member.findMany({
      where: {
        id: { in: memberIds },
      },
      select: {
        id: true,
        membershipId: true,
        firstName: true,
        lastName: true,
      },
    });

    return result.map((r: any) => {
      const member = members.find((m: any) => m.id === r.memberId);
      return {
        member: member ? {
          id: member.id,
          membershipId: member.membershipId,
          name: `${member.firstName} ${member.lastName}`,
        } : null,
        attendanceCount: r._count.id,
      };
    });
  }

  private async getSessionsByType(startDate: Date) {
    return await prisma.session.groupBy({
      by: ['sessionType'],
      where: {
        startTime: { gte: startDate },
      },
      _count: {
        id: true,
      },
    });
  }

  private async getAttendanceByDay(days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM attendance 
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return result;
  }

  private async getMembersByStatus() {
    return await prisma.member.groupBy({
      by: ['membershipStatus'],
      _count: {
        id: true,
      },
    });
  }

  private async getRecentSessions(limit: number) {
    return await prisma.session.findMany({
      orderBy: {
        startTime: 'desc',
      },
      take: limit,
      include: {
        _count: {
          select: {
            attendance: true,
          },
        },
      },
    });
  }

  private async getQRCodeStatistics(startDate: Date) {
    const [totalGenerated, totalUsed] = await Promise.all([
      prisma.qRToken.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),
      prisma.qRToken.count({
        where: {
          createdAt: { gte: startDate },
          usedAt: { not: null },
        },
      }),
    ]);

    return {
      totalGenerated,
      totalUsed,
      usageRate: totalGenerated > 0 ? (totalUsed / totalGenerated) * 100 : 0,
    };
  }

  private async getMemberGrowthRate(days: number): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);

    const [currentPeriod, previousPeriod] = await Promise.all([
      prisma.member.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),
      prisma.member.count({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
        },
      }),
    ]);

    if (previousPeriod === 0) return currentPeriod > 0 ? 100 : 0;
    return ((currentPeriod - previousPeriod) / previousPeriod) * 100;
  }

  private async getAttendanceTrends(startDate: Date, endDate: Date, groupBy: string) {
    // Implementation would depend on groupBy (day, week, month)
    const result = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as attendance_count,
        COUNT(DISTINCT member_id) as unique_members
      FROM attendance 
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return result;
  }

  private async getMembershipTrends(startDate: Date, endDate: Date, groupBy: string) {
    const result = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_members
      FROM members 
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return result;
  }

  private async getSessionAnalytics(startDate: Date, endDate: Date) {
    return await prisma.session.groupBy({
      by: ['sessionType'],
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
      _avg: {
        // We would need to calculate average attendance per session
      },
    });
  }

  private async getCellAnalytics(startDate: Date, endDate: Date) {
    return await prisma.cell.findMany({
      include: {
        _count: {
          select: {
            members: true,
          },
        },
        members: {
          include: {
            _count: {
              select: {
                attendance: {
                  where: {
                    createdAt: {
                      gte: startDate,
                      lte: endDate,
                    },
                    status: { in: ['PRESENT', 'LATE'] },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  private async getAgeGroupAnalytics() {
    // This would require calculating age from dateOfBirth
    const result = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN YEAR(CURDATE()) - YEAR(date_of_birth) < 18 THEN 'Under 18'
          WHEN YEAR(CURDATE()) - YEAR(date_of_birth) BETWEEN 18 AND 30 THEN '18-30'
          WHEN YEAR(CURDATE()) - YEAR(date_of_birth) BETWEEN 31 AND 50 THEN '31-50'
          WHEN YEAR(CURDATE()) - YEAR(date_of_birth) > 50 THEN 'Over 50'
          ELSE 'Unknown'
        END as age_group,
        COUNT(*) as count
      FROM members 
      WHERE date_of_birth IS NOT NULL
      GROUP BY age_group
    `;

    return result;
  }

  private async getGenderAnalytics() {
    return await prisma.member.groupBy({
      by: ['gender'],
      _count: {
        id: true,
      },
      where: {
        gender: { not: null },
      },
    });
  }

  private async getMemberAttendanceRate(memberId: string, startDate: Date): Promise<number> {
    const [totalSessions, memberAttendance] = await Promise.all([
      prisma.session.count({
        where: {
          startTime: { gte: startDate },
          status: 'ACTIVE',
        },
      }),
      prisma.attendance.count({
        where: {
          memberId,
          createdAt: { gte: startDate },
          status: { in: ['PRESENT', 'LATE'] },
        },
      }),
    ]);

    return totalSessions > 0 ? (memberAttendance / totalSessions) * 100 : 0;
  }
}
