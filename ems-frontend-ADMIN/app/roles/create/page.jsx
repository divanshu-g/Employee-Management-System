'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CreateRolePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    role_name: '',
    role_type: '',
    role_description: '',
    permissions: '',
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const res = await fetch(`${API_URL}/api/role`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || 'Failed to create role.');
        setLoading(false);
        return;
      }
      setLoading(false);
      router.push('/roles'); // redirect after successful create
    } catch {
      setError('Network error.');
      setLoading(false);
    }
  }

  function navigateToRoles() {
    router.push('/roles');
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-gray-800 rounded-md shadow-lg p-10">
        <div className="flex items-center justify-between mb-8 border-b border-gray-700 pb-4">
          <h1 className="text-4xl font-bold">Create Role</h1>
          <button
            onClick={navigateToRoles}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded font-semibold shadow transition"
          >
            Return to Roles
          </button>
        </div>
        {error && <p className="text-red-500 mb-6 font-semibold">{error}</p>}

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
            <input
              type="text"
              id="role_type"
              name="role_type"
              value={form.role_type}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="E.g. superAdmin"
              className="w-full rounded border border-gray-600 bg-gray-900 p-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
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
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold shadow text-white transition disabled:opacity-70"
          >
            {loading ? 'Creating...' : 'Create Role'}
          </button>
        </form>
      </div>
    </div>
  );
}
