// app/dashboard/layout.jsx
"use client"
import Link from 'next/link';
import { motion } from 'framer-motion';

const navItems = [
  { label: "Onboard Employee", href: "/onboard-employee" },
  { label: "Department", href: "/department" },
  { label: "Roles", href: "/roles" },
  { label: "Positions", href: "/positions" },
  { label: "Employee", href: "/employee" },
];

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80 }}
        className="w-72 bg-gray-800 shadow-lg flex flex-col justify-between py-10 px-8"
      >
        <nav>
          <ul className="space-y-5">
            {navItems.map((item) => (
              <motion.li
                key={item.label}
                whileHover={{ scale: 1.06, backgroundColor: "#2d3748" }}
                className="rounded-md transition-colors"
              >
                <Link
                  href={item.href}
                  className="block px-5 py-3 font-medium text-lg hover:text-blue-400 transition"
                >
                  {item.label}
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center space-x-2 pt-10">
          <span className="text-blue-400 font-bold text-xl">Nexsus-HR</span>
        </div>
      </motion.aside>
      <main className="flex-1 px-8 py-10 overflow-y-auto">{children}</main>
    </div>
  );
}
