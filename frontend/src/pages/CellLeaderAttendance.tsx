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
  Edit
} from 'lucide-react';
import {
  AttendanceStatus,
  MemberAttendanceStatus,
  CellLeaderAttendanceView,
  ATTENDANCE_COLORS,
  AttendanceMarkingRequest
} from '../types/attendance';

interface CellLeaderAttendanceProps {
  cellId: string;
  cellName: string;
  sessionId?: string;
}

// Mock data for demonstration - this would come from your API
const mockCellAttendanceData: CellLeaderAttendanceView = {
  cellId: 'cell-1',
  cellName: 'Gonyeli Cell',
  sessionId: 'session-today',
  sessionTitle: 'Sunday Cell Meeting',
  date: '2025-09-16',
  startTime: '19:00',
  expectedMembers: 15,
  presentCount: 12,
  absentCount: 2,
  lateCount: 1,
  attendanceRate: 86.7,
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
      checkInTime: '18:55',
      notes: ''
    },
    {
      memberId: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@email.com',
      phone: '+1234567891',
      profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=150',
      cellId: 'cell-1',
      cellName: 'Gonyeli Cell',
      status: 'PRESENT',
      arrivalTime: new Date('2025-09-16T19:02:00'),
      checkInTime: '19:02',
      notes: ''
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
    },
    {
      memberId: '4',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.d@email.com',
      phone: '+1234567893',
      cellId: 'cell-1',
      cellName: 'Gonyeli Cell',
      status: 'ABSENT',
      notes: 'Family emergency'
    },
    {
      memberId: '5',
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.w@email.com',
      phone: '+1234567894',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      cellId: 'cell-1',
      cellName: 'Gonyeli Cell',
      status: 'PRESENT',
      arrivalTime: new Date('2025-09-16T18:50:00'),
      checkInTime: '18:50',
      notes: ''
    },
    {
      memberId: '6',
      firstName: 'Lisa',
      lastName: 'Anderson',
      email: 'lisa.a@email.com',
      phone: '+1234567895',
      cellId: 'cell-1',
      cellName: 'Gonyeli Cell',
      status: 'ABSENT',
      notes: 'Out of town'
    }
  ]
};

const CellLeaderAttendance: React.FC<CellLeaderAttendanceProps> = ({ 
  cellId, 
  cellName,
  sessionId 
}) => {
  const [attendanceData, setAttendanceData] = useState<CellLeaderAttendanceView>(mockCellAttendanceData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'ALL'>('ALL');
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Filter members based on search and status
  const filteredMembers = attendanceData.members.filter(member => {
    const matchesSearch = `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter;
    return matchesSearch && matchesStatus;
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

  const markAttendance = async (memberId: string, status: AttendanceStatus) => {
    setIsMarkingAttendance(true);
    
    // Update local state immediately for better UX
    setAttendanceData(prev => ({
      ...prev,
      members: prev.members.map(member => {
        if (member.memberId === memberId) {
          const now = new Date();
          return {
            ...member,
            status,
            arrivalTime: status === 'PRESENT' || status === 'LATE' ? now : undefined,
            checkInTime: status === 'PRESENT' || status === 'LATE' ? 
              now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : 
              undefined
          };
        }
        return member;
      }),
      presentCount: prev.members.filter(m => m.memberId === memberId ? status === 'PRESENT' : m.status === 'PRESENT').length,
      absentCount: prev.members.filter(m => m.memberId === memberId ? status === 'ABSENT' : m.status === 'ABSENT').length,
      lateCount: prev.members.filter(m => m.memberId === memberId ? status === 'LATE' : m.status === 'LATE').length,
    }));

    // Here you would make the API call
    try {
      // const response = await markMemberAttendance({ sessionId, memberId, status });
      console.log('Marking attendance:', { sessionId, memberId, status });
    } catch (error) {
      console.error('Failed to mark attendance:', error);
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  const formatTime = (time: Date | string) => {
    if (!time) return '--:--';
    const date = typeof time === 'string' ? new Date(time) : time;
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 via-blue-50/90 to-green-100/90" />
      <div className="absolute inset-0 bg-white/80" />

      {/* Header */}
      <header className="relative z-10 bg-white/30 backdrop-blur-lg border-b border-white/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {attendanceData.cellName} Attendance
              </h1>
              <p className="text-gray-700 font-medium mt-1">
                {attendanceData.sessionTitle} - {new Date(attendanceData.date).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/50 border border-white/30 rounded-xl hover:bg-white/70 transition-all text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/50 border border-white/30 rounded-xl hover:bg-white/70 transition-all text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{attendanceData.expectedMembers}</p>
            <p className="text-sm text-gray-600">Expected</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{attendanceData.presentCount}</p>
            <p className="text-sm text-gray-600">Present</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{attendanceData.lateCount}</p>
            <p className="text-sm text-gray-600">Late</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{attendanceData.absentCount}</p>
            <p className="text-sm text-gray-600">Absent</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{attendanceData.attendanceRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Rate</p>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AttendanceStatus | 'ALL')}
                className="px-4 py-2 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="ALL">All Status</option>
                <option value="PRESENT">Present</option>
                <option value="LATE">Late</option>
                <option value="ABSENT">Absent</option>
                <option value="EXCUSED">Excused</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attendance List */}
        <div className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-white/30">
            <h3 className="text-lg font-semibold text-gray-800">
              Member Attendance ({filteredMembers.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Arrival Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredMembers.map((member, index) => (
                  <motion.tr
                    key={member.memberId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-white/20 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={member.profilePicture || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=random`}
                            alt={`${member.firstName} ${member.lastName}`}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50"
                          />
                          <div 
                            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                            style={{ backgroundColor: ATTENDANCE_COLORS[member.status.toLowerCase() as keyof typeof ATTENDANCE_COLORS] }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(member.status)}`}>
                        {getStatusIcon(member.status)}
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(member.arrivalTime || '')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {member.notes || '--'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => markAttendance(member.memberId, 'PRESENT')}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="Mark Present"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => markAttendance(member.memberId, 'LATE')}
                            className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                            title="Mark Late"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => markAttendance(member.memberId, 'ABSENT')}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Mark Absent"
                          >
                            <XCircle className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedMember(member.memberId)}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            title="Add Note"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No members found matching your search criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CellLeaderAttendance;
