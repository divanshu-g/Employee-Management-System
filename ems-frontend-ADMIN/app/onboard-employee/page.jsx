'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = 'http://localhost:8080/api';

export default function OnboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      setLoadingUsers(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/user`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message || 'Error loading users');
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white max-w-5xl mx-auto rounded-md shadow-md">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-bold">Onboard Employees</h1>
        <div className="space-x-3">
          <button
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded font-semibold"
            onClick={() => router.push('/dashboard')}
          >
            Return to Dashboard
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded font-semibold"
            onClick={() => router.push('/onboard-employee/create')}
          >
            Create User
          </button>
          <button
            className="bg-yellow-600 hover:bg-yellow-700 px-5 py-2 rounded font-semibold"
            onClick={() => router.push('/onboard-employee/assign')}
          >
            Assign Roles
          </button>
        </div>
      </header>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loadingUsers ? (
        <p>Loading users...</p>
      ) : (
        <ul className="space-y-4">
          {users.length === 0 && <p>No users onboarded yet.</p>}
          {users.map((user) => (
            <li
              key={user.user_id}
              className="bg-gray-800 p-4 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{user.email}</p>
                <p className="text-sm text-gray-400">
                  Roles: {user.roles && user.roles.length ? user.roles.join(', ') : 'None'}
                </p>
                <p className="text-xs mt-1 text-gray-500">
                  Status: {user.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
