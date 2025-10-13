'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditRolePage() {
  const router = useRouter();
  const { id } = useParams();

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

  useEffect(() => {
    async function fetchRole() {
      setLoadingRole(true);
      setError('');
      try {
        const res = await fetch(`${API_URL}/api/role/${id}`, { method: 'GET', credentials: 'include' });
        if (res.status === 404) {
          setError('Role not found.');
          setLoadingRole(false);
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch role.');
        const data = await res.json();
        setForm({
          role_name: data.role_name || '',
          role_type: data.role_type || '',
          role_description: data.role_description || '',
          permissions: data.permissions || '',
          is_active: typeof data.is_active === 'boolean' ? data.is_active : true,
        });
      } catch (err) {
        setError(err.message || 'Error loading role.');
      }
      setLoadingRole(false);
    }
    if (id) fetchRole();
  }, [id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.role_name.trim() || !form.role_type.trim()) {
      setError('Role name and Role type are required.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/role/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || 'Failed to update role.');
        setLoading(false);
        return;
      }
      setLoading(false);
      router.push('/roles'); // redirect after update
    } catch {
      setError('Network error.');
      setLoading(false);
    }
  }

  if (loadingRole) {
    return <p className="p-6 text-white">Loading role data...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500 font-semibold">{error}</p>;
  }

  function navigateToDashBoard() {
    router.push('/dashboard');
  }
  function navigateToRoles() {
    router.push('/roles');
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-gray-800 rounded-md shadow-lg p-10">
        <div className="flex items-center justify-between mb-8 border-b border-gray-700 pb-4">
          <h1 className="text-4xl font-bold">Edit Role</h1>
          <button
            onClick={navigateToRoles}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded font-semibold shadow transition"
          >
            Return to Roles
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="role_name" className="block mb-2 font-semibold">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="role_name"
              name="role_name"
              value={form.role_name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter role name"
              className="w-full rounded border border-gray-600 bg-gray-900 p-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label htmlFor="role_type" className="block mb-2 font-semibold">
              Role Type <span className="text-red-500">*</span>
            </label>
            <select
              id="role_type"
              name="role_type"
              value={form.role_type}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full rounded border border-gray-600 bg-gray-900 p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="" disabled>Select role type</option>
              <option value="superAdmin">superAdmin</option>
              <option value="subAdmin">subAdmin</option>
              <option value="employee">employee</option>
            </select>
          </div>

          <div>
            <label htmlFor="role_description" className="block mb-2 font-semibold">
              Description
            </label>
            <textarea
              id="role_description"
              name="role_description"
              value={form.role_description}
              onChange={handleChange}
              disabled={loading}
              placeholder="Describe role responsibilities"
              rows={4}
              className="w-full rounded border border-gray-600 bg-gray-900 p-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label htmlFor="permissions" className="block mb-2 font-semibold">
              Permissions (comma separated)
            </label>
            <input
              type="text"
              id="permissions"
              name="permissions"
              value={form.permissions}
              onChange={handleChange}
              disabled={loading}
              placeholder="read,write,delete"
              className="w-full rounded border border-gray-600 bg-gray-900 p-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              disabled={loading}
              className="rounded cursor-pointer focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="font-semibold cursor-pointer">
              Active
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 rounded font-semibold shadow text-white transition disabled:opacity-70"
          >
            {loading ? 'Updating...' : 'Update Role'}
          </button>
        </form>
      </div>
    </div>
  );
}
