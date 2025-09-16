import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck,
  Filter,
  Search,
  Plus,
  Crown,
  Badge,
  Eye
} from 'lucide-react';
import { mockTeams, mockMembers, Team, Member } from '../data/mockData';

const Teams: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['ALL', 'WORSHIP', 'ADMINISTRATION', 'OUTREACH', 'TECHNICAL', 'PASTORAL'];

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'WORSHIP': return '🎵';
      case 'ADMINISTRATION': return '📋';
      case 'OUTREACH': return '🤝';
      case 'TECHNICAL': return '💻';
      case 'PASTORAL': return '🙏';
      default: return '👥';
    }
  };

  const filteredTeams = mockTeams.filter(team => {
    const matchesCategory = selectedCategory === 'ALL' || team.category === selectedCategory;
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTeamMembers = (teamId: string): Member[] => {
    return mockMembers.filter(member => member.teams?.includes(teamId));
  };

  const TeamCard: React.FC<{ team: Team }> = ({ team }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={() => setSelectedTeam(team)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg ring-2 ring-white/30"
            style={{ backgroundColor: team.color }}
          >
            {getCategoryIcon(team.category)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
              {team.name}
            </h3>
            <span className="text-xs px-3 py-1 bg-white/50 backdrop-blur-sm text-gray-700 rounded-full border border-white/30">
              {team.category}
            </span>
          </div>
        </div>
        <Eye className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
      </div>

      <p className="text-sm text-gray-700 group-hover:text-gray-800 mb-4 line-clamp-2 transition-colors">
        {team.description}
      </p>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/30">
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: team.color }}>
            {team.memberCount}
          </p>
          <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">Members</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Crown className="w-4 h-4 text-yellow-600" />
            <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors">Leader</p>
          </div>
          <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">{team.leaderName}</p>
        </div>
        <div className="text-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/30 ${
            team.isActive 
              ? 'bg-green-500/20 text-green-800'
              : 'bg-red-500/20 text-red-800'
          }`}>
            {team.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>
    </motion.div>
  );

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
            <pattern id="teams-dots" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.5" fill="#22C55E"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#teams-dots)"/>
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/30 backdrop-blur-lg border-b border-white/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Ministry Teams
              </h1>
              <p className="text-gray-700 font-medium mt-1">
                Organize and manage church service teams
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-700 placeholder-gray-500"
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add Team
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-800">Filter by Category</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm border ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg border-transparent'
                    : 'bg-white/50 text-gray-700 hover:bg-white/70 border-white/30'
                }`}
              >
                {getCategoryIcon(category)} {category === 'ALL' ? 'All Teams' : category.replace('_', ' ')}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{mockTeams.length}</h3>
                <p className="text-sm text-gray-600">Total Teams</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {mockTeams.filter(team => team.isActive).length}
                </h3>
                <p className="text-sm text-gray-600">Active Teams</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {mockTeams.reduce((sum, team) => sum + team.memberCount, 0)}
                </h3>
                <p className="text-sm text-gray-600">Total Volunteers</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <Badge className="w-8 h-8 text-orange-600" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {new Set(mockTeams.map(team => team.category)).size}
                </h3>
                <p className="text-sm text-gray-600">Categories</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Teams Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedCategory === 'ALL' ? 'All Teams' : `${selectedCategory} Teams`}
            </h2>
            <span className="text-sm text-gray-600">
              {filteredTeams.length} teams found
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TeamCard team={team} />
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Empty state */}
        {filteredTeams.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-2xl p-8 shadow-lg max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No teams found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          </motion.div>
        )}
      </main>

      {/* Team Detail Modal */}
      {selectedTeam && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTeam(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/90 backdrop-blur-lg border border-white/50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-2 ring-white/30"
                    style={{ backgroundColor: selectedTeam.color }}
                  >
                    {getCategoryIcon(selectedTeam.category)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedTeam.name}
                    </h2>
                    <p className="text-gray-600">
                      {selectedTeam.description}
                    </p>
                    <span className="inline-flex items-center px-2 py-1 mt-2 bg-white/50 text-gray-700 rounded-full text-sm border border-white/30">
                      {selectedTeam.category}
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedTeam(null)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-white/50 rounded-xl transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5" style={{ color: selectedTeam.color }} />
                    <h3 className="font-semibold text-gray-800">Total Members</h3>
                  </div>
                  <p className="text-3xl font-bold" style={{ color: selectedTeam.color }}>
                    {selectedTeam.memberCount}
                  </p>
                </div>

                <div className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold text-gray-800">Team Leader</h3>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedTeam.leaderName}
                  </p>
                </div>

                <div className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="w-5 h-5" style={{ color: selectedTeam.color }} />
                    <h3 className="font-semibold text-gray-800">Status</h3>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTeam.isActive 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedTeam.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Team Members ({getTeamMembers(selectedTeam.id).length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getTeamMembers(selectedTeam.id).map((member) => (
                    <motion.div
                      key={member.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/70 transition-all"
                    >
                      <img
                        src={member.profilePicture}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {member.cellName}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {member.teams?.filter(t => t !== selectedTeam.id).slice(0, 2).map((teamId) => {
                          const team = mockTeams.find(t => t.id === teamId);
                          return team ? (
                            <span
                              key={teamId}
                              className="px-2 py-1 bg-white/70 border border-white/50 text-xs rounded-full font-medium"
                              style={{ color: team.color }}
                            >
                              {team.name.split(' ')[0]}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/30">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-white/50 text-gray-700 rounded-xl hover:bg-white/70 transition-colors font-medium border border-white/30"
                  onClick={() => setSelectedTeam(null)}
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all font-medium shadow-lg"
                >
                  Edit Team
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Teams;
