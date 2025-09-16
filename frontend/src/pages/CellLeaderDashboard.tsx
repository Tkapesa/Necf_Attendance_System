import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  QrCode, 
  TrendingUp, 
  Calendar,
  MapPin,
  Clock,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { mockMembers, mockCells } from '../data/mockData';

const CellLeaderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  if (!user || user.role !== 'CELL_LEADER') {
    return <div>Access Denied</div>;
  }

  // Filter data to only show the leader's cell
  const userCell = mockCells.find(cell => cell.id === user.cellId);
  const cellMembers = mockMembers.filter(member => member.cellId === user.cellId);

  // Filter members based on search
  const filteredMembers = cellMembers.filter(member =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate cell-specific metrics
  const cellMetrics = {
    totalMembers: cellMembers.length,
    activeMembers: cellMembers.filter(m => m.status === 'ACTIVE').length,
    recentAttendance: userCell?.recentAttendance || 0,
    attendanceRate: userCell?.attendancePercentage || 0
  };

  // Weekly attendance data for the cell
  const weeklyData = [
    { week: 'Week 1', attendance: 18, target: 20 },
    { week: 'Week 2', attendance: 16, target: 20 },
    { week: 'Week 3', attendance: 22, target: 20 },
    { week: 'Week 4', attendance: cellMetrics.recentAttendance, target: 20 }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Background with Logo-inspired Colors */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80')`
        }}
      ></div>
      
      {/* Logo-inspired gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 via-blue-50/90 to-green-100/90"></div>
      <div className="absolute inset-0 bg-white/80"></div>
      
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern id="cell-dots" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.5" fill="#22C55E"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#cell-dots)"/>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen p-6">
        {/* Header with Glass Effect */}
        <div className="mb-8 bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {userCell?.name} Dashboard
              </h1>
              <p className="text-gray-700 font-medium mt-1">
                Welcome back, {user.firstName}! Here's your cell overview.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
                onClick={() => window.location.hash = '#mark-attendance'}
              >
                <UserCheck className="w-4 h-4" />
                Mark Attendance
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
                onClick={() => window.location.hash = '#cell-attendance'}
              >
                <Calendar className="w-4 h-4" />
                View Attendance
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <UserPlus className="w-4 h-4" />
                Add Member
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <QrCode className="w-4 h-4" />
                Generate QR
              </motion.button>
            </div>
          </div>
        </div>

      {/* Quick Stats with Glass Morphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-800 transition-colors">Total Members</p>
              <p className="text-2xl font-bold text-gray-900 group-hover:text-black transition-colors">{cellMetrics.totalMembers}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 group-hover:border-white/50 transition-all duration-300">
              <Users className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-800 transition-colors">Active Members</p>
              <p className="text-2xl font-bold text-green-700 group-hover:text-green-800 transition-colors">{cellMetrics.activeMembers}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-emerald-500/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 group-hover:border-white/50 transition-all duration-300">
              <TrendingUp className="w-6 h-6 text-green-600 group-hover:text-green-700 transition-colors" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-800 transition-colors">Last Meeting</p>
              <p className="text-2xl font-bold text-purple-700 group-hover:text-purple-800 transition-colors">{cellMetrics.recentAttendance}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 group-hover:border-white/50 transition-all duration-300">
              <Calendar className="w-6 h-6 text-purple-600 group-hover:text-purple-700 transition-colors" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-800 transition-colors">Attendance Rate</p>
              <p className="text-2xl font-bold text-orange-700 group-hover:text-orange-800 transition-colors">{cellMetrics.attendanceRate}%</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500/30 to-red-500/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 group-hover:border-white/50 transition-all duration-300">
              <TrendingUp className="w-6 h-6 text-orange-600 group-hover:text-orange-700 transition-colors" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section with Glass Morphism */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Attendance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Weekly Attendance Trend
            </h3>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              Last 4 weeks
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis 
                  dataKey="week" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#374151', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#374151', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#1e40af" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Cell Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cell Information</h3>
          
          {userCell && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Meeting Location</p>
                  <p className="text-gray-600">{userCell.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Meeting Schedule</p>
                  <p className="text-gray-600">{userCell.meetingDay}s at {userCell.meetingTime}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Capacity</p>
                  <p className="text-gray-600">{userCell.memberCount} / {userCell.capacity} members</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Description:</strong> {userCell.description}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Members List with Glass Morphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 shadow-lg"
      >
        <div className="p-6 border-b border-white/30">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Cell Members</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 placeholder-gray-500"
                />
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-800 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/70 transition-all duration-200">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Teams
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/20 backdrop-blur-sm divide-y divide-white/20">
              {filteredMembers.map((member, index) => (
                <motion.tr 
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-white/30 transition-all duration-200 group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-white/30 group-hover:ring-white/50 transition-all duration-200"
                          src={member.profilePicture || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}`}
                          alt={`${member.firstName} ${member.lastName}`}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                          ID: {member.membershipId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-800 group-hover:text-gray-900 transition-colors">{member.email}</div>
                    <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">{member.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm border border-white/30 ${
                      member.status === 'ACTIVE' 
                        ? 'bg-green-500/20 text-green-800' 
                        : 'bg-red-500/20 text-red-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 group-hover:text-gray-800 transition-colors">
                    {new Date(member.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {member.teams?.slice(0, 2).map((team) => (
                        <span
                          key={team}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-800 rounded-lg backdrop-blur-sm border border-white/30"
                        >
                          {team}
                        </span>
                      ))}
                      {member.teams && member.teams.length > 2 && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-500/20 text-gray-700 rounded-lg backdrop-blur-sm border border-white/30">
                          +{member.teams.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg bg-white/30 backdrop-blur-sm border border-white/30 hover:bg-white/50 transition-all duration-200">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default CellLeaderDashboard;
