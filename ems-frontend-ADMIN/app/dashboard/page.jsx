// app/dashboard/page.jsx
"use client"
import { motion } from 'framer-motion';

export default function DashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-6 text-blue-400">Dashboard</h1>
      <div className="bg-gray-800 rounded-xl shadow-md p-8 mb-8 animate-in fade-in">
        <p className="text-lg font-medium text-gray-100">
          Welcome to the <span className="text-blue-400 font-semibold">Nexsus-HR</span> platform.
        </p>
        <p className="mt-2 text-gray-400">
          Enterprise-grade employee management, timesheets, department and roles creation. Secure, scalable, and modern.
        </p>
      </div>
      {/* Add dashboard widgets/cards here */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.03, boxShadow: "0 10px 25px rgba(59,130,246,0.3)" }}
          className="bg-gray-800 rounded-lg p-5 text-gray-300 transition-shadow"
        >
          Onboard Employees
        </motion.div>
        <motion.div whileHover={{ scale: 1.03, boxShadow: "0 10px 25px rgba(59,130,246,0.3)" }}
          className="bg-gray-800 rounded-lg p-5 text-gray-300 transition-shadow"
        >
          Manage Departments
        </motion.div>
      </div>
    </motion.div>
  );
}
