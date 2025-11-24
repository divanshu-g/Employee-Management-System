"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuthorizedFetch } from "@/app/hooks/useAuthorizedFetch";
import { 
  Users, 
  Search, 
  Plus, 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EmployeeListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { authorizedFetch } = useAuthorizedFetch();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  /* ---------------------------------------------- */
  /*   FETCH EMPLOYEES + DEPARTMENT + POSITION      */
  /* ---------------------------------------------- */
  async function fetchEmployees() {
    if (!session?.accessToken) return;

    setLoading(true);
    setError("");
    try {

      const empRes = await authorizedFetch(`${API_URL}/api/employee`);
      setEmployees(empRes.employees || []);

      const deptRes = await authorizedFetch(`${API_URL}/api/department`);
      setDepartments(deptRes.departments || []);

      const posRes = await authorizedFetch(`${API_URL}/api/position`);
      setPositions(posRes.positions || []);

    } catch (err) {
      setError(err.message || "Error loading employees.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchEmployees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  /* ---------------------------------------------- */
  /*         HELPERS TO MAP ID → NAME               */
  /* ---------------------------------------------- */
  const getDeptName = (id) => {
    return departments.find((d) => d.department_id === id)?.department_name || "-";
  };

  const getPositionName = (id) => {
    return positions.find((p) => p.position_id === id)?.position_title || "-";
  };

  /* ---------------------------------------------- */
  /*               FILTERING LOGIC                  */
  /* ---------------------------------------------- */
  const filteredEmployees = employees.filter((emp) => {
    const s = searchTerm.toLowerCase();
    return (
      emp.first_name?.toLowerCase().includes(s) ||
      emp.last_name?.toLowerCase().includes(s) ||
      emp.employee_code?.toLowerCase().includes(s) ||
      emp.personal_email?.toLowerCase().includes(s)
    );
  });

  /* ---------------------------------------------- */
  /*             AUTH CHECK                         */
  /* ---------------------------------------------- */

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-gray-300">
        Checking authentication...
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.replace("/signin");
    return null;
  }

  /* ---------------------------------------------- */
  /*                    UI                          */
  /* ---------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Employees</h1>
              <p className="text-gray-400 text-sm">Manage your workforce directory and profiles</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-[#334155] hover:bg-[#475569] px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Dashboard
              </button>

              <button
                onClick={() => router.push("/employee/onboard")}
                className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/20"
              >
                <Plus size={18} />
                Onboard Employee
              </button>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, code, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#1e293b] border border-[#334155] rounded-lg focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
            />
          </div>
        </header>

        {/* ERROR */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-600/50 rounded-lg flex items-start gap-3">
            <p className="text-red-200 font-medium">{error}</p>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard 
            label="Total Employees" 
            value={employees.length} 
            color="blue" 
            icon={<Users size={24} />} 
          />
          <StatCard 
            label="Active" 
            value={employees.filter((e) => e.employment_status === "Active").length} 
            color="green" 
            icon={<div className="text-lg font-bold">●</div>} 
          />
          <StatCard 
            label="Full Time" 
            value={employees.filter((e) => e.employee_type === "Full_Time").length} 
            color="purple" 
            icon={<Briefcase size={24} />} 
          />
        </div>

        {/* EMPLOYEE GRID */}
        {loading ? (
          <div className="flex flex-col items-center py-16">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading directory...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-12 text-center">
            <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No employees found
            </h3>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.emp_id}
                className="bg-[#1e293b] border border-[#334155] rounded-lg p-6 hover:border-blue-500/50 transition group"
              >
                <div className="flex items-center gap-3 mb-4">
                  
                  {/* AVATAR */}
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold border border-slate-600">
                    {emp.first_name[0]}{emp.last_name[0]}
                  </div>

                  {/* NAME */}
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {emp.first_name} {emp.last_name}
                    </h3>
                    <p className="text-xs text-slate-400">{emp.employee_code}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-400">
                  
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-blue-400" />
                    <span>{emp.personal_email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-green-400" />
                    <span>{emp.phone_number || "N/A"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-purple-400" />
                    <span>Dept: {getDeptName(emp.department_id)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-yellow-400" />
                    <span>Position: {getPositionName(emp.position_id)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#334155] mt-4">
                  <button
                    onClick={() => router.push(`/employee/edit/${emp.employee_code}`)}
                    className="w-full bg-[#334155] hover:bg-[#475569] text-white py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------- */
/*    STAT CARD COMPONENT     */
/* -------------------------- */
function StatCard({ label, value, color, icon }) {
  const colorStyles = {
    blue: "text-blue-400 bg-blue-500/10",
    green: "text-green-400 bg-green-500/10",
    purple: "text-purple-400 bg-purple-500/10",
  };

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
