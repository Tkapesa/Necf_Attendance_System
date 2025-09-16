import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  TrendingUp,
  MapPin,
  ChevronDown,
  ChevronUp,
  BarChart3
} from 'lucide-react';
import {
  AttendanceStatus,
  MemberAttendanceStatus,
  CellAttendanceOverview,
  AllCellsAttendanceView,
  ATTENDANCE_COLORS,
  TodayAttendanceSummary
} from '../types/attendance';

interface PastorAttendanceDashboardProps {
  sessionId?: string;
}

// Mock data for all cells - this would come from your API
const mockAllCellsData: AllCellsAttendanceView = {
  sessionId: 'session-today',
  sessionTitle: 'Sunday Cell Meetings',
  date: '2025-09-16',
  startTime: '19:00',
  totalCells: 7,
  totalExpectedMembers: 98,
  totalPresent: 78,
  totalAbsent: 15,
  totalLate: 5,
  overallAttendanceRate: 79.6,
  cellsAttendance: [
    {
      cellId: 'cell-1',
      cellName: 'Gonyeli Cell',
      cellLeader: 'John Doe',
      totalMembers: 15,
      presentMembers: 12,
      absentMembers: 2,
      lateMembers: 1,
      attendancePercentage: 86.7,
      lastUpdated: new Date('2025-09-16T19:30:00'),
      members: [
        {
          memberId: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phone: '+1234567890',
          profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          cellId: 'cell-1',
          cellName: 'Gonyeli Cell',
          status: 'PRESENT',
          arrivalTime: new Date('2025-09-16T18:55:00'),
          checkInTime: '18:55'
        },
        {
          memberId: '2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.j@email.com',
          phone: '+1234567891',
          cellId: 'cell-1',
          cellName: 'Gonyeli Cell',
          status: 'PRESENT',
          arrivalTime: new Date('2025-09-16T19:02:00'),
          checkInTime: '19:02'
        },
        {
          memberId: '3',
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael.b@email.com',
          phone: '+1234567892',
          cellId: 'cell-1',
          cellName: 'Gonyeli Cell',
          status: 'LATE',
          arrivalTime: new Date('2025-09-16T19:25:00'),
          checkInTime: '19:25',
          notes: 'Traffic delay'
        }
      ]
    },
    {
      cellId: 'cell-2',
      cellName: 'Merit Cell',
      cellLeader: 'Jane Smith',
      totalMembers: 18,
      presentMembers: 15,
      absentMembers: 2,
      lateMembers: 1,
      attendancePercentage: 88.9,
      lastUpdated: new Date('2025-09-16T19:25:00'),
      members: [
        {
          memberId: '11',
          firstName: 'Emma',
          lastName: 'Wilson',
          email: 'emma.w@email.com',
          phone: '+1234567900',
          cellId: 'cell-2',
          cellName: 'Merit Cell',
          status: 'PRESENT',
          arrivalTime: new Date('2025-09-16T18:58:00'),
          checkInTime: '18:58'
        },
        {
          memberId: '12',
          firstName: 'James',
          lastName: 'Taylor',
          email: 'james.t@email.com',
          phone: '+1234567901',
          cellId: 'cell-2',
          cellName: 'Merit Cell',
          status: 'ABSENT',
          notes: 'Sick'
        }
      ]
    },
    {
      cellId: 'cell-3',
      cellName: 'Yenikent Cell',
      cellLeader: 'Michael Johnson',
      totalMembers: 12,
      presentMembers: 10,
      absentMembers: 2,
      lateMembers: 0,
      attendancePercentage: 83.3,
      lastUpdated: new Date('2025-09-16T19:20:00'),
      members: []
    },
    {
      cellId: 'cell-4',
      cellName: 'School Cell',
      cellLeader: 'Sarah Wilson',
      totalMembers: 20,
      presentMembers: 16,
      absentMembers: 3,
      lateMembers: 1,
      attendancePercentage: 85.0,
      lastUpdated: new Date('2025-09-16T19:35:00'),
      members: []
    },
    {
      cellId: 'cell-5',
      cellName: 'Küçük Kaymaklı Cell',
      cellLeader: 'David Brown',
      totalMembers: 10,
      presentMembers: 5,
      absentMembers: 3,
      lateMembers: 2,
      attendancePercentage: 70.0,
      lastUpdated: new Date('2025-09-16T19:15:00'),
      members: []
    },
    {
      cellId: 'cell-6',
      cellName: 'Hamitköy Cell',
      cellLeader: 'Grace Okonkwo',
      totalMembers: 16,
      presentMembers: 13,
      absentMembers: 2,
      lateMembers: 1,
      attendancePercentage: 87.5,
      lastUpdated: new Date('2025-09-16T19:28:00'),
      members: []
    },
    {
      cellId: 'cell-7',
      cellName: 'Ortaköy Cell',
      cellLeader: 'James Thompson',
      totalMembers: 12,
      presentMembers: 11,
      absentMembers: 0,
      lateMembers: 1,
      attendancePercentage: 100.0,
      lastUpdated: new Date('2025-09-16T19:10:00'),
      members: []
    }
  ]
};

