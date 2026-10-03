import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { LeaveRequest, ShiftSwapRequest } from '../../types';
import {
  Briefcase,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  X,
  ArrowLeftRight,
  UserCheck,
  ShieldCheck,
  Search,
  Filter,
  Users,
} from 'lucide-react';

export const EmployeesAdmin: React.FC = () => {
  const {
    employees,
    leaves,
    submitLeave,
    updateLeaveStatus,
    shiftSwaps,
    submitShiftSwap,
    updateShiftSwapStatus,
    currentUser,
  } = useClub();

  const [activeTab, setActiveTab] = useState<'roster' | 'shifts' | 'leaves'>('roster');
  const [shiftFilter, setShiftFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [leaveFilter, setLeaveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [newLeaveModal, setNewLeaveModal] = useState(false);
  const [newShiftSwapModal, setNewShiftSwapModal] = useState(false);

  // Leave Form State
  const [leaveForm, setLeaveForm] = useState<{
    employeeId: string;
    employeeName: string;
    role: string;
    leaveType: LeaveRequest['leaveType'];
    startDate: string;
    endDate: string;
    reason: string;
  }>({
    employeeId: employees[0]?.id || 'emp_1',
    employeeName: employees[0]?.name || 'Raj Malhotra',
    role: employees[0]?.role || 'Front Desk',
    leaveType: 'Vacation',
    startDate: '2026-10-15',
    endDate: '2026-10-18',
    reason: 'Family event and personal rest.',
  });

  // Shift Swap Form State
  const defaultRequester = employees[1] || employees[0];
  const defaultTarget = employees.find((e) => e.id !== defaultRequester?.id) || employees[0];

  const [swapForm, setSwapForm] = useState({
    requesterId: defaultRequester?.id || 'emp_2',
    targetEmployeeId: defaultTarget?.id || 'emp_1',
    swapDate: new Date().toISOString().split('T')[0],
    reason: 'Attending family medical appointment; need morning shift.',
  });

  const selectedRequester = employees.find((e) => e.id === swapForm.requesterId) || employees[0];
  const selectedTarget = employees.find((e) => e.id === swapForm.targetEmployeeId) || employees[1];

  // Quick initiate swap from employee card
  const handleOpenSwapForEmployee = (employeeId: string) => {
    const requester = employees.find((e) => e.id === employeeId);
    const target = employees.find((e) => e.id !== employeeId) || employees[0];
    if (requester) {
      setSwapForm({
        requesterId: requester.id,
        targetEmployeeId: target.id,
        swapDate: new Date().toISOString().split('T')[0],
        reason: 'Shift swap requested due to personal schedule adjustment.',
      });
      setNewShiftSwapModal(true);
    }
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedEmployee = employees.find((emp) => emp.id === leaveForm.employeeId);
    submitLeave({
      employeeId: leaveForm.employeeId,
      employeeName: matchedEmployee ? matchedEmployee.name : leaveForm.employeeName,
      role: matchedEmployee ? matchedEmployee.role : leaveForm.role,
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason,
    });
    setNewLeaveModal(false);
    setActiveTab('leaves');
  };

  const handleShiftSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequester || !selectedTarget || selectedRequester.id === selectedTarget.id) {
      alert('Please select two distinct employees to swap shifts.');
      return;
    }

    submitShiftSwap({
      requesterId: selectedRequester.id,
      requesterName: selectedRequester.name,
      requesterShift: selectedRequester.shift,
      targetEmployeeId: selectedTarget.id,
      targetEmployeeName: selectedTarget.name,
      targetEmployeeShift: selectedTarget.shift,
      swapDate: swapForm.swapDate,
      reason: swapForm.reason,
    });

    setNewShiftSwapModal(false);
    setActiveTab('shifts');
  };

  // Filtered lists
  const pendingShiftCount = shiftSwaps.filter((s) => s.status === 'pending').length;
  const pendingLeaveCount = leaves.filter((l) => l.status === 'pending').length;

  const filteredShiftSwaps = shiftSwaps.filter((s) => {
    if (shiftFilter !== 'all' && s.status !== shiftFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        s.requesterName.toLowerCase().includes(q) ||
        s.targetEmployeeName.toLowerCase().includes(q) ||
        s.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredLeaves = leaves.filter((l) => {
    if (leaveFilter !== 'all' && l.status !== leaveFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        l.employeeName.toLowerCase().includes(q) ||
        l.role.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
            Human Resources & Club Operations
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Staff Shifts & Request Management
          </h1>
          <p className="text-xs text-slate-500">
            {employees.length} Active Staff Members · Front Desk, Pro Shop, Cafeteria, Coaching & Operations
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setNewShiftSwapModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 border border-slate-200 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
            <span>Request Shift Swap</span>
          </button>

          <button
            onClick={() => setNewLeaveModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Submit Leave Request</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('roster')}
          className={`py-2 px-4 font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'roster'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Staff Directory & Roster ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shifts')}
          className={`py-2 px-4 font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'shifts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Shift Requests</span>
          {pendingShiftCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-mono font-bold">
              {pendingShiftCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`py-2 px-4 font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'leaves'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Leave Management</span>
          {pendingLeaveCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold">
              {pendingLeaveCount} Pending
            </span>
          )}
        </button>
      </div>

      {/* TAB CONTENT: 1. ROSTER */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          {/* Shift Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs">
                      {emp.avatarInitials}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        emp.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {emp.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{emp.name}</h3>
                    <div className="text-[11px] font-mono text-blue-600 font-medium">
                      {emp.role} · {emp.department}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-semibold">Shift: {emp.shift}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{emp.phone}</div>
                    <div className="text-[10px] text-slate-400">{emp.email}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenSwapForEmployee(emp.id)}
                    className="w-full py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200/80 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ArrowLeftRight className="w-3 h-3 text-blue-600" />
                    <span>Swap Shift</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. SHIFT REQUESTS */}
      {activeTab === 'shifts' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Total Shift Swap Requests</div>
                <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                  {shiftSwaps.length}
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs text-amber-700 font-medium">Pending Manager Review</div>
                <div className="text-xl font-extrabold text-amber-600 font-mono mt-0.5">
                  {pendingShiftCount}
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs text-emerald-700 font-medium">Approved & Roster Synced</div>
                <div className="text-xl font-extrabold text-emerald-600 font-mono mt-0.5">
                  {shiftSwaps.filter((s) => s.status === 'approved').length}
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setShiftFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    shiftFilter === filter
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff, reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>
          </div>

          {/* Shift Requests Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Shift Requests & Approval Ledger</h3>
                <p className="text-xs text-slate-500">
                  Managerial shift exchange review. Approving a request dynamically updates active rosters for both staff members.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono uppercase text-slate-500">
                    <th className="py-3 px-4">Swap Date</th>
                    <th className="py-3 px-4">Requester & Shift</th>
                    <th className="py-3 px-4">Swap Partner & Shift</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Manager Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredShiftSwaps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                        No shift swap requests found matching current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredShiftSwaps.map((swap) => (
                      <tr key={swap.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{swap.swapDate}</div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            Sub: {new Date(swap.submittedAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-sans">
                          <div className="font-bold text-slate-900">{swap.requesterName}</div>
                          <div className="text-[11px] font-mono text-blue-600 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{swap.requesterShift}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-sans">
                          <div className="font-bold text-slate-900">{swap.targetEmployeeName}</div>
                          <div className="text-[11px] font-mono text-teal-600 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{swap.targetEmployeeShift}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-sans text-slate-600 max-w-xs">
                          <p className="line-clamp-2">{swap.reason}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          {swap.status === 'approved' ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                            </span>
                          ) : swap.status === 'pending' ? (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center gap-1 w-max">
                              <Clock className="w-3.5 h-3.5" /> Pending
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[11px] flex items-center gap-1 w-max">
                              <XCircle className="w-3.5 h-3.5" /> Rejected
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right font-sans">
                          {swap.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => updateShiftSwapStatus(swap.id, 'approved', currentUser.name || 'Club Manager')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-xs"
                                title="Approve Swap and Update Roster"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => updateShiftSwapStatus(swap.id, 'rejected', currentUser.name || 'Club Manager')}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors"
                                title="Reject Swap Request"
                              >
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400">
                              <span className="capitalize">{swap.status}</span>
                              {swap.reviewedBy && <span> by {swap.reviewedBy}</span>}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. LEAVE MANAGEMENT */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Total Leave Requests</div>
                <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                  {leaves.length}
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-rose-200 p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs text-rose-600 font-medium">Pending Manager Approvals</div>
                <div className="text-xl font-extrabold text-rose-600 font-mono mt-0.5">
                  {pendingLeaveCount}
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs text-emerald-700 font-medium">Currently on Approved Leave</div>
                <div className="text-xl font-extrabold text-emerald-600 font-mono mt-0.5">
                  {employees.filter((e) => e.status === 'on_leave').length}
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setLeaveFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    leaveFilter === filter
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff, reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>
          </div>

          {/* Leave Requests Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Leave Requests Ledger</h3>
                <p className="text-xs text-slate-500">
                  Managerial leave review. Approved leaves automatically reflect as 'on leave' on staff roster cards.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono uppercase text-slate-500">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                        No leave requests found matching current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">
                          {leave.employeeName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{leave.role}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{leave.leaveType}</td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {leave.startDate} – {leave.endDate}
                        </td>
                        <td className="py-3.5 px-4 font-sans text-slate-600 max-w-xs truncate">
                          {leave.reason}
                        </td>
                        <td className="py-3.5 px-4">
                          {leave.status === 'approved' ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                            </span>
                          ) : leave.status === 'pending' ? (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center gap-1 w-max">
                              <Clock className="w-3.5 h-3.5" /> Pending
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[11px] flex items-center gap-1 w-max">
                              <XCircle className="w-3.5 h-3.5" /> Rejected
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-sans">
                          {leave.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => updateLeaveStatus(leave.id, 'approved', currentUser.name || 'Club Manager')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => updateLeaveStatus(leave.id, 'rejected', currentUser.name || 'Club Manager')}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors"
                              >
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400">
                              <span className="capitalize">{leave.status}</span>
                              {leave.reviewedBy && <span> by {leave.reviewedBy}</span>}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: REQUEST SHIFT SWAP */}
      {newShiftSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-lg w-full p-6 relative">
            <button
              onClick={() => setNewShiftSwapModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleShiftSwapSubmit} className="space-y-4 text-xs">
              <div>
                <div className="text-xs font-mono uppercase text-blue-600 font-semibold flex items-center gap-1.5">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Employee Shift Exchange</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  Request Shift Swap
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Submit a bilateral shift exchange request. Shift swaps require managerial authorization before the roster updates.
                </p>
              </div>

              {/* Requester Employee */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Requester (You / Initiator)
                </label>
                <select
                  value={swapForm.requesterId}
                  onChange={(e) => setSwapForm({ ...swapForm, requesterId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-sans focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — Current Shift: {emp.shift} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Employee to Swap With */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Swap With Colleague (Target Employee)
                </label>
                <select
                  value={swapForm.targetEmployeeId}
                  onChange={(e) => setSwapForm({ ...swapForm, targetEmployeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-sans focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {employees
                    .filter((emp) => emp.id !== swapForm.requesterId)
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — Desired Shift: {emp.shift} ({emp.role})
                      </option>
                    ))}
                </select>
              </div>

              {/* Visual Shift Exchange Preview */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Proposed Shift Swap Preview:</div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{selectedRequester?.name}</div>
                    <div className="text-blue-600 text-[11px] font-semibold">
                      {selectedRequester?.shift}
                    </div>
                  </div>

                  <div className="px-2 py-1 rounded bg-slate-200 text-slate-700 flex items-center gap-1 font-sans text-[11px]">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
                    <span>Swap</span>
                  </div>

                  <div className="space-y-0.5 text-right">
                    <div className="font-bold text-slate-900">{selectedTarget?.name}</div>
                    <div className="text-teal-600 text-[11px] font-semibold">
                      {selectedTarget?.shift}
                    </div>
                  </div>
                </div>
              </div>

              {/* Swap Date */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Effective Swap Date
                </label>
                <input
                  type="date"
                  required
                  value={swapForm.swapDate}
                  onChange={(e) => setSwapForm({ ...swapForm, swapDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Shift Swap
                </label>
                <textarea
                  rows={2}
                  required
                  value={swapForm.reason}
                  onChange={(e) => setSwapForm({ ...swapForm, reason: e.target.value })}
                  placeholder="e.g. Schedule conflict, family commitment, tournament assistance..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewShiftSwapModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Submit Swap Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SUBMIT LEAVE REQUEST */}
      {newLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md w-full p-6 relative">
            <button
              onClick={() => setNewLeaveModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
              <div>
                <div className="text-xs font-mono uppercase text-blue-600 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Staff Request</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  Submit Leave Request
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Submit a planned absence request. Requires managerial authorization.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Employee
                </label>
                <select
                  value={leaveForm.employeeId}
                  onChange={(e) => {
                    const emp = employees.find((x) => x.id === e.target.value);
                    setLeaveForm({
                      ...leaveForm,
                      employeeId: e.target.value,
                      employeeName: emp ? emp.name : leaveForm.employeeName,
                      role: emp ? emp.role : leaveForm.role,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role} · {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Leave Type
                  </label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Vacation">Vacation</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department Role
                  </label>
                  <input
                    type="text"
                    required
                    value={leaveForm.role}
                    onChange={(e) => setLeaveForm({ ...leaveForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Leave
                </label>
                <textarea
                  rows={2}
                  required
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewLeaveModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
