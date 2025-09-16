// Attendance system types and interfaces

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberPhoto?: string;
  sessionId: string;
  sessionTitle: string;
  cellId: string;
  cellName: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  arrivalTime?: Date;
  date: string;
  notes?: string;
  markedBy?: string; // Who marked the attendance
  createdAt: Date;
  updatedAt: Date;
}

export interface CellAttendanceSession {
  id: string;
  sessionTitle: string;
  cellId: string;
  cellName: string;
  date: string;
  startTime: string;
  endTime?: string;
  expectedMembers: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRecords: AttendanceRecord[];
}

export interface MemberAttendanceStatus {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  cellId: string;
  cellName: string;
  status: AttendanceStatus;
  arrivalTime?: Date;
  checkInTime?: string;
  notes?: string;
}

export interface CellAttendanceOverview {
  cellId: string;
  cellName: string;
  cellLeader: string;
  totalMembers: number;
  presentMembers: number;
  absentMembers: number;
  lateMembers: number;
  attendancePercentage: number;
  lastUpdated: Date;
  members: MemberAttendanceStatus[];
}

export interface AttendanceColorConfig {
  present: string;
  absent: string;
  late: string;
  excused: string;
}

export const ATTENDANCE_COLORS: AttendanceColorConfig = {
  present: '#10B981', // Green
  absent: '#EF4444',  // Red
  late: '#F59E0B',    // Yellow/Orange
  excused: '#6B7280'  // Gray
};

export interface AttendanceStats {
  totalSessions: number;
  totalAttendances: number;
  averageAttendance: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number;
  lastSessionDate?: Date;
}

// For Pastor/Admin views - viewing all cells
export interface AllCellsAttendanceView {
  sessionId: string;
  sessionTitle: string;
  date: string;
  startTime: string;
  totalCells: number;
  totalExpectedMembers: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  overallAttendanceRate: number;
  cellsAttendance: CellAttendanceOverview[];
}

// For Cell Leader views - viewing own cell only
export interface CellLeaderAttendanceView {
  cellId: string;
  cellName: string;
  sessionId: string;
  sessionTitle: string;
  date: string;
  startTime: string;
  expectedMembers: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
  members: MemberAttendanceStatus[];
}

// For real-time attendance marking
export interface AttendanceMarkingRequest {
  sessionId: string;
  memberId: string;
  status: AttendanceStatus;
  arrivalTime?: Date;
  notes?: string;
  markedBy: string;
}

export interface QuickAttendanceUpdate {
  memberId: string;
  status: AttendanceStatus;
  arrivalTime: Date;
}

// Attendance filtering and sorting options
export interface AttendanceFilters {
  status?: AttendanceStatus[];
  cellIds?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

export interface AttendanceSortOptions {
  field: 'memberName' | 'arrivalTime' | 'status' | 'cellName';
  direction: 'asc' | 'desc';
}

// Dashboard summary interfaces
export interface TodayAttendanceSummary {
  date: string;
  totalCells: number;
  totalExpectedMembers: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  overallRate: number;
  cellsSummary: {
    cellId: string;
    cellName: string;
    present: number;
    total: number;
    rate: number;
  }[];
}