const PastorAttendanceDashboard: React.FC<PastorAttendanceDashboardProps> = ({ sessionId }) => {
  const [attendanceData, setAttendanceData] = useState<AllCellsAttendanceView>(mockAllCellsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'ALL'>('ALL');
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'attendance' | 'present' | 'absent'>('attendance');
  const [isLoading, setIsLoading] = useState(false);

  // Toggle cell expansion
  const toggleCellExpansion = (cellId: string) => {
    setExpandedCells(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cellId)) {
        newSet.delete(cellId);
      } else {
        newSet.add(cellId);
      }
      return newSet;
    });
  };

  // Filter and sort cells
  const filteredAndSortedCells = attendanceData.cellsAttendance
    .filter(cell => cell.cellName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   cell.cellLeader.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.cellName.localeCompare(b.cellName);
        case 'attendance':
          return b.attendancePercentage - a.attendancePercentage;
        case 'present':
          return b.presentMembers - a.presentMembers;
        case 'absent':
          return b.absentMembers - a.absentMembers;
        default:
          return 0;
      }
    });

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="w-4 h-4" />;
      case 'LATE':
        return <AlertCircle className="w-4 h-4" />;
      case 'ABSENT':
        return <XCircle className="w-4 h-4" />;
      case 'EXCUSED':
        return <UserCheck className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ABSENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'EXCUSED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (time: Date | string) => {
    if (!time) return '--:--';
    const date = typeof time === 'string' ? new Date(time) : time;
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 75) return 'text-blue-600 bg-blue-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-purple-50/90 to-blue-100/90" />
      <div className="absolute inset-0 bg-white/80" />

      {/* Header */}
      <header className="relative z-10 bg-white/30 backdrop-blur-lg border-b border-white/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                All Cells Attendance
              </h1>
              <p className="text-gray-700 font-medium mt-1">
                {attendanceData.sessionTitle} - {new Date(attendanceData.date).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white/50 border border-white/30 rounded-xl hover:bg-white/70 transition-all text-sm font-medium disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/50 border border-white/30 rounded-xl hover:bg-white/70 transition-all text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Export Report
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{attendanceData.totalCells}</p>
            <p className="text-sm text-gray-600">Total Cells</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{attendanceData.totalExpectedMembers}</p>
            <p className="text-sm text-gray-600">Expected</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{attendanceData.totalPresent}</p>
            <p className="text-sm text-gray-600">Present</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{attendanceData.totalLate}</p>
            <p className="text-sm text-gray-600">Late</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{attendanceData.totalAbsent}</p>
            <p className="text-sm text-gray-600">Absent</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 bg-indigo-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-indigo-600">{attendanceData.overallAttendanceRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Overall Rate</p>
          </motion.div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search cells or leaders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="attendance">Sort by Attendance</option>
                  <option value="name">Sort by Name</option>
                  <option value="present">Sort by Present</option>
                  <option value="absent">Sort by Absent</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setExpandedCells(new Set(attendanceData.cellsAttendance.map(cell => cell.cellId)))}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Expand All
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setExpandedCells(new Set())}
                className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                Collapse All
              </motion.button>
            </div>
          </div>
        </div>

        {/* Cells List */}
        <div className="space-y-6">
          {filteredAndSortedCells.map((cell, index) => (
            <motion.div
              key={cell.cellId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl shadow-lg overflow-hidden"
            >
              {/* Cell Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => toggleCellExpansion(cell.cellId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                      {cell.cellName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{cell.cellName}</h3>
                      <p className="text-gray-600">Led by {cell.cellLeader}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{cell.presentMembers}</p>
                        <p className="text-xs text-gray-600">Present</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">{cell.lateMembers}</p>
                        <p className="text-xs text-gray-600">Late</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">{cell.absentMembers}</p>
                        <p className="text-xs text-gray-600">Absent</p>
                      </div>
                      <div>
                        <p className={`text-2xl font-bold px-3 py-1 rounded-lg ${getAttendanceColor(cell.attendancePercentage)}`}>
                          {cell.attendancePercentage.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-600">Rate</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {formatTime(cell.lastUpdated)}
                      </span>
                      {expandedCells.has(cell.cellId) ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Cell Members */}
              <AnimatePresence>
                {expandedCells.has(cell.cellId) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-white/30"
                  >
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        Members ({cell.members.length})
                      </h4>
                      
                      {cell.members.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="text-left">
                                <th className="pb-3 text-sm font-medium text-gray-700">Member</th>
                                <th className="pb-3 text-sm font-medium text-gray-700">Status</th>
                                <th className="pb-3 text-sm font-medium text-gray-700">Arrival Time</th>
                                <th className="pb-3 text-sm font-medium text-gray-700">Notes</th>
                              </tr>
                            </thead>
                            <tbody className="space-y-2">
                              {cell.members.map((member, memberIndex) => (
                                <tr key={member.memberId} className="border-t border-white/20">
                                  <td className="py-3">
                                    <div className="flex items-center gap-3">
                                      <div className="relative">
                                        <img
                                          src={member.profilePicture || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=random`}
                                          alt={`${member.firstName} ${member.lastName}`}
                                          className="w-8 h-8 rounded-full object-cover ring-2 ring-white/50"
                                        />
                                        <div 
                                          className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white"
                                          style={{ backgroundColor: ATTENDANCE_COLORS[member.status.toLowerCase() as keyof typeof ATTENDANCE_COLORS] }}
                                        />
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-800 text-sm">
                                          {member.firstName} {member.lastName}
                                        </p>
                                        <p className="text-xs text-gray-600">{member.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(member.status)}`}>
                                      {getStatusIcon(member.status)}
                                      {member.status}
                                    </span>
                                  </td>
                                  <td className="py-3">
                                    <div className="flex items-center gap-1 text-sm text-gray-700">
                                      <Clock className="w-3 h-3" />
                                      <span>{formatTime(member.arrivalTime || '')}</span>
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <p className="text-sm text-gray-600">
                                      {member.notes || '--'}
                                    </p>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">No detailed member data available</p>
                          <p className="text-sm text-gray-500">Contact cell leader for more information</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {filteredAndSortedCells.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">No cells found</p>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PastorAttendanceDashboard;
