'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthorizedFetch } from '@/app/hooks/useAuthorizedFetch';
import {
  User, Briefcase, CheckCircle, ChevronRight, ChevronLeft,
  Building2, MapPin, Calendar, Mail, Phone, Hash, Users
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OnboardEmployeePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { authorizedFetch } = useAuthorizedFetch();

  const steps = [
    { id: 1, title: 'Personal Info', icon: <User size={20} /> },
    { id: 2, title: 'Job Details', icon: <Briefcase size={20} /> },
    { id: 3, title: 'Management & Review', icon: <Users size={20} /> },
  ];
  const [currentStep, setCurrentStep] = useState(1);

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [managers, setManagers] = useState([]);
  const [users, setUsers] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    user_id: '',
    first_name: '',
    last_name: '',
    personal_email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    address_street: '',
    address_city: '',
    address_country: '',
    ec_name: '',
    ec_phone: '',

    employee_code: '',
    department_id: '',
    position_id: '',
    employment_type: 'Full_Time',
    work_location: 'Office',
    hire_date: '',
    probation_end_date: '',

    direct_manager_id: '',
    skip_level_manager_id: '',
    is_people_manager: false,
    employment_status: 'Active',
  });

  useEffect(() => {
    if (session?.accessToken) {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  async function fetchAllData() {
    try {
      const [deptRes, posRes, empRes, userRes] = await Promise.all([
        authorizedFetch(`${API_URL}/api/department`),
        authorizedFetch(`${API_URL}/api/position`),
        authorizedFetch(`${API_URL}/api/employee`),
        authorizedFetch(`${API_URL}/api/user`)
      ]);

      setDepartments(deptRes.departments || []);
      setPositions(posRes.positions || []);
      setManagers(empRes.employees || []);

      const allUsers = Array.isArray(userRes) ? userRes : (userRes.users || []);
      const employeeUsers = allUsers.filter(u => {
        if (Array.isArray(u.roles)) return u.roles.includes('employee');
        if (u.role?.role_name === 'employee') return true;
        if (u.role === 'employee') return true;
        return false;
      });
      setUsers(employeeUsers);
    } catch (err) {
      console.error("Error fetching dropdown data", err);
      setError("Failed to load dropdown options. Please check your connection.");
    } finally {
      setLoadingData(false);
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep = (step) => {
    setError('');
    if (step === 1) {
      if (!formData.first_name || !formData.last_name || !formData.personal_email || !formData.phone_number || !formData.user_id) {
        setError('Please fill in all required personal fields (Name, Email, Phone, User Account).');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.employee_code || !formData.department_id || !formData.position_id || !formData.hire_date) {
        setError('Please fill in all required job fields (Code, Dept, Position, Hire Date).');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  // helpers
  const formatDateForBackend = (dateStr) => {
    // Expecting dateStr from <input type="date"> as "YYYY-MM-DD"
    if (!dateStr) return null;
    // Ensure ISO-8601 DateTime accepted by Prisma (avoid timezone shift)
    return `${dateStr}T00:00:00.000Z`;
  };

  const parseIntSafe = (val) => {
    if (val === undefined || val === null || val === '') return null;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    const payload = {
      user_id: parseIntSafe(formData.user_id),
      employee_code: formData.employee_code,
      first_name: formData.first_name,
      last_name: formData.last_name,
      personal_email: formData.personal_email,
      phone_number: formData.phone_number,

      date_of_birth: formatDateForBackend(formData.date_of_birth),
      hire_date: formatDateForBackend(formData.hire_date),
      probation_end_date: formatDateForBackend(formData.probation_end_date),

      gender: formData.gender || null,

      address: (formData.address_street || formData.address_city || formData.address_country) ? {
        street: formData.address_street || '',
        city: formData.address_city || '',
        country: formData.address_country || ''
      } : null,

      emergency_contact: (formData.ec_name || formData.ec_phone) ? {
        name: formData.ec_name || '',
        phone: formData.ec_phone || ''
      } : null,

      department_id: parseIntSafe(formData.department_id),
      position_id: parseIntSafe(formData.position_id),

      // NOTE: backend expects 'employment_type' & 'employment_status' (Prisma names)
      employment_type: formData.employment_type || null,
      work_location: formData.work_location || null,
      employment_status: formData.employment_status || null,

      direct_manager_id: parseIntSafe(formData.direct_manager_id),
      skip_level_manager_id: parseIntSafe(formData.skip_level_manager_id),

      is_people_manager: !!formData.is_people_manager,
    };

    // debug output to console (very useful)
    console.log('Onboard payload:', payload);

    try {
      await authorizedFetch(`${API_URL}/api/employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setSuccess('Employee onboarded successfully!');
      // small delay so user sees success message
      setTimeout(() => router.push('/employee'), 1200);
    } catch (err) {
      console.error('Create employee error:', err);
      setError(err.message || 'Failed to onboard employee.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loadingData) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-gray-400 flex-col gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p>Loading onboarding resources...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.replace('/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 flex justify-center">
      <div className="w-full max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Onboard New Employee</h1>

          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-700 -z-10"></div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>

            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-[#0f172a] px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  step.id <= currentStep ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-gray-700 text-gray-400'
                }`}>
                  {step.id < currentStep ? <CheckCircle size={20} /> : step.id}
                </div>
                <span className={`text-sm font-medium ${step.id <= currentStep ? 'text-blue-400' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-8 shadow-2xl min-h-[500px] flex flex-col relative overflow-hidden">
          {error && <div className="mb-6 p-4 bg-red-900/20 border border-red-600/50 rounded-lg text-red-200 flex items-center gap-2">⚠️ {error}</div>}
          {success && <div className="mb-6 p-4 bg-green-900/20 border border-green-600/50 rounded-lg text-green-200 flex items-center gap-2">✅ {success}</div>}

          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-semibold text-gray-200 border-b border-gray-700 pb-2 mb-6">Personal Information</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <span className="text-blue-400"><User size={16} /></span>
                    User Account *
                  </label>
                  <select name="user_id" value={formData.user_id} onChange={handleChange} className="form-input">
                    <option value="">Select User Account</option>
                    {users.length > 0 ? (
                      users.map(u => (
                        <option key={u.user_id} value={u.user_id}>
                          {u.email} (ID: {u.user_id})
                        </option>
                      ))
                    ) : (
                      <option disabled>No available 'employee' users found</option>
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Only users with <strong>'employee'</strong> role appear here.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-300">First Name *</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="form-input" placeholder="John" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-300">Last Name *</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="form-input" placeholder="Doe" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300 flex items-center gap-2"><span className="text-blue-400"><Mail size={16} /></span> Personal Email *</label>
                  <input type="email" name="personal_email" value={formData.personal_email} onChange={handleChange} className="form-input" placeholder="john.doe@gmail.com" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300 flex items-center gap-2"><span className="text-blue-400"><Phone size={16} /></span> Phone Number *</label>
                  <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="form-input" placeholder="+1 234 567 8900" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300">Date of Birth</label>
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="form-input" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="form-input">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-[#334155] pt-6 mt-2">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Address & Emergency</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-300">Address (Street/City/Country)</label>
                    <input type="text" name="address_street" value={formData.address_street} onChange={handleChange} className="form-input mb-2" placeholder="Street Address" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" name="address_city" value={formData.address_city} onChange={handleChange} className="form-input" placeholder="City" />
                      <input type="text" name="address_country" value={formData.address_country} onChange={handleChange} className="form-input" placeholder="Country" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-300">Emergency Contact</label>
                    <input type="text" name="ec_name" value={formData.ec_name} onChange={handleChange} className="form-input mb-2" placeholder="Contact Name" />
                    <input type="tel" name="ec_phone" value={formData.ec_phone} onChange={handleChange} className="form-input" placeholder="Contact Phone" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-semibold text-gray-200 border-b border-gray-700 pb-2 mb-6">Job & Role Assignment</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300 flex items-center gap-2"><span className="text-blue-400"><Hash size={16} /></span> Employee Code *</label>
                  <input type="text" name="employee_code" value={formData.employee_code} onChange={handleChange} className="form-input" placeholder="EMP-2024-001" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300 flex items-center gap-2"><span className="text-blue-400"><Building2 size={16} /></span> Department *</label>
                  <select name="department_id" value={formData.department_id} onChange={handleChange} className="form-input">
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300 flex items-center gap-2"><span className="text-blue-400"><Briefcase size={16} /></span> Position *</label>
                  <select name="position_id" value={formData.position_id} onChange={handleChange} className="form-input">
                    <option value="">Select Position</option>
                    {positions.map(p => <option key={p.position_id} value={p.position_id}>{p.position_title} ({p.position_code})</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300 flex items-center gap-2"><span className="text-blue-400"><MapPin size={16} /></span> Work Location *</label>
                  <select name="work_location" value={formData.work_location} onChange={handleChange} className="form-input">
                    <option value="Office">Office</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300 flex items-center gap-2"><span className="text-blue-400"><Calendar size={16} /></span> Hire Date *</label>
                  <input type="date" name="hire_date" value={formData.hire_date} onChange={handleChange} className="form-input" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300">Probation End Date</label>
                  <input type="date" name="probation_end_date" value={formData.probation_end_date} onChange={handleChange} className="form-input" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300">Employment Type</label>
                  <select name="employment_type" value={formData.employment_type} onChange={handleChange} className="form-input">
                    <option value="Full_Time">Full Time</option>
                    <option value="Part_Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                    <option value="Consultant">Consultant</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-semibold text-gray-200 border-b border-gray-700 pb-2 mb-6">Management Structure</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300 flex items-center gap-2"><span className="text-blue-400"><Users size={16} /></span> Direct Manager</label>
                  <select name="direct_manager_id" value={formData.direct_manager_id} onChange={handleChange} className="form-input">
                    <option value="">None / Self</option>
                    {managers.map(m => <option key={m.emp_id} value={m.emp_id}>{m.first_name} {m.last_name} ({m.employee_code})</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300">Skip Level Manager</label>
                  <select name="skip_level_manager_id" value={formData.skip_level_manager_id} onChange={handleChange} className="form-input">
                    <option value="">None</option>
                    {managers.map(m => <option key={m.emp_id} value={m.emp_id}>{m.first_name} {m.last_name}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-6 bg-[#0f172a] p-4 rounded-lg border border-[#334155]">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="is_people_manager"
                    name="is_people_manager"
                    checked={formData.is_people_manager}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                  />
                  <label htmlFor="is_people_manager" className="font-medium text-white cursor-pointer">This employee is a People Manager</label>
                </div>
                <p className="text-xs text-gray-500">
                  Enabling this will allow this employee to appear in the "Direct Manager" list for other employees.
                </p>
              </div>

              <div className="mt-8 p-4 border border-blue-500/30 bg-blue-900/10 rounded-lg">
                <h3 className="text-blue-400 font-bold mb-2">Summary Review</h3>
                <p className="text-sm text-gray-300">
                  Ready to onboard <strong>{formData.first_name} {formData.last_name}</strong> as
                  <strong> {formData.employment_type}</strong> employee in
                  <strong> {departments.find(d => d.department_id == formData.department_id)?.department_name || 'Unknown Dept'}</strong> department.
                </p>
              </div>
            </div>
          )}

          <div className="mt-auto pt-8 flex justify-between">
            {currentStep > 1 ? (
              <button onClick={handleBack} className="px-6 py-3 bg-[#334155] hover:bg-[#475569] text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
                <ChevronLeft size={18} /> Back
              </button>
            ) : (
              <button onClick={() => router.push('/employee')} className="px-6 py-3 text-gray-400 hover:text-white font-medium transition-colors">
                Cancel
              </button>
            )}

            {currentStep < 3 ? (
              <button onClick={handleNext} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20">
                Next Step <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(22,163,74,0.4)] hover:shadow-[0_0_30px_rgba(22,163,74,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Onboarding...' : 'Complete Onboarding'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
