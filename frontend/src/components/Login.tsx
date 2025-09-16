import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, User, Lock, Church } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  // Demo accounts for easy testing
  const demoAccounts = [
    { 
      role: 'Pastor', 
      email: 'pastor@necf.org', 
      name: 'Pastor David',
      description: 'Full access to all church data'
    },
    { 
      role: 'Cell Leader', 
      email: 'john.doe@necf.org', 
      name: 'John Doe - Gonyeli Cell',
      description: 'Access to Gonyeli Cell only'
    },
    { 
      role: 'Cell Leader', 
      email: 'jane.smith@necf.org', 
      name: 'Jane Smith - Merit Cell',
      description: 'Access to Merit Cell only'
    },
    { 
      role: 'Member', 
      email: 'maria.g@email.com', 
      name: 'Maria Garcia',
      description: 'Personal dashboard only'
    }
  ];

  const fillDemo = (email: string) => {
    setEmail(email);
    setPassword('demo123'); // Any password works for demo
  };

  return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Logo-inspired background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-blue-700 to-green-800"></div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl"
        >
          {/* Header */}
                    <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl ring-1 ring-white/30 overflow-hidden necf-logo-container">
                <img 
                  src="/assets/logo/Copy of logo REMAKE.png" 
                  alt="NECF Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">NECF Attendance System</h1>
            <p className="text-white/70">Near East Christian Fellowship</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Right Side - Demo Accounts */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Demo Accounts</h2>
          <p className="text-white/70 mb-6">
            Try different user roles to see the role-based access control system:
          </p>

          <div className="space-y-4">
            {demoAccounts.map((account, index) => (
              <motion.div
                key={account.email}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer"
                onClick={() => fillDemo(account.email)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        account.role === 'Pastor' ? 'bg-purple-500/30 text-purple-200' :
                        account.role === 'Cell Leader' ? 'bg-blue-500/30 text-blue-200' :
                        'bg-green-500/30 text-green-200'
                      }`}>
                        {account.role}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white">{account.name}</h3>
                    <p className="text-white/60 text-sm">{account.description}</p>
                    <p className="text-white/40 text-xs mt-1">{account.email}</p>
                  </div>
                  <LogIn className="w-5 h-5 text-white/50" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-200 text-sm">
              <strong>Note:</strong> This is a demo system. Use any password with the demo accounts above.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
