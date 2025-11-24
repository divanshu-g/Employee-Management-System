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
  const [passwordErrors, setPasswordErrors] = useState([]);

  function validatePassword(password) {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
    }
    
    return errors;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setMessage('');
    
    // Validate password in real-time
    if (name === 'password') {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!form.email || !form.password) {
      setError('Email and Password are required.');
      return;
    }

    // Validate password strength before submitting
    const errors = validatePassword(form.password);
    if (errors.length > 0) {
      setError('Please fix the password requirements before submitting.');
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
      setPasswordErrors([]);
      
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

  const isPasswordValid = form.password && passwordErrors.length === 0;

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
              placeholder="Enter strong password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              required
            />
            
            {/* Password Requirements */}
            <div className="mt-3 space-y-1 text-sm">
              <p className="text-gray-400 font-semibold mb-2">Password Requirements:</p>
              {[
                { test: form.password.length >= 8, text: 'At least 8 characters' },
                { test: /[A-Z]/.test(form.password), text: 'One uppercase letter' },
                { test: /[a-z]/.test(form.password), text: 'One lowercase letter' },
                { test: /[0-9]/.test(form.password), text: 'One number' },
                { test: /[!@#$%^&*(),.?":{}|<>]/.test(form.password), text: 'One special character' },
              ].map((requirement, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {form.password ? (
                    requirement.test ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-red-500">✗</span>
                    )
                  ) : (
                    <span className="text-gray-500">○</span>
                  )}
                  <span className={
                    form.password 
                      ? requirement.test 
                        ? 'text-green-400' 
                        : 'text-red-400'
                      : 'text-gray-500'
                  }>
                    {requirement.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full bg-blue-600 hover:bg-blue-700 rounded py-3 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
}