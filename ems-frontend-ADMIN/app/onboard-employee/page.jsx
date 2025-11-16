"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuthorizedFetch } from "@/app/hooks/useAuthorizedFetch";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function OnboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { authorizedFetch } = useAuthorizedFetch();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Load users once token is available
  useEffect(() => {
    async function loadUsers() {
      try {
        setLoadingUsers(true);
        setError("");

        const data = await authorizedFetch(`${API_BASE}/api/user`);
        setUsers(data);

      } catch (err) {
        setError(err.message || "Error loading users");
      } finally {
        setLoadingUsers(false);
      }
    }

    if (session?.accessToken) {
      loadUsers();
    }
  }, [session?.accessToken, authorizedFetch]);

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle NextAuth loading - AFTER all hooks
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

  // Redirect if unauthenticated - AFTER all hooks
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
              <h1 className="text-4xl font-bold text-white mb-2">Onboard Employees</h1>
              <p className="text-gray-400 text-sm">Manage your team members and their roles</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className="bg-[#334155] hover:bg-[#475569] px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                onClick={() => router.push("/dashboard")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Dashboard
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95"
                onClick={() => router.push("/onboard-employee/create")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create User
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95"
                onClick={() => router.push("/onboard-employee/assign")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Assign Roles
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search users by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#1e293b] border border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
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
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-white">{users.filter(u => u.is_active).length}</p>
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
                <p className="text-gray-400 text-sm">Inactive Users</p>
                <p className="text-2xl font-bold text-white">{users.filter(u => !u.is_active).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        {loadingUsers ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? "No users found" : "No users onboarded yet"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm ? "Try adjusting your search" : "Get started by creating your first user"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push("/onboard-employee/create")}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First User
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.user_id}
                className="bg-[#1e293b] border border-[#334155] rounded-lg p-5 hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-lg text-white">{user.email}</p>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          user.is_active 
                            ? 'bg-green-900/40 text-green-400 border border-green-500/30' 
                            : 'bg-gray-700 text-gray-400 border border-gray-600'
                        }`}>
                          {user.is_active ? '● Active' : '○ Inactive'}
                        </span>
                      </div>
                      
                      {/* Roles */}
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        {user.roles?.length ? (
                          <div className="flex flex-wrap gap-1.5">
                            {user.roles.map((role, idx) => (
                              <span key={idx} className="bg-blue-900/30 text-blue-300 px-2.5 py-1 rounded-md text-xs font-medium border border-blue-500/30">
                                {role}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">No roles assigned</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/onboard-employee/assign?userId=${user.user_id}&email=${encodeURIComponent(user.email)}`)}
                      className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border border-blue-500/30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Assign Role
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