import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock,
  ChevronRight,
  Moon,
  Sun,
  BookOpen,
  Plus,
  Share,
  Grid,
  Filter,
  Save,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTheme } from '../hooks/useTheme';
import { mockDashboardStats, mockCells, mockMembers, Cell } from '../data/mockData';
import CellDetailModal from '../components/CellDetailModal';

const Dashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState(mockDashboardStats);
  const [cells] = useState(mockCells);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCell(null);
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        todayAttendance: prev.todayAttendance + Math.floor(Math.random() * 3) - 1
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Project-style attendance data
  const attendanceProjects = [
    { 
      id: 1,
      name: 'Sunday Service Attendance',
      status: 'On Track',
      completion: 87,
      overdue: 0,
      lastMilestone: 'Weekly Report Due',
      dueDate: '16 Sep, 2025',
      owners: ['JD', 'SM'],
      statusColor: 'green',
      priority: 'high',
      icon: '📊'
    },
    { 
      id: 2,
      name: 'Youth Ministry Tracking',
      status: 'At Risk',
      completion: 62,
      overdue: 3,
      lastMilestone: 'Month 1 Report Due',
      dueDate: '20 Sep, 2025 (-4 days)',
      owners: ['MK', 'AL'],
      statusColor: 'yellow',
      priority: 'medium',
      icon: '📋'
    },
    { 
      id: 3,
      name: 'Children Church Monitor',
      status: 'Off Track',
      completion: 34,
      overdue: 8,
      lastMilestone: 'Weekly attendance review',
      dueDate: '10 Sep, 2025 (+6 days)',
      owners: ['TR', 'JL'],
      statusColor: 'red',
      priority: 'high',
      icon: '📄'
    },
    { 
      id: 4,
      name: 'Prayer Meeting Analytics',
      status: 'On Track',
      completion: 91,
      overdue: 0,
      lastMilestone: 'Monthly summary complete',
      dueDate: '25 Sep, 2025',
      owners: ['DM', 'PK'],
      statusColor: 'green',
      priority: 'low',
      icon: '📊'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'On Track': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'At Risk': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'Off Track': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

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
            <pattern id="dashboard-dots" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.5" fill="#22C55E"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#dashboard-dots)"/>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header Section with Glass Effect */}
        <div className="bg-white/90 backdrop-blur-xl border-b border-white/50 shadow-lg">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-green-500/30">
                    <Grid className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      Pastor Dashboard
                    </h1>
                    <p className="text-gray-700 font-medium mt-1">
                      Near East Christian Fellowship
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Add Project
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl bg-white/70 backdrop-blur-sm hover:bg-white/80 transition-all duration-200 shadow-lg border border-white/50"
                >
                  <Share className="w-5 h-5 text-green-600" />
                </motion.button>
                <motion.button
                  onClick={toggleTheme}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl bg-white/70 backdrop-blur-sm hover:bg-white/80 transition-all duration-200 shadow-lg border border-white/50"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                  )}
                </motion.button>
            </div>
          </div>
          
          {/* Action Bar */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-300">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium">
                <Grid className="w-4 h-4" />
                Columns
              </button>
              <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium">
                <Filter className="w-4 h-4" />
                Sort By: Due Date
              </button>
              <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium">
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="border-0 bg-transparent text-sm text-gray-700 placeholder-gray-500 focus:outline-none w-64 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Projects Table with Glass Morphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 overflow-hidden shadow-xl"
        >
          {/* Table Header */}
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm border-b border-white/30 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-800 uppercase tracking-wide">
              <div className="col-span-3">Name</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Completion Percentage</div>
              <div className="col-span-1">Overdue Tasks</div>
              <div className="col-span-2">Last Milestone</div>
              <div className="col-span-2">Due Date</div>
              <div className="col-span-1">Owners</div>
            </div>
          </div>

          {/* Previous Section */}
          <div className="border-b border-white/30">
            <div className="px-6 py-3 bg-white/20 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-gray-700 rotate-90" />
                <span className="font-medium text-gray-800">Previous</span>
              </div>
            </div>
          </div>

          {/* Project Rows */}
          <div className="divide-y divide-white/30">
            {attendanceProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                className="px-6 py-4 hover:bg-white/20 transition-all duration-200 cursor-pointer group"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Name */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/30 to-green-500/30 backdrop-blur-sm rounded-xl flex items-center justify-center text-sm border border-white/30 group-hover:border-white/50 transition-all duration-200">
                      {project.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 group-hover:text-gray-900 transition-colors">{project.name}</div>
                      <div className="text-sm text-gray-600">NECF Ministry</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(project.status)}
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm border border-white/30 ${
                        project.status === 'On Track' ? 'bg-green-500/30 text-green-800' :
                        project.status === 'At Risk' ? 'bg-yellow-500/30 text-yellow-800' :
                        'bg-red-500/30 text-red-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    {project.status === 'On Track' && (
                      <div className="text-xs text-gray-600 mt-1">15 Oct</div>
                    )}
                    {project.status === 'Off Track' && (
                      <div className="text-xs text-gray-600 mt-1">17 Sep</div>
                    )}
                  </div>

                  {/* Completion */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="w-full bg-white/30 rounded-full h-2 backdrop-blur-sm">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              project.completion >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                              project.completion >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                              'bg-gradient-to-r from-red-500 to-red-600'
                            }`}
                            style={{ width: `${project.completion}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors">
                        {project.completion}%
                      </span>
                    </div>
                  </div>

                  {/* Overdue */}
                  <div className="col-span-1 text-center">
                    <span className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                      {project.overdue}
                    </span>
                  </div>

                  {/* Last Milestone */}
                  <div className="col-span-2">
                    <div className="text-sm text-gray-700 group-hover:text-gray-800 transition-colors">{project.lastMilestone}</div>
                  </div>

                  {/* Due Date */}
                  <div className="col-span-2">
                    <div className={`text-sm font-medium ${
                      project.dueDate.includes('(+') ? 'text-red-600' :
                      project.dueDate.includes('(-') ? 'text-yellow-600' : 'text-gray-700'
                    } group-hover:text-gray-800 transition-colors`}>
                      {project.dueDate}
                    </div>
                  </div>

                  {/* Owners */}
                  <div className="col-span-1">
                    <div className="flex -space-x-2">
                      {project.owners.map((owner, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white/50 backdrop-blur-sm group-hover:border-white/70 transition-all duration-200"
                        >
                          {owner}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats Cards with Glass Morphism */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-800 transition-colors">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900 group-hover:text-black transition-colors">{attendanceProjects.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 group-hover:border-white/50 transition-all duration-300">
                <BookOpen className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-800 transition-colors">On Track</p>
                <p className="text-2xl font-bold text-green-700 group-hover:text-green-800 transition-colors">
                  {attendanceProjects.filter(p => p.status === 'On Track').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-emerald-500/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 group-hover:border-white/50 transition-all duration-300">
                <CheckCircle className="w-6 h-6 text-green-600 group-hover:text-green-700 transition-colors" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-800 transition-colors">At Risk</p>
                <p className="text-2xl font-bold text-yellow-700 group-hover:text-yellow-800 transition-colors">
                  {attendanceProjects.filter(p => p.status === 'At Risk').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 group-hover:border-white/50 transition-all duration-300">
                <AlertTriangle className="w-6 h-6 text-yellow-600 group-hover:text-yellow-700 transition-colors" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-800 transition-colors">Off Track</p>
                <p className="text-2xl font-bold text-red-700 group-hover:text-red-800 transition-colors">
                  {attendanceProjects.filter(p => p.status === 'Off Track').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500/30 to-pink-500/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 group-hover:border-white/50 transition-all duration-300">
                <XCircle className="w-6 h-6 text-red-600 group-hover:text-red-700 transition-colors" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section with Glass Morphism */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Attendance Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Weekly Attendance Trend
              </h3>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                Last 7 days
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={stats.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    dataKey="day" 
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
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Cell Attendance Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Cell Performance
              </h3>
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                This week
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={cells.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#374151', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
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
                  <Bar 
                    dataKey="attendancePercentage" 
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#1e40af" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>

      {/* Cell Detail Modal */}
      <CellDetailModal
        cell={selectedCell}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        members={mockMembers}
      />
    </div>
  );
};

export default Dashboard;
