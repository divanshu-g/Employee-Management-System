'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthorizedFetch } from '@/app/hooks/useAuthorizedFetch';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-gray-300">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
}

// Main component that uses useSearchParams
function AssignRolesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { authorizedFetch } = useAuthorizedFetch();

  // Get pre-selected user from URL params
  const preSelectedUserId = searchParams.get('userId');
  const preSelectedUserEmail = searchParams.get('email');

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    user_id: preSelectedUserId || '',
    role_id: '',
  });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      setLoadingUsers(true);
      try {
        const data = await authorizedFetch(`${API_BASE}/api/user`);
        setUsers(data);
      } catch (err) {
        setError(err.message || 'Error loading users');
      } finally {
        setLoadingUsers(false);
      }
    }

    async function fetchRoles() {
      setLoadingRoles(true);
      try {
        const data = await authorizedFetch(`${API_BASE}/api/role`);
        setRoles(data);
      } catch (err) {
        setError(err.message || 'Error loading roles');
      } finally {
        setLoadingRoles(false);
      }
    }

    if (session?.accessToken) {
      fetchUsers();
      fetchRoles();
    }
  }, [session?.accessToken, authorizedFetch]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setMessage('');
  }

  async function handleAssign(e) {
    e.preventDefault();
    if (!form.user_id || !form.role_id) {
      setError('Please select both user and role');
      return;
    }
    setAssigning(true);
    setError('');
    setMessage('');

    try {
      const result = await authorizedFetch(`${API_BASE}/api/userRole`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: parseInt(form.user_id),
          role_id: parseInt(form.role_id),
        }),
      });

      setMessage('Role assigned successfully!');
      setForm({ user_id: '', role_id: '' });

      // Optionally redirect after success
      setTimeout(() => {
        router.push('/onboard-employee');
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to assign role');
    } finally {
      setAssigning(false);
    }
  }

  // Handle loading state
  if (status === 'loading') {
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
  if (status === 'unauthenticated') {
    router.replace('/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-[#1e293b] rounded-xl shadow-2xl p-8 border border-[#334155]">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-[#334155]">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Assign Role to User</h1>
            <p className="text-gray-400 text-sm">Connect users with their appropriate roles</p>
          </div>
          <button
            onClick={() => router.push('/onboard-employee')}
            className="bg-[#334155] hover:bg-[#475569] px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-600/50 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-200 font-medium">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-600/50 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-200 font-medium">{message}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAssign} className="space-y-6">
          {/* Select User */}
          <div>
            <label className="block mb-3 font-semibold text-gray-200 flex items-center gap-2" htmlFor="user_id">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Select User
            </label>
            {loadingUsers ? (
              <div className="w-full p-4 rounded-lg bg-[#0f172a] border border-[#334155] flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400">Loading users...</p>
              </div>
            ) : (
              <div className="relative">
                <select
                  id="user_id"
                  name="user_id"
                  value={form.user_id}
                  onChange={handleChange}
                  disabled={assigning}
                  className="w-full p-4 rounded-lg bg-[#0f172a] border border-[#334155] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none text-white"
                  required
                >
                  <option value="">Choose a user</option>
                  {users.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.email}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">Select the user you want to assign a role to</p>
          </div>

          {/* Select Role */}
          <div>
            <label className="block mb-3 font-semibold text-gray-200 flex items-center gap-2" htmlFor="role_id">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Select Role
            </label>
            {loadingRoles ? (
              <div className="w-full p-4 rounded-lg bg-[#0f172a] border border-[#334155] flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400">Loading roles...</p>
              </div>
            ) : (
              <div className="relative">
                <select
                  id="role_id"
                  name="role_id"
                  value={form.role_id}
                  onChange={handleChange}
                  disabled={assigning}
                  className="w-full p-4 rounded-lg bg-[#0f172a] border border-[#334155] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none text-white"
                  required
                >
                  <option value="">Choose a role</option>
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.role_name} ({role.role_type})
                    </option>
                  ))}
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">Choose the role to be assigned</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={assigning || !form.user_id || !form.role_id}
            className="w-full py-4 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold shadow-lg text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {assigning ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Assigning Role...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Assign Role
              </>
            )}
          </button>
        </form>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-blue-900/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-blue-400 mb-1">Assignment Information</p>
              <p>Users can have multiple roles. This assignment will add the selected role to the user's existing roles.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Exported page component with Suspense wrapper
export default function AssignRolesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AssignRolesContent />
    </Suspense>
  );
}