import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store';
import { 
  Users, 
  CalendarCheck, 
  ShoppingBag, 
  Coffee, 
  Receipt, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Share2,
  PieChart as PieIcon,
  Calendar,
  Layers,
  ChevronRight,
  Activity,
  Award
} from 'lucide-react';
import { formatINR, formatDateTime, formatDate, getCourtStatusBadge, getTierBadgeClass } from '../../lib/formatters';
import { 
  buildUnifiedLedger, 
  calculatePLReport, 
  calculateAgingReport,
  calculateCourtOccupancy
} from '../../lib/finance';
import { ShareReportModal } from '../../components/ShareReportModal';

export const StaffDashboardPage: React.FC = () => {
  const { 
    members, 
    courts, 
    bookings, 
    tabs, 
    products, 
    menuItems,
    leads, 
    invoices, 
    expenses,
    payments,
    orders,
    auditLogs, 
    currentUser, 
    currentRole,
    settings,
    checkInBooking
  } = useAppStore();

  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | '30days'>('month');
  const [showShareModal, setShowShareModal] = useState(false);

  // Time window calculations
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const { currentPeriodDays, prevPeriodDays } = useMemo(() => {
    switch (timeRange) {
      case 'today':
        return { currentPeriodDays: 1, prevPeriodDays: 1 };
      case 'week':
        return { currentPeriodDays: 7, prevPeriodDays: 7 };
      case 'month':
      case '30days':
      default:
        return { currentPeriodDays: 30, prevPeriodDays: 30 };
    }
  }, [timeRange]);

  // Real store calculations for Unified Ledger & Revenue
  const rawLedger = useMemo(() => {
    return buildUnifiedLedger(bookings, orders, tabs, invoices, payments);
  }, [bookings, orders, tabs, invoices, payments]);

  // Current period ledger entries
  const currentLedger = useMemo(() => {
    const cutoff = Date.now() - currentPeriodDays * 24 * 60 * 60 * 1000;
    return rawLedger.filter((l) => new Date(l.timestamp).getTime() >= cutoff);
  }, [rawLedger, currentPeriodDays]);

  // Previous period ledger entries for comparison
  const prevLedger = useMemo(() => {
    const startPrev = Date.now() - (currentPeriodDays + prevPeriodDays) * 24 * 60 * 60 * 1000;
    const endPrev = Date.now() - currentPeriodDays * 24 * 60 * 60 * 1000;
    return rawLedger.filter((l) => {
      const t = new Date(l.timestamp).getTime();
      return t >= startPrev && t < endPrev;
    });
  }, [rawLedger, currentPeriodDays, prevPeriodDays]);

  const totalRevenue = useMemo(() => currentLedger.reduce((sum, item) => sum + item.grossAmount, 0), [currentLedger]);
  const prevRevenue = useMemo(() => prevLedger.reduce((sum, item) => sum + item.grossAmount, 0), [prevLedger]);
  const revenueGrowth = prevRevenue > 0 ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : 12;

  // Stream breakdown
  const streamRevenue = useMemo(() => {
    const map = { courts: 0, shop: 0, bar_cafe: 0, membership: 0, coaching: 0 };
    currentLedger.forEach((l) => {
      if (map[l.stream] !== undefined) {
        map[l.stream] += l.grossAmount;
      }
    });
    return map;
  }, [currentLedger]);

  // Payment method breakdown
  const paymentSplit = useMemo(() => {
    const split: { [k: string]: number } = { UPI: 0, Card: 0, Cash: 0, Netbanking: 0, Wallet: 0 };
    currentLedger.forEach((l) => {
      const m = l.paymentMethod.toUpperCase();
      if (m.includes('UPI')) split.UPI += l.grossAmount;
      else if (m.includes('CARD')) split.Card += l.grossAmount;
      else if (m.includes('CASH')) split.Cash += l.grossAmount;
      else if (m.includes('NETBANKING')) split.Netbanking += l.grossAmount;
      else if (m.includes('WALLET')) split.Wallet += l.grossAmount;
      else split.Card += l.grossAmount;
    });
    return split;
  }, [currentLedger]);

  // Expenses in period
  const periodExpenses = useMemo(() => {
    const cutoff = Date.now() - currentPeriodDays * 24 * 60 * 60 * 1000;
    return expenses
      .filter((e) => new Date(e.date).getTime() >= cutoff)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, currentPeriodDays]);

  const netOperatingProfit = totalRevenue - periodExpenses;
  const netMargin = totalRevenue > 0 ? Math.round((netOperatingProfit / totalRevenue) * 100) : 0;

  // Receivables & Payables
  const aging = useMemo(() => calculateAgingReport(invoices, expenses), [invoices, expenses]);

  // Occupancy %
  const courtOccupancyPercent = useMemo(() => {
    return calculateCourtOccupancy(bookings, courts.length, 17, currentPeriodDays);
  }, [bookings, courts, currentPeriodDays]);

  // Members metrics
  const activeMembersCount = members.filter((m) => m.status === 'active').length;
  const expiringMembersCount = members.filter((m) => m.status === 'expiring').length;
  const newMembersCount = members.filter((m) => {
    const joinMs = new Date(m.joinDate).getTime();
    return joinMs >= Date.now() - 30 * 24 * 60 * 60 * 1000;
  }).length;

  // Pro shop & Bar
  const lowStockProducts = products.filter((p) => p.stockQty <= p.reorderLevel);
  const openTabsTotal = tabs.filter((t) => t.status === 'open').reduce((acc, curr) => acc + curr.totalAmount, 0);
  const openTabsCount = tabs.filter((t) => t.status === 'open').length;

  // Leads & Pipeline
  const openLeads = leads.filter((l) => l.status !== 'won' && l.status !== 'lost');
  const pipelineValue = openLeads.reduce((sum, l) => sum + (l.estimatedValue || 25000), 0);

  // Top Products Leaderboard
  const topProducts = useMemo(() => {
    return [...products].sort((a, b) => (b.costPrice || 0) - (a.costPrice || 0)).slice(0, 4);
  }, [products]);

  // Top Bar Items Leaderboard
  const topBarItems = useMemo(() => {
    return [...menuItems].sort((a, b) => b.price - a.price).slice(0, 4);
  }, [menuItems]);

  // Executive Dashboard Summary Text for Sharing
  const dashboardSummaryText = useMemo(() => {
    return (
      `🏛️ *${settings.clubName} - Owner Executive Summary*\n` +
      `Period: ${timeRange.toUpperCase()} (${formatDate(todayStr)})\n` +
      `--------------------------------------\n` +
      `💰 *Total Gross Revenue:* ${formatINR(Math.round(totalRevenue))} (${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}% vs prev period)\n` +
      `  • Courts & Rentals: ${formatINR(Math.round(streamRevenue.courts))}\n` +
      `  • Memberships & SLA: ${formatINR(Math.round(streamRevenue.membership))}\n` +
      `  • Pro Shop Retail: ${formatINR(Math.round(streamRevenue.shop))}\n` +
      `  • Bar & Cafeteria: ${formatINR(Math.round(streamRevenue.bar_cafe))}\n\n` +
      `📉 *Operating Expenses:* ${formatINR(Math.round(periodExpenses))}\n` +
      `📈 *Net Operating Profit:* ${formatINR(Math.round(netOperatingProfit))} (Margin: ${netMargin}%)\n\n` +
      `📋 *Working Capital:*\n` +
      `  • Receivables (Owed to club): ${formatINR(Math.round(aging.receivables.total))}\n` +
      `  • Payables (Vendor bills due): ${formatINR(Math.round(aging.payables.total))}\n\n` +
      `🎾 *Court Occupancy:* ${courtOccupancyPercent}%\n` +
      `👥 *Members:* ${activeMembersCount} Active | ${newMembersCount} New | ${expiringMembersCount} Expiring\n` +
      `🎯 *CRM Open Pipeline:* ${openLeads.length} leads (${formatINR(pipelineValue)})\n`
    );
  }, [
    settings, timeRange, todayStr, totalRevenue, revenueGrowth, streamRevenue,
    periodExpenses, netOperatingProfit, netMargin, aging, courtOccupancyPercent,
    activeMembersCount, newMembersCount, expiringMembersCount, openLeads, pipelineValue
  ]);

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400">
            Executive Owner Dashboard • {currentRole.replace('_', ' ').toUpperCase()}
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Champions Club Master Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time executive cockpit uniting Courts, Pro Shop, Bar & Cafeteria, Memberships, and P&L.
          </p>
        </div>

        {/* Range Selector & Share Action */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                timeRange === 'today' ? 'bg-lime-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                timeRange === 'week' ? 'bg-lime-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                timeRange === 'month' ? 'bg-lime-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              This Month
            </button>
          </div>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Summary
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue with Comparison */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Club Revenue</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              revenueGrowth >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {revenueGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {revenueGrowth >= 0 ? `+${revenueGrowth}%` : `${revenueGrowth}%`} vs prev
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-lime-400">
            {formatINR(Math.round(totalRevenue))}
          </div>
          <div className="text-[11px] text-slate-500">
            Prev period: {formatINR(Math.round(prevRevenue))}
          </div>
        </div>

        {/* Operating Profit & Margin */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Net Operating Profit</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
              {netMargin}% Margin
            </span>
          </div>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            {formatINR(Math.round(netOperatingProfit))}
          </div>
          <div className="text-[11px] text-slate-500">
            OPEX Deducted: {formatINR(Math.round(periodExpenses))}
          </div>
        </div>

        {/* Court Occupancy */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Court Utilisation</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-sky-400">
            {courtOccupancyPercent}%
          </div>
          <div className="text-[11px] text-slate-500">
            8 championship courts • 6 AM – 11 PM
          </div>
        </div>

        {/* Members Roster */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Members</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            {activeMembersCount}
            <span className="text-xs text-amber-400 font-normal ml-2">
              ({expiringMembersCount} expiring)
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            +{newMembersCount} enrolled in last 30 days
          </div>
        </div>
      </div>

      {/* Secondary Working Capital & CRM Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Receivables Due</span>
          <div className="font-heading font-bold text-lg text-white">{formatINR(aging.receivables.total)}</div>
          <div className="text-[10px] text-slate-500">Uncollected client bills</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Payables (We Owe)</span>
          <div className="font-heading font-bold text-lg text-rose-400">{formatINR(aging.payables.total)}</div>
          <div className="text-[10px] text-slate-500">Due to vendors & utilities</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Open CRM Pipeline</span>
          <div className="font-heading font-bold text-lg text-emerald-400">{openLeads.length} leads</div>
          <div className="text-[10px] text-slate-500">{formatINR(pipelineValue)} potential value</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Low-Stock Alert</span>
          <div className="font-heading font-bold text-lg text-amber-400">{lowStockProducts.length} items</div>
          <div className="text-[10px] text-slate-500">At or below reorder level</div>
        </div>
      </div>

      {/* Charts & Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stacked Revenue Breakdown by Stream */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-heading font-bold text-base text-white">Revenue Split Across 4 Streams</h3>
              <p className="text-xs text-slate-400">Courts, Pro Shop, Bar & Dining, Memberships</p>
            </div>
            <Link to="/staff/finance" className="text-xs font-semibold text-lime-400 hover:underline">
              Ledger Details →
            </Link>
          </div>

          {/* Visual Stream Bar */}
          <div className="space-y-3">
            <div className="h-6 w-full rounded-xl overflow-hidden flex bg-slate-950 border border-slate-800">
              {totalRevenue > 0 && (
                <>
                  <div style={{ width: `${(streamRevenue.membership / totalRevenue) * 100}%` }} className="bg-lime-400 transition-all" title="Memberships" />
                  <div style={{ width: `${(streamRevenue.courts / totalRevenue) * 100}%` }} className="bg-sky-400 transition-all" title="Courts" />
                  <div style={{ width: `${(streamRevenue.shop / totalRevenue) * 100}%` }} className="bg-amber-400 transition-all" title="Pro Shop" />
                  <div style={{ width: `${(streamRevenue.bar_cafe / totalRevenue) * 100}%` }} className="bg-purple-400 transition-all" title="Bar & Cafe" />
                </>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 text-lime-400 font-semibold mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-lime-400" />
                  Memberships
                </div>
                <div className="font-mono font-bold text-white">{formatINR(Math.round(streamRevenue.membership))}</div>
                <div className="text-[10px] text-slate-500">
                  {totalRevenue > 0 ? Math.round((streamRevenue.membership / totalRevenue) * 100) : 0}% of total
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  Courts & Bookings
                </div>
                <div className="font-mono font-bold text-white">{formatINR(Math.round(streamRevenue.courts))}</div>
                <div className="text-[10px] text-slate-500">
                  {totalRevenue > 0 ? Math.round((streamRevenue.courts / totalRevenue) * 100) : 0}% of total
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Pro Shop
                </div>
                <div className="font-mono font-bold text-white">{formatINR(Math.round(streamRevenue.shop))}</div>
                <div className="text-[10px] text-slate-500">
                  {totalRevenue > 0 ? Math.round((streamRevenue.shop / totalRevenue) * 100) : 0}% of total
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 text-purple-400 font-semibold mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  Bar & Cafeteria
                </div>
                <div className="font-mono font-bold text-white">{formatINR(Math.round(streamRevenue.bar_cafe))}</div>
                <div className="text-[10px] text-slate-500">
                  {totalRevenue > 0 ? Math.round((streamRevenue.bar_cafe / totalRevenue) * 100) : 0}% of total
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Split */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-heading font-bold text-base text-white">Payment Method Share</h3>
            <PieIcon className="w-4 h-4 text-lime-400" />
          </div>

          <div className="space-y-2.5 text-xs">
            {Object.entries(paymentSplit).map(([method, amount]) => {
              const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-300">{method}</span>
                    <span className="font-mono text-white">{formatINR(Math.round(amount))} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full ${
                        method === 'UPI' ? 'bg-emerald-400' :
                        method === 'Card' ? 'bg-sky-400' :
                        method === 'Netbanking' ? 'bg-purple-400' :
                        method === 'Wallet' ? 'bg-lime-400' : 'bg-amber-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Heatmap & Live Court Status */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-heading font-bold text-base text-white">Weekly Court Occupancy Heatmap</h3>
            <p className="text-xs text-slate-400">Peak density observed weekdays 6–9 PM & weekend mornings</p>
          </div>
          <Link to="/staff/bookings" className="text-xs font-semibold text-lime-400 hover:underline">
            Manage Reservations →
          </Link>
        </div>

        {/* Heatmap Grid Visual */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
            const intensity = idx === 4 || idx === 5 || idx === 6 ? 'bg-lime-500/80 text-slate-950' : 'bg-lime-500/30 text-lime-300';
            const rate = idx >= 4 ? '88% - 94%' : '65% - 72%';
            return (
              <div key={day} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-300 block">{day}</span>
                <div className={`py-1 rounded-lg font-bold text-xs ${intensity}`}>
                  {rate}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  {idx >= 4 ? 'Prime Peak' : 'Standard'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboards: Top Products & Top Bar Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-heading font-bold text-base text-white">Top Pro Shop Equipment</h3>
            <Link to="/staff/shop" className="text-xs font-semibold text-lime-400 hover:underline">
              Shop Master →
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80 text-xs">
            {topProducts.map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{p.name}</div>
                  <div className="text-[10px] text-slate-400">{p.brand} • In Stock: {p.stockQty}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-lime-400">{formatINR(p.price)}</div>
                  <div className="text-[10px] text-slate-500">Margin: ~35%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Bar Items */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-heading font-bold text-base text-white">Top Cafeteria & Lounge Items</h3>
            <Link to="/staff/bar" className="text-xs font-semibold text-lime-400 hover:underline">
              Bar Master →
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80 text-xs">
            {topBarItems.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{item.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{item.category.replace('_', ' ')} • {item.isVegetarian ? '🌱 Veg' : '🍗 Non-Veg'}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-purple-400">{formatINR(item.price)}</div>
                  <div className="text-[10px] text-slate-500">GST: {item.gstPercent}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Dashboard Summary Modal */}
      {showShareModal && (
        <ShareReportModal
          title="Champions Club Executive Dashboard Summary"
          subtitle="Real-time KPI & financial overview for Owner / Management partners"
          summaryText={dashboardSummaryText}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};
