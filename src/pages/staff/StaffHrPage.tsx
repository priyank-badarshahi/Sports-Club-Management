import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../../store';
import { 
  Users, 
  Calendar, 
  Clock, 
  DollarSign, 
  UserCheck, 
  Briefcase, 
  Plus, 
  Check, 
  X, 
  AlertTriangle, 
  Search, 
  Award, 
  Printer, 
  Send, 
  RefreshCw, 
  ShieldCheck, 
  FileText,
  ArrowRight,
  TrendingUp,
  Eye,
  EyeOff,
  Lock,
  Loader2,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { formatINR, formatDate, formatDateTime } from '../../lib/formatters';
import { validateShiftConflict, calculateEmployeePayroll } from '../../lib/hr';
import { Employee, Shift, Leave, Payroll, StaffAttendance, ShiftSwapRequest } from '../../types';
import { EmployeeDetailModal } from '../../components/EmployeeDetailModal';
import { PayslipModal } from '../../components/PayslipModal';
import { CoachBookingModal } from '../../components/CoachBookingModal';

export const StaffHrPage: React.FC = () => {
  const { 
    employees, 
    shifts, 
    swapRequests, 
    attendance, 
    leaves, 
    payroll, 
    courts,
    addEmployee, 
    updateEmployee, 
    deleteEmployee,
    addShift, 
    updateShift, 
    deleteShift, 
    requestShiftSwap, 
    decideShiftSwap,
    clockInAttendance, 
    clockOutAttendance,
    applyLeave, 
    decideLeave,
    runPayrollMonth, 
    markPayrollPaid,
    createCoachCourtBlock,
    syncEmployees,
    addToast
  } = useAppStore();

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    syncEmployees();
  }, [syncEmployees]);

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      await syncEmployees();
      addToast({
        type: 'success',
        title: 'HR Records Synchronized',
        message: 'Loaded real-time staff records from Supabase database.',
      });
    } catch (e) {
      addToast({
        type: 'error',
        title: 'Sync Failed',
        message: 'Could not fetch employee records from database.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'employees' | 'roster' | 'attendance' | 'leaves' | 'payroll' | 'coaches'>('employees');

  // Modals state
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<Employee | null>(null);
  const [selectedPayrollForSlip, setSelectedPayrollForSlip] = useState<Payroll | null>(null);
  const [showCoachBookingModal, setShowCoachBookingModal] = useState(false);

  // New Employee Modal state
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingEmployee, setIsSubmittingEmployee] = useState(false);
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    name: '',
    role: 'front_desk' as Employee['role'],
    department: 'Front Office' as Employee['department'],
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '1995-05-15',
    monthlySalary: 38000,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
  });

  const handleRoleChange = (role: Employee['role']) => {
    let department: Employee['department'] = 'Front Office';
    if (role === 'bar_staff') department = 'Food & Beverage';
    else if (role === 'shop_staff') department = 'Pro Shop & Retail';
    else if (role === 'manager') department = 'Management';
    else department = 'Front Office';

    setNewEmployeeForm((prev) => ({ ...prev, role, department }));
  };

  // Shift Assignment Modal
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [newShiftForm, setNewShiftForm] = useState({
    employeeId: employees[0]?.id || '',
    role: 'Duty Lead',
    department: 'Front Office' as Employee['department'],
    date: new Date().toISOString().split('T')[0],
    startTime: '06:00',
    endTime: '14:00',
    station: 'Main Gate',
  });

  // Shift Swap Request Modal
  const [showSwapModal, setShowSwapModal] = useState<Shift | null>(null);
  const [swapForm, setSwapForm] = useState({
    targetEmployeeId: '',
    reason: 'Personal engagement coverage',
  });

  // Apply Leave Modal
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    employeeId: employees[0]?.id || '',
    type: 'casual' as Leave['type'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: 'Family function in hometown',
  });

  // Selected Payroll Month
  const [selectedPayrollMonth, setSelectedPayrollMonth] = useState('October 2026');

  // Filter states
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeDeptFilter, setEmployeeDeptFilter] = useState('all');

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      if (employeeDeptFilter !== 'all' && e.department !== employeeDeptFilter) return false;
      if (employeeSearch) {
        const query = employeeSearch.toLowerCase();
        return e.name.toLowerCase().includes(query) || e.empId.toLowerCase().includes(query) || e.role.toLowerCase().includes(query);
      }
      return true;
    });
  }, [employees, employeeDeptFilter, employeeSearch]);

  // Coaches list
  const coaches = useMemo(() => {
    return employees.filter((e) => e.department === 'Sports & Coaching' || e.coachingProfile);
  }, [employees]);

  // Check conflicts for new shift form
  const shiftConflicts = useMemo(() => {
    if (!showAddShiftModal || !newShiftForm.employeeId) return [];
    const emp = employees.find((e) => e.id === newShiftForm.employeeId);
    if (!emp) return [];
    return validateShiftConflict(emp, newShiftForm, shifts);
  }, [showAddShiftModal, newShiftForm, employees, shifts]);

  // Handle Add Employee Submit
  const handleAddEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmployeeForm.name.trim() || !newEmployeeForm.email.trim() || !newEmployeeForm.phone.trim() || !newEmployeeForm.password || !newEmployeeForm.dob) {
      addToast({
        type: 'error',
        title: 'Fields Required',
        message: 'Full name, email, phone, date of birth, and password are required fields.',
      });
      return;
    }

    if (newEmployeeForm.password.length < 6) {
      addToast({
        type: 'error',
        title: 'Password Too Short',
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    if (newEmployeeForm.password !== newEmployeeForm.confirmPassword) {
      addToast({
        type: 'error',
        title: 'Password Mismatch',
        message: 'Passwords do not match.',
      });
      return;
    }

    try {
      setIsSubmittingEmployee(true);

      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEmployeeForm.name.trim(),
          email: newEmployeeForm.email.trim(),
          password: newEmployeeForm.password,
          role: newEmployeeForm.role,
          phone: newEmployeeForm.phone.trim(),
          department: newEmployeeForm.department,
          dob: newEmployeeForm.dob,
          monthlySalary: newEmployeeForm.monthlySalary,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast({
          type: 'error',
          title: 'Enrollment Error',
          message: data.error || 'Failed to create staff member account.',
        });
        return;
      }

      addEmployee({
        name: newEmployeeForm.name.trim(),
        role: newEmployeeForm.role,
        department: newEmployeeForm.department,
        phone: newEmployeeForm.phone.trim(),
        email: newEmployeeForm.email.trim(),
        avatar: newEmployeeForm.avatar,
        monthlySalary: newEmployeeForm.monthlySalary,
        salaryStructure: {
          baseSalary: newEmployeeForm.monthlySalary,
          hraAllowance: Math.round(newEmployeeForm.monthlySalary * 0.2),
          transportAllowance: 3000,
          specialAllowance: Math.round(newEmployeeForm.monthlySalary * 0.1),
          pfEligible: true,
          taxDeductionPercent: 5,
          bankAccount: 'HDFC-502000' + Math.floor(1000 + Math.random() * 9000),
          ifscCode: 'HDFC0000428',
        },
        documents: [],
        shiftPreference: { preferredShift: 'morning', maxWeeklyHours: 44, preferredOffDays: ['Sunday'] },
        leaveBalances: { casual: 12, sick: 10, annual: 15, emergency: 5, usedCasual: 0, usedSick: 0, usedAnnual: 0, usedEmergency: 0 },
        emergencyContact: { name: 'Emergency Family', relation: 'Family', phone: newEmployeeForm.phone.trim() },
        status: 'active',
      });

      // Synchronize with database
      await syncEmployees();

      addToast({
        type: 'success',
        title: 'Staff Member Enrolled!',
        message: `${newEmployeeForm.name} can now sign in using ${newEmployeeForm.email} as ${newEmployeeForm.role.replace('_', ' ').toUpperCase()}.`,
      });

      setShowAddEmployeeModal(false);
      setNewEmployeeForm({
        name: '',
        role: 'front_desk',
        department: 'Front Office',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        dob: '1995-05-15',
        monthlySalary: 38000,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      });
    } catch (err: any) {
      console.error('Failed to create employee:', err);
      addToast({
        type: 'error',
        title: 'Network Error',
        message: 'Could not connect to server to enroll employee.',
      });
    } finally {
      setIsSubmittingEmployee(false);
    }
  };

  // Handle Add Shift Submit
  const handleAddShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === newShiftForm.employeeId);
    if (!emp) return;

    addShift({
      employeeId: emp.id,
      employeeName: emp.name,
      role: newShiftForm.role,
      department: newShiftForm.department,
      date: newShiftForm.date,
      startTime: newShiftForm.startTime,
      endTime: newShiftForm.endTime,
      station: newShiftForm.station,
      status: 'scheduled',
      conflictWarning: shiftConflicts.length > 0 ? shiftConflicts.map((c) => c.message).join('; ') : undefined,
    });
    setShowAddShiftModal(false);
  };

  // Handle Shift Swap Request
  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSwapModal) return;

    const reqEmp = employees.find((e) => e.id === showSwapModal.employeeId);
    const targetEmp = employees.find((e) => e.id === swapForm.targetEmployeeId);
    if (!reqEmp || !targetEmp) return;

    requestShiftSwap({
      shiftId: showSwapModal.id,
      requestingEmployeeId: reqEmp.id,
      requestingEmployeeName: reqEmp.name,
      targetEmployeeId: targetEmp.id,
      targetEmployeeName: targetEmp.name,
      reason: swapForm.reason,
    });
    setShowSwapModal(null);
  };

  // Handle Leave Apply Submit
  const handleApplyLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === leaveForm.employeeId);
    if (!emp) return;

    const startMs = new Date(leaveForm.startDate).getTime();
    const endMs = new Date(leaveForm.endDate).getTime();
    const daysCount = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);

    applyLeave({
      employeeId: emp.id,
      employeeName: emp.name,
      type: leaveForm.type,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      daysCount,
      reason: leaveForm.reason,
    });
    setShowApplyLeaveModal(false);
  };

  // Filtered Payroll for Selected Month
  const monthPayrollList = useMemo(() => {
    return payroll.filter((p) => p.monthYear === selectedPayrollMonth);
  }, [payroll, selectedPayrollMonth]);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400">
            Staff & Workforce Operating Suite
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Human Resources, Rosters & Payroll
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Directory across 12 athletic coaches, front desk staff, baristas, kitchen crew & groundskeepers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddEmployeeModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            + New Employee
          </button>

          <button
            onClick={() => setShowAddShiftModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            + Assign Duty Shift
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Active Roster Size</span>
          <div className="font-heading font-extrabold text-2xl text-white">
            {employees.length} Staff
          </div>
          <div className="text-[11px] text-slate-500">
            {coaches.length} certified coaches on staff
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Scheduled Duty Shifts</span>
          <div className="font-heading font-extrabold text-2xl text-sky-400">
            {shifts.length} Shifts
          </div>
          <div className="text-[11px] text-slate-500">
            Shared in real-time with Bar module
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Pending Leave Requests</span>
          <div className="font-heading font-extrabold text-2xl text-amber-400">
            {leaves.filter((l) => l.status === 'pending').length} Requests
          </div>
          <div className="text-[11px] text-slate-500">
            Awaiting manager approval
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Monthly Payroll Disbursed</span>
          <div className="font-heading font-extrabold text-2xl text-emerald-400">
            {formatINR(payroll.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.netPay, 0))}
          </div>
          <div className="text-[11px] text-slate-500">
            Auto-posted to Finance ledger
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit overflow-x-auto max-w-full text-xs">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
            activeTab === 'employees' ? 'bg-lime-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Employee Directory ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
            activeTab === 'roster' ? 'bg-lime-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Weekly Shift Roster ({shifts.length})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
            activeTab === 'attendance' ? 'bg-lime-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Attendance & Punch Clock
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
            activeTab === 'leaves' ? 'bg-lime-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          4. Leave Management ({leaves.filter((l) => l.status === 'pending').length} pending)
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-4 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
            activeTab === 'payroll' ? 'bg-lime-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          5. Monthly Payroll Runner
        </button>
        <button
          onClick={() => setActiveTab('coaches')}
          className={`px-4 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
            activeTab === 'coaches' ? 'bg-lime-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          6. Certified Coaches ({coaches.length})
        </button>
      </div>

      {/* TAB 1: EMPLOYEE DIRECTORY */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search employee name or ID..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 w-52 sm:w-64 text-xs"
                />
              </div>

              <select
                value={employeeDeptFilter}
                onChange={(e) => setEmployeeDeptFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-lime-400"
              >
                <option value="all">All Departments</option>
                <option value="Sports & Coaching">Sports & Coaching</option>
                <option value="Front Office">Front Office</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Facilities & Grounds">Facilities & Grounds</option>
                <option value="Pro Shop & Retail">Pro Shop & Retail</option>
                <option value="Management">Management</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition disabled:opacity-60 border border-slate-700"
                title="Sync live records from Supabase database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-lime-400' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync DB'}</span>
              </button>

              <button
                onClick={() => setShowAddEmployeeModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                + Enroll Staff Member
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase">
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Department & Role</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4 text-right">Monthly Basic</th>
                    <th className="py-3.5 px-4">Shift Preference</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-9 h-9 rounded-xl object-cover bg-slate-950 shrink-0 border border-slate-700"
                          />
                          <div>
                            <div className="font-semibold text-white">{emp.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{emp.empId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{emp.department}</div>
                        <div className="text-[10px] text-lime-400 capitalize">{emp.role.replace('_', ' ')}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200">{emp.phone}</div>
                        <div className="text-[10px] text-slate-400">{emp.email}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white font-heading">
                        {formatINR(emp.monthlySalary)}
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-300">
                        {emp.shiftPreference?.preferredShift || 'Morning'} ({emp.shiftPreference?.maxWeeklyHours || 44}h/wk)
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedEmployeeForDetail(emp)}
                          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-medium transition"
                        >
                          Full Profile →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEEKLY SHIFT ROSTER & SWAP REQUESTS */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-heading font-bold text-sm text-white">Duty Roster & Shift Assignments</h3>
              <p className="text-slate-400 text-[11px]">Syncs automatically with Bar, Front Office & Kitchen modules.</p>
            </div>

            <button
              onClick={() => setShowAddShiftModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              + Schedule Shift
            </button>
          </div>

          {/* Swap Requests Queue */}
          {swapRequests.filter((s) => s.status === 'pending').length > 0 && (
            <div className="p-4 rounded-3xl bg-amber-950/40 border border-amber-800/60 text-xs space-y-3">
              <h4 className="font-heading font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Pending Shift Swap Requests ({swapRequests.filter((s) => s.status === 'pending').length})
              </h4>
              <div className="space-y-2">
                {swapRequests.filter((s) => s.status === 'pending').map((swap) => (
                  <div key={swap.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">
                        {swap.requestingEmployeeName} ⇄ {swap.targetEmployeeName}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{swap.reason}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decideShiftSwap(swap.id, 'approved', 'Manager Approved')}
                        className="px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-[11px] transition"
                      >
                        Approve Swap
                      </button>
                      <button
                        onClick={() => decideShiftSwap(swap.id, 'rejected', 'Roster Constraint')}
                        className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-[11px] transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Roster Grid */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase">
                    <th className="py-3.5 px-4">Duty Officer / Staff</th>
                    <th className="py-3.5 px-4">Department & Station</th>
                    <th className="py-3.5 px-4">Scheduled Hours</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Conflict Check</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {shifts.map((sh) => (
                    <tr key={sh.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-semibold text-white">
                        {sh.employeeName}
                        <span className="block text-[10px] text-slate-400 font-normal">{sh.role}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-lime-400 font-medium">{sh.department || 'Operations'}</span>
                        <div className="text-[10px] text-slate-400">{sh.station || 'Club Main'}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {sh.startTime} – {sh.endTime}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {formatDate(sh.date)}
                      </td>
                      <td className="py-3 px-4">
                        {sh.conflictWarning ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold">
                            ⚠️ {sh.conflictWarning}
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                            ✓ Clear
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setShowSwapModal(sh);
                              setSwapForm({
                                targetEmployeeId: employees.find((e) => e.id !== sh.employeeId)?.id || '',
                                reason: 'Shift swap request',
                              });
                            }}
                            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-[11px] font-semibold transition"
                          >
                            Swap Shift
                          </button>
                          <button
                            onClick={() => deleteShift(sh.id)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE & PUNCH CLOCK */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Punch Clock Station */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400 block">
                Real-Time Attendance Terminal
              </span>
              <h3 className="font-heading font-extrabold text-lg text-white mt-0.5">
                Front Office & Shift Punch Clock
              </h3>
              <p className="text-xs text-slate-400">Record duty entry and exit times for payroll integration.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => clockInAttendance(employees[0]?.id || 'emp_1', 'Shift Clock-In')}
                className="px-5 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-heading font-extrabold text-xs shadow-lg shadow-lime-400/20 transition"
              >
                ⏱️ Clock In Now
              </button>
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800">
              <h3 className="font-heading font-bold text-sm text-white">Daily Attendance & Punch Register</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase">
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Clock-In Time</th>
                    <th className="py-3.5 px-4">Clock-Out Time</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {attendance.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-semibold text-white">{att.employeeName}</td>
                      <td className="py-3 px-4 text-slate-300">{att.date}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400">{formatDateTime(att.clockIn)}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {att.clockOut ? formatDateTime(att.clockOut) : (
                          <button
                            onClick={() => clockOutAttendance(att.id)}
                            className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-[10px] font-bold hover:bg-rose-500/30 transition"
                          >
                            Clock Out →
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-white font-medium">
                        {att.durationHours ? `${att.durationHours} hrs` : 'In Progress'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {att.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LEAVE MANAGEMENT */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-heading font-bold text-sm text-white">Leave Applications & Approval Workflow</h3>
              <p className="text-slate-400 text-[11px]">Unpaid leaves automatically calculate salary adjustments on payroll.</p>
            </div>

            <button
              onClick={() => setShowApplyLeaveModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              + Apply for Leave
            </button>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase">
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Leave Type</th>
                    <th className="py-3.5 px-4">Duration & Dates</th>
                    <th className="py-3.5 px-4">Reason</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Manager Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leaves.map((lv) => (
                    <tr key={lv.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-semibold text-white">{lv.employeeName}</td>
                      <td className="py-3 px-4 capitalize font-bold text-lime-400">{lv.type} Leave</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{lv.daysCount || 1} Day(s)</div>
                        <div className="text-[10px] text-slate-400">{formatDate(lv.startDate)} to {formatDate(lv.endDate)}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs text-slate-300 truncate">{lv.reason}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          lv.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          lv.status === 'rejected' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {lv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {lv.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => decideLeave(lv.id, 'approved', 'Manager Approved')}
                              className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-[11px] transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => decideLeave(lv.id, 'rejected', 'Operational Coverage Requirements')}
                              className="px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-[11px] transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400">
                            By {lv.approvedBy || 'Manager'}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MONTHLY PAYROLL RUNNER */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400 block">
                Automated Salary Engine & Disbursal
              </span>
              <h3 className="font-heading font-extrabold text-lg text-white mt-0.5">
                Monthly Staff Payroll Run
              </h3>
              <p className="text-xs text-slate-400">Disbursing net salaries automatically posts salary expenses to Finance.</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedPayrollMonth}
                onChange={(e) => setSelectedPayrollMonth(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-lime-400"
              >
                <option value="September 2026">September 2026 (Completed)</option>
                <option value="October 2026">October 2026 (Current)</option>
              </select>

              <button
                onClick={() => runPayrollMonth(selectedPayrollMonth)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-heading font-extrabold text-xs shadow-md shadow-lime-400/20 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Run Payroll Calculation
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase">
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Gross Earnings</th>
                    <th className="py-3.5 px-4 text-right">PF & Tax</th>
                    <th className="py-3.5 px-4 text-right">Unpaid Leave Deduct</th>
                    <th className="py-3.5 px-4 text-right">Total Net Pay</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {monthPayrollList.map((pr) => (
                    <tr key={pr.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-semibold text-white">
                        {pr.employeeName}
                        <span className="block text-[10px] text-slate-400 font-normal">{pr.role || 'Staff'}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-white">{formatINR(pr.grossEarnings)}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">{formatINR((pr.pfDeduction || 0) + (pr.taxDeduction || 0))}</td>
                      <td className="py-3 px-4 text-right font-mono text-rose-400">{formatINR(pr.unpaidLeaveDeduction || 0)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-sm">{formatINR(pr.netPay)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          pr.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {pr.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedPayrollForSlip(pr)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition"
                            title="View & Print Official Payslip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {pr.status !== 'paid' && (
                            <button
                              onClick={() => markPayrollPaid(pr.id, 'bank_transfer')}
                              className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[11px] font-bold transition"
                            >
                              Disburse & Post
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CERTIFIED COACHES */}
      {activeTab === 'coaches' && (
        <div className="space-y-6">
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-white">Champions Club Coaching Faculty</h3>
              <p className="text-slate-400 text-[11px]">Schedule clinics directly onto the master court calendar.</p>
            </div>

            <button
              onClick={() => setShowCoachBookingModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              + Reserve Court Coach Block
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coaches.map((coach) => (
              <div key={coach.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={coach.avatar}
                    alt={coach.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <h4 className="font-heading font-extrabold text-base text-white">{coach.name}</h4>
                    <div className="text-xs text-lime-400 font-semibold">{coach.coachingProfile?.certification || coach.role}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">Rating: ⭐ {coach.coachingProfile?.rating || '4.9'}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-2">
                  "{coach.coachingProfile?.bio || 'High-performance racquet coach specializing in tactical positioning and matchplay.'}"
                </p>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Court Rate</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {formatINR(coach.coachingProfile?.hourlyRate || 2000)} / hr
                    </span>
                  </div>

                  <button
                    onClick={() => setShowCoachBookingModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition"
                  >
                    Reserve Clinic
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Employee Detail Modal */}
      {selectedEmployeeForDetail && (
        <EmployeeDetailModal
          employee={selectedEmployeeForDetail}
          onClose={() => setSelectedEmployeeForDetail(null)}
        />
      )}

      {/* MODAL 2: Payslip Modal */}
      {selectedPayrollForSlip && (
        <PayslipModal
          payroll={selectedPayrollForSlip}
          settings={{ clubName: 'Champions Club', address: 'Bangalore Athletic Complex', phone: '+91 80 4920 8800', email: 'hr@championsclub.in', gstNumber: '29ABCDE1234F1Z5', tagline: 'Elite Racquet Club', operatingHours: { weekdays: '06:00-23:00', weekends: '05:30-23:30' }, currencySymbol: '₹', defaultGstPercent: 18, allowGuestBookings: true, bookingCancellationWindowHours: 4, socialPlayNotification: true, gracePeriodDays: 7, dailyBookingCap: 2 }}
          onClose={() => setSelectedPayrollForSlip(null)}
        />
      )}

      {/* MODAL 3: Coach Clinic Booking Modal */}
      {showCoachBookingModal && (
        <CoachBookingModal
          coaches={coaches}
          courts={courts}
          onClose={() => setShowCoachBookingModal(false)}
          onSubmit={(coachId, courtId, date, startTime, endTime, topic) => {
            createCoachCourtBlock(coachId, courtId, date, startTime, endTime, topic);
          }}
        />
      )}

      {/* MODAL 4: Add Employee Modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-xs">
          <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-heading font-extrabold text-base text-white">Enroll New Staff Member</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Set up employee details and portal credentials with role-based access
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddEmployeeModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddEmployeeSubmit} className="p-6 overflow-y-auto space-y-4">
              {/* Credentials notice banner */}
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-lime-400/10 border border-lime-400/20 text-lime-300">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-lime-400" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-semibold text-white">Staff Login Credentials:</span> This employee can log in directly using this email & password. The system will automatically route them to their designated workplace module upon signing in.
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newEmployeeForm.name}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Staff Role *</label>
                  <select
                    value={newEmployeeForm.role}
                    onChange={(e) => handleRoleChange(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400 font-medium"
                  >
                    <option value="front_desk">Front Desk (Bookings & Check-in)</option>
                    <option value="bar_staff">Bar Staff (F&B / Bar Tab)</option>
                    <option value="shop_staff">Shop Staff (Pro Shop Retail)</option>
                    <option value="manager">Manager (Operations Dashboard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Department</label>
                  <select
                    value={newEmployeeForm.department}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, department: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400 font-medium"
                  >
                    <option value="Front Office">Front Office</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Pro Shop & Retail">Pro Shop & Retail</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
              </div>

              {/* Login Email & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Login Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="staff@championsclub.in"
                      value={newEmployeeForm.email}
                      onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={newEmployeeForm.phone}
                      onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                    />
                  </div>
                </div>
              </div>

              {/* Date of Birth & Monthly Basic Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Date of Birth *</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      required
                      value={newEmployeeForm.dob}
                      onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, dob: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Monthly Basic Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    min="10000"
                    value={newEmployeeForm.monthlySalary}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, monthlySalary: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold font-mono focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-400">Password *</label>
                    <span className="text-[10px] text-slate-500">Min 6 characters</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={newEmployeeForm.password}
                      onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, password: e.target.value })}
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={newEmployeeForm.confirmPassword}
                      onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, confirmPassword: e.target.value })}
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isSubmittingEmployee}
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEmployee}
                  className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-lime-400/20 disabled:opacity-60 transition"
                >
                  {isSubmittingEmployee ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Provisioning Credentials...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Enroll & Create Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Add Shift Modal */}
      {showAddShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-xs">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="font-heading font-extrabold text-base text-white">Assign Shift Duty</h3>

            <form onSubmit={handleAddShiftSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Select Employee *</label>
                <select
                  value={newShiftForm.employeeId}
                  onChange={(e) => setNewShiftForm({ ...newShiftForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.department} - {e.role.replace('_', ' ')})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Duty Designation *</label>
                  <input
                    type="text"
                    required
                    value={newShiftForm.role}
                    onChange={(e) => setNewShiftForm({ ...newShiftForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Station / Area</label>
                  <input
                    type="text"
                    required
                    value={newShiftForm.station}
                    onChange={(e) => setNewShiftForm({ ...newShiftForm, station: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newShiftForm.date}
                    onChange={(e) => setNewShiftForm({ ...newShiftForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newShiftForm.startTime}
                    onChange={(e) => setNewShiftForm({ ...newShiftForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={newShiftForm.endTime}
                    onChange={(e) => setNewShiftForm({ ...newShiftForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              {shiftConflicts.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Conflict Warning Detected:
                  </div>
                  {shiftConflicts.map((c, i) => (
                    <p key={i} className="text-[10px]">{c.message}</p>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddShiftModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold"
                >
                  Schedule Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Shift Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-xs">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="font-heading font-extrabold text-base text-white">Request Shift Swap</h3>
            <p className="text-slate-400">Swapping shift for <strong className="text-white">{showSwapModal.employeeName}</strong> ({showSwapModal.date} {showSwapModal.startTime}-{showSwapModal.endTime})</p>

            <form onSubmit={handleSwapSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Swap With Colleague *</label>
                <select
                  value={swapForm.targetEmployeeId}
                  onChange={(e) => setSwapForm({ ...swapForm, targetEmployeeId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-400"
                >
                  {employees.filter((e) => e.id !== showSwapModal.employeeId).map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.role.replace('_', ' ')})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Reason for Swap *</label>
                <input
                  type="text"
                  required
                  value={swapForm.reason}
                  onChange={(e) => setSwapForm({ ...swapForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-bold"
                >
                  Submit Swap Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: Apply Leave Modal */}
      {showApplyLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-xs">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="font-heading font-extrabold text-base text-white">Apply for Staff Leave</h3>

            <form onSubmit={handleApplyLeaveSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Select Employee *</label>
                <select
                  value={leaveForm.employeeId}
                  onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Leave Category</label>
                <select
                  value={leaveForm.type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400 capitalize"
                >
                  <option value="casual">Casual Leave (CL)</option>
                  <option value="sick">Sick Leave (SL)</option>
                  <option value="annual">Annual Privilege Leave (PL)</option>
                  <option value="emergency">Emergency Leave</option>
                  <option value="unpaid">Unpaid Leave (Auto Payroll Deduct)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Reason for Leave *</label>
                <input
                  type="text"
                  required
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowApplyLeaveModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
