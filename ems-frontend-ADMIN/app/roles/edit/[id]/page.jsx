'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthorizedFetch } from '@/app/hooks/useAuthorizedFetch';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditRolePage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: session, status } = useSession();
  const { authorizedFetch } = useAuthorizedFetch();

  const [form, setForm] = useState({
    role_name: '',
    role_type: '',
    role_description: '',
    permissions: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchRole() {
      if (!session?.accessToken || !id) return;
      
      setLoadingRole(true);
      setError('');
      try {
        const data = await authorizedFetch(`${API_URL}/api/role/${id}`);
        
        setForm({
          role_name: data.role_name || '',
          role_type: data.role_type || '',
          role_description: data.role_description || '',
          permissions: data.permissions || '',
          is_active: typeof data.is_active === 'boolean' ? data.is_active : true,
        });
      } catch (err) {
        if (err.message && err.message.includes('404')) {
          setError('Role not found.');
        } else {
          setError(err.message || 'Error loading role.');
        }
      } finally {
        setLoadingRole(false);
      }
    }
    
    fetchRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, session?.accessToken]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.role_name.trim() || !form.role_type.trim()) {
      setError('Role name and Role type are required.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authorizedFetch(`${API_URL}/api/role/${id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });

      setSuccess('Role updated successfully!');
      
      // Redirect after success
      setTimeout(() => {
        router.push('/roles');
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to update role.');
    } finally {
      setLoading(false);
    }
  }

  // Handle loading state
  if (status === 'loading' || loadingRole) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-gray-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>{status === 'loading' ? 'Checking authentication...' : 'Loading role data...'}</p>
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
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-[#1e293b] rounded-xl shadow-2xl p-8 border border-[#334155]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#334155]">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Edit Role</h1>
            <p className="text-gray-400 text-sm">Modify role details and permissions</p>
          </div>
          <button
            onClick={() => router.push('/roles')}
            className="bg-[#334155] hover:bg-[#475569] px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
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

        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-600/50 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-200 font-medium">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Name */}
          <div>
            <label htmlFor="role_name" className="block mb-2 font-semibold text-gray-200">
              Role Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="role_name"
              name="role_name"
              value={form.role_name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="e.g., Project Manager"
              className="w-full rounded-lg border border-[#334155] bg-[#0f172a] p-3.5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Role Type */}
          <div>
            <label htmlFor="role_type" className="block mb-2 font-semibold text-gray-200">
              Role Type <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                id="role_type"
                name="role_type"
                value={form.role_type}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full rounded-lg border border-[#334155] bg-[#0f172a] p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
              >
                <option value="">Select Role Type</option>
                <option value="superAdmin">🔐 Super Admin</option>
                <option value="subAdmin">👔 Sub Admin</option>
                <option value="employee">👤 Employee</option>
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 mt-2">Choose the hierarchy level for this role</p>
          </div>

          {/* Role Description */}
          <div>
            <label htmlFor="role_description" className="block mb-2 font-semibold text-gray-200">
              Description
            </label>
            <textarea
              id="role_description"
              name="role_description"
              value={form.role_description}
              onChange={handleChange}
              disabled={loading}
              placeholder="Describe the responsibilities and duties of this role..."
              rows={4}
              className="w-full rounded-lg border border-[#334155] bg-[#0f172a] p-3.5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-2">Optional: Provide context about this role</p>
          </div>

          {/* Permissions */}
          <div>
            <label htmlFor="permissions" className="block mb-2 font-semibold text-gray-200">
              Permissions
            </label>
            <input
              type="text"
              id="permissions"
              name="permissions"
              value={form.permissions}
              onChange={handleChange}
              disabled={loading}
              placeholder="read, write, delete, admin"
              className="w-full rounded-lg border border-[#334155] bg-[#0f172a] p-3.5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-2">Separate multiple permissions with commas</p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
            <div className="flex items-center gap-3">
              <div 
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${form.is_active ? 'bg-blue-600' : 'bg-gray-600'}`}
                onClick={() => !loading && setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${form.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
              <label 
                htmlFor="is_active" 
                className="font-semibold text-gray-200 cursor-pointer select-none"
                onClick={() => !loading && setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
              >
                Active Status
              </label>
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${form.is_active ? 'bg-green-900/40 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
              {form.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold shadow-lg text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating Role...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Update Role
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
              <p className="font-semibold text-blue-400 mb-1">Update Information</p>
              <p>Changes to this role will affect all users currently assigned to it.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}