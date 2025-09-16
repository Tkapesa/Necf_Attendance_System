import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  QrCode, 
  Users, 
  Menu,
  X,
  Home,
  UserCheck,
  LogOut,
  Calendar,
  ClipboardList
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CellLeaderDashboard from './pages/CellLeaderDashboard';
import MemberDashboard from './pages/MemberDashboard';
import LeaderScan from './pages/LeaderScan';
import AdminPanel from './pages/AdminPanel';
import Teams from './pages/Teams';
import CellLeaderAttendance from './pages/CellLeaderAttendance';
import PastorAttendanceDashboard from './pages/PastorAttendanceDashboard';
import AttendanceMarking from './components/AttendanceMarking';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useTheme } from './hooks/useTheme';

type PageType = 'dashboard' | 'cell-dashboard' | 'member-dashboard' | 'scan' | 'admin' | 'teams' | 'attendance' | 'cell-attendance' | 'mark-attendance';

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  if (!user) {
    return <Login />;
  }

  // Role-based navigation
  const getNavigationForRole = () => {
    switch (user.role) {
      case 'PASTOR':
        return [
          { id: 'dashboard', name: 'Pastor Dashboard', icon: BarChart3, component: Dashboard },
          { id: 'attendance', name: 'All Cells Attendance', icon: Calendar, component: PastorAttendanceDashboard },
          { id: 'scan', name: 'QR Scanner', icon: QrCode, component: LeaderScan },
          { id: 'teams', name: 'Teams', icon: UserCheck, component: Teams },
          { id: 'admin', name: 'Admin Panel', icon: Users, component: AdminPanel },
        ];
      case 'CELL_LEADER':
        return [
          { id: 'cell-dashboard', name: 'Cell Dashboard', icon: BarChart3, component: CellLeaderDashboard },
          { id: 'cell-attendance', name: 'Cell Attendance', icon: Calendar, component: () => <CellLeaderAttendance cellId={user.cellId || ''} cellName={user.cellName || 'My Cell'} /> },
          { id: 'mark-attendance', name: 'Mark Attendance', icon: ClipboardList, component: () => <AttendanceMarking cellId={user.cellId || ''} sessionId="session-today" cellName={user.cellName || 'My Cell'} /> },
          { id: 'scan', name: 'QR Scanner', icon: QrCode, component: LeaderScan },
        ];
      case 'MEMBER':
        return [
          { id: 'member-dashboard', name: 'My Dashboard', icon: Home, component: MemberDashboard },
        ];
      default:
        return [];
    }
  };

  const navigation = getNavigationForRole();

  // Set default page based on user role
  const getDefaultPage = (): PageType => {
    switch (user.role) {
      case 'PASTOR':
        return 'dashboard';
      case 'CELL_LEADER':
        return 'cell-dashboard';
      case 'MEMBER':
        return 'member-dashboard';
      default:
        return 'dashboard';
    }
  };

  // Set current page to default if it's not accessible for this role
  const currentPageValid = navigation.some(nav => nav.id === currentPage);
  const actualCurrentPage = currentPageValid ? currentPage : getDefaultPage();

  const currentNav = navigation.find(nav => nav.id === actualCurrentPage);

  // Function to render current page content
  const renderContent = () => {
    const CurrentComponent = currentNav?.component || Dashboard;
    return <CurrentComponent />;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 relative min-h-screen overflow-hidden">
          {/* Beautiful Background with Logo-inspired Colors */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80')`
            }}
          ></div>
          
          {/* Logo-inspired gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-700/85 via-blue-800/85 to-green-900/85"></div>
          <div className="absolute inset-0 bg-black/30"></div>
          
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <defs>
                <pattern id="dots" width="4" height="4" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="0.5" fill="white"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#dots)"/>
            </svg>
          </div>
          
          {/* Glass Effect Layer */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Sidebar Header with Logo */}
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/30 overflow-hidden">
                  <img 
                    src="/assets/logo/Copy of logo REMAKE.png" 
                    alt="NECF Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white drop-shadow-sm">
                    NECF
                  </h1>
                  <p className="text-xs text-white/70 drop-shadow-sm">
                    Attendance System
                  </p>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-white/10">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 shadow-lg ring-1 ring-white/30">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-white" />
                  <div>
                    <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-white/80">
                      {user?.role === 'PASTOR' ? 'Pastor' : user?.role === 'CELL_LEADER' ? 'Cell Leader' : 'Member'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-white/70">
                  {user?.role === 'PASTOR' 
                    ? 'Full church management access'
                    : user?.role === 'CELL_LEADER'
                    ? `Managing ${user.cellName || 'Cell Group'}`
                    : 'Personal dashboard view'
                  }
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <div className="space-y-1">
                {navigation.map((nav) => (
                  <button
                    key={nav.id}
                    onClick={() => {
                      setCurrentPage(nav.id as PageType);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      actualCurrentPage === nav.id
                        ? 'bg-white/25 text-white border-r-3 border-white shadow-lg backdrop-blur-sm ring-1 ring-white/40'
                        : 'text-white/80 hover:bg-white/15 hover:text-white hover:backdrop-blur-sm hover:shadow-md'
                    }`}
                  >
                    <nav.icon className={`w-5 h-5 ${
                      actualCurrentPage === nav.id ? 'text-white drop-shadow-sm' : 'text-white/80'
                    }`} />
                    <span className="drop-shadow-sm">{nav.name}</span>
                  </button>
                ))}
              </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-white/30">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-white/80 hover:bg-white/15 hover:text-white transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
              
              <div className="mt-4 bg-white/15 backdrop-blur-sm rounded-xl p-4 shadow-lg ring-1 ring-white/30">
                <h3 className="font-semibold text-white text-sm mb-1 drop-shadow-sm">
                  Near East Christian Fellowship
                </h3>
                <p className="text-xs text-white/80 leading-relaxed drop-shadow-sm">
                  Modern attendance tracking system with QR codes and offline support.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          {/* Mobile Header */}
          <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src="/assets/logo/Copy of logo REMAKE.png" 
                    alt="NECF Logo" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  NECF Attendance
                </h1>
              </div>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </header>

          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <motion.div
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  className="w-64 h-full shadow-2xl relative overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Beautiful Background for Mobile */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-blue-600 to-green-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                  
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-48 h-48 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
                  </div>
                  
                  {/* Glass Effect Layer */}
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-xl"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Mobile Sidebar Header */}
                    <div className="p-6 border-b border-white/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/30 overflow-hidden">
                          <img 
                            src="/assets/logo/Copy of logo REMAKE.png" 
                            alt="NECF Logo" 
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                        <div>
                          <h1 className="text-lg font-bold text-white">
                            NECF
                          </h1>
                          <p className="text-xs text-white/70">
                            Attendance System
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="p-4">
                      <div className="space-y-1">
                        {navigation.map((nav) => (
                          <button
                            key={nav.id}
                            onClick={() => {
                              setCurrentPage(nav.id as PageType);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                              actualCurrentPage === nav.id
                                ? 'bg-white/20 text-white border-r-3 border-white shadow-lg backdrop-blur-sm ring-1 ring-white/30'
                                : 'text-white/70 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm hover:shadow-md'
                            }`}
                          >
                            <nav.icon className={`w-5 h-5 ${
                              actualCurrentPage === nav.id ? 'text-white' : 'text-white/70'
                            }`} />
                            <span>{nav.name}</span>
                          </button>
                        ))}
                      </div>
                    </nav>

                    {/* Mobile User Info & Logout */}
                    <div className="p-4 border-t border-white/20">
                      <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 shadow-lg ring-1 ring-white/30 mb-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Users className="w-5 h-5 text-white" />
                          <div>
                            <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-white/80">
                              {user?.role === 'PASTOR' ? 'Pastor' : user?.role === 'CELL_LEADER' ? 'Cell Leader' : 'Member'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-white/80 hover:bg-white/15 hover:text-white transition-all duration-200"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <motion.div
            key={actualCurrentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2">
        <div className="grid grid-cols-4 gap-1">
          {navigation.map((nav) => (
            <button
              key={nav.id}
              onClick={() => setCurrentPage(nav.id as PageType)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 ${
                actualCurrentPage === nav.id
                  ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <nav.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{nav.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component with Authentication Provider
const MainApp = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default MainApp;
