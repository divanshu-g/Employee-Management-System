'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthorizedFetch } from '@/app/hooks/useAuthorizedFetch';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function CreateUserPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { authorizedFetch } = useAuthorizedFetch();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setMessage('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!form.email || !form.password) {
      setError('Email and Password are required.');
      return;
    }

    setLoading(true);
    try {
      await authorizedFetch(`${API_BASE}/api/user`, {
        method: 'POST',
        body: JSON.stringify({ 
          email: form.email, 
          password: form.password 
        }),
      });
      
      setMessage('User created successfully.');
      setForm({ email: '', password: '' });
      
      // Optionally redirect after a delay
      setTimeout(() => {
        router.push('/onboard-employee');
      }, 1500);
      
    } catch (err) {
      setError(err.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  }

  // Handle loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-300">
        Checking authentication...
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.replace('/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-gray-800 rounded-md shadow-lg p-8 text-white">
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h1 className="text-4xl font-bold">Create User</h1>
          <button
            onClick={() => router.push('/onboard-employee')}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded font-semibold text-sm"
          >
            Back
          </button>
        </div>

        {error && <p className="text-red-500 mb-4 p-3 bg-red-900/20 rounded">{error}</p>}
        {message && <p className="text-green-500 mb-4 p-3 bg-green-900/20 rounded">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block mb-2 font-semibold">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 font-semibold">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 rounded py-3 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
}