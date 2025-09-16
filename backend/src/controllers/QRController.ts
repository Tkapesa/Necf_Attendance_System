import { Response } from 'express';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { prisma } from '../index';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class QRController {
  // GET /qrcode/:memberId - Generate QR code for member
  async generateQRCode(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { memberId } = req.params;

    // Verify member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: true,
      },
    });

    if (!member) {
      throw createError('Member not found', 404);
    }

    // Check if member is active
    if (member.membershipStatus !== 'ACTIVE') {
      throw createError('Member is not active', 400);
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Save QR token to database
    const qrToken = await prisma.qRToken.create({
      data: {
        token,
        memberId,
        expiresAt,
        createdById: req.user.id,
      },
    });

    // Create QR code data
    const qrData = {
      token,
      memberId,
      membershipId: member.membershipId,
      memberName: `${member.firstName} ${member.lastName}`,
      expiresAt: expiresAt.toISOString(),
    };

    const qrDataString = JSON.stringify(qrData);

    // Generate QR code image
    try {
      const qrCodeDataURL = await QRCode.toDataURL(qrDataString, {
        margin: 1,
        width: 300,
      });

      res.json({
        success: true,
        message: 'QR code generated successfully',
        data: {
          qrCode: {
            id: qrToken.id,
            token: qrToken.token,
            qrCodeImage: qrCodeDataURL,
            member: {
              id: member.id,
              membershipId: member.membershipId,
              firstName: member.firstName,
              lastName: member.lastName,
            },
            expiresAt: qrToken.expiresAt,
            createdAt: qrToken.createdAt,
          },
        },
      });
    } catch (error) {
      throw createError('Failed to generate QR code image', 500);
    }
  }

  // POST /qrcode/batch - Generate QR codes for multiple members
  async generateBatchQRCodes(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { memberIds, expirationHours = 24 } = req.body;

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      throw createError('Member IDs array is required', 400);
    }

    if (memberIds.length > 100) {
      throw createError('Maximum 100 members allowed per batch', 400);
    }

    // Verify all members exist and are active
    const members = await prisma.member.findMany({
      where: {
        id: { in: memberIds },
        membershipStatus: 'ACTIVE',
      },
    });

    if (members.length !== memberIds.length) {
      throw createError('Some members not found or inactive', 400);
    }

    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);
    const qrCodes = [];

    // Generate QR codes for each member
    for (const member of members) {
      const token = crypto.randomBytes(32).toString('hex');

      // Save QR token to database
      const qrToken = await prisma.qRToken.create({
        data: {
          token,
          memberId: member.id,
          expiresAt,
          createdById: req.user.id,
        },
      });

      // Create QR code data
      const qrData = {
        token,
        memberId: member.id,
        membershipId: member.membershipId,
        memberName: `${member.firstName} ${member.lastName}`,
        expiresAt: expiresAt.toISOString(),
      };

      const qrDataString = JSON.stringify(qrData);

      try {
        const qrCodeDataURL = await QRCode.toDataURL(qrDataString, {
          margin: 1,
          width: 300,
        });

        qrCodes.push({
          id: qrToken.id,
          token: qrToken.token,
          qrCodeImage: qrCodeDataURL,
          member: {
            id: member.id,
            membershipId: member.membershipId,
            firstName: member.firstName,
            lastName: member.lastName,
          },
          expiresAt: qrToken.expiresAt,
          createdAt: qrToken.createdAt,
        });
      } catch (error) {
        // Log error but continue with other QR codes
        console.error(`Failed to generate QR code for member ${member.id}:`, error);
      }
    }

    res.json({
      success: true,
      message: `Generated ${qrCodes.length} QR codes successfully`,
      data: {
        qrCodes,
        summary: {
          totalRequested: memberIds.length,
          totalGenerated: qrCodes.length,
          expiresAt,
        },
      },
    });
  }

  // GET /qrcode/member/:memberId/active - Get active QR codes for member
  async getActiveQRCodes(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { memberId } = req.params;

    // Verify member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw createError('Member not found', 404);
    }

    // Get active QR tokens for member
    const activeTokens = await prisma.qRToken.findMany({
      where: {
        memberId,
        expiresAt: {
          gt: new Date(),
        },
        usedAt: null,
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: {
        member: {
          id: member.id,
          membershipId: member.membershipId,
          firstName: member.firstName,
          lastName: member.lastName,
        },
        activeQRCodes: activeTokens.map((token: any) => ({
          id: token.id,
          token: token.token,
          expiresAt: token.expiresAt,
          createdAt: token.createdAt,
          createdBy: token.createdBy ? {
            name: `${token.createdBy.firstName} ${token.createdBy.lastName}`,
          } : null,
        })),
      },
    });
  }

  // POST /qrcode/validate - Validate QR code token
  async validateQRCode(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { token } = req.body;

    if (!token) {
      throw createError('QR code token is required', 400);
    }

    // Find QR token
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

    res.json({
      success: true,
      message: 'QR code is valid',
      data: {
        qrToken: {
          id: qrToken.id,
          token: qrToken.token,
          expiresAt: qrToken.expiresAt,
        },
        member: {
          id: qrToken.member.id,
          membershipId: qrToken.member.membershipId,
          firstName: qrToken.member.firstName,
          lastName: qrToken.member.lastName,
          email: qrToken.member.email,
          phone: qrToken.member.phone,
          membershipStatus: qrToken.member.membershipStatus,
        },
      },
    });
  }

  // DELETE /qrcode/:tokenId - Revoke QR code
  async revokeQRCode(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { tokenId } = req.params;

    const qrToken = await prisma.qRToken.findUnique({
      where: { id: tokenId },
      include: {
        member: true,
      },
    });

    if (!qrToken) {
      throw createError('QR code not found', 404);
    }

    // Mark as used/revoked
    await prisma.qRToken.update({
      where: { id: tokenId },
      data: {
        usedAt: new Date(),
        revokedById: req.user.id,
      },
    });

    res.json({
      success: true,
      message: 'QR code revoked successfully',
    });
  }

  // GET /qrcode/stats - Get QR code statistics
  async getQRCodeStats(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }

    const whereClause = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    // Get statistics
    const [
      totalGenerated,
      totalUsed,
      totalExpired,
      totalActive,
    ] = await Promise.all([
      prisma.qRToken.count({ where: whereClause }),
      prisma.qRToken.count({
        where: {
          ...whereClause,
          usedAt: { not: null },
        },
      }),
      prisma.qRToken.count({
        where: {
          ...whereClause,
          expiresAt: { lt: new Date() },
          usedAt: null,
        },
      }),
      prisma.qRToken.count({
        where: {
          ...whereClause,
          expiresAt: { gt: new Date() },
          usedAt: null,
        },
      }),
    ]);

    // Get usage rate
    const usageRate = totalGenerated > 0 ? (totalUsed / totalGenerated) * 100 : 0;

    res.json({
      success: true,
      data: {
        statistics: {
          totalGenerated,
          totalUsed,
          totalExpired,
          totalActive,
          usageRate: parseFloat(usageRate.toFixed(2)),
        },
        period: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      },
    });
  }
}
