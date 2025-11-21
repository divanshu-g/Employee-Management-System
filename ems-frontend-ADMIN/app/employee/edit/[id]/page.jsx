'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthorizedFetch } from '@/app/hooks/useAuthorizedFetch';
import {
  User, Briefcase, CheckCircle, ChevronRight, ChevronLeft,
  Building2, MapPin, Calendar, Mail, Phone, Hash, Users, Save, Trash2
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const employeeCode = decodeURIComponent(params.id);
  const { data: session, status } = useSession();
  const { authorizedFetch } = useAuthorizedFetch();

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [managers, setManagers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
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
    confirmation_date: '',
    termination_date: '',

    direct_manager_id: '',
    skip_level_manager_id: '',
    is_people_manager: false,
    employment_status: 'Active',
  });

  useEffect(() => {
    if (session?.accessToken && employeeCode) {
      Promise.all([fetchDropdowns(), fetchEmployeeDetails()]).finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, employeeCode]);

  async function fetchDropdowns() {
    try {
      const [deptRes, posRes, empRes] = await Promise.all([
        authorizedFetch(`${API_URL}/api/department`),
        authorizedFetch(`${API_URL}/api/position`),
        authorizedFetch(`${API_URL}/api/employee`),
      ]);
      setDepartments(deptRes.departments || []);
      setPositions(posRes.positions || []);
      setManagers(empRes.employees || []);
    } catch (err) {
      console.error("Error fetching dropdowns", err);
    }
  }

  async function fetchEmployeeDetails() {
    try {
      const data = await authorizedFetch(`${API_URL}/api/employee/code/${employeeCode}`);
      const emp = data.employee || data;

      if (!emp) throw new Error("Employee not found");

      const addr = emp.address || {};
      const ec = emp.emergency_contact || {};

      const toInputDate = (isoStr) => {
        if (!isoStr) return '';
        // create input-friendly YYYY-MM-DD
        return new Date(isoStr).toISOString().split('T')[0];
      };

      setFormData({
        first_name: emp.first_name || '',
        last_name: emp.last_name || '',
        personal_email: emp.personal_email || '',
        phone_number: emp.phone_number || '',
        date_of_birth: toInputDate(emp.date_of_birth),
        gender: emp.gender || '',

        address_street: addr.street || '',
        address_city: addr.city || '',
        address_country: addr.country || '',

        ec_name: ec.name || '',
        ec_phone: ec.phone || '',

        employee_code: emp.employee_code || '',
        department_id: emp.department_id || '',
        position_id: emp.position_id || '',
        employment_type: emp.employment_type || 'Full_Time',
        work_location: emp.work_location || 'Office',
        hire_date: toInputDate(emp.hire_date),
        probation_end_date: toInputDate(emp.probation_end_date),
        confirmation_date: toInputDate(emp.confirmation_date),
        termination_date: toInputDate(emp.termination_date),

        direct_manager_id: emp.direct_manager_id || '',
        skip_level_manager_id: emp.skip_level_manager_id || '',
        is_people_manager: !!emp.is_people_manager,
        employment_status: emp.employment_status || 'Active',
      });
    } catch (err) {
      setError(err.message || "Failed to load employee details");
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatDateForBackend = (dateStr) => {
    if (!dateStr) return null;
    return `${dateStr}T00:00:00.000Z`;
  };

  const parseIntSafe = (val) => {
    if (val === undefined || val === null || val === '') return null;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (!formData.hire_date) {
      setError("Hire Date is required.");
      setSaving(false);
      return;
    }

    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      personal_email: formData.personal_email,
      phone_number: formData.phone_number,

      date_of_birth: formatDateForBackend(formData.date_of_birth),
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

      employment_type: formData.employment_type || null,
      work_location: formData.work_location || null,

      hire_date: formatDateForBackend(formData.hire_date),
      probation_end_date: formatDateForBackend(formData.probation_end_date),
      confirmation_date: formatDateForBackend(formData.confirmation_date),
      termination_date: formatDateForBackend(formData.termination_date),

      direct_manager_id: parseIntSafe(formData.direct_manager_id),
      skip_level_manager_id: parseIntSafe(formData.skip_level_manager_id),

      is_people_manager: !!formData.is_people_manager,
      employment_status: formData.employment_status || null,
    };

    console.log('Update payload:', payload);

    try {
      await authorizedFetch(`${API_URL}/api/employee/${employeeCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setSuccess('Employee updated successfully!');
      setTimeout(() => router.push('/employee'), 1200);
    } catch (err) {
      console.error('Update employee error:', err);
      setError(err.message || 'Failed to update employee.');
    } finally {
      setSaving(false);
    }
  };

  const handleTerminate = async () => {
    if (!confirm("Are you sure you want to terminate this employee? This will set their status to 'Terminated'.")) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        personal_email: formData.personal_email,
        phone_number: formData.phone_number,
        date_of_birth: formatDateForBackend(formData.date_of_birth),
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
        employment_type: formData.employment_type || null,
        work_location: formData.work_location || null,
        hire_date: formatDateForBackend(formData.hire_date),
        probation_end_date: formatDateForBackend(formData.probation_end_date),
        direct_manager_id: parseIntSafe(formData.direct_manager_id),
        skip_level_manager_id: parseIntSafe(formData.skip_level_manager_id),
        is_people_manager: !!formData.is_people_manager,

        employment_status: 'Terminated',
        termination_date: new Date().toISOString()
      };

      console.log('Terminate payload:', payload);

      await authorizedFetch(`${API_URL}/api/employee/${employeeCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setSuccess('Employee terminated.');
      setTimeout(() => router.push('/employee'), 1200);
    } catch (err) {
      console.error('Terminate error:', err);
      setError(err.message || 'Failed to terminate employee.');
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-gray-400">Loading employee profile...</div>;
  if (status === 'unauthenticated') { router.replace('/signin'); return null; }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 flex justify-center">
      <div className="w-full max-w-6xl">

        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-700">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Edit Employee</h1>
            <p className="text-gray-400 mt-1 text-sm">Update profile for {formData.first_name} {formData.last_name} ({employeeCode})</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push('/employee')} className="bg-[#334155] hover:bg-[#475569] text-white px-4 py-2 rounded-lg font-medium transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 disabled:opacity-50"><Save size={18} /> Save Changes</button>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-900/20 border border-red-600/50 rounded-lg text-red-200 font-medium">⚠️ {error}</div>}
        {success && <div className="mb-6 p-4 bg-green-900/20 border border-green-600/50 rounded-lg text-green-200 font-medium">✅ {success}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <Section title="Personal Info" icon={<User size={18} />}>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="First Name"><input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="form-input" /></FormGroup>
                <FormGroup label="Last Name"><input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="form-input" /></FormGroup>
              </div>
              <FormGroup label="Email"><input type="email" name="personal_email" value={formData.personal_email} onChange={handleChange} className="form-input" /></FormGroup>
              <FormGroup label="Phone"><input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="form-input" /></FormGroup>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="DOB"><input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="form-input" /></FormGroup>
                <FormGroup label="Gender">
                  <select name="gender" value={formData.gender} onChange={handleChange} className="form-input">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </FormGroup>
              </div>
            </Section>

            <Section title="Address" icon={<MapPin size={18} />}>
              <FormGroup label="Street"><input type="text" name="address_street" value={formData.address_street} onChange={handleChange} className="form-input" /></FormGroup>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="City"><input type="text" name="address_city" value={formData.address_city} onChange={handleChange} className="form-input" /></FormGroup>
                <FormGroup label="Country"><input type="text" name="address_country" value={formData.address_country} onChange={handleChange} className="form-input" /></FormGroup>
              </div>
            </Section>
          </div>

          <div className="space-y-6">
            <Section title="Job Details" icon={<Briefcase size={18} />}>
              <FormGroup label="Department">
                <select name="department_id" value={formData.department_id} onChange={handleChange} className="form-input">
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
                </select>
              </FormGroup>

              <FormGroup label="Position">
                <select name="position_id" value={formData.position_id} onChange={handleChange} className="form-input">
                  <option value="">Select Position</option>
                  {positions.map(p => <option key={p.position_id} value={p.position_id}>{p.position_title}</option>)}
                </select>
              </FormGroup>

              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Type">
                  <select name="employment_type" value={formData.employment_type} onChange={handleChange} className="form-input">
                    <option value="Full_Time">Full Time</option>
                    <option value="Part_Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                    <option value="Consultant">Consultant</option>
                  </select>
                </FormGroup>

                <FormGroup label="Location">
                  <select name="work_location" value={formData.work_location} onChange={handleChange} className="form-input">
                    <option value="Office">Office</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </FormGroup>
              </div>
            </Section>

            <Section title="Important Dates" icon={<Calendar size={18} />}>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Hire Date"><input type="date" name="hire_date" value={formData.hire_date} onChange={handleChange} className="form-input" /></FormGroup>
                <FormGroup label="Probation End"><input type="date" name="probation_end_date" value={formData.probation_end_date} onChange={handleChange} className="form-input" /></FormGroup>
                <FormGroup label="Confirmation"><input type="date" name="confirmation_date" value={formData.confirmation_date} onChange={handleChange} className="form-input" /></FormGroup>
                <FormGroup label="Termination"><input type="date" name="termination_date" value={formData.termination_date} onChange={handleChange} className="form-input" /></FormGroup>
              </div>
            </Section>
          </div>

          <div className="space-y-6">
            <Section title="Management" icon={<Users size={18} />}>
              <FormGroup label="Direct Manager">
                <select name="direct_manager_id" value={formData.direct_manager_id} onChange={handleChange} className="form-input">
                  <option value="">None</option>
                  {managers.map(m => <option key={m.emp_id} value={m.emp_id}>{m.first_name} {m.last_name}</option>)}
                </select>
              </FormGroup>

              <FormGroup label="Skip Level">
                <select name="skip_level_manager_id" value={formData.skip_level_manager_id} onChange={handleChange} className="form-input">
                  <option value="">None</option>
                  {managers.map(m => <option key={m.emp_id} value={m.emp_id}>{m.first_name} {m.last_name}</option>)}
                </select>
              </FormGroup>

              <div className="flex items-center gap-3 mt-4 p-3 bg-[#0f172a] rounded border border-[#334155]">
                <input type="checkbox" name="is_people_manager" checked={formData.is_people_manager} onChange={handleChange} className="w-4 h-4" />
                <label className="text-sm text-gray-300">Is People Manager?</label>
              </div>
            </Section>

            <Section title="Status & Actions" className="border-red-900/30 bg-red-900/5">
              <FormGroup label="Employment Status">
                <select name="employment_status" value={formData.employment_status} onChange={handleChange} className="form-input">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Terminated">Terminated</option>
                  <option value="On_Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </FormGroup>

              <div className="mt-6 pt-4 border-t border-red-900/30">
                <button type="button" onClick={handleTerminate} className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-800/50 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"><Trash2 size={18} /> Terminate / Deactivate</button>
                <p className="text-xs text-red-400/60 mt-2 text-center">This sets status to 'Terminated' and records today as termination date.</p>
              </div>
            </Section>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper components
function Section({ title, icon, children, className = '' }) {
  return (
    <div className={`bg-[#1e293b] border border-[#334155] rounded-xl p-6 shadow-lg ${className}`}>
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#334155]">
        {icon && <span className="text-blue-400">{icon}</span>}
        <h3 className="font-bold text-lg text-gray-200">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
