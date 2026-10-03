import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import {
  Users,
  CalendarCheck,
  DollarSign,
  ShoppingBag,
  Coffee,
  TrendingUp,
  Activity,
  ArrowUpRight,
  UserCheck,
  CreditCard,
  Grid,
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { members, bookings, products, transactions, courts, setCurrentView } = useClub();
  const [revenuePeriod, setRevenuePeriod] = useState<'today' | 'week' | 'month'>('today');

  // Compute live KPIs
  const activeMembersCount = members.filter((m) => m.status === 'active').length + 1170; // baseline + dynamic
  const totalMembersCount = members.length + 1235;

  const today = new Date().toISOString().split('T')[0];
  const todayBookingsCount = bookings.filter((b) => b.date === today && b.status !== 'cancelled').length + 42;

  // Compute revenue breakdown dynamically from transactions
  const courtsRevenue = transactions.filter((t) => t.source === 'Courts').reduce((sum, t) => sum + t.amount, 0) + 14500;
  const shopRevenue = transactions.filter((t) => t.source === 'Shop').reduce((sum, t) => sum + t.amount, 0) + 12800;
  const barRevenue = transactions.filter((t) => t.source === 'Bar').reduce((sum, t) => sum + t.amount, 0) + 18400;
  const membershipRevenue = transactions.filter((t) => t.source === 'Memberships').reduce((sum, t) => sum + t.amount, 0) + 65000;
  const todayTotalRevenue = courtsRevenue + shopRevenue + barRevenue;

  // Membership counts
  const goldCount = members.filter((m) => m.plan === 'Gold').length + 450;
  const silverCount = members.filter((m) => m.plan === 'Silver').length + 510;
  const juniorCount = members.filter((m) => m.plan === 'Junior').length + 220;
  const totalTierSum = goldCount + silverCount + juniorCount;

  // Court utilization
  const court1Bookings = bookings.filter((b) => b.courtId === 'court_1' && b.status !== 'cancelled').length + 12;
  const court2Bookings = bookings.filter((b) => b.courtId === 'court_2' && b.status !== 'cancelled').length + 15;
  const court3Bookings = bookings.filter((b) => b.courtId === 'court_3' && b.status !== 'cancelled').length + 10;
  const court4Bookings = bookings.filter((b) => b.courtId === 'court_4' && b.status !== 'cancelled').length + 14;

  const recentTransactions = transactions.slice(0, 7);

  return (
    <div className="space-y-8">
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
            Executive Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Champions Club Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time operational metrics, multi-department revenue attribution & facilities ledger.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('admin_members')}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            + Member
          </button>
          <button
            onClick={() => setCurrentView('admin_bookings')}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
          >
            Manage Bookings
          </button>
        </div>
      </div>

      {/* Top 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Members */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold text-slate-500">Total Members</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {totalMembersCount.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">
            +18 this month
          </div>
        </div>

        {/* Active Memberships */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold text-slate-500">Active Plans</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {activeMembersCount.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            94.4% Retention Rate
          </div>
        </div>

        {/* Today's Bookings */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold text-slate-500">Today's Bookings</span>
            <CalendarCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {todayBookingsCount}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">
            88% Court Occupancy
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold text-slate-500">Today's Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            ₹{todayTotalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">
            Live All-Sources
          </div>
        </div>

        {/* Shop Sales */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold text-slate-500">Shop Sales</span>
            <ShoppingBag className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            ₹{shopRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            Unified Inventory
          </div>
        </div>

        {/* Bar Sales */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-semibold text-slate-500">Bar Sales</span>
            <Coffee className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            ₹{barRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            Cafeteria POS
          </div>
        </div>
      </div>

      {/* Middle Row: Revenue Overview Chart & Revenue by Source Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line Chart Section */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Revenue Overview</h3>
              <p className="text-xs text-slate-500">Total integrated turnover across club operations</p>
            </div>
            {/* Period selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium border border-slate-200">
              {(['today', 'week', 'month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setRevenuePeriod(p)}
                  className={`px-3 py-1 rounded-md capitalize transition-colors ${
                    revenuePeriod === p
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Clean SVG Line / Area Graph */}
          <div className="h-60 w-full pt-4">
            <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeDasharray="3 3" />

              {/* Area */}
              <polygon
                fill="url(#revenueGrad)"
                points="0,170 50,150 100,120 150,140 200,90 250,105 300,60 350,75 400,35 450,45 500,20 500,190 0,190"
              />

              {/* Line */}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                points="0,170 50,150 100,120 150,140 200,90 250,105 300,60 350,75 400,35 450,45 500,20"
              />

              {/* Key points */}
              {[[200, 90], [300, 60], [400, 35], [500, 20]].map(([x, y], idx) => (
                <circle key={idx} cx={x} cy={y} r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
              ))}
            </svg>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2">
              <span>08:00 AM</span>
              <span>11:00 AM</span>
              <span>02:00 PM</span>
              <span>05:00 PM</span>
              <span>08:00 PM</span>
              <span>Peak 10:00 PM</span>
            </div>
          </div>
        </div>

        {/* Donut Chart: Revenue by Source */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Revenue by Source</h3>
            <p className="text-xs text-slate-500">Departmental contribution breakdown</p>
          </div>

          {/* Donut visualization */}
          <div className="flex items-center justify-center my-4 relative">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" stroke="#3b82f6" strokeWidth="12" fill="none" strokeDasharray="60 178" />
              <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="12" fill="none" strokeDasharray="50 188" strokeDashoffset="-60" />
              <circle cx="50" cy="50" r="38" stroke="#f59e0b" strokeWidth="12" fill="none" strokeDasharray="45 193" strokeDashoffset="-110" />
              <circle cx="50" cy="50" r="38" stroke="#8b5cf6" strokeWidth="12" fill="none" strokeDasharray="83 155" strokeDashoffset="-155" />
            </svg>
            <div className="absolute text-center">
              <div className="text-[10px] font-mono uppercase text-slate-400">Total</div>
              <div className="text-sm font-extrabold font-mono text-slate-900">
                ₹{((courtsRevenue + shopRevenue + barRevenue + membershipRevenue) / 1000).toFixed(0)}k
              </div>
            </div>
          </div>

          {/* Breakdown legend */}
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded bg-blue-500" /> Courts
              </span>
              <span className="font-semibold text-slate-900">₹{courtsRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Pro Shop
              </span>
              <span className="font-semibold text-slate-900">₹{shopRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Bar & Cafe
              </span>
              <span className="font-semibold text-slate-900">₹{barRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded bg-purple-500" /> Memberships
              </span>
              <span className="font-semibold text-slate-900">₹{membershipRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Membership Distribution & Court Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Membership Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Membership Distribution</h3>
            <span className="text-xs font-mono text-blue-600 font-semibold">
              {totalTierSum} Active Members
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-sans font-medium text-slate-700">Gold Tier (₹45,000/yr)</span>
                <span className="font-bold text-slate-900">
                  {goldCount} ({((goldCount / totalTierSum) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${(goldCount / totalTierSum) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-sans font-medium text-slate-700">Silver Tier (₹28,000/yr)</span>
                <span className="font-bold text-slate-900">
                  {silverCount} ({((silverCount / totalTierSum) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full"
                  style={{ width: `${(silverCount / totalTierSum) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-sans font-medium text-slate-700">Junior Tier (₹22,000/yr)</span>
                <span className="font-bold text-slate-900">
                  {juniorCount} ({((juniorCount / totalTierSum) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(juniorCount / totalTierSum) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Court Utilization Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Court Utilization (Today)</h3>
            <span className="text-xs font-mono text-slate-400">Total 16 Hours Operating Window</span>
          </div>

          <div className="grid grid-cols-4 gap-3 pt-4 h-48 items-end text-center font-mono">
            {[
              { label: 'Court 1 (Tennis)', value: court1Bookings, max: 16, color: 'bg-blue-600' },
              { label: 'Court 2 (Hybrid)', value: court2Bookings, max: 16, color: 'bg-indigo-600' },
              { label: 'Court 3 (Badminton)', value: court3Bookings, max: 16, color: 'bg-emerald-600' },
              { label: 'Court 4 (Padel)', value: court4Bookings, max: 16, color: 'bg-cyan-600' },
            ].map((col) => {
              const heightPct = Math.round((col.value / col.max) * 100);
              return (
                <div key={col.label} className="h-full flex flex-col justify-end items-center">
                  <span className="text-[11px] font-bold text-slate-900 mb-1">{col.value} hrs</span>
                  <div className="w-full max-w-[48px] bg-slate-100 rounded-t-lg h-36 flex items-end overflow-hidden">
                    <div
                      className={`w-full ${col.color} transition-all duration-500 rounded-t-md`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2 truncate w-full">
                    {col.label.split(' ')[0]} {col.label.split(' ')[1]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 4: Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
            <p className="text-xs text-slate-500">Live payments across Courts, Pro Shop, Bar POS & Memberships</p>
          </div>
          <button
            onClick={() => setCurrentView('admin_accounting')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Ledger Entries</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-mono uppercase text-slate-700">
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{tx.date}</td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-900 whitespace-nowrap">
                    {tx.customerName}
                    {tx.memberId && (
                      <span className="ml-1.5 text-[10px] text-slate-400 font-mono">({tx.memberId})</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                        tx.source === 'Courts'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : tx.source === 'Shop'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : tx.source === 'Bar'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {tx.source}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-600 max-w-xs truncate">
                    {tx.description}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{tx.paymentMethod}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
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
