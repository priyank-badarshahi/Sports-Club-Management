import React from 'react';
import { Payroll, ClubSettings } from '../types';
import { formatINR, formatDate } from '../lib/formatters';
import { Printer, X, ShieldCheck, Download } from 'lucide-react';

interface PayslipModalProps {
  payroll: Payroll;
  settings: ClubSettings;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  payroll,
  settings,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header Action Bar (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-lime-400">
              PAYSLIP • {payroll.monthYear.toUpperCase()}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {payroll.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-200 print:text-black print:bg-white text-xs sm:text-sm">
          {/* Company Branding & Title */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800 print:border-gray-300">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-white print:text-black">
                {settings.clubName}
              </h2>
              <p className="text-[11px] text-slate-400 print:text-gray-600">
                {settings.address}
              </p>
              <p className="text-[11px] font-mono text-slate-400 print:text-gray-600 mt-0.5">
                GSTIN: {settings.gstNumber}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400 print:text-gray-800 block">
                SALARY PAYSLIP
              </span>
              <div className="font-mono font-bold text-base text-white print:text-black mt-0.5">
                {payroll.monthYear}
              </div>
              {payroll.paidOn && (
                <div className="text-[11px] text-slate-400 print:text-gray-600">
                  Disbursed: {formatDate(payroll.paidOn)}
                </div>
              )}
            </div>
          </div>

          {/* Employee Metadata */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 print:bg-gray-50 print:border-gray-200">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 print:text-gray-500 block mb-0.5">
                Employee Information
              </span>
              <h4 className="font-heading font-bold text-sm text-white print:text-black">
                {payroll.employeeName}
              </h4>
              <p className="text-[11px] text-slate-400 print:text-gray-600">{payroll.role || 'Staff Member'} • {payroll.department || 'Operations'}</p>
            </div>

            <div className="text-right space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 print:text-gray-500 block mb-0.5">
                Disbursement Account
              </span>
              <p className="font-mono font-semibold text-white print:text-black">{payroll.bankAccount || 'Direct Bank Wire'}</p>
              <p className="text-[11px] text-slate-400 print:text-gray-600">Mode: {payroll.paymentMethod?.toUpperCase().replace('_', ' ') || 'BANK TRANSFER'}</p>
            </div>
          </div>

          {/* Earnings vs Deductions Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 print:bg-gray-50 print:border-gray-200 space-y-2">
              <span className="text-[11px] font-bold uppercase text-lime-400 print:text-black block pb-1 border-b border-slate-800 print:border-gray-300">
                A. Earnings (Gross CTC)
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-600">Basic Pay:</span>
                  <span className="font-mono text-white print:text-black">{formatINR(payroll.baseSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-600">HRA Allowance:</span>
                  <span className="font-mono text-white print:text-black">{formatINR(payroll.hraAllowance || Math.round(payroll.baseSalary * 0.2))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-600">Special Allowances:</span>
                  <span className="font-mono text-white print:text-black">{formatINR(payroll.specialAllowance || Math.round(payroll.baseSalary * 0.1))}</span>
                </div>
                {payroll.overtimeBonus > 0 && (
                  <div className="flex justify-between text-emerald-400 print:text-black font-medium">
                    <span>Overtime Bonus ({payroll.overtimeHours}h):</span>
                    <span className="font-mono">{formatINR(payroll.overtimeBonus)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-800 print:border-gray-300 font-bold text-white print:text-black">
                  <span>Gross Earnings:</span>
                  <span className="font-mono">{formatINR(payroll.grossEarnings || (payroll.baseSalary + (payroll.hraAllowance || 0) + (payroll.specialAllowance || 0) + (payroll.overtimeBonus || 0)))}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 print:bg-gray-50 print:border-gray-200 space-y-2">
              <span className="text-[11px] font-bold uppercase text-rose-400 print:text-black block pb-1 border-b border-slate-800 print:border-gray-300">
                B. Statutory & Leave Deductions
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-600">Provident Fund (PF 12%):</span>
                  <span className="font-mono text-slate-300 print:text-black">{formatINR(payroll.pfDeduction || Math.round(payroll.baseSalary * 0.12))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-600">Professional Income Tax:</span>
                  <span className="font-mono text-slate-300 print:text-black">{formatINR(payroll.taxDeduction || 200)}</span>
                </div>
                {payroll.unpaidLeaveDays > 0 && (
                  <div className="flex justify-between text-rose-400 print:text-black font-medium">
                    <span>Unpaid Leave ({payroll.unpaidLeaveDays} days):</span>
                    <span className="font-mono">- {formatINR(payroll.unpaidLeaveDeduction)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-800 print:border-gray-300 font-bold text-rose-400 print:text-black">
                  <span>Total Deductions:</span>
                  <span className="font-mono">{formatINR(payroll.totalDeductions || ((payroll.pfDeduction || 0) + (payroll.taxDeduction || 0) + (payroll.unpaidLeaveDeduction || 0)))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay Box */}
          <div className="p-5 rounded-2xl bg-slate-950 border-2 border-lime-400/40 print:bg-gray-100 print:border-black flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 print:text-gray-600 block">
                Net Salary Disbursed into Bank Account
              </span>
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-lime-400 print:text-black mt-0.5">
                {formatINR(payroll.netPay)}
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-400 print:text-gray-600">
              <span className="text-emerald-400 print:text-black font-bold uppercase block">CONFIRMED PAID</span>
              <span>Ref: {payroll.expenseIdPosted || 'PAYROLL-DISBURSED'}</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-800 print:border-gray-300 flex items-center justify-between text-[10px] text-slate-400 print:text-gray-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-lime-400 print:text-black" />
              <span>Computer generated payslip. No physical signature required.</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-200 print:text-black">For {settings.clubName}</div>
              <span>HR & Finance Controller</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
