import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Users, 
  Check, 
  X, 
  Camera, 
  Wifi, 
  WifiOff,
  AlertCircle,
  Download,
  Upload,
  User,
  CalendarDays,
  Clock
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { saveOfflineAttendance, getUnsyncedAttendance, markAttendanceSynced } from '../utils/database';

interface ScannedMember {
  id: string;
  name: string;
  cellGroup: string;
  phone: string;
  email: string;
  scannedAt: Date;
}

const LeaderScan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedMembers, setScannedMembers] = useState<ScannedMember[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sessionName, setSessionName] = useState('');
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'error'>('synced');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Start scanning
  const startScanning = () => {
    if (!sessionName.trim()) {
      setError('Please enter a session name first');
      return;
    }

    setIsScanning(true);
    setError(null);
    
    const sessionId = `session_${Date.now()}`;
    setCurrentSession(sessionId);

    // Initialize QR scanner
    if (scannerRef.current) {
      scannerRef.current.clear();
    }

    scannerRef.current = new Html5QrcodeScanner(
      'qr-scanner',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scannerRef.current.render(onScanSuccess, onScanError);
  };

  // Stop scanning
  const stopScanning = () => {
    setIsScanning(false);
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  };

  // Handle successful QR scan
  const onScanSuccess = async (decodedText: string) => {
    try {
      // Parse member data from QR code
      const memberData = JSON.parse(decodedText);
      
      // Check if member already scanned in this session
      const alreadyScanned = scannedMembers.some(
        member => member.id === memberData.id
      );

      if (alreadyScanned) {
        setError('Member already scanned in this session');
        return;
      }

      const scannedMember: ScannedMember = {
        id: memberData.id,
        name: memberData.name,
        cellGroup: memberData.cellGroup || 'Unknown',
        phone: memberData.phone || '',
        email: memberData.email || '',
        scannedAt: new Date()
      };

      setScannedMembers(prev => [...prev, scannedMember]);

      // Save to local database
      const attendanceRecord = {
        memberId: memberData.id,
        memberName: scannedMember.name,
        sessionId: currentSession!,
        sessionTitle: sessionName,
        checkInTime: new Date().toISOString()
      };

      await saveOfflineAttendance(attendanceRecord);
      setSyncStatus('pending');

      // Auto-sync if online
      if (isOnline) {
        syncData();
      }

      setError(null);
    } catch (err) {
      setError('Invalid QR code format');
      console.error('QR scan error:', err);
    }
  };

  // Handle QR scan errors
  const onScanError = (error: string) => {
    // Ignore frequent scanning errors to avoid spam
    if (!error.includes('No QR code found')) {
      console.warn('QR Scan error:', error);
    }
  };

  // Sync data to backend
  const syncData = async () => {
    try {
      setSyncStatus('pending');
      
      // Get unsynced attendance records
      const unsyncedRecords = await getUnsyncedAttendance();
      
      // TODO: Send to backend API
      // For now, simulate sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark as synced
      for (const record of unsyncedRecords) {
        if (record.id) {
          await markAttendanceSynced(record.id);
        }
      }
      
      setSyncStatus('synced');
    } catch (err) {
      setSyncStatus('error');
      console.error('Sync error:', err);
    }
  };

  // Export attendance data
  const exportData = () => {
    const data = scannedMembers.map(member => ({
      Name: member.name,
      'Cell Group': member.cellGroup,
      Phone: member.phone,
      Email: member.email,
      'Scanned At': member.scannedAt.toLocaleString()
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${sessionName}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset session
  const resetSession = () => {
    stopScanning();
    setScannedMembers([]);
    setSessionName('');
    setCurrentSession(null);
    setError(null);
  };

  const StatusBadge = ({ status }: { status: 'synced' | 'pending' | 'error' }) => {
    const config = {
      synced: { icon: Check, color: 'text-green-600', bg: 'bg-green-100' },
      pending: { icon: Upload, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' }
    };

    const { icon: Icon, color, bg } = config[status];

    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${bg} backdrop-blur-sm border border-white/30`}>
        <Icon className={`w-4 h-4 ${color}`} />
        <span className={`text-sm font-medium ${color} capitalize`}>
          {status === 'pending' ? 'Syncing...' : status}
        </span>
      </div>
    );
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
            <pattern id="scan-dots" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.5" fill="#22C55E"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#scan-dots)"/>
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/30 backdrop-blur-lg border-b border-white/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Leader Scan
              </h1>
              <p className="text-gray-700 font-medium text-sm">
                Scan QR codes to record attendance
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <StatusBadge status={syncStatus} />
              <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-xl border border-white/30">
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-green-600" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-600" />
                )}
                <span className="text-sm text-gray-700 font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Session Setup */}
        {!currentSession && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-8 shadow-lg mb-8"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg ring-2 ring-white/30">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Start Attendance Session
              </h2>
              <p className="text-gray-600">
                Enter a session name to begin scanning QR codes
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Name
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g., Sunday Service, Bible Study..."
                className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/30 text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startScanning}
                disabled={!sessionName.trim()}
                className="w-full mt-4 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                Start Scanning
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Scanner Interface */}
        {currentSession && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scanner */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  QR Scanner
                </h3>
                <div className="flex gap-2">
                  {!isScanning ? (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={startScanning}
                      className="p-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg"
                    >
                      <Camera className="w-5 h-5" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={stopScanning}
                      className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Scanner Container */}
              <div className="relative">
                <div 
                  id="qr-scanner" 
                  className="w-full rounded-xl overflow-hidden border border-white/30"
                  style={{ minHeight: '300px' }}
                />
                
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <QrCode className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-600">
                        Click camera button to start scanning
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-3 bg-red-100 border border-red-200 rounded-xl backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-700 text-sm">
                        {error}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Session Info & Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Session Details */}
              <div className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Session Details
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">{sessionName}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">
                      Started: {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {scannedMembers.length} members scanned
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/20 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Actions
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={syncData}
                    disabled={scannedMembers.length === 0 || !isOnline}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    Sync to Server
                  </button>
                  
                  <button
                    onClick={exportData}
                    disabled={scannedMembers.length === 0}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Export CSV
                  </button>
                  
                  <button
                    onClick={resetSession}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                    End Session
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Scanned Members List */}
        {scannedMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white/30 backdrop-blur-lg rounded-2xl border border-white/50 p-6 shadow-lg"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Scanned Members ({scannedMembers.length})
            </h3>
            
            <div className="space-y-3">
              {scannedMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/70 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/30">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {member.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {member.cellGroup}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Present</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {member.scannedAt.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default LeaderScan;
