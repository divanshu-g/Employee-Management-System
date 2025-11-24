"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuthorizedFetch } from "@/app/hooks/useAuthorizedFetch";
import { 
  Building2, 
  Search, 
  Plus, 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Power,
  Filter
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DepartmentsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { authorizedFetch } = useAuthorizedFetch();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // --- Fetch Data ---
  async function fetchDepartments() {
    if (!session?.accessToken) return;

    setLoading(true);
    setError("");
    try {
      // Adjust the endpoint path if your API is mounted differently (e.g. just /api/department)
      const url = API_URL ? `${API_URL}/api/department` : '/api/department';
      const data = await authorizedFetch(url);
      
      // Handle response structure: { message: "...", departments: [...] } or direct array
      const depts = data.departments || (Array.isArray(data) ? data : []);
      setDepartments(depts);
    } catch (err) {
      setError(err.message || "Error loading departments.");
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchDepartments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  // --- Handlers ---
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this department?")) return;
    
    try {
      const url = API_URL ? `${API_URL}/api/department/${id}` : `/api/department/${id}`;
      await authorizedFetch(url, {
        method: "DELETE",
      });
      fetchDepartments();
    } catch (err) {
      setError(err.message || "Error deleting department.");
    }
  }

  async function handleActivate(id) {
    try {
      const url = API_URL ? `${API_URL}/api/department/activate/${id}` : `/api/department/activate/${id}`;
      await authorizedFetch(url, {
        method: "PUT",
      });
      fetchDepartments();
    } catch (err) {
      setError(err.message || "Error activating department.");
    }
  }

  // --- Filtering Logic ---
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = 
      dept.department_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.department_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "active" && dept.is_active) ||
      (filterStatus === "inactive" && !dept.is_active);

    return matchesSearch && matchesStatus;
  });

  // --- Loading / Auth States ---
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-gray-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.replace("/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Header --- */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Departments</h1>
              <p className="text-gray-400 text-sm">Manage your organization's departments and structure</p>
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
                onClick={() => router.push("/department/create")}
                className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/20"
              >
                <Plus size={18} />
                Create Department
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, code, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#1e293b] border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-500"
              />
            </div>
            <div className="relative w-full md:w-64">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-white cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </header>

        {/* --- Error Message --- */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-600/50 rounded-lg flex items-start gap-3">
            <div className="text-red-500 mt-0.5">⚠️</div>
            <p className="text-red-200 font-medium">{error}</p>
          </div>
        )}

        {/* --- Stats Bar --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Departments</p>
                <p className="text-2xl font-bold text-white">{departments.length}</p>
              </div>
            </div>
          </div>

          {/* Active */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <div className="w-6 h-6 text-green-400 font-bold flex items-center justify-center">●</div>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active</p>
                <p className="text-2xl font-bold text-white">{departments.filter(d => d.is_active).length}</p>
              </div>
            </div>
          </div>

          {/* Inactive */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <div className="w-6 h-6 text-yellow-400 font-bold flex items-center justify-center">○</div>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Inactive</p>
                <p className="text-2xl font-bold text-white">{departments.filter(d => !d.is_active).length}</p>
              </div>
            </div>
          </div>

          {/* Filtered */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Filter className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Filtered Results</p>
                <p className="text-2xl font-bold text-white">{filteredDepartments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- Departments List --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading departments...</p>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || filterStatus !== "all" ? "No departments found" : "No departments created yet"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterStatus !== "all" ? "Try adjusting your filters" : "Get started by creating your first department"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <button
                onClick={() => router.push("/dashboard/departments/create")}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create First Department
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDepartments.map((dept) => (
              <div
                key={dept.department_id}
                className={`bg-[#1e293b] border ${dept.is_active ? 'border-[#334155]' : 'border-red-900/30 bg-red-900/5'} rounded-lg p-5 hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 group`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  
                  {/* Left: Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-inner">
                      <Building2 size={24} />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-white">{dept.department_name}</h3>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#0f172a] text-slate-400 border border-[#334155] font-mono">
                          {dept.department_code}
                        </span>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                          dept.is_active 
                            ? 'bg-green-900/40 text-green-400 border-green-500/30' 
                            : 'bg-red-900/40 text-red-400 border-red-500/30'
                        }`}>
                          {dept.is_active ? '● Active' : '○ Inactive'}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                        {dept.description || "No description provided"}
                      </p>
                      
                      {/* Optional: Add more meta info here if available (e.g. Head of Dept) */}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex gap-2 self-start md:self-center">
                    <button
                      onClick={() => router.push(`/department/edit/${dept.department_id}`)}
                      className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border border-indigo-500/30"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                    
                    {dept.is_active ? (
                      <button
                        onClick={() => handleDelete(dept.department_id)}
                        className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border border-red-500/30"
                      >
                        <Trash2 size={16} />
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(dept.department_id)}
                        className="bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border border-green-500/30"
                      >
                        <Power size={16} />
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}