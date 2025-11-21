'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthorizedFetch } from '@/app/hooks/useAuthorizedFetch';
import { ArrowLeft, Save, Trash2, Briefcase, Hash, Building2, BarChart2, DollarSign, FileText } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditPositionPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { data: session, status } = useSession();
  const { authorizedFetch } = useAuthorizedFetch();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  // --- Fetch Data ---
  useEffect(() => {
    if (session?.accessToken && id) {
      Promise.all([fetchPositionData(), fetchDepartments()]).finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, id]);

  async function fetchDepartments() {
    try {
      const url = API_URL ? `${API_URL}/api/department` : '/api/department';
      const data = await authorizedFetch(url);
      const depts = data.departments || (Array.isArray(data) ? data : []);
      setDepartments(depts);
    } catch (err) {
      console.error("Error fetching departments", err);
    }
  }

  async function fetchPositionData() {
    try {
      const url = API_URL ? `${API_URL}/api/position/${id}` : `/api/position/${id}`;
      const data = await authorizedFetch(url);
      const pos = data.position || data;
      
      // Handle Skills: DB (Array) -> Form (Comma-separated string)
      let skillsStr = '';
      if (Array.isArray(pos.required_skills)) {
        skillsStr = pos.required_skills.join(', ');
      } else if (typeof pos.required_skills === 'string') {
        // In case it's stored as string or JSON string
        try {
             const parsed = JSON.parse(pos.required_skills);
             if(Array.isArray(parsed)) skillsStr = parsed.join(', ');
             else skillsStr = pos.required_skills;
        } catch(e) {
             skillsStr = pos.required_skills;
        }
      }

      setForm({
        position_title: pos.position_title || '',
        position_code: pos.position_code || '',
        job_description: pos.job_description || '',
        required_skills: skillsStr,
        salary: pos.salary || '',
        position_level: pos.position_level || '',
        department_id: pos.department_id || '',
        is_active: pos.is_active ?? true,
      });
    } catch (err) {
      setError(err.message || 'Failed to load position details.');
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
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const url = API_URL ? `${API_URL}/api/position/${id}` : `/api/position/${id}`;
      
      // Handle Skills: Form (String) -> DB (Array)
      const skillsArray = form.required_skills
        ? form.required_skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [];

      await authorizedFetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...form,
            department_id: parseInt(form.department_id), // Int
            salary: parseFloat(form.salary),             // Float
            position_level: parseInt(form.position_level), // Int
            required_skills: skillsArray,                // Array
        }),
      });

      setSuccess('Position updated successfully!');
      setTimeout(() => {
        router.push('/positions');
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to update position.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this position?')) return;

    setSaving(true);
    try {
      const url = API_URL ? `${API_URL}/api/position/${id}` : `/api/position/${id}`;
      await authorizedFetch(url, { method: 'DELETE' });
      router.push('/position');
    } catch (err) {
      setError(err.message || 'Failed to delete position.');
      setSaving(false);
    }
  }

  if (status === 'loading' || loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-300">Loading details...</div>;
  if (status === 'unauthenticated') { router.replace('/signin'); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl p-8 border border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-700">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Edit Position</h1>
            <p className="text-gray-400 mt-2 text-sm">Update details for {form.position_title}</p>
          </div>
          <button onClick={() => router.push('/positions')} className="bg-gray-700 hover:bg-gray-600 px-5 py-2.5 rounded-lg font-semibold shadow-lg transition-all duration-200">
            ← Back
          </button>
        </div>

        {/* Messages */}
        {error && <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-lg text-red-200 font-medium">⚠️ {error}</div>}
        {success && <div className="mb-6 p-4 bg-green-900/30 border border-green-600 rounded-lg text-green-200 font-medium">✅ {success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          
           {/* Row 1: Title & Code */}
           <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-200">Position Title <span className="text-red-400">*</span></label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input type="text" name="position_title" value={form.position_title} onChange={handleChange} required className="w-full rounded-lg border border-gray-600 bg-gray-900/50 p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-200">Position Code <span className="text-red-400">*</span></label>
              <div className="relative">
                <Hash className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input type="text" name="position_code" value={form.position_code} onChange={handleChange} required className="w-full rounded-lg border border-gray-600 bg-gray-900/50 p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>

          {/* Row 2: Department & Level */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-200">Department <span className="text-red-400">*</span></label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <select name="department_id" value={form.department_id} onChange={handleChange} required className="w-full rounded-lg border border-gray-600 bg-gray-900/50 p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.department_id} value={dept.department_id}>
                        {dept.department_name} ({dept.department_code})
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-200">Level (Integer) <span className="text-red-400">*</span></label>
              <div className="relative">
                <BarChart2 className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input type="number" name="position_level" value={form.position_level} onChange={handleChange} required className="w-full rounded-lg border border-gray-600 bg-gray-900/50 p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>

          {/* Row 3: Salary & Skills */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-200">Salary <span className="text-red-400">*</span></label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input type="number" name="salary" value={form.salary} onChange={handleChange} required className="w-full rounded-lg border border-gray-600 bg-gray-900/50 p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-200">Required Skills</label>
              <input type="text" name="required_skills" value={form.required_skills} onChange={handleChange} className="w-full rounded-lg border border-gray-600 bg-gray-900/50 p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              <p className="text-xs text-gray-500 mt-1">Separate with commas (e.g. React, Node, AWS)</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-semibold text-gray-200">Job Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <textarea name="job_description" value={form.job_description} onChange={handleChange} rows={4} className="w-full rounded-lg border border-gray-600 bg-gray-900/50 p-3 pl-10 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${form.is_active ? 'bg-blue-600' : 'bg-gray-600'}`} onClick={() => !saving && setForm(prev => ({ ...prev, is_active: !prev.is_active }))}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${form.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
              <label className="font-semibold text-gray-200 cursor-pointer select-none">Active Status</label>
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${form.is_active ? 'bg-green-900/40 text-green-400' : 'bg-gray-700 text-gray-400'}`}>{form.is_active ? 'Active' : 'Inactive'}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button type="button" onClick={handleDelete} disabled={saving} className="flex-1 py-4 bg-red-900/30 border border-red-800 hover:bg-red-900/50 text-red-200 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
              <Trash2 size={18} /> Delete
            </button>
            <button type="submit" disabled={saving} className="flex-[2] py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-bold shadow-lg text-white flex items-center justify-center gap-2 disabled:opacity-50">
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