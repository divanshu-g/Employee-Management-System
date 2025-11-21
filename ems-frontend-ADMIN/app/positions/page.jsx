"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuthorizedFetch } from "@/app/hooks/useAuthorizedFetch";
import { 
  Briefcase, 
  Search, 
  Plus, 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Power,
  Filter,
  DollarSign,
  BarChart2
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PositionsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { authorizedFetch } = useAuthorizedFetch();

  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // --- Fetch Data ---
  async function fetchPositions() {
    if (!session?.accessToken) return;

    setLoading(true);
    setError("");
    try {
      const url = API_URL ? `${API_URL}/api/position` : '/api/position';
      const data = await authorizedFetch(url);
      
      const posList = data.positions || (Array.isArray(data) ? data : []);
      setPositions(posList);
    } catch (err) {
      setError(err.message || "Error loading positions.");
      setPositions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchPositions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  // --- Handlers ---
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this position?")) return;
    
    try {
      const url = API_URL ? `${API_URL}/api/position/${id}` : `/api/position/${id}`;
      await authorizedFetch(url, { method: "DELETE" });
      fetchPositions();
    } catch (err) {
      setError(err.message || "Error deleting position.");
    }
  }

  async function handleActivate(id) {
    try {
      const url = API_URL ? `${API_URL}/api/position/activate/${id}` : `/api/position/activate/${id}`;
      await authorizedFetch(url, { method: "PUT" });
      fetchPositions();
    } catch (err) {
      setError(err.message || "Error activating position.");
    }
  }

  // --- Filtering Logic ---
  const filteredPositions = positions.filter(pos => {
    const matchesSearch = 
      pos.position_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pos.position_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pos.job_description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "active" && pos.is_active) ||
      (filterStatus === "inactive" && !pos.is_active);

    return matchesSearch && matchesStatus;
  });

  // --- Auth Loading ---
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

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Header --- */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Positions</h1>
              <p className="text-gray-400 text-sm">Manage job titles, requirements, and salary bands</p>
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
                onClick={() => router.push("/positions/create")}
                className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/20"
              >
                <Plus size={18} />
                Create Position
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, code, or description..."
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
          <StatCard 
            label="Total Positions" 
            value={positions.length} 
            color="blue" 
            icon={<Briefcase size={24} />} 
          />
          <StatCard 
            label="Active" 
            value={positions.filter(p => p.is_active).length} 
            color="green" 
            icon={<div className="text-lg font-bold">●</div>} 
          />
          <StatCard 
            label="Inactive" 
            value={positions.filter(p => !p.is_active).length} 
            color="yellow" 
            icon={<div className="text-lg font-bold">○</div>} 
          />
          <StatCard 
            label="Filtered Results" 
            value={filteredPositions.length} 
            color="purple" 
            icon={<Filter size={24} />} 
          />
        </div>

        {/* --- Positions List --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading positions...</p>
          </div>
        ) : filteredPositions.length === 0 ? (
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || filterStatus !== "all" ? "No positions found" : "No positions created yet"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterStatus !== "all" ? "Try adjusting your filters" : "Get started by creating your first position"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <button
                onClick={() => router.push("/position/create")}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create First Position
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPositions.map((pos) => (
              <div
                key={pos.position_id}
                className={`bg-[#1e293b] border ${pos.is_active ? 'border-[#334155]' : 'border-red-900/30 bg-red-900/5'} rounded-lg p-5 hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 group`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  
                  {/* Left: Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white flex-shrink-0 shadow-inner">
                      <Briefcase size={24} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-white">{pos.position_title}</h3>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#0f172a] text-slate-400 border border-[#334155] font-mono">
                          {pos.position_code}
                        </span>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                          pos.is_active 
                            ? 'bg-green-900/40 text-green-400 border-green-500/30' 
                            : 'bg-red-900/40 text-red-400 border-red-500/30'
                        }`}>
                          {pos.is_active ? '● Active' : '○ Inactive'}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-2">
                        <span className="flex items-center gap-1">
                          <BarChart2 size={14} className="text-blue-400" /> {pos.position_level}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign size={14} className="text-green-400" /> {pos.salary ? Number(pos.salary).toLocaleString() : 'N/A'}
                        </span>
                      </div>

                      <p className="text-gray-500 text-sm line-clamp-1">
                        {pos.job_description || "No description provided"}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex gap-2 self-start md:self-center">
                    <button
                      onClick={() => router.push(`/positions/edit/${pos.position_id}`)}
                      className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border border-indigo-500/30"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                    
                    {pos.is_active ? (
                      <button
                        onClick={() => handleDelete(pos.position_id)}
                        className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border border-red-500/30"
                      >
                        <Trash2 size={16} />
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(pos.position_id)}
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

function StatCard({ label, value, color, icon }) {
  const colorStyles = {
    blue: "text-blue-400 bg-blue-500/10",
    green: "text-green-400 bg-green-500/10",
    yellow: "text-yellow-400 bg-yellow-500/10",
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