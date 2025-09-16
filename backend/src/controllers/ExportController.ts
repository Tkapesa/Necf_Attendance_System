import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { prisma } from '../index';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class ExportController {
  // GET /export/attendance - Export attendance data
  async exportAttendance(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const {
      format = 'csv',
      startDate,
      endDate,
      sessionId,
      memberId,
      status,
    } = req.query;

    // Build where clause for filtering
    const where: any = {};

    if (startDate) {
      where.createdAt = { gte: new Date(startDate as string) };
    }
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) };
    }
    if (sessionId) {
      where.sessionId = sessionId;
    }
    if (memberId) {
      where.memberId = memberId;
    }
    if (status) {
      where.status = status;
    }

    // Get attendance data
    const attendanceData = await prisma.attendance.findMany({
      where,
      include: {
        member: {
          select: {
            membershipId: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            cell: {
              select: {
                name: true,
              },
            },
          },
        },
        session: {
          select: {
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data for export
    const exportData = attendanceData.map((record: any) => ({
      'Member ID': record.member.membershipId,
      'Member Name': `${record.member.firstName} ${record.member.lastName}`,
      'Email': record.member.email || '',
      'Phone': record.member.phone || '',
      'Cell Group': record.member.cell?.name || '',
      'Session Name': record.session.name,
      'Session Type': record.session.sessionType,
      'Session Start': record.session.startTime.toISOString(),
      'Session End': record.session.endTime.toISOString(),
      'Attendance Status': record.status,
      'Check-in Time': record.checkedInAt?.toISOString() || '',
      'Notes': record.notes || '',
      'Manual Entry': record.isManualEntry ? 'Yes' : 'No',
      'Recorded By': record.recordedBy ? `${record.recordedBy.firstName} ${record.recordedBy.lastName}` : '',
      'Latitude': record.latitude || '',
      'Longitude': record.longitude || '',
      'Created At': record.createdAt.toISOString(),
    }));

    const filename = `attendance_${new Date().toISOString().split('T')[0]}`;

    try {
      switch (format) {
        case 'excel':
          return await this.exportToExcel(res, exportData, filename);
        case 'pdf':
          return await this.exportToPDF(res, exportData, filename);
        case 'json':
          return this.exportToJSON(res, exportData, filename);
        default:
          return await this.exportToCSV(res, exportData, filename);
      }
    } catch (error) {
      throw createError('Failed to export data', 500);
    }
  }

  // GET /export/members - Export members data
  async exportMembers(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const {
      format = 'csv',
      status,
      cellId,
      gender,
    } = req.query;

    // Build where clause
    const where: any = {};
    if (status) {
      where.membershipStatus = status;
    }
    if (cellId) {
      where.cellId = cellId;
    }
    if (gender) {
      where.gender = gender;
    }

    // Get members data
    const membersData = await prisma.member.findMany({
      where,
      include: {
        cell: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            status: true,
            lastLoginAt: true,
            emailVerifiedAt: true,
          },
        },
        _count: {
          select: {
            attendance: true,
          },
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    // Transform data for export
    const exportData = membersData.map((member: any) => ({
      'Member ID': member.membershipId,
      'First Name': member.firstName,
      'Last Name': member.lastName,
      'Email': member.email || '',
      'Phone': member.phone || '',
      'Date of Birth': member.dateOfBirth?.toISOString().split('T')[0] || '',
      'Gender': member.gender || '',
      'Address': member.address || '',
      'City': member.city || '',
      'State': member.state || '',
      'Zip Code': member.zipCode || '',
      'Cell Group': member.cell?.name || '',
      'Membership Status': member.membershipStatus,
      'Join Date': member.joinDate.toISOString().split('T')[0],
      'Total Attendance': member._count.attendance,
      'User Status': member.user?.status || 'No Account',
      'Last Login': member.user?.lastLoginAt?.toISOString() || '',
      'Email Verified': member.user?.emailVerifiedAt ? 'Yes' : 'No',
      'Created At': member.createdAt.toISOString(),
    }));

    const filename = `members_${new Date().toISOString().split('T')[0]}`;

    try {
      switch (format) {
        case 'excel':
          return await this.exportToExcel(res, exportData, filename);
        case 'pdf':
          return await this.exportToPDF(res, exportData, filename);
        case 'json':
          return this.exportToJSON(res, exportData, filename);
        default:
          return await this.exportToCSV(res, exportData, filename);
      }
    } catch (error) {
      throw createError('Failed to export data', 500);
    }
  }

  // GET /export/sessions - Export sessions data
  async exportSessions(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const {
      format = 'csv',
      startDate,
      endDate,
      sessionType,
      status,
    } = req.query;

    // Build where clause
    const where: any = {};
    if (startDate) {
      where.startTime = { gte: new Date(startDate as string) };
    }
    if (endDate) {
      where.startTime = { ...where.startTime, lte: new Date(endDate as string) };
    }
    if (sessionType) {
      where.sessionType = sessionType;
    }
    if (status) {
      where.status = status;
    }

    // Get sessions data
    const sessionsData = await prisma.session.findMany({
      where,
      include: {
        // createdBy: {
        //   select: {
        //     firstName: true,
        //     lastName: true,
        //   },
        // },
        _count: {
          select: {
            attendance: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    // Calculate attendance statistics for each session
    const exportData = await Promise.all(
      sessionsData.map(async (session: any) => {
        const attendanceStats = await prisma.attendance.groupBy({
          by: ['status'],
          where: {
            sessionId: session.id,
          },
          _count: {
            id: true,
          },
        });

        const present = attendanceStats.find((s: any) => s.status === 'PRESENT')?._count.id || 0;
        const absent = attendanceStats.find((s: any) => s.status === 'ABSENT')?._count.id || 0;
        const late = attendanceStats.find((s: any) => s.status === 'LATE')?._count.id || 0;
        const total = present + absent + late;

        return {
          'Session ID': session.id,
          'Session Name': session.name,
          'Session Type': session.sessionType,
          'Description': session.description || '',
          'Start Time': session.startTime.toISOString(),
          'End Time': session.endTime.toISOString(),
          'Location': session.location || '',
          'Status': session.status,
          'Max Capacity': session.maxCapacity || '',
          'Total Attendance': session._count.attendance,
          'Present': present,
          'Absent': absent,
          'Late': late,
          'Attendance Rate': total > 0 ? ((present + late) / total * 100).toFixed(2) + '%' : '0%',
          'Created By': session.createdBy ? `${session.createdBy.firstName} ${session.createdBy.lastName}` : '',
          'Created At': session.createdAt.toISOString(),
        };
      })
    );

    const filename = `sessions_${new Date().toISOString().split('T')[0]}`;

    try {
      switch (format) {
        case 'excel':
          return await this.exportToExcel(res, exportData, filename);
        case 'pdf':
          return await this.exportToPDF(res, exportData, filename);
        case 'json':
          return this.exportToJSON(res, exportData, filename);
        default:
          return await this.exportToCSV(res, exportData, filename);
      }
    } catch (error) {
      throw createError('Failed to export data', 500);
    }
  }

  // Private helper methods for different export formats

  private async exportToCSV(res: Response, data: any[], filename: string) {
    if (data.length === 0) {
      throw createError('No data to export', 400);
    }

    const parser = new Parser();
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    res.send(csv);
  }

  private async exportToExcel(res: Response, data: any[], filename: string) {
    if (data.length === 0) {
      throw createError('No data to export', 400);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    // Add headers
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);

    // Style headers
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data rows
    data.forEach(row => {
      worksheet.addRow(Object.values(row));
    });

    // Auto-fit columns
    worksheet.columns.forEach((column: any) => {
      let maxLength = 0;
      column?.eachCell({ includeEmpty: true }, (cell: any) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength;
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  }

  private async exportToPDF(res: Response, data: any[], filename: string) {
    if (data.length === 0) {
      throw createError('No data to export', 400);
    }

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);

    doc.pipe(res);

    // Add title
    doc.fontSize(16).text(`${filename.replace(/_/g, ' ').toUpperCase()}`, { align: 'center' });
    doc.moveDown();

    // Add metadata
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.text(`Total Records: ${data.length}`, { align: 'right' });
    doc.moveDown();

    // Add table headers
    const headers = Object.keys(data[0]);
    const columnWidth = (doc.page.width - 60) / headers.length;

    let yPosition = doc.y;
    
    // Draw headers
    headers.forEach((header, index) => {
      doc.fontSize(8)
         .text(header, 30 + (index * columnWidth), yPosition, {
           width: columnWidth,
           align: 'left'
         });
    });

    yPosition += 20;

    // Draw data rows
    data.forEach((row, rowIndex) => {
      if (yPosition > doc.page.height - 100) {
        doc.addPage();
        yPosition = 30;
      }

      Object.values(row).forEach((value: any, colIndex) => {
        doc.fontSize(6)
           .text(value?.toString() || '', 30 + (colIndex * columnWidth), yPosition, {
             width: columnWidth,
             align: 'left'
           });
      });

      yPosition += 15;
    });

    doc.end();
  }

  private exportToJSON(res: Response, data: any[], filename: string) {
    if (data.length === 0) {
      throw createError('No data to export', 400);
    }

    const exportObject = {
      metadata: {
        exportedAt: new Date().toISOString(),
        totalRecords: data.length,
        filename: filename,
      },
      data: data,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    res.json(exportObject);
  }

  // GET /export/report - Generate comprehensive report
  async generateReport(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const {
      format = 'pdf',
      period = '30',
      includeCharts = 'false',
    } = req.query;

    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      // Get comprehensive data
      const [
        totalMembers,
        activeMembers,
        totalSessions,
        attendanceData,
        topAttendees,
        sessionsByType,
      ] = await Promise.all([
        prisma.member.count(),
        prisma.member.count({ where: { membershipStatus: 'ACTIVE' } }),
        prisma.session.count({ where: { startTime: { gte: startDate } } }),
        prisma.attendance.count({ where: { createdAt: { gte: startDate } } }),
        this.getTopAttendeesForReport(startDate, 10),
        this.getSessionsByTypeForReport(startDate),
      ]);

      const reportData = {
        summary: {
          reportPeriod: `${days} days`,
          startDate: startDate.toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          totalMembers,
          activeMembers,
          totalSessions,
          totalAttendance: attendanceData,
        },
        topAttendees,
        sessionsByType,
      };

      const filename = `report_${new Date().toISOString().split('T')[0]}`;

      if (format === 'pdf') {
        return await this.generatePDFReport(res, reportData, filename);
      } else {
        return this.exportToJSON(res, [reportData], filename);
      }
    } catch (error) {
      throw createError('Failed to generate report', 500);
    }
  }

  private async getTopAttendeesForReport(startDate: Date, limit: number) {
    const result = await prisma.attendance.groupBy({
      by: ['memberId'],
      where: {
        createdAt: { gte: startDate },
        status: { in: ['PRESENT', 'LATE'] },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const memberIds = result.map((r: any) => r.memberId);
    const members = await prisma.member.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, firstName: true, lastName: true },
    });

    return result.map((r: any) => {
      const member = members.find((m: any) => m.id === r.memberId);
      return {
        name: member ? `${member.firstName} ${member.lastName}` : 'Unknown',
        attendanceCount: r._count.id,
      };
    });
  }

  private async getSessionsByTypeForReport(startDate: Date) {
    return await prisma.session.groupBy({
      by: ['sessionType'],
      where: { startTime: { gte: startDate } },
      _count: { id: true },
    });
  }

  private async generatePDFReport(res: Response, data: any, filename: string) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('CHURCH ATTENDANCE REPORT', { align: 'center' });
    doc.moveDown();

    // Summary section
    doc.fontSize(14).text('SUMMARY', { underline: true });
    doc.fontSize(10);
    doc.text(`Report Period: ${data.summary.reportPeriod}`);
    doc.text(`Start Date: ${data.summary.startDate}`);
    doc.text(`End Date: ${data.summary.endDate}`);
    doc.text(`Total Members: ${data.summary.totalMembers}`);
    doc.text(`Active Members: ${data.summary.activeMembers}`);
    doc.text(`Total Sessions: ${data.summary.totalSessions}`);
    doc.text(`Total Attendance: ${data.summary.totalAttendance}`);
    doc.moveDown();

    // Top Attendees section
    doc.fontSize(14).text('TOP ATTENDEES', { underline: true });
    doc.fontSize(10);
    data.topAttendees.forEach((attendee: any, index: number) => {
      doc.text(`${index + 1}. ${attendee.name} - ${attendee.attendanceCount} sessions`);
    });
    doc.moveDown();

    // Sessions by Type section
    doc.fontSize(14).text('SESSIONS BY TYPE', { underline: true });
    doc.fontSize(10);
    data.sessionsByType.forEach((session: any) => {
      doc.text(`${session.sessionType}: ${session._count.id} sessions`);
    });

    doc.end();
  }
}
