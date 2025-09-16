import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  Clock,
  MapPin,
  Users,
  TrendingUp,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockCells, mockMembers } from '../data/mockData';

const MemberDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'MEMBER') {
    return <div>Access Denied</div>;
  }

  // Get member's cell information
  const memberCell = mockCells.find(cell => cell.id === user.cellId);
  const memberData = mockMembers.find(member => member.id === user.id);

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
            <pattern id="member-dots" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.5" fill="#22C55E"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#member-dots)"/>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen p-6">
        {/* Header with Glass Effect */}
        <div className="mb-8 bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-xl">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Welcome, {user?.firstName}!
            </h1>
            <p className="text-gray-700 font-medium mt-1">
              Your personal NECF dashboard
            </p>
          </div>
        </div>

      {/* Personal Info & Cell Info with Glass Morphism */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-white/50"
                />
              ) : (
                <User className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800">
                {user.firstName} {user.lastName}
              </h4>
              <p className="text-gray-600">{memberData?.membershipId}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <Mail className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Email</p>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            
            {user.phone && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <Phone className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Phone</p>
                  <p className="text-gray-600">{user.phone}</p>
                </div>
              </div>
            )}

            {memberData?.joinDate && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Member Since</p>
                  <p className="text-gray-600">
                    {new Date(memberData.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Cell Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">My Cell Group</h3>
          
          {memberCell ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {memberCell.name}
                </h4>
                <p className="text-gray-600">{memberCell.description}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Cell Leader</p>
                    <p className="text-gray-600">{memberCell.leaderName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Meeting Schedule</p>
                    <p className="text-gray-600">
                      {memberCell.meetingDay}s at {memberCell.meetingTime}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Location</p>
                    <p className="text-gray-600">{memberCell.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                    <TrendingUp className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Cell Size</p>
                    <p className="text-gray-600">
                      {memberCell.memberCount} members
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No cell group assigned</p>
          )}
        </motion.div>
      </div>

      {/* Teams & Activities with Glass Morphism */}
      {memberData?.teams && memberData.teams.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 mb-8 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">My Ministry Teams</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {memberData.teams.map((team, index) => (
              <motion.div
                key={team}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-500/20 to-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:border-white/50 transition-all duration-300 group"
              >
                <h4 className="font-semibold text-blue-800 group-hover:text-blue-900 mb-2 capitalize transition-colors">
                  {team.replace('-', ' ')}
                </h4>
                <p className="text-blue-700 text-sm">Active Member</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions with Glass Morphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm hover:from-blue-500/30 hover:to-blue-600/30 border border-white/30 hover:border-white/50 rounded-xl p-4 text-left transition-all duration-300 group"
          >
            <Calendar className="w-8 h-8 text-blue-600 group-hover:text-blue-700 mb-2 transition-colors" />
            <h4 className="font-semibold text-blue-800 group-hover:text-blue-900 transition-colors">View Attendance</h4>
            <p className="text-blue-700 text-sm">Check your attendance history</p>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm hover:from-green-500/30 hover:to-green-600/30 border border-white/30 hover:border-white/50 rounded-xl p-4 text-left transition-all duration-300 group"
          >
            <Users className="w-8 h-8 text-green-600 group-hover:text-green-700 mb-2 transition-colors" />
            <h4 className="font-semibold text-green-800 group-hover:text-green-900 transition-colors">Contact Cell Leader</h4>
            <p className="text-green-700 text-sm">Get in touch with your leader</p>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm hover:from-purple-500/30 hover:to-purple-600/30 border border-white/30 hover:border-white/50 rounded-xl p-4 text-left transition-all duration-300 group"
          >
            <Clock className="w-8 h-8 text-purple-600 group-hover:text-purple-700 mb-2 transition-colors" />
            <h4 className="font-semibold text-purple-800 group-hover:text-purple-900 transition-colors">Upcoming Events</h4>
            <p className="text-purple-700 text-sm">See what's coming up</p>
          </motion.button>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default MemberDashboard;
