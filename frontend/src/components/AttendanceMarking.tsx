import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  Search,
  QrCode,
  Users,
  Plus,
  Minus,
  Save,
  RefreshCw,
  Zap
} from 'lucide-react';
import {
  AttendanceStatus,
  MemberAttendanceStatus,
  ATTENDANCE_COLORS
} from '../types/attendance';

interface AttendanceMarkingProps {
  cellId: string;
  sessionId: string;
  cellName: string;
  onAttendanceMarked?: (memberId: string, status: AttendanceStatus) => void;
}

// Mock members data for attendance marking
const mockMembers: MemberAttendanceStatus[] = [
  {
    memberId: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1234567890',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    cellId: 'cell-1',
    cellName: 'Gonyeli Cell',
    status: 'ABSENT'
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
    status: 'ABSENT'
  },
  {
    memberId: '3',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.b@email.com',
    phone: '+1234567892',
    cellId: 'cell-1',
    cellName: 'Gonyeli Cell',
    status: 'ABSENT'
  },
  {
    memberId: '4',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.d@email.com',
    phone: '+1234567893',
    cellId: 'cell-1',
    cellName: 'Gonyeli Cell',
    status: 'ABSENT'
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
    status: 'ABSENT'
  }
];

const AttendanceMarking: React.FC<AttendanceMarkingProps> = ({
  sessionId,
  cellName,
  onAttendanceMarked
}) => {
  const [members, setMembers] = useState<MemberAttendanceStatus[]>(mockMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [batchStatus, setBatchStatus] = useState<AttendanceStatus>('PRESENT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mode, setMode] = useState<'manual' | 'qr' | 'bulk'>('manual');
  const [showSuccess, setShowSuccess] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter members based on search
  const filteredMembers = members.filter(member =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mark individual attendance
  const markAttendance = async (memberId: string, status: AttendanceStatus) => {
    const now = new Date();
    
    // Update local state immediately
    setMembers(prev => prev.map(member => {
      if (member.memberId === memberId) {
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
    }));

    // Show success animation
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    // Call parent callback
    onAttendanceMarked?.(memberId, status);

    // Here you would make the API call
    try {
      console.log('Marking attendance:', { sessionId, memberId, status, arrivalTime: now });
    } catch (error) {
      console.error('Failed to mark attendance:', error);
    }
  };

  // Batch mark attendance for selected members
  const markBatchAttendance = async () => {
    setIsSubmitting(true);
    const now = new Date();

    try {
      // Update all selected members
      setMembers(prev => prev.map(member => {
        if (selectedMembers.has(member.memberId)) {
          return {
            ...member,
            status: batchStatus,
            arrivalTime: batchStatus === 'PRESENT' || batchStatus === 'LATE' ? now : undefined,
            checkInTime: batchStatus === 'PRESENT' || batchStatus === 'LATE' ? 
              now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : 
              undefined
          };
        }
        return member;
      }));

      // Clear selection
      setSelectedMembers(new Set());
      
      // Show success
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      console.log('Batch marking:', { selectedMembers: Array.from(selectedMembers), status: batchStatus });
    } catch (error) {
      console.error('Failed to batch mark attendance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle member selection
  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  // Select all filtered members
  const selectAllFiltered = () => {
    setSelectedMembers(new Set(filteredMembers.map(m => m.memberId)));
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedMembers(new Set());
  };

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
    }
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getAttendanceStats = () => {
    const present = members.filter(m => m.status === 'PRESENT').length;
    const late = members.filter(m => m.status === 'LATE').length;
    const absent = members.filter(m => m.status === 'ABSENT').length;
    const total = members.length;
    const attendanceRate = total > 0 ? ((present + late) / total) * 100 : 0;
    
    return { present, late, absent, total, attendanceRate };
  };

  const stats = getAttendanceStats();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 via-blue-50/90 to-purple-100/90" />
      <div className="absolute inset-0 bg-white/80" />

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold">Attendance Marked Successfully!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="relative z-10 bg-white/30 backdrop-blur-lg border-b border-white/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Mark Attendance
              </h1>
              <p className="text-gray-700 font-medium mt-1">
                {cellName} - {formatTime(currentTime)}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Mode Selection */}
              <div className="flex bg-white/50 rounded-xl p-1 border border-white/30">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode('manual')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === 'manual' 
                      ? 'bg-white shadow-md text-gray-800' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-1" />
                  Manual
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode('qr')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === 'qr' 
                      ? 'bg-white shadow-md text-gray-800' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <QrCode className="w-4 h-4 inline mr-1" />
                  QR Code
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode('bulk')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === 'bulk' 
                      ? 'bg-white shadow-md text-gray-800' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Zap className="w-4 h-4 inline mr-1" />
                  Bulk
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-lg text-center"
          >
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-lg text-center"
          >
            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            <p className="text-sm text-gray-600">Present</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-lg text-center"
          >
            <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
            <p className="text-sm text-gray-600">Late</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-lg text-center"
          >
            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            <p className="text-sm text-gray-600">Absent</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-4 shadow-lg text-center"
          >
            <p className="text-2xl font-bold text-purple-600">{stats.attendanceRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Rate</p>
          </motion.div>
        </div>

        {/* Search and Bulk Actions */}
        <div className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4">
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

            {/* Bulk Actions */}
            {mode === 'bulk' && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  {selectedMembers.size} selected
                </span>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={selectAllFiltered}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    All
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearSelections}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    <Minus className="w-4 h-4 inline mr-1" />
                    Clear
                  </motion.button>
                </div>

                <select
                  value={batchStatus}
                  onChange={(e) => setBatchStatus(e.target.value as AttendanceStatus)}
                  className="px-3 py-2 bg-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="PRESENT">Mark Present</option>
                  <option value="LATE">Mark Late</option>
                  <option value="ABSENT">Mark Absent</option>
                  <option value="EXCUSED">Mark Excused</option>
                </select>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={markBatchAttendance}
                  disabled={selectedMembers.size === 0 || isSubmitting}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-1" />
                  ) : (
                    <Save className="w-4 h-4 inline mr-1" />
                  )}
                  Apply
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.memberId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${
                mode === 'bulk' && selectedMembers.has(member.memberId) 
                  ? 'ring-2 ring-blue-500 bg-blue-50/50' 
                  : ''
              }`}
              onClick={() => mode === 'bulk' && toggleMemberSelection(member.memberId)}
            >
              <div className="text-center mb-4">
                <div className="relative inline-block">
                  <img
                    src={member.profilePicture || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=random`}
                    alt={`${member.firstName} ${member.lastName}`}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-white/50 mx-auto"
                  />
                  <div 
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white"
                    style={{ backgroundColor: ATTENDANCE_COLORS[member.status.toLowerCase() as keyof typeof ATTENDANCE_COLORS] }}
                  />
                  {mode === 'bulk' && selectedMembers.has(member.memberId) && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 mt-3">
                  {member.firstName} {member.lastName}
                </h3>
                <p className="text-sm text-gray-600">{member.email}</p>
              </div>

              <div className="mb-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border w-full justify-center ${getStatusColor(member.status)}`}>
                  {getStatusIcon(member.status)}
                  {member.status}
                </span>
                {member.checkInTime && (
                  <div className="flex items-center justify-center gap-1 mt-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{member.checkInTime}</span>
                  </div>
                )}
              </div>

              {mode === 'manual' && (
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => markAttendance(member.memberId, 'PRESENT')}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Present
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => markAttendance(member.memberId, 'ABSENT')}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    <XCircle className="w-4 h-4 inline mr-1" />
                    Absent
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => markAttendance(member.memberId, 'LATE')}
                    className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                  >
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Late
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => markAttendance(member.memberId, 'EXCUSED')}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    <UserCheck className="w-4 h-4 inline mr-1" />
                    Excused
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">No members found</p>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AttendanceMarking;
