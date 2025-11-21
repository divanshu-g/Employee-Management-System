'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthorizedFetch } from '@/app/hooks/useAuthorizedFetch';
import { ArrowLeft, Save, X, Briefcase, FileText, Hash, DollarSign, BarChart2, Building2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CreatePositionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { authorizedFetch } = useAuthorizedFetch();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deptLoading, setDeptLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    position_title: '',
    position_code: '',
    job_description: '',
    required_skills: '',
    salary: '',
    position_level: '',
    department_id: '',
    is_active: true,
  });

  // --- Fetch Departments for Dropdown ---
  useEffect(() => {
    if (session?.accessToken) {
      fetchDepartments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  async function fetchDepartments() {
    try {
      const url = API_URL ? `${API_URL}/api/department` : '/api/department';
      const data = await authorizedFetch(url);
      const depts = data.departments || (Array.isArray(data) ? data : []);
      setDepartments(depts);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    } finally {
      setDeptLoading(false);
    }
  }

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
    
    if (!form.position_title || !form.position_code || !form.salary || !form.position_level || !form.department_id) {
      setError('Please fill in all required fields (Title, Code, Salary, Level, Department).');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const url = API_URL ? `${API_URL}/api/position` : '/api/position';
      
      // Convert comma-separated skills string to an array for Prisma Json field
      const skillsArray = form.required_skills
        ? form.required_skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [];

      await authorizedFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          department_id: parseInt(form.department_id),
          salary: parseFloat(form.salary),
          position_level: parseInt(form.position_level), // Fixed: Parse as Int
          required_skills: skillsArray, // Fixed: Send as Array for Json field
        }),
      });

      setSuccess('Position created successfully!');
      
      setTimeout(() => {
        router.push('/position');
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to create position.');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading') return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-300">Checking authentication...</div>;
  if (status === 'unauthenticated') { router.replace('/signin'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl p-8 border border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-700">
          <div>
            <h1 className="text-4xl font-bold bg-white bg-clip-text text-transparent">
              Create Position
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Define a new job role in your organization</p>
          </div>
          <button onClick={() => router.push('/positions')} className="bg-gray-700 hover:bg-gray-600 px-5 py-2.5 rounded-lg font-semibold shadow-lg transition-all duration-200">
            ← Back
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-lg flex items-start gap-3 text-red-200 font-medium">
            <span>⚠️ {error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-600 rounded-lg flex items-start gap-3 text-green-200 font-medium">
            <span>✅ {success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Title & Code */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-200">Position Title <span className="text-red-400">*</span></label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="text" name="position_title" value={form.position_title} onChange={handleChange} required
                  placeholder="e.g. Senior Developer"
                  className="w-full rounded-lg border border-gray-600 bg-gray-900/50 p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-200">Position Code <span className="text-red-400">*</span></label>
              <div className="relative">
                <Hash className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="text" name="position_code" value={form.position_code} onChange={handleChange} required
                  placeholder="e.g. DEV-SR-01"
                  className="w-full rounded-lg border border-gray-600 bg-gray-900/50 p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Department & Level */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-200">Department <span className="text-red-400">*</span></label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <select
                  name="department_id" value={form.department_id} onChange={handleChange} required
                  className="w-full rounded-lg border border-gray-600 bg-gray-900/50 p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option value="">Select Department</option>
                  {deptLoading ? (
                    <option disabled>Loading departments...</option>
                  ) : (
                    departments.map(dept => (
                      <option key={dept.department_id} value={dept.department_id}>
                        {dept.department_name} ({dept.department_code})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-200">Level (Integer) <span className="text-red-400">*</span></label>
              <div className="relative">
                <BarChart2 className="absolute left-3 top-3.5 text-gray-400" size={18} />
                {/* Changed input type to number because Prisma expects Int */}
                <input
                  type="number" name="position_level" value={form.position_level} onChange={handleChange} required
                  placeholder="e.g. 4"
                  className="w-full rounded-lg border border-gray-600 bg-gray-900/50 p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Salary & Skills */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-200">Salary <span className="text-red-400">*</span></label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="number" name="salary" value={form.salary} onChange={handleChange} required
                  placeholder="e.g. 80000"
                  className="w-full rounded-lg border border-gray-600 bg-gray-900/50 p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-200">Required Skills</label>
              <input
                type="text" name="required_skills" value={form.required_skills} onChange={handleChange}
                placeholder="e.g. React, Node.js, AWS"
                className="w-full rounded-lg border border-gray-600 bg-gray-900/50 p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-semibold text-gray-200">Job Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <textarea
                name="job_description" value={form.job_description} onChange={handleChange} rows={4}
                placeholder="Describe the role responsibilities..."
                className="w-full rounded-lg border border-gray-600 bg-gray-900/50 p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${form.is_active ? 'bg-blue-600' : 'bg-gray-600'}`}
                onClick={() => !loading && setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${form.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
              <label className="font-semibold text-gray-200 cursor-pointer select-none"
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
            className="w-full py-4 bg-blue-700 rounded-lg font-bold shadow-lg text-white transition-all duration-200 disabled:opacity-50 hover:scale-[1.02]"
          >
            {loading ? 'Creating...' : 'Create Position'}
          </button>
        </form>
      </div>
    </div>
  );
}