'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthorizedFetch } from '@/app/hooks/useAuthorizedFetch';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditDepartmentPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params; // Get ID from URL
  const { data: session, status } = useSession();
  const { authorizedFetch } = useAuthorizedFetch();

  const [form, setForm] = useState({
    department_name: '',
    department_code: '',
    description: '',
    is_active: true,
  });

  const [loading, setLoading] = useState(true); // Start true to fetch data
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // --- Fetch Existing Data ---
  useEffect(() => {
    if (session?.accessToken && id) {
      fetchDepartmentData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, id]);

  async function fetchDepartmentData() {
    try {
      const url = API_URL ? `${API_URL}/api/department/${id}` : `/api/department/${id}`;
      const data = await authorizedFetch(url);
      
      // Adjust based on whether your API returns { department: ... } or just the object
      const dept = data.department || data;
      
      setForm({
        department_name: dept.department_name || '',
        department_code: dept.department_code || '',
        description: dept.description || '',
        is_active: dept.is_active ?? true,
      });
    } catch (err) {
      setError(err.message || 'Failed to load department details.');
    } finally {
      setLoading(false);
    }
  }

  // --- Handle Input Change ---
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
    setSuccess('');
  }

  // --- Handle Update (PUT) ---
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!form.department_name.trim() || !form.department_code.trim()) {
      setError('Department name and Department code are required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const url = API_URL ? `${API_URL}/api/department/${id}` : `/api/department/${id}`;
      await authorizedFetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      setSuccess('Department updated successfully!');
      
      // Redirect after success
      setTimeout(() => {
        router.push('/department');
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to update department.');
    } finally {
      setSaving(false);
    }
  }

  // --- Handle Delete ---
  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) return;

    setSaving(true);
    try {
      const url = API_URL ? `${API_URL}/api/department/${id}` : `/api/department/${id}`;
      await authorizedFetch(url, { method: 'DELETE' });
      router.push('/department');
    } catch (err) {
      setError(err.message || 'Failed to delete department.');
      setSaving(false);
    }
  }

  // Handle loading state for initial fetch
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-300">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p>{loading ? 'Loading department data...' : 'Checking authentication...'}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl p-8 border border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-700">
          <div>
            <h1 className="text-4xl font-bold bg-white bg-clip-text text-transparent">
              Edit Department
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Update details for {form.department_name || 'this department'}</p>
          </div>
          <button
            onClick={() => router.push('/department')}
            className="bg-gray-700 hover:bg-gray-600 px-5 py-2.5 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
          >
            ← Back
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-200 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-600 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-200 font-medium">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Department Name */}
          <div>
            <label htmlFor="department_name" className="block mb-2 font-semibold text-gray-200">
              Department Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="department_name"
              name="department_name"
              value={form.department_name}
              onChange={handleChange}
              required
              disabled={saving}
              className="w-full rounded-lg border border-gray-600 bg-gray-900/50 p-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Department Code */}
          <div>
            <label htmlFor="department_code" className="block mb-2 font-semibold text-gray-200">
              Department Code <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="department_code"
              name="department_code"
              value={form.department_code}
              onChange={handleChange}
              required
              disabled={saving}
              className="w-full rounded-lg border border-gray-600 bg-gray-900/50 p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-2">Unique identifier (e.g. ENG-01)</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block mb-2 font-semibold text-gray-200">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              disabled={saving}
              rows={4}
              className="w-full rounded-lg border border-gray-600 bg-gray-900/50 p-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${form.is_active ? 'bg-blue-600' : 'bg-gray-600'}`}
                onClick={() => !saving && setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${form.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
              <label htmlFor="is_active" className="font-semibold text-gray-200 cursor-pointer select-none"
                onClick={() => !saving && setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
              >
                Active Status
              </label>
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${form.is_active ? 'bg-green-900/40 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
              {form.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 py-4 bg-red-900/30 border border-red-800 hover:bg-red-900/50 text-red-200 rounded-lg font-bold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-[2] py-4 bg-blue-700 hover:to-purple-700 rounded-lg font-bold shadow-lg text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}