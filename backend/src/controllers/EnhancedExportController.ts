import { Response } from 'express';
import { stringify } from 'csv-stringify';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { prisma } from '../index';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export class EnhancedExportController {
  
  // GET /export?from=&to=&format= - Enhanced export with specific columns and metadata
  async exportAttendanceData(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    // Get full user details for metadata
    const fullUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { firstName: true, lastName: true, email: true }
    });

    const { from, to, format = 'csv' } = req.query;
    
    // Validate date parameters
    const fromDate = from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: 30 days ago
    const toDate = to ? new Date(to as string) : new Date(); // Default: now
    
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw createError('Invalid date format. Use YYYY-MM-DD', 400);
    }

    if (fromDate > toDate) {
      throw createError('From date cannot be after to date', 400);
    }

    // Fetch attendance data with all required relationships
    const attendanceData = await prisma.attendance.findMany({
      where: {
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            cell: {
              select: {
                id: true,
                name: true,
                leaderId: true,
              },
            },
          },
        },
        session: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get leader names for cells
    const cellLeaderIds = [...new Set(attendanceData.map(a => a.member.cell?.leaderId).filter(Boolean))] as string[];
    const leaders = await prisma.user.findMany({
      where: { id: { in: cellLeaderIds } },
      select: { id: true, firstName: true, lastName: true }
    });
    const leaderMap = new Map(leaders.map(l => [l.id, `${l.firstName} ${l.lastName}`]));

    // Transform data to required format
    const transformedData = attendanceData.map(attendance => ({
      scanned_at: attendance.createdAt.toISOString(),
      member_name: `${attendance.member.firstName} ${attendance.member.lastName}`,
      cell_name: attendance.member.cell?.name || 'N/A',
      team: 'N/A', // Cell model doesn't have team field
      leader_name: attendance.member.cell?.leaderId 
        ? leaderMap.get(attendance.member.cell.leaderId) || 'N/A'
        : 'N/A',
      session_name: attendance.session.name,
    }));

    // Generate metadata
    const metadata = {
      export_date: new Date().toISOString(),
      exported_by: fullUser ? `${fullUser.firstName} ${fullUser.lastName}` : req.user.email,
      date_range: `${fromDate.toISOString().split('T')[0]} to ${toDate.toISOString().split('T')[0]}`,
      total_records: transformedData.length,
      format: format as string,
    };

    const filename = `attendance_export_${fromDate.toISOString().split('T')[0]}_to_${toDate.toISOString().split('T')[0]}`;

    // Export in requested format
    switch (format) {
      case 'csv':
        return this.exportToCSV(res, transformedData, metadata, filename);
      case 'excel':
        return this.exportToExcel(res, transformedData, metadata, filename);
      case 'pdf':
        return this.exportToPDF(res, transformedData, metadata, filename);
      default:
        throw createError('Unsupported format. Use: csv, excel, pdf', 400);
    }
  }

  private async exportToCSV(res: Response, data: any[], metadata: any, filename: string) {
    const headers = ['scanned_at', 'member_name', 'cell_name', 'team', 'leader_name', 'session_name'];
    
    // Create CSV with metadata headers
    const csvData = [
      ['# Church Attendance Export'],
      ['# Export Date:', metadata.export_date],
      ['# Exported By:', metadata.exported_by],
      ['# Date Range:', metadata.date_range],
      ['# Total Records:', metadata.total_records],
      ['# Format:', metadata.format],
      [''], // Empty row
      headers, // Column headers
      ...data.map(row => headers.map(header => row[header] || ''))
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);

    return new Promise((resolve, reject) => {
      stringify(csvData, (err, output) => {
        if (err) {
          reject(createError('Error generating CSV', 500));
        } else {
          res.send(output);
          resolve(output);
        }
      });
    });
  }

  private async exportToExcel(res: Response, data: any[], metadata: any, filename: string) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Export');

    // Add metadata headers
    worksheet.addRow(['Church Attendance Export']);
    worksheet.addRow(['Export Date:', metadata.export_date]);
    worksheet.addRow(['Exported By:', metadata.exported_by]);
    worksheet.addRow(['Date Range:', metadata.date_range]);
    worksheet.addRow(['Total Records:', metadata.total_records]);
    worksheet.addRow(['Format:', metadata.format]);
    worksheet.addRow([]); // Empty row

    // Style metadata headers
    for (let i = 1; i <= 6; i++) {
      const row = worksheet.getRow(i);
      row.font = { bold: true, color: { argb: 'FF0066CC' } };
    }

    // Add column headers
    const headers = ['Scanned At', 'Member Name', 'Cell Name', 'Team', 'Leader Name', 'Session Name'];
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F3FF' }
    };

    // Add data rows
    data.forEach(row => {
      worksheet.addRow([
        row.scanned_at,
        row.member_name,
        row.cell_name,
        row.team,
        row.leader_name,
        row.session_name
      ]);
    });

    // Auto-fit columns
    worksheet.columns.forEach((column, index) => {
      if (column && column.eachCell) {
        let maxLength = headers[index]?.length || 10;
        
        column.eachCell({ includeEmpty: false }, (cell) => {
          const cellLength = cell.value ? cell.value.toString().length : 0;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        });
        
        column.width = Math.min(maxLength + 2, 50); // Max width of 50
      }
    });

    // Add borders to data
    const dataStartRow = 9; // After metadata
    const dataEndRow = dataStartRow + data.length;
    for (let i = dataStartRow; i <= dataEndRow; i++) {
      const row = worksheet.getRow(i);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);

    return workbook.xlsx.write(res);
  }

  private async exportToPDF(res: Response, data: any[], metadata: any, filename: string) {
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    
    doc.pipe(res);

    // Title
    doc.fontSize(18).font('Helvetica-Bold').text('Church Attendance Export', { align: 'center' });
    doc.moveDown(0.5);

    // Metadata
    doc.fontSize(10).font('Helvetica');
    doc.text(`Export Date: ${metadata.export_date}`, { continued: true });
    doc.text(`Exported By: ${metadata.exported_by}`, { align: 'right' });
    doc.text(`Date Range: ${metadata.date_range}`, { continued: true });
    doc.text(`Total Records: ${metadata.total_records}`, { align: 'right' });
    doc.text(`Format: ${metadata.format}`);
    doc.moveDown(1);

    // Table headers
    const headers = ['Scanned At', 'Member Name', 'Cell Name', 'Team', 'Leader Name', 'Session Name'];
    const colWidths = [85, 85, 85, 60, 85, 85];
    let currentY = doc.y;

    // Header background
    doc.rect(50, currentY - 5, 495, 20).fill('#E6F3FF');
    doc.fillColor('black');

    // Header text
    let currentX = 50;
    headers.forEach((header, index) => {
      doc.fontSize(9).font('Helvetica-Bold').text(header, currentX + 2, currentY, {
        width: colWidths[index] - 4,
        height: 15,
        ellipsis: true
      });
      currentX += colWidths[index];
    });

    currentY += 20;

    // Data rows
    data.forEach((row, index) => {
      if (currentY > 720) { // Start new page if needed
        doc.addPage();
        currentY = 50;
      }

      // Alternate row background
      if (index % 2 === 0) {
        doc.rect(50, currentY - 2, 495, 16).fill('#F8F8F8');
        doc.fillColor('black');
      }

      currentX = 50;
      const rowData = [
        row.scanned_at,
        row.member_name,
        row.cell_name,
        row.team,
        row.leader_name,
        row.session_name
      ];

      rowData.forEach((value, colIndex) => {
        doc.fontSize(8).font('Helvetica').text(value || '', currentX + 2, currentY, {
          width: colWidths[colIndex] - 4,
          height: 12,
          ellipsis: true
        });
        currentX += colWidths[colIndex];
      });

      currentY += 16;
    });

    // Footer
    doc.fontSize(8).text(`Generated on ${new Date().toLocaleString()}`, 50, doc.page.height - 30, {
      align: 'center'
    });

    doc.end();
  }

  // Generate metadata summary for exports
  private async generateMetadata(fromDate: Date, toDate: Date) {
    const where = {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    };

    const [
      totalRecords,
      uniqueMembers,
      uniqueSessions,
    ] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.groupBy({
        by: ['memberId'],
        where,
        _count: true,
      }),
      prisma.attendance.groupBy({
        by: ['sessionId'],
        where,
        _count: { id: true },
      }),
    ]);

    return {
      totalRecords,
      uniqueMembers: uniqueMembers.length,
      uniqueSessions: uniqueSessions.length,
      dateRange: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
    };
  }
}
