"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { checkAuth, logout } from '@/utils/auth';

function DashboardContent() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    const { authenticated, user: userData } = await checkAuth();
    if (authenticated) {
      setUser(userData);
    }
  }

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
      // Force a hard redirect to clear any cached state
      window.location.href = '/signin';
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even on error
      window.location.href = '/signin';
    }
  }
  
  const [loading, setLoading] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 border-b border-gray-700 px-6 py-4"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-400">
            Nexsus-HR Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">
              Welcome, {user?.email || 'Admin'}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              Logout
            </motion.button>
          </div>
        </div>
      </motion.nav>
      
      <main className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-3xl font-bold mb-6"
          >
            Dashboard
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-gray-800 rounded-xl shadow-md p-8 mb-8"
          >
            <p className="text-lg font-medium text-gray-100">
              Welcome to the <span className="text-blue-400 font-semibold">Nexsus-HR</span> platform.
            </p>
            <p className="mt-2 text-gray-400">
              Enterprise-grade employee management, timesheets, department and roles creation. Secure, scalable, and modern.
            </p>
          </motion.div>
          
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 bg-gray-800 rounded-lg p-6 mb-8"
            >
              <h3 className="text-xl font-semibold mb-4">User Information</h3>
              <div className="space-y-2">
                <p><span className="text-gray-400">Email:</span> {user.email}</p>
                <p><span className="text-gray-400">Roles:</span> {user.roles?.join(', ')}</p>
              </div>
            </motion.div>
          )}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.button
              variants={itemVariants}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: "0 10px 25px rgba(59,130,246,0.3)",
                borderColor: "rgb(59, 130, 246)"
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/onboard-employee')}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 transition-all text-left"
            >
              <h3 className="text-lg font-semibold mb-2">Employees</h3>
              <p className="text-3xl font-bold text-blue-400">124</p>
              <p className="text-sm text-gray-400 mt-2">Manage employees</p>
            </motion.button>
            
            <motion.button
              variants={itemVariants}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: "0 10px 25px rgba(34,197,94,0.3)",
                borderColor: "rgb(34, 197, 94)"
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/roles')}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 transition-all text-left"
            >
              <h3 className="text-lg font-semibold mb-2">Roles</h3>
              <p className="text-3xl font-bold text-green-400">8</p>
              <p className="text-sm text-gray-400 mt-2">Manage roles</p>
            </motion.button>
            
            <motion.div
              variants={itemVariants}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: "0 10px 25px rgba(168,85,247,0.3)"
              }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 transition-all"
            >
              <h3 className="text-lg font-semibold mb-2">Timesheets</h3>
              <p className="text-3xl font-bold text-purple-400">42</p>
              <p className="text-sm text-gray-400 mt-2">Pending approvals</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRoles={['superAdmin', 'subAdmin']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}