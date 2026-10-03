import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Member, MembershipTier, MemberStatus } from '../types';
import { 
  X, 
  QrCode, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  Wallet, 
  Coffee, 
  ShoppingBag, 
  Receipt, 
  ShieldAlert, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  Send, 
  ArrowUpRight, 
  Plus, 
  UserCheck, 
  History,
  Lock,
  Unlock,
  FileText
} from 'lucide-react';
import { formatINR, getTierBadgeClass, getTierName, formatDate, formatDateTime } from '../lib/formatters';

export const Member360Drawer: React.FC = () => {
  const { 
    selectedMemberId360, 
    closeMember360, 
    members, 
    bookings, 
    tabs, 
    invoices, 
    plans,
    checkInMember, 
    renewMember, 
    upgradeMember, 
    downgradeMember,
    freezeMember, 
    unfreezeMember, 
    topupWallet, 
    sendMemberReminder, 
    addMemberNote,
    settings 
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'spending' | 'lifecycle' | 'attendance'>('overview');
  const [topupAmount, setTopupAmount] = useState('2000');
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeReason, setFreezeReason] = useState('Medical recovery / Travel pause');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderChannel, setReminderChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [reminderText, setReminderText] = useState('');
  const [newNote, setNewNote] = useState('');

  if (!selectedMemberId360) return null;

  const member = members.find((m) => m.id === selectedMemberId360);
  if (!member) return null;

  const plan = plans.find((p) => p.tier === member.tier) || plans[0];
  const memberBookings = bookings.filter((b) => b.memberId === member.id);
  const memberTabs = tabs.filter((t) => t.memberId === member.id);
  const memberInvoices = invoices.filter((i) => i.memberId === member.id);

  // Expiry calculation
  const today = new Date();
  const expiry = new Date(member.expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const graceDays = settings.gracePeriodDays || 7;
  const isExpired = diffDays < 0;
  const isPastGrace = diffDays < -graceDays;
  const isExpiringSoon = diffDays >= 0 && diffDays <= 7;

  // Today's attendance / booking count: "x of 2 used today"
  const todayDateStr = today.toISOString().split('T')[0];
  const todayAttendances = (member.attendanceLog || []).filter((a) =>
    a.timestamp.startsWith(todayDateStr)
  );
  const todayBookingsCount = bookings.filter(
    (b) => b.memberId === member.id && b.date === todayDateStr && b.status !== 'cancelled'
  ).length;
  const dailyCap = settings.dailyBookingCap || 2;
  const usedToday = Math.max(todayAttendances.length, todayBookingsCount);

  // Outstanding dues
  const unpaidInvoices = memberInvoices.filter((i) => i.status === 'unpaid');
  const unpaidInvoicesSum = unpaidInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalOutstandingDues = member.activeTabBalance + unpaidInvoicesSum;

  const handleCheckIn = () => {
    checkInMember(member.id);
  };

  const handleSendReminder = (e: React.FormEvent) => {
    e.preventDefault();
    sendMemberReminder(member.id, reminderChannel, reminderText || undefined);
    setShowReminderModal(false);
    setReminderText('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addMemberNote(member.id, newNote.trim());
    setNewNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-slate-950/90 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="relative shrink-0">
              <img
                src={member.avatar}
                alt={member.fullName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-lime-400/50 shadow-xl"
              />
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 ${
                member.status === 'active' ? 'bg-emerald-500' : member.status === 'expiring' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider ${getTierBadgeClass(member.tier)}`}>
                  {getTierName(member.tier)}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  member.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : member.status === 'expiring'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : member.status === 'frozen'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {member.status}
                </span>
              </div>

              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white truncate mt-1">
                {member.fullName}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 font-mono">
                <span>{member.memberNumber}</span>
                <span>•</span>
                <span>{member.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCheckIn}
              disabled={isPastGrace || member.status === 'frozen'}
              className="px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Check-in</span>
            </button>
            <button
              onClick={closeMember360}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              aria-label="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800/80 bg-slate-950/40 text-xs overflow-x-auto">
          {[
            { id: 'overview', label: '360° Overview' },
            { id: 'bookings', label: `Bookings (${memberBookings.length})` },
            { id: 'spending', label: `Tabs & Invoices (${memberTabs.length + memberInvoices.length})` },
            { id: 'lifecycle', label: 'Lifecycle & Renew' },
            { id: 'attendance', label: `Attendance (${member.attendanceLog?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 border-b-2 font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'border-lime-400 text-lime-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Daily Booking & Attendance Cap Bar */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Daily Facility Access
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-heading font-extrabold text-xl text-white">
                      {usedToday} of {dailyCap} Used Today
                    </span>
                    {usedToday >= dailyCap && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                        Daily Cap Reached
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-24 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usedToday >= dailyCap ? 'bg-amber-400' : 'bg-lime-400'
                    }`}
                    style={{ width: `${Math.min(100, (usedToday / dailyCap) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Status & Expiry Countdown Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                isPastGrace
                  ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  : isExpired
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                  : isExpiringSoon
                  ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-lime-400" />
                    <span className="font-semibold text-xs text-white">
                      {isExpired
                        ? isPastGrace
                          ? 'Expired Beyond Grace Period (Benefits Blocked)'
                          : `Expired (${diffDays} days ago, in ${graceDays}-day grace period)`
                        : `Expires in ${diffDays} days (${formatDate(member.expiryDate)})`}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Enrolled on {formatDate(member.joinDate)} • {member.frozenDaysCount ? `${member.frozenDaysCount} frozen days accumulated` : 'Continuous validity'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRenewModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs"
                  >
                    Renew
                  </button>
                  <button
                    onClick={() => setShowReminderModal(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
                  >
                    Notify
                  </button>
                </div>
              </div>

              {/* Balances & Dues Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Club Wallet</span>
                  <div className="font-heading font-extrabold text-xl text-lime-400 mt-0.5">
                    {formatINR(member.walletBalance)}
                  </div>
                  <button
                    onClick={() => setShowTopupModal(true)}
                    className="text-[11px] text-slate-400 hover:text-lime-400 mt-1 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Top-up Wallet
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Bar Tab</span>
                  <div className="font-heading font-extrabold text-xl text-amber-400 mt-0.5">
                    {formatINR(member.activeTabBalance)}
                  </div>
                  <span className="text-[11px] text-slate-500">15% Gold discount</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Outstanding Dues</span>
                  <div className={`font-heading font-extrabold text-xl mt-0.5 ${
                    totalOutstandingDues > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {formatINR(Math.round(totalOutstandingDues))}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {totalOutstandingDues > 0 ? 'Open tab + unpaid dues' : 'All accounts settled'}
                  </span>
                </div>
              </div>

              {/* Entitlements Matrix Preview */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-300">
                    Active Entitlements ({getTierName(member.tier)})
                  </h4>
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="text-xs text-lime-400 hover:underline font-semibold"
                  >
                    Change / Upgrade Tier →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-500 text-[10px] block">Court Discount</span>
                    <strong className="text-white">{plan.entitlements.courtDiscountPercent}% off</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-500 text-[10px] block">Booking Window</span>
                    <strong className="text-white">{plan.entitlements.bookingWindowDays} Days</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-500 text-[10px] block">Pro Shop Discount</span>
                    <strong className="text-white">{plan.entitlements.shopDiscountPercent}%</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-500 text-[10px] block">Bar & Café Discount</span>
                    <strong className="text-white">{plan.entitlements.barDiscountPercent}%</strong>
                  </div>
                </div>
              </div>

              {/* Personal Details & Guardian (if Junior) */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
                  Profile & Contact Data
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                  <div>Date of Birth: <strong className="text-white">{member.dateOfBirth || '1990-01-01'}</strong></div>
                  <div>Gender: <strong className="text-white">{member.gender || 'Not specified'}</strong></div>
                  <div>Address: <strong className="text-white line-clamp-1">{member.address || 'Bengaluru'}</strong></div>
                  <div>Emergency Contact: <strong className="text-white">{member.emergencyContact.name} ({member.emergencyContact.phone})</strong></div>
                  {member.guardian && (
                    <div className="sm:col-span-2 p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300">
                      <strong>Junior Guardian:</strong> {member.guardian.name} • {member.guardian.phone} ({member.guardian.relation})
                    </div>
                  )}
                </div>
              </div>

              {/* Staff Notes */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-300">
                  Staff Notes & Observations
                </h4>
                {member.notes ? (
                  <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 leading-relaxed">
                    {member.notes}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic">No notes logged for this member yet.</p>
                )}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add an internal operational note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                  >
                    Save Note
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-sm text-white">Court Reservation History</h4>
                <span className="text-xs text-slate-400">{memberBookings.length} total records</span>
              </div>

              {memberBookings.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">No bookings on file.</div>
              ) : (
                <div className="space-y-2">
                  {memberBookings.map((b) => (
                    <div key={b.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">{b.courtId.replace(/_/g, ' ').toUpperCase()}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {b.date} • {b.startTime} - {b.endTime} • {b.sport.toUpperCase()}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-heading font-bold text-lime-400">{formatINR(b.totalPrice)}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded capitalize block mt-1 bg-slate-800 text-slate-300">
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SPENDING & INVOICES */}
          {activeTab === 'spending' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-heading font-bold text-sm text-white mb-2">Membership & Court Invoices</h4>
                <div className="space-y-2">
                  {memberInvoices.map((inv) => (
                    <div key={inv.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-mono font-bold text-white">{inv.invoiceNumber}</div>
                        <div className="text-slate-400 text-[11px]">{inv.items[0]?.description}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lime-400 font-heading">{formatINR(Math.round(inv.totalAmount))}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase block mt-0.5 ${
                          inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-heading font-bold text-sm text-white mb-2">Courtside Bar & Café Tabs</h4>
                <div className="space-y-2">
                  {memberTabs.map((t) => (
                    <div key={t.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white">{t.tableName}</span>
                        <span className="text-slate-400 ml-2">({t.orders.length} items)</span>
                        <div className="text-[10px] text-slate-500">{formatDateTime(t.openedAt)}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white font-heading">{formatINR(Math.round(t.totalAmount))}</span>
                        <span className="text-[10px] text-slate-400 capitalize block">{t.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIFECYCLE & ACTIONS */}
          {activeTab === 'lifecycle' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="font-heading font-bold text-sm text-white">Membership Lifecycle Controls</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    onClick={() => setShowRenewModal(true)}
                    className="p-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-md"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Renew Membership</span>
                  </button>

                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="p-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Upgrade / Downgrade</span>
                  </button>

                  {member.status === 'frozen' ? (
                    <button
                      onClick={() => unfreezeMember(member.id)}
                      className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 col-span-2 shadow-md transition"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>Unfreeze Membership (Resume Privileges & Extend Expiry)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowFreezeModal(true)}
                      className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center justify-center gap-2 border border-slate-700 col-span-2 transition"
                    >
                      <Lock className="w-4 h-4 text-cyan-400" />
                      <span>Freeze Membership (Temporary Pause)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Reminder Log */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-sm text-white">Message & Reminder Log</h4>
                  <button
                    onClick={() => setShowReminderModal(true)}
                    className="text-xs text-lime-400 font-semibold hover:underline"
                  >
                    + Send Message
                  </button>
                </div>

                <div className="space-y-2">
                  {(member.reminderLog || []).map((rem) => (
                    <div key={rem.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lime-400 uppercase tracking-wider text-[10px]">
                          {rem.type} • {rem.sentBy}
                        </span>
                        <span className="text-[10px] text-slate-500">{formatDateTime(rem.timestamp)}</span>
                      </div>
                      <p className="text-slate-300 mt-1 text-[11px]">{rem.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ATTENDANCE LOG */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-sm text-white">Physical Attendance & Gate Check-ins</h4>
                <button
                  onClick={handleCheckIn}
                  className="px-3 py-1.5 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  + Log Gate Check-in
                </button>
              </div>

              <div className="space-y-2">
                {(member.attendanceLog || []).map((att) => (
                  <div key={att.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{att.courtName || 'Main Reception'}</div>
                      <div className="text-slate-400 text-[10px] mt-0.5">By {att.checkedInBy}</div>
                    </div>
                    <span className="text-slate-400 text-[11px] font-mono">
                      {formatDateTime(att.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Pass: <strong className="text-white">{member.memberNumber}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReminderModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
            >
              WhatsApp / SMS
            </button>
            <button
              onClick={closeMember360}
              className="px-4 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Top-up Wallet Modal */}
      {showTopupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-heading font-extrabold text-lg text-white">Top-up Member Wallet</h3>
            <p className="text-xs text-slate-400">
              Adding funds for <strong>{member.fullName}</strong>. Balance: {formatINR(member.walletBalance)}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {['1000', '2000', '5000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopupAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-semibold border ${
                    topupAmount === amt ? 'bg-lime-400 text-slate-950 border-lime-400' : 'bg-slate-950 text-slate-300 border-slate-700'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-lime-400"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowTopupModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  topupWallet(member.id, parseInt(topupAmount, 10), 'upi');
                  setShowTopupModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs shadow-md"
              >
                Confirm Recharge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-heading font-extrabold text-lg text-white">Renew Membership</h3>
            <p className="text-xs text-slate-400">
              Extend {member.fullName}'s {member.tier.toUpperCase()} membership with auto-invoice.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  renewMember(member.id, 1, 'upi');
                  setShowRenewModal(false);
                }}
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left flex justify-between items-center text-xs"
              >
                <span className="font-bold text-white">1 Month Extension</span>
                <span className="text-lime-400 font-semibold">{formatINR(Math.round(plan.monthlyPrice * 1.18))}</span>
              </button>
              <button
                onClick={() => {
                  renewMember(member.id, 3, 'upi');
                  setShowRenewModal(false);
                }}
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left flex justify-between items-center text-xs"
              >
                <span className="font-bold text-white">3 Months (Quarterly)</span>
                <span className="text-lime-400 font-semibold">{formatINR(Math.round(plan.quarterlyPrice * 1.18))}</span>
              </button>
              <button
                onClick={() => {
                  renewMember(member.id, 12, 'upi');
                  setShowRenewModal(false);
                }}
                className="w-full p-3 rounded-xl bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/40 text-left flex justify-between items-center text-xs"
              >
                <div>
                  <span className="font-bold text-white block">1 Year (Annual VIP)</span>
                  <span className="text-[10px] text-amber-400 font-semibold">30% Savings</span>
                </div>
                <span className="text-lime-400 font-bold font-heading">{formatINR(Math.round(plan.annualPrice * 1.18))}</span>
              </button>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowRenewModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade / Downgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-heading font-extrabold text-lg text-white">Upgrade or Downgrade Tier</h3>
              <button onClick={() => setShowUpgradeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Adjust plan privileges for <strong>{member.fullName}</strong>. Current: <strong className="text-lime-400 uppercase">{member.tier}</strong>
            </p>

            <div className="space-y-2.5">
              {(['gold', 'silver', 'junior', 'walk_in'] as MembershipTier[]).map((t) => {
                if (t === member.tier) return null;
                const isUpgrade = (member.tier === 'walk_in') || 
                                  (member.tier === 'junior' && (t === 'silver' || t === 'gold')) ||
                                  (member.tier === 'silver' && t === 'gold');
                const proratedCost = t === 'gold' ? 8850 : t === 'silver' ? 4720 : 2950;

                return (
                  <div
                    key={t}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getTierBadgeClass(t)}`}>
                          {t.replace('_', ' ')}
                        </span>
                        <span className="font-semibold text-white">
                          {isUpgrade ? 'Upgrade Plan' : 'Downgrade Plan'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        {isUpgrade 
                          ? `Prorated differential invoice of ${formatINR(proratedCost)} will be generated.`
                          : 'Privileges and court discounts adjusted to lower tier immediately.'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (isUpgrade) {
                          upgradeMember(member.id, t, proratedCost, 'upi');
                        } else {
                          downgradeMember(member.id, t, 0);
                        }
                        setShowUpgradeModal(false);
                      }}
                      className={`px-3.5 py-2 rounded-xl font-bold text-xs shrink-0 transition ${
                        isUpgrade
                          ? 'bg-lime-400 hover:bg-lime-300 text-slate-950 shadow-md shadow-lime-400/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isUpgrade ? `Upgrade (${formatINR(proratedCost)})` : 'Downgrade'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Freeze Membership Modal */}
      {showFreezeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-cyan-400">
              <Lock className="w-5 h-5" />
              <h3 className="font-heading font-extrabold text-lg text-white">Freeze Membership</h3>
            </div>
            <p className="text-xs text-slate-400">
              Temporarily freeze <strong>{member.fullName}</strong>'s membership. Court booking and bar tab benefits will be paused. When unfrozen, expiry will be automatically extended by the frozen duration.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Reason for Freeze</label>
              <select
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="Medical injury / surgery recovery">Medical injury / surgery recovery</option>
                <option value="International travel / relocation">International travel / relocation</option>
                <option value="Monsoon / off-season temporary hold">Monsoon / off-season temporary hold</option>
                <option value="Personal / academic exam leave">Personal / academic exam leave</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFreezeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  freezeMember(member.id, freezeReason);
                  setShowFreezeModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md"
              >
                Confirm Freeze
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-heading font-extrabold text-lg text-white">Dispatch Member Reminder</h3>
            <p className="text-xs text-slate-400">
              Send an expiry or renewal alert to <strong>{member.fullName}</strong> ({member.phone}).
            </p>
            <form onSubmit={handleSendReminder} className="space-y-3 text-xs">
              <div className="flex gap-2">
                {(['whatsapp', 'sms', 'email'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setReminderChannel(ch)}
                    className={`flex-1 py-2 rounded-xl uppercase font-bold text-[10px] border ${
                      reminderChannel === ch ? 'bg-lime-400 text-slate-950 border-lime-400' : 'bg-slate-950 text-slate-300 border-slate-700'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                placeholder="Leave blank for standard expiry reminder text, or write custom message..."
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md"
                >
                  Dispatch {reminderChannel.toUpperCase()}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
