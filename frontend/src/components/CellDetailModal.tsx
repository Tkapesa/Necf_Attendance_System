import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Clock, 
  QrCode, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Users, 
  Activity,
  Download,
  Edit,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Cell, Member } from '../data/mockData';

interface CellDetailModalProps {
  cell: Cell | null;
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
}

interface MemberActivity {
  id: string;
  memberId: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  team?: string;
}

// Mock member activities
const mockActivities: MemberActivity[] = [
  {
    id: '1',
    memberId: '1',
    date: '2024-01-14',
    checkInTime: '19:00',
    checkOutTime: '21:30',
    status: 'PRESENT',
    team: 'Worship Team'
  },
  {
    id: '2',
    memberId: '1',
    date: '2024-01-07',
    checkInTime: '19:15',
    checkOutTime: '21:45',
    status: 'LATE',
    team: 'Worship Team'
  },
  {
    id: '3',
    memberId: '2',
    date: '2024-01-14',
    checkInTime: '18:55',
    checkOutTime: '21:30',
    status: 'PRESENT',
    team: 'Prayer Team'
  },
  {
    id: '4',
    memberId: '3',
    date: '2024-01-14',
    checkInTime: '19:05',
    checkOutTime: '21:30',
    status: 'PRESENT',
    team: 'Ushering Team'
  }
];

const CellDetailModal: React.FC<CellDetailModalProps> = ({ cell, isOpen, onClose, members }) => {
  const [activeTab, setActiveTab] = useState<'members' | 'activity' | 'statistics'>('members');

  if (!cell) return null;

  const cellMembers = members.filter(member => member.cellId === cell.id);
  
  const getActivityForMember = (memberId: string) => {
    return mockActivities.filter(activity => activity.memberId === memberId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'text-green-600 bg-green-100';
      case 'LATE': return 'text-yellow-600 bg-yellow-100';
      case 'ABSENT': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT': return <CheckCircle className="w-4 h-4" />;
      case 'LATE': return <AlertCircle className="w-4 h-4" />;
      case 'ABSENT': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const generateQRData = (member: Member) => {
    return `NECF-${member.membershipId}-${member.firstName}-${member.lastName}-${Date.now()}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{cell.name}</h2>
                  <p className="text-blue-100">{cell.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>Led by {cell.leaderName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{cell.meetingDay}s at {cell.meetingTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{cell.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{cell.memberCount}</div>
                    <div className="text-blue-100">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{cell.attendancePercentage}%</div>
                    <div className="text-blue-100">Attendance</div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex">
                {[
                  { id: 'members', label: 'Members', icon: Users },
                  { id: 'activity', label: 'Recent Activity', icon: Activity },
                  { id: 'statistics', label: 'Statistics', icon: Calendar }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                      activeTab === id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeTab === 'members' && (
                <div className="space-y-4">
                  {cellMembers.map((member) => {
                    const recentActivity = getActivityForMember(member.id);
                    const lastAttendance = recentActivity[0];

                    return (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <img
                              src={member.profilePicture || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=random`}
                              alt={`${member.firstName} ${member.lastName}`}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {member.firstName} {member.lastName}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300">ID: {member.membershipId}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  <span>{member.email}</span>
                                </div>
                                {member.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    <span>{member.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {member.status}
                              </span>
                            </div>
                            <button className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                              <QrCode className="w-4 h-4" />
                              View QR
                            </button>
                          </div>
                        </div>

                        {/* Member Details */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Last Attendance */}
                          <div className="bg-white dark:bg-gray-600 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Last Attendance</h4>
                            {lastAttendance ? (
                              <div>
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lastAttendance.status)}`}>
                                  {getStatusIcon(lastAttendance.status)}
                                  {lastAttendance.status}
                                </div>
                                <div className="flex items-center gap-1 mt-2 text-sm text-gray-600 dark:text-gray-300">
                                  <Clock className="w-4 h-4" />
                                  <span>{lastAttendance.checkInTime} - {lastAttendance.checkOutTime}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{lastAttendance.date}</div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">No recent attendance</div>
                            )}
                          </div>

                          {/* Teams Assignment */}
                          <div className="bg-white dark:bg-gray-600 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Teams</h4>
                            {member.teams && member.teams.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {member.teams.map((teamId) => (
                                  <span 
                                    key={teamId}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 rounded-full text-xs font-medium"
                                  >
                                    <Shield className="w-3 h-3" />
                                    {teamId.charAt(0).toUpperCase() + teamId.slice(1).replace('-', ' ')}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">No teams assigned</div>
                            )}
                          </div>

                          {/* QR Details */}
                          <div className="bg-white dark:bg-gray-600 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">QR Code</h4>
                            <div className="text-xs text-gray-500 break-all">
                              {generateQRData(member).substring(0, 30)}...
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">
                                <Download className="w-3 h-3" />
                                Download
                              </button>
                              <button className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors">
                                <Edit className="w-3 h-3" />
                                Regenerate
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Cell Activities</h3>
                  {mockActivities.map((activity) => {
                    const member = cellMembers.find(m => m.id === activity.memberId);
                    if (!member) return null;

                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={member.profilePicture || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=random`}
                            alt={`${member.firstName} ${member.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {activity.date} • {activity.checkInTime} - {activity.checkOutTime}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {activity.team && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                              {activity.team}
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {getStatusIcon(activity.status)}
                            {activity.status}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'statistics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-8 h-8 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Membership</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Total Members:</span>
                        <span className="font-semibold">{cell.memberCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Capacity:</span>
                        <span className="font-semibold">{cell.capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Utilization:</span>
                        <span className="font-semibold">{Math.round((cell.memberCount / (cell.capacity || 1)) * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">This Week:</span>
                        <span className="font-semibold">{cell.recentAttendance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Average:</span>
                        <span className="font-semibold">{cell.attendancePercentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Trend:</span>
                        <span className="font-semibold text-green-600">↗ +5%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-8 h-8 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Teams</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Worship Team:</span>
                        <span className="font-semibold">3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Prayer Team:</span>
                        <span className="font-semibold">5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Ushering Team:</span>
                        <span className="font-semibold">2</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CellDetailModal;
