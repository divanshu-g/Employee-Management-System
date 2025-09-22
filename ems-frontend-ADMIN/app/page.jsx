import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800 text-white font-sans">
      {/* Hero/Header */}
      <header className="w-full px-6 pt-12 pb-10 flex flex-col items-center bg-gradient-to-b from-gray-950/60 via-transparent to-transparent relative animate-fadein-down">
        <div className="flex flex-col items-center mb-4">
          {/* Inline SVG for logo as placeholder */}
          <span className="mb-4 rounded-full bg-blue-700/80 p-4 shadow-xl animate-fadein-down">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="18" rx="3" fill="#3B82F6" />
              <rect x="11" y="8" width="6" height="13" rx="3" fill="#2563EB" />
              <rect x="18" y="14" width="3" height="7" rx="1.5" fill="#6366F1" />
            </svg>
          </span>
          <span className="text-4xl font-extrabold text-blue-300 tracking-tight">
            Nexsus-HR
          </span>
          <p className="text-lg text-blue-100 mt-2 font-medium animate-fadein-up">Modern Employee Management System</p>
          <p className="text-gray-300 text-center mt-2 max-w-xl animate-fadein-up delay-100">
            Empower your organization with seamless workforce management: automated timesheets, secure employee data, real-time dashboards, and comprehensive HR tools for businesses of all sizes.
          </p>
        </div>
        <div className="absolute bottom-[-18px] left-0 w-full h-8 bg-gradient-to-b from-transparent to-gray-900"></div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-8 md:px-20 py-8 space-y-24">
        {/* Feature grid section */}
        <section className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 animate-fadein-up">
          {/* Employee Directory */}
          <div className="bg-blue-900/70 rounded-2xl p-8 shadow-xl transition hover:scale-[1.03] hover:shadow-blue-600/30 duration-400 group">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-9 h-9 text-blue-400 group-hover:animate-bounce-slow" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="7" r="4" stroke="#38bdf8" strokeWidth="1.5" />
                <rect x="4" y="13" width="16" height="7" rx="3.5" stroke="#60a5fa" strokeWidth="1.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Live Directory</h3>
            <p className="text-blue-100 text-sm">View, search, and manage all employees with up-to-date department and contact information.</p>
          </div>
          {/* Attendance & Timesheets */}
          <div className="bg-gradient-to-br from-cyan-800/80 to-blue-700/70 rounded-2xl p-8 shadow-xl transition hover:scale-[1.03] hover:shadow-cyan-600/30 duration-400 group">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-9 h-9 text-cyan-300 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" rx="3" stroke="#22d3ee" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="3.5" stroke="#38bdf8" strokeWidth="1.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Timesheets & Attendance</h3>
            <p className="text-blue-100 text-sm">Clock in/out, submit and approve timesheets, and track leave with transparent logs and analytics.</p>
          </div>
          {/* Admin & Security */}
          <div className="bg-gradient-to-br from-blue-800/70 to-indigo-700/70 rounded-2xl p-8 shadow-xl transition hover:scale-[1.03] hover:shadow-indigo-600/30 duration-400 group">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-9 h-9 text-indigo-300 group-hover:animate-spin-slow" fill="none" viewBox="0 0 24 24">
                <rect x="4" y="8" width="16" height="10" rx="3" stroke="#6366f1" strokeWidth="1.5" />
                <path d="M9 14l2 2 4-4" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Admin Control</h3>
            <p className="text-blue-100 text-sm">Granular role-based access, activity tracking, and powerful admin tools for onboarding and management.</p>
          </div>
        </section>

        {/* About & roadmap section */}
        <section className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 py-8 animate-fadein delay-200">
          {/* Illustration */}
          <div className="flex flex-col items-center justify-center md:items-start md:w-1/3">
            <div className="rounded-xl shadow-md bg-blue-950/60 p-3 flex items-center justify-center" style={{ width: 200, height: 200 }}>
              <svg viewBox="0 0 128 128" fill="none" width="100%" height="100%">
                <rect x="25" y="10" width="40" height="108" rx="15" fill="#3B82F6" />
                <rect x="70" y="40" width="23" height="78" rx="9" fill="#2563EB" />
                <rect x="97" y="85" width="10" height="33" rx="5" fill="#6366F1" />
                <circle cx="64" cy="90" r="16" fill="#60A5FA" opacity="0.4" />
                <circle cx="95" cy="55" r="4" fill="#38BDF8" opacity="0.55" />
              </svg>
            </div>

          </div>
          {/* Text */}
          <div className="flex-1 flex flex-col gap-2 md:gap-4 justify-center text-left">
            <h2 className="text-2xl font-bold text-blue-300 mb-1">Why Nexsus-HR?</h2>
            <p className="text-gray-100/85">
              Nexsus-HR is designed for modern organizations, combining powerful people management, beautiful UI, and advanced security.
              Sync employees, automate approvals, manage payroll, and visualize org health at-a-glance—on any device.
            </p>
            <ul className="list-disc ml-5 text-blue-200/90 space-y-1 text-sm">
              <li>Customizable onboarding & workflow automation</li>
              <li>End-to-end data encryption & privacy first</li>
              <li>Real-time analytics and org charts</li>
              <li>Built for SuperAdmins, HRs, and Employees</li>
            </ul>
            <a
              href="/signin"
              className="inline-block mt-6 px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 shadow-lg hover:from-blue-500 hover:to-blue-700 hover:scale-105 transition-all duration-300 animate-fadein-up"
            >
              Get Started
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-8 border-t border-gray-700 bg-gradient-to-b from-gray-900/90 via-gray-950/80 to-gray-900/90 text-center ">
        <div className="max-w-5xl mx-auto flex flex-col gap-3 items-center animate-fadein-up text-gray-400">
          <div>
            <a className="hover:underline hover:text-blue-400 mr-4" href="https://github.com/" target="_blank">GitHub</a>
            <a className="hover:underline hover:text-blue-400 mr-4" href="https://nextjs.org" target="_blank">Powered by Next.js</a>
            <a className="hover:underline hover:text-blue-400" href="/contact">Contact</a>
          </div>
          <div className="text-xs mt-2">© 2025 Nexsus-HR. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
