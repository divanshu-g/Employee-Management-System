'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  UserPlus, 
  Building2, 
  ShieldCheck, 
  Briefcase, 
  Users, 
  LogOut, 
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { label: "Onboard Employee", href: "/onboard-employee", icon: <UserPlus size={20} /> },
  { label: "Departments", href: "/department", icon: <Building2 size={20} /> },
  { label: "Positions", href: "/positions", icon: <Briefcase size={20} /> },
  { label: "Roles", href: "/roles", icon: <ShieldCheck size={20} /> },
  { label: "Employees", href: "/employee", icon: <Users size={20} /> },
];

// --- Animation Variants ---
const sidebarVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      duration: 0.4, 
      ease: [0.25, 0.1, 0.25, 1.0], // Cubic bezier for a "snappy" feel
      staggerChildren: 0.05 
    }
  },
};

const itemVariants = {
  hidden: { x: -10, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

export default function Layout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* --- Sidebar --- */}
      <motion.aside
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1e293b]/80 backdrop-blur-2xl border-r border-white/5 flex flex-col justify-between shadow-2xl transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Area with animated gradient text */}
        <div className="h-24 flex items-center px-8 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-blue-700 to-pink-500 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
               <div className="w-full h-full bg-[#1e293b] rounded-[11px] flex items-center justify-center">
                  <span className="text-lg font-black bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text text-transparent">N</span>
               </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white">Nexus-HR</span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Workspace</span>
            </div>
          </Link>
          <button 
            className="ml-auto lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 overflow-y-auto custom-scrollbar">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              return (
                <motion.li key={item.href} variants={itemVariants}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-sm transition-all duration-300 group overflow-hidden ${
                      isActive 
                        ? "text-white bg-blue-700 shadow-lg shadow-indigo-500/25 translate-x-1" 
                        : "text-slate-400 hover:text-white hover:bg-white/5 hover:translate-x-1"
                    }`}
                  >
                    <span className={`relative z-10 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                      {item.icon}
                    </span>
                    <span className="relative z-10 tracking-wide">{item.label}</span>
                    
                    {/* Active State Chevron */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeChevron"
                        className="ml-auto relative z-10"
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight size={16} className="text-white/70" />
                      </motion.div>
                    )}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* User Footer Card */}
        <div className="p-6 border-t border-white/5">
          <div className="p-4 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 backdrop-blur-md group hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[2px] shadow-inner">
                 <img 
                   src={`https://ui-avatars.com/api/?name=${session?.user?.name || 'Admin'}&background=0f172a&color=fff`} 
                   alt="User" 
                   className="w-full h-full rounded-full object-cover border-2 border-[#1e293b]"
                 />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                  {session?.user?.name || "Administrator"}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {session?.user?.email || "admin@nexus.com"}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => signOut({ callbackUrl: '/signin' })}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 text-xs font-bold uppercase tracking-wider transition-all duration-200 group/logout"
            >
              <LogOut size={14} className="group-hover/logout:-translate-x-0.5 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </motion.aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#0f172a]">
        
        {/* Mobile Header */}
        <div className="lg:hidden h-20 flex items-center justify-between px-6 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-40">
          <span className="font-bold text-xl bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Nexus-HR</span>
          <button onClick={() => setIsMobileOpen(true)} className="text-white p-2 bg-white/5 rounded-lg">
            <Menu size={24} />
          </button>
        </div>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth custom-scrollbar relative">
          {/* Ambient Background Glows */}
          <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
          <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
            {/* Content Fade In */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}