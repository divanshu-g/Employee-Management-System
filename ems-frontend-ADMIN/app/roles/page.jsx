"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuthorizedFetch } from "@/app/hooks/useAuthorizedFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RolesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { authorizedFetch } = useAuthorizedFetch();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  async function fetchRoles() {
    if (!session?.accessToken) return;

    setLoading(true);
    setError("");
    try {
      const data = await authorizedFetch(`${API_URL}/api/role`);
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error loading roles.");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this role?")) return;
    
    try {
      await authorizedFetch(`${API_URL}/api/role/${id}`, {
        method: "DELETE",
      });
      fetchRoles();
    } catch (err) {
      setError(err.message || "Error deleting role.");
    }
  }

  // Filter roles based on search and type
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.role_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.role_description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || role.role_type === filterType;
    return matchesSearch && matchesType;
  });

  // Handle loading state
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

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.replace("/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Role Management</h1>
              <p className="text-gray-400 text-sm">Manage roles and permissions across your organization</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-[#334155] hover:bg-[#475569] px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Dashboard
              </button>
              <button
                onClick={() => router.push("/roles/create")}
                className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Role
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search roles by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#1e293b] border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="relative w-full md:w-64">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="all">All Types</option>
                <option value="superAdmin">Super Admin</option>
                <option value="subAdmin">Sub Admin</option>
                <option value="employee">Employee</option>
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-600/50 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-200 font-medium">{error}</p>
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Roles</p>
                <p className="text-2xl font-bold text-white">{roles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active</p>
                <p className="text-2xl font-bold text-white">{roles.filter(r => r.is_active).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Inactive</p>
                <p className="text-2xl font-bold text-white">{roles.filter(r => !r.is_active).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Filtered</p>
                <p className="text-2xl font-bold text-white">{filteredRoles.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Roles List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading roles...</p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || filterType !== "all" ? "No roles found" : "No roles created yet"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterType !== "all" ? "Try adjusting your filters" : "Get started by creating your first role"}
            </p>
            {!searchTerm && filterType === "all" && (
              <button
                onClick={() => router.push("/roles/create")}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First Role
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRoles.map((role) => (
              <div
                key={role.role_id}
                className="bg-[#1e293b] border border-[#334155] rounded-lg p-5 hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {role.role_type === "superAdmin" ? "🔐" : role.role_type === "subAdmin" ? "👔" : "👤"}
                    </div>

                    {/* Role Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-white">{role.role_name}</h3>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-900/30 text-blue-300 border border-blue-500/30">
                          {role.role_type}
                        </span>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          role.is_active 
                            ? 'bg-green-900/40 text-green-400 border border-green-500/30' 
                            : 'bg-gray-700 text-gray-400 border border-gray-600'
                        }`}>
                          {role.is_active ? '● Active' : '○ Inactive'}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-2">
                        {role.role_description || "No description provided"}
                      </p>

                      {role.permissions && (
                        <div className="flex items-center gap-2 text-xs">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span className="text-gray-500">Permissions: {role.permissions}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/roles/edit/${role.role_id}`)}
                      className="bg-yellow-600/20 hover:bg-yellow-600 text-yellow-400 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border border-yellow-500/30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(role.role_id)}
                      className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border border-red-500/30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
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