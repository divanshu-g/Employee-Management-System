'use client';

import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function AssignRolesPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    user_id: '',
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
        const res = await fetch(`${API_BASE}/api/user`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
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
        const res = await fetch(`${API_BASE}/api/role`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch roles');
        const data = await res.json();
        setRoles(data);
      } catch (err) {
        setError(err.message || 'Error loading roles');
      } finally {
        setLoadingRoles(false);
      }
    }

    fetchUsers();
    fetchRoles();
  }, []);

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
      const res = await fetch(`${API_BASE}/api/userRole`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_id: parseInt(form.user_id),
          role_id: parseInt(form.role_id),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to assign role');
      }

      setMessage('Role assigned successfully!');
      setForm({ user_id: '', role_id: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 max-w-xl mx-auto rounded-md shadow-md">
      <h1 className="text-4xl font-bold mb-6 border-b border-gray-700 pb-4">Assign Role to User</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {message && <p className="text-green-500 mb-4">{message}</p>}

      <form onSubmit={handleAssign} className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold" htmlFor="user_id">
            Select User
          </label>
          {loadingUsers ? (
            <p>Loading users...</p>
          ) : (
            <select
              id="user_id"
              name="user_id"
              value={form.user_id}
              onChange={handleChange}
              disabled={assigning}
              className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.email}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block mb-2 font-semibold" htmlFor="role_id">
            Select Role
          </label>
          {loadingRoles ? (
            <p>Loading roles...</p>
          ) : (
            <select
              id="role_id"
              name="role_id"
              value={form.role_id}
              onChange={handleChange}
              disabled={assigning}
              className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.role_id} value={role.role_id}>
                  {role.role_name} ({role.role_type})
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="submit"
          disabled={assigning}
          className="w-full py-3 rounded bg-blue-600 hover:bg-blue-700 font-semibold transition disabled:opacity-70"
        >
          {assigning ? 'Assigning...' : 'Assign Role'}
        </button>
      </form>
    </div>
  );
}
