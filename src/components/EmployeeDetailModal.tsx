import React, { useState } from 'react';
import { Employee, EmployeeDocument } from '../types';
import { formatINR, formatDate } from '../lib/formatters';
import { 
  User, 
  Phone, 
  Mail, 
  Briefcase, 
  DollarSign, 
  FileText, 
  Clock, 
  Calendar, 
  Award, 
  ShieldCheck, 
  X, 
  Plus, 
  Download, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface EmployeeDetailModalProps {
  employee: Employee;
  onClose: () => void;
  onUpdateSalary?: (employeeId: string, baseSalary: number) => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'salary' | 'documents' | 'shift_pref' | 'leaves' | 'coaching'>('profile');

  const sal = employee.salaryStructure || {
    baseSalary: employee.monthlySalary,
    hraAllowance: Math.round(employee.monthlySalary * 0.2),
    transportAllowance: 3000,
    specialAllowance: Math.round(employee.monthlySalary * 0.1),
    pfEligible: true,
    taxDeductionPercent: 5,
    bankAccount: 'HDFC-502000' + employee.empId.slice(-4),
    ifscCode: 'HDFC0000428',
  };

  const grossEarnings = sal.baseSalary + sal.hraAllowance + sal.transportAllowance + sal.specialAllowance;
  const pf = sal.pfEligible ? Math.round(sal.baseSalary * 0.12) : 0;
  const tax = Math.round(grossEarnings * (sal.taxDeductionPercent / 100));
  const netTakeHome = grossEarnings - pf - tax;

  const leave = employee.leaveBalances || {
    casual: 12, sick: 10, annual: 15, emergency: 5,
    usedCasual: 2, usedSick: 1, usedAnnual: 2, usedEmergency: 0
  };

  const pref = employee.shiftPreference || {
    preferredShift: 'morning',
    maxWeeklyHours: 44,
    preferredOffDays: ['Sunday']
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-lg text-white">
                  {employee.name}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30">
                  {employee.empId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                <span className="text-slate-200 capitalize font-medium">{employee.role.replace('_', ' ')}</span> • {employee.department}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-950/60 border-b border-slate-800 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
              activeTab === 'profile' ? 'bg-lime-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('salary')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
              activeTab === 'salary' ? 'bg-lime-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Salary Structure
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
              activeTab === 'documents' ? 'bg-lime-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Documents ({employee.documents?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('shift_pref')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
              activeTab === 'shift_pref' ? 'bg-lime-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Shift Preference
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
              activeTab === 'leaves' ? 'bg-lime-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Leave Balances
          </button>
          {employee.coachingProfile && (
            <button
              onClick={() => setActiveTab('coaching')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                activeTab === 'coaching' ? 'bg-lime-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Coaching Profile
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Phone Contact</span>
                  <div className="font-semibold text-white">{employee.phone}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Email Address</span>
                  <div className="font-semibold text-white truncate">{employee.email}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Join Date</span>
                  <div className="font-semibold text-white">{formatDate(employee.joinDate)}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Emergency Contact</span>
                  <div className="font-semibold text-white">{employee.emergencyContact?.name || 'On File'}</div>
                  <div className="text-[10px] text-slate-400">{employee.emergencyContact?.relation} • {employee.emergencyContact?.phone}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Monthly Total CTC</span>
                  <div className="font-heading font-extrabold text-xl text-lime-400 mt-0.5">
                    {formatINR(grossEarnings)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Roster Status</span>
                  <span className="inline-block mt-0.5 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {employee.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'salary' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-heading font-bold text-sm text-white">Monthly Salary Breakdown & Bank Details</h4>
                <div className="divide-y divide-slate-800/80">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Basic Pay:</span>
                    <span className="font-mono font-bold text-white">{formatINR(sal.baseSalary)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">HRA Allowance (20%):</span>
                    <span className="font-mono text-slate-300">{formatINR(sal.hraAllowance)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Transport & Special Allowance:</span>
                    <span className="font-mono text-slate-300">{formatINR(sal.transportAllowance + sal.specialAllowance)}</span>
                  </div>
                  <div className="py-2 flex justify-between font-bold text-lime-400">
                    <span>Gross Monthly Salary:</span>
                    <span className="font-mono">{formatINR(grossEarnings)}</span>
                  </div>
                  <div className="py-2 flex justify-between text-rose-400">
                    <span>Est. PF (12%) & Tax Deductions:</span>
                    <span className="font-mono">- {formatINR(pf + tax)}</span>
                  </div>
                  <div className="py-2.5 flex justify-between font-heading font-extrabold text-sm text-emerald-400">
                    <span>Net Take-Home Pay:</span>
                    <span className="font-mono">{formatINR(netTakeHome)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Banking Information</span>
                <p className="text-slate-200 font-mono">A/C: {sal.bankAccount} • IFSC: {sal.ifscCode}</p>
                {sal.panNumber && <p className="text-[10px] text-slate-400 font-mono">PAN: {sal.panNumber}</p>}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-heading font-bold text-sm text-white">Employee Verified Documents</h4>
                <span className="text-[10px] text-slate-400">{employee.documents?.length || 0} uploaded</span>
              </div>

              {employee.documents && employee.documents.length > 0 ? (
                <div className="space-y-2">
                  {employee.documents.map((doc) => (
                    <div key={doc.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-lime-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-white">{doc.name}</div>
                          <div className="text-[10px] text-slate-500 capitalize">{doc.type} • Uploaded {formatDate(doc.uploadedAt)}</div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold uppercase">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic text-center py-4">No custom documents uploaded yet.</p>
              )}
            </div>
          )}

          {activeTab === 'shift_pref' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="font-heading font-bold text-sm text-white">Shift Preferences & Duty Constraints</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Preferred Shift Window</span>
                  <div className="font-semibold text-white capitalize mt-0.5">{pref.preferredShift} Shift</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Max Weekly Hours Cap</span>
                  <div className="font-semibold text-white font-mono mt-0.5">{pref.maxWeeklyHours} Hours / Week</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Preferred Days Off</span>
                <div className="font-semibold text-lime-400 mt-0.5">{pref.preferredOffDays.join(', ')}</div>
              </div>
            </div>
          )}

          {activeTab === 'leaves' && (
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-sm text-white">Annual Leave Balances & Consumption</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Casual Leave</span>
                  <div className="font-heading font-bold text-base text-white">{leave.casual - leave.usedCasual} remaining</div>
                  <div className="text-[10px] text-slate-500">Used: {leave.usedCasual} of {leave.casual}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Sick Leave</span>
                  <div className="font-heading font-bold text-base text-white">{leave.sick - leave.usedSick} remaining</div>
                  <div className="text-[10px] text-slate-500">Used: {leave.usedSick} of {leave.sick}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Annual Privilege</span>
                  <div className="font-heading font-bold text-base text-white">{leave.annual - leave.usedAnnual} remaining</div>
                  <div className="text-[10px] text-slate-500">Used: {leave.usedAnnual} of {leave.annual}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Emergency</span>
                  <div className="font-heading font-bold text-base text-white">{leave.emergency - leave.usedEmergency} remaining</div>
                  <div className="text-[10px] text-slate-500">Used: {leave.usedEmergency} of {leave.emergency}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'coaching' && employee.coachingProfile && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-sm text-white">Coaching Credentials & Court Rates</h4>
                <span className="font-mono font-bold text-lime-400 text-sm">{formatINR(employee.coachingProfile.hourlyRate)} / hour</span>
              </div>
              <p className="text-slate-300 italic">{employee.coachingProfile.bio}</p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Sports Specialty</span>
                  <span className="font-semibold text-white uppercase">{employee.coachingProfile.sports.join(', ')}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Certification</span>
                  <span className="font-semibold text-white">{employee.coachingProfile.certification}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
