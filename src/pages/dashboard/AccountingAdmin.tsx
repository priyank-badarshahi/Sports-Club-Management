import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { Transaction } from '../../types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calendar,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  FileSpreadsheet,
} from 'lucide-react';

export const AccountingAdmin: React.FC = () => {
  const { transactions } = useClub();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Compute breakdown
  const membershipIncome = transactions.filter((t) => t.source === 'Memberships').reduce((s, t) => s + t.amount, 0) + 65000;
  const courtsIncome = transactions.filter((t) => t.source === 'Courts').reduce((s, t) => s + t.amount, 0) + 14500;
  const shopIncome = transactions.filter((t) => t.source === 'Shop').reduce((s, t) => s + t.amount, 0) + 12800;
  const barIncome = transactions.filter((t) => t.source === 'Bar').reduce((s, t) => s + t.amount, 0) + 18400;

  const totalIncome = membershipIncome + courtsIncome + shopIncome + barIncome;

  // Expenses baseline
  const staffExpense = 32000;
  const inventoryExpense = 18500;
  const operationsExpense = 14200;
  const utilitiesExpense = 9800;
  const totalExpenses = staffExpense + inventoryExpense + operationsExpense + utilitiesExpense;

  const netRevenue = totalIncome - totalExpenses;

  const filteredTransactions = transactions.filter((t) => {
    if (sourceFilter !== 'All' && t.source !== sourceFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        t.customerName.toLowerCase().includes(q) ||
        t.txCode.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
            Club Financial Controller
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Accounting & Payment Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Real-time income aggregation, operational overhead ledger & multi-gateway payments
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium">
          {(['today', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
        {/* Total Income */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 uppercase">
            <span>Total Gross Income</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            ₹{totalIncome.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 font-sans font-medium">
            Courts + Pro Shop + Bar + Memberships
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 uppercase">
            <span>Total Overhead Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-rose-600 font-sans font-medium">
            Staff + Stock Purchases + Maintenance
          </div>
        </div>

        {/* Net Revenue */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 uppercase">
            <span>Net Operating Margin</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">
            ₹{netRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 font-sans">
            Operating Net Margin: {((netRevenue / totalIncome) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Income & Expense Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income by Stream */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Income by Operating Stream</h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-sans font-medium text-slate-700">Memberships (Gold, Silver, Junior)</span>
              <span className="font-bold text-slate-900">₹{membershipIncome.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-sans font-medium text-slate-700">Court Bookings & Guest Slots</span>
              <span className="font-bold text-slate-900">₹{courtsIncome.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-sans font-medium text-slate-700">Pro Shop Apparel & Gear</span>
              <span className="font-bold text-slate-900">₹{shopIncome.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-sans font-medium text-slate-700">Bar & Cafeteria Tables</span>
              <span className="font-bold text-slate-900">₹{barIncome.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Operating Expenses Ledger</h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-sans font-medium text-slate-700">Staff Payroll & Coaching Wages</span>
              <span className="font-bold text-rose-600">₹{staffExpense.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-sans font-medium text-slate-700">Inventory Wholesale Reorders</span>
              <span className="font-bold text-rose-600">₹{inventoryExpense.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-sans font-medium text-slate-700">Court Maintenance & Glass Cleans</span>
              <span className="font-bold text-rose-600">₹{operationsExpense.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-sans font-medium text-slate-700">Floodlights Electricity & Utilities</span>
              <span className="font-bold text-rose-600">₹{utilitiesExpense.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Payment History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Transactions Audit Ledger</h3>
            <p className="text-xs text-slate-500">All gateway payments with reconciliation statuses</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Sources</option>
              <option value="Courts">Courts</option>
              <option value="Shop">Pro Shop</option>
              <option value="Bar">Bar & Cafe</option>
              <option value="Memberships">Memberships</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono uppercase text-slate-500">
                <th className="py-3 px-4">Transaction Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{tx.txCode}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                    {tx.customerName}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                        tx.source === 'Courts'
                          ? 'bg-blue-100 text-blue-800'
                          : tx.source === 'Shop'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.source === 'Bar'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {tx.source}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{tx.date}</td>
                  <td className="py-3 px-4 text-slate-600">{tx.paymentMethod}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-emerald-700 font-semibold text-[11px]">
                      ● Paid
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
