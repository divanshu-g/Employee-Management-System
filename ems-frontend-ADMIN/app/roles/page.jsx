'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function fetchRoles() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/role`, { method: 'GET', credentials: 'include' });
      if (res.status === 401) {
        setError('Unauthorized. Please login.');
        setRoles([]);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch roles.');
      const data = await res.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error loading roles.');
      setRoles([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchRoles();
  }, []);

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      const res = await fetch(`${API_URL}/api/role/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || 'Failed to delete role.');
        return;
      }
      fetchRoles();
    } catch {
      setError('Error deleting role.');
    }
  }

  function handleEdit(id) {
    router.push(`/roles/edit/${id}`);
  }

  function navigateToCreate() {
    router.push('/roles/create');
  }

  function navigateToDashBoard() {
    router.push('/dashboard');
  }


  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900 text-white p-4">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h1 className="text-4xl font-bold tracking-wide text-blue-400">
          Role Management
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={navigateToCreate}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded font-semibold shadow transition"
          >
            Create Role
          </button>
          <button
            onClick={navigateToDashBoard}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded font-semibold shadow transition"
          >
            Return to DashBoard
          </button>
        </div>
      </header>


      <main className="flex-1 flex overflow-hidden mt-6 mx-6 rounded-lg shadow-lg border border-gray-800 bg-gray-800">
        <div className="flex-1 overflow-auto p-6">
          {error && <p className="mb-4 text-red-400 font-semibold">{error}</p>}
          {loading ? (
            <p className="text-center text-gray-400 text-lg">Loading roles...</p>
          ) : (
            <ul className="space-y-4">
              {roles.length === 0 && <p className="text-center text-gray-400">No roles found.</p>}
              {roles.map((role) => (
                <li
                  key={role.role_id}
                  className="bg-gray-900 p-4 rounded flex justify-between items-center shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <p className="text-xl font-semibold">{role.role_name} <span className="text-sm text-gray-400">({role.role_type})</span></p>
                    <p className="text-gray-500">{role.role_description || 'No description'}</p>
                    <p className={`text-xs font-semibold mt-1 ${role.is_active ? 'text-green-400' : 'text-red-400'}`}>
                      {role.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleEdit(role.role_id)}
                      className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded font-semibold shadow transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(role.role_id)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold shadow transition"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
