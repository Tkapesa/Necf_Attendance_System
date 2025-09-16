import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock,
  ChevronRight,
  Moon,
  Sun,
  MapPin
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

  const handleCellClick = (cell: Cell) => {
    setSelectedCell(cell);
    setIsModalOpen(true);
  };

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

  const StatCard = ({ icon: Icon, title, value, change, color }: {
    icon: any;
    title: string;
    value: string | number;
    change?: string;
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 opacity-10">
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${color}`} />
      </div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-8 h-8 text-gray-600 dark:text-gray-300" />
          {change && (
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
              {change}
            </span>
          )}
        </div>
        
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {value}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {title}
        </p>
      </div>
    </motion.div>
  );

  const CellCard = ({ cell }: { cell: Cell }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={() => handleCellClick(cell)}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
      </div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {cell.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {cell.description}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4 mr-2" />
            <span>Led by {cell.leaderName}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{cell.meetingDay}s at {cell.meetingTime}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{cell.location}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {cell.memberCount}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Members</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {cell.attendancePercentage}%
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Attendance</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {cell.capacity}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Capacity</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {cell.recentAttendance}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Last Meeting</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Pastor Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Near East Christian Fellowship
              </p>
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-lg border border-white/20 dark:border-gray-600/20 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-purple-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Members"
            value={stats.totalMembers}
            change="+5.2%"
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={Users}
            title="Active Members"
            value={stats.activeMembers}
            change="+3.1%"
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={Calendar}
            title="Total Sessions"
            value={stats.totalSessions}
            change="+12.5%"
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={TrendingUp}
            title="Today's Attendance"
            value={stats.todayAttendance}
            change="+8.2%"
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Attendance Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Weekly Attendance
              </h3>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-1" />
                <span>Last 7 days</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="day" 
                  stroke="#6B7280" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280" 
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Cell Attendance Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cell Attendance
              </h3>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>This week</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cells.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="#6B7280" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#6B7280" 
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar 
                  dataKey="attendancePercentage" 
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Church Cells */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Church Cells
            </h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {cells.length} active cells
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cells.map((cell, index) => (
              <motion.div
                key={cell.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CellCard cell={cell} />
              </motion.div>
            ))}
          </div>
        </div>
      </main>

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
