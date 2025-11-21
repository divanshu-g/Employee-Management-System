"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthorizedFetch } from "@/app/hooks/useAuthorizedFetch";
import { 
  Users, 
  Building2, 
  Briefcase, 
  Clock, 
  Activity,
  UserPlus,
  FileText,
  CheckCircle2
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { authorizedFetch } = useAuthorizedFetch();

  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    positions: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchDashboardData();
    }
  }, [session?.accessToken]);

  async function fetchDashboardData() {
    try {
      // Fetch counts in parallel using Promise.allSettled to handle potential failures gracefully
      const [empRes, deptRes, posRes] = await Promise.allSettled([
        authorizedFetch(`${API_URL}/api/employee`),
        authorizedFetch(`${API_URL}/api/department`),
        authorizedFetch(`${API_URL}/api/position`),
      ]);

      // Extract values if the promise was fulfilled, otherwise default to 0
      const employees = empRes.status === 'fulfilled' ? (empRes.value.employees?.length || 0) : 0;
      const departments = deptRes.status === 'fulfilled' ? (deptRes.value.departments?.length || 0) : 0;
      const positions = posRes.status === 'fulfilled' ? (posRes.value.positions?.length || 0) : 0;

      setStats({ employees, departments, positions, activeUsers: employees }); 
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });  // clear cookies first
      router.push("/signin");              // then redirect
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
              {session.user.email?.[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back!</h1>
              <p className="text-gray-400 text-sm">{session.user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              {session.user.roles?.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30"
                >
                  {role}
                </span>
              ))}
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 transition-all duration-200 flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Employees"
              value={stats.employees}
              change="+12%"
              icon={<Users size={24} />}
              delay={0.2}
            />
            <StatCard
              title="Departments"
              value={stats.departments}
              change="+2"
              icon={<Building2 size={24} />}
              delay={0.3}
            />
            <StatCard
              title="Open Positions"
              value={stats.positions}
              change="+5%"
              icon={<Briefcase size={24} />}
              delay={0.4}
            />
            <StatCard
              title="Pending Reviews"
              value="8" // This is static for now as requested
              change="-3"
              icon={<FileText size={24} />}
              delay={0.5}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard
              title="Onboard Employee"
              description="Add new team members and assign roles"
              icon="👤"
              link="onboard-employee" // Corrected route
              delay={0.6}
            />
            <ActionCard
              title="Manage Departments"
              description="Create and organize departments"
              icon="🏢"
              link="/department"
              delay={0.7}
            />
            <ActionCard
              title="Role Management"
              description="Define and assign user roles"
              icon="🔐"
              link="/roles"
              delay={0.8}
            />
            <ActionCard
              title="View Timesheets"
              description="Track employee work hours"
              icon="⏰"
              link="/timesheets" 
              delay={0.9}
            />
            <ActionCard
              title="Employee Directory"
              description="Browse all employees"
              icon="📇"
              link="/employee"
              delay={1.0}
            />
            <ActionCard
              title="Reports & Analytics"
              description="Generate insights and reports"
              icon="📊"
              link="/reports" 
              delay={1.1}
            />
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <ActivityItem
                action="New employee onboarded"
                user="John Doe"
                time="2 hours ago"
              />
              <ActivityItem
                action="Department created"
                user="Jane Smith"
                time="5 hours ago"
              />
              <ActivityItem
                action="Timesheet approved"
                user="Mike Johnson"
                time="1 day ago"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon, delay }) {
  const isPositive = change.startsWith("+");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">{icon}</div>
        <span
          className={`text-sm font-medium ${
            isPositive ? "text-green-400" : "text-red-400"
          }`}
        >
          {change}
        </span>
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

function ActionCard({ title, description, icon, link, delay }) {
  return (
    <motion.a
      href={link}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59,130,246,0.3)" }}
      className="block bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-200 group"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </motion.a>
  );
}

function ActivityItem({ action, user, time }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-700/50 last:border-0">
      <div className="flex items-center space-x-3">
        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        <div>
          <p className="text-white text-sm">
            {action} <span className="text-gray-400">by {user}</span>
          </p>
        </div>
      </div>
      <span className="text-gray-500 text-xs">{time}</span>
    </div>
  );
}