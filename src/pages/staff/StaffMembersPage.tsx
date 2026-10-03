import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../../store';
import { Member, MembershipTier, MemberStatus, SportType } from '../../types';
import { MemberRegistrationModal } from '../../components/MemberRegistrationModal';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Wallet, 
  Phone, 
  Mail, 
  QrCode, 
  ShieldCheck, 
  Check, 
  Clock, 
  AlertTriangle, 
  Download, 
  Send, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  Sparkles,
  UserCheck,
  X
} from 'lucide-react';
import { formatINR, getTierBadgeClass, getTierName, formatDate } from '../../lib/formatters';

export const StaffMembersPage: React.FC = () => {
  const { members, bookings, openMember360, sendBulkExpiryReminders, addToast, settings, syncMembers } = useAppStore();

  useEffect(() => {
    syncMembers();
  }, [syncMembers]);

  const [activeDirectoryTab, setActiveDirectoryTab] = useState<'members' | 'guests'>('members');
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterExpiryWindow, setFilterExpiryWindow] = useState<'all' | '7_days' | '30_days' | 'expired'>('all');
  const [filterSport, setFilterSport] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'expiry' | 'join' | 'wallet'>('expiry');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);

  // Expiring soon metrics
  const today = new Date();
  const expiring7Days = members.filter((m) => {
    const exp = new Date(m.expiryDate);
    const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7 && m.status !== 'cancelled';
  });

  const expiring30Days = members.filter((m) => {
    const exp = new Date(m.expiryDate);
    const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30 && m.status !== 'cancelled';
  });

  const expiredMembers = members.filter((m) => {
    const exp = new Date(m.expiryDate);
    const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff < 0 && m.status !== 'cancelled';
  });

  // Filter & Sort
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !m.fullName.toLowerCase().includes(q) &&
          !m.memberNumber.toLowerCase().includes(q) &&
          !m.phone.includes(q) &&
          !m.email.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (filterTier !== 'all' && m.tier !== filterTier) return false;
      if (filterStatus !== 'all' && m.status !== filterStatus) return false;
      if (filterSport !== 'all' && !m.preferredSports.includes(filterSport as SportType)) return false;

      if (filterExpiryWindow !== 'all') {
        const exp = new Date(m.expiryDate);
        const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (filterExpiryWindow === '7_days' && (diff < 0 || diff > 7)) return false;
        if (filterExpiryWindow === '30_days' && (diff < 0 || diff > 30)) return false;
        if (filterExpiryWindow === 'expired' && diff >= 0) return false;
      }

      return true;
    }).sort((a, b) => {
      let result = 0;
      if (sortBy === 'name') result = a.fullName.localeCompare(b.fullName);
      else if (sortBy === 'expiry') result = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      else if (sortBy === 'join') result = new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
      else if (sortBy === 'wallet') result = a.walletBalance - b.walletBalance;

      return sortOrder === 'asc' ? result : -result;
    });
  }, [members, search, filterTier, filterStatus, filterExpiryWindow, filterSport, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Bulk actions
  const handleToggleSelectAll = () => {
    if (selectedMemberIds.length === paginatedMembers.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(paginatedMembers.map((m) => m.id));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkRemind = () => {
    if (selectedMemberIds.length === 0) return;
    sendBulkExpiryReminders(selectedMemberIds, 'whatsapp');
    setSelectedMemberIds([]);
  };

  const handleExportCSV = () => {
    const list = selectedMemberIds.length > 0
      ? members.filter((m) => selectedMemberIds.includes(m.id))
      : filteredMembers;

    const headers = ['MemberID', 'FullName', 'Tier', 'Status', 'Phone', 'Email', 'ExpiryDate', 'WalletBalance'];
    const rows = list.map((m) => [
      m.memberNumber,
      `"${m.fullName}"`,
      m.tier,
      m.status,
      m.phone,
      m.email,
      m.expiryDate,
      m.walletBalance,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Champions_Club_Members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'CSV Export Generated',
      message: `Exported ${list.length} member records to CSV file.`,
    });
  };

  // Guest records extracted from non-member bookings & POS orders
  const guestRecords = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; visits: number; totalSpent: number; lastVisit: string }>();
    bookings.forEach((b) => {
      if (!b.memberId && b.guestName && b.guestName !== 'Walk-in Guest') {
        const key = `${b.guestName.toLowerCase()}_${b.guestPhone}`;
        const existing = map.get(key) || {
          name: b.guestName,
          phone: b.guestPhone || '+91 98000 00000',
          visits: 0,
          totalSpent: 0,
          lastVisit: b.date,
        };
        existing.visits += 1;
        existing.totalSpent += b.totalPrice || 0;
        if (b.date > existing.lastVisit) existing.lastVisit = b.date;
        map.set(key, existing);
      }
    });

    if (map.size === 0) {
      map.set('rahul_verma', {
        name: 'Rahul Verma',
        phone: '+91 98111 22334',
        visits: 3,
        totalSpent: 3600,
        lastVisit: '2026-10-02',
      });
      map.set('meera_nair', {
        name: 'Meera Nair',
        phone: '+91 98222 33445',
        visits: 2,
        totalSpent: 2400,
        lastVisit: '2026-10-01',
      });
    }
    return Array.from(map.values());
  }, [bookings]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400">
            Staff Module • Directory & CRM
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Members & Guest Visitor Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Total of {members.length} members enrolled across Gold, Silver, Junior tiers + Guest visitor history.
          </p>

          {/* Directory Tab Switcher */}
          <div className="inline-flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl mt-3">
            <button
              onClick={() => setActiveDirectoryTab('members')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeDirectoryTab === 'members'
                  ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Enrolled Members ({members.length})
            </button>
            <button
              onClick={() => setActiveDirectoryTab('guests')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeDirectoryTab === 'guests'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Guest Visitors ({guestRecords.length})
            </button>
          </div>
        </div>

        <button
          onClick={() => setRegistrationModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 flex items-center gap-2 self-start sm:self-auto transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member (Front Desk)</span>
        </button>
      </div>

      {/* EXPIRING SOON WIDGET BANNER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Membership Lifecycle Alert</span>
          </div>
          <h3 className="font-heading font-bold text-lg text-white">
            {expiring7Days.length} Members Expiring in Next 7 Days • {expiring30Days.length} in 30 Days
          </h3>
          <p className="text-xs text-slate-400">
            {expiredMembers.length} accounts currently expired. Benefit auto-block activates after {settings.gracePeriodDays || 7} days grace period.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setFilterExpiryWindow('7_days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              filterExpiryWindow === '7_days'
                ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
            }`}
          >
            Show Expiring in 7 Days ({expiring7Days.length})
          </button>
          <button
            onClick={() => {
              const ids = expiring7Days.map((m) => m.id);
              sendBulkExpiryReminders(ids, 'whatsapp');
            }}
            disabled={expiring7Days.length === 0}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-lime-400 to-lime-500 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 hover:brightness-105 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Bulk WhatsApp Reminders</span>
          </button>
        </div>
      </div>

      {/* GUEST VISITORS TAB DIRECTORY */}
      {activeDirectoryTab === 'guests' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-400">Non-Member Visitors</span>
              <h3 className="font-heading font-extrabold text-xl text-white mt-0.5">
                Guest Visitor History & Conversion Pipeline
              </h3>
              <p className="text-xs text-slate-400">
                Guests pay full rack rate for court bookings and POS orders. Convert them to members in 1 click.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Guest Name</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Visit Count</th>
                  <th className="py-3.5 px-4">Total Spent (Rack Rate)</th>
                  <th className="py-3.5 px-4">Last Visit</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {guestRecords.map((gst, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-white text-sm">{gst.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{gst.phone}</td>
                    <td className="py-3 px-4 font-bold text-amber-400">{gst.visits} Court Visits</td>
                    <td className="py-3 px-4 font-mono font-bold text-lime-400">{formatINR(gst.totalSpent)}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{gst.lastVisit}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setRegistrationModalOpen(true);
                          addToast({
                            type: 'info',
                            title: 'Guest Conversion Initiated',
                            message: `Converting Guest ${gst.name} (${gst.phone}) to Gold/Silver member.`,
                          });
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-400/20 transition flex items-center gap-1.5 ml-auto"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Convert to Member</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ENROLLED MEMBERS TAB DIRECTORY */}
      {activeDirectoryTab === 'members' && (
        <div className="space-y-6">
          {/* FILTERS & SEARCH TOOLBAR */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by member name, ID (e.g. CC-2026-1001), phone, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Tier Filter */}
            <select
              value={filterTier}
              onChange={(e) => {
                setFilterTier(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Tiers</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="junior">Junior</option>
              <option value="walk_in">Walk-in</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Expired</option>
              <option value="frozen">Frozen</option>
              <option value="suspended">Suspended</option>
            </select>

            {/* Expiry Window Filter */}
            <select
              value={filterExpiryWindow}
              onChange={(e) => {
                setFilterExpiryWindow(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Validity</option>
              <option value="7_days">Expiring in ≤ 7 Days</option>
              <option value="30_days">Expiring in ≤ 30 Days</option>
              <option value="expired">Already Expired</option>
            </select>

            {/* Sport Filter */}
            <select
              value={filterSport}
              onChange={(e) => {
                setFilterSport(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Sports</option>
              <option value="tennis">Tennis</option>
              <option value="padel">Padel</option>
              <option value="badminton">Badminton</option>
              <option value="cricket">Cricket</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb as any);
                setSortOrder(so as any);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
            >
              <option value="expiry-asc">Expiry: Soonest First</option>
              <option value="expiry-desc">Expiry: Latest First</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="wallet-desc">Wallet: High to Low</option>
              <option value="join-desc">Joined: Newest First</option>
            </select>
          </div>
        </div>

        {/* BULK ACTIONS BAR */}
        {selectedMemberIds.length > 0 && (
          <div className="p-3 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-between text-xs animate-in fade-in">
            <span className="font-semibold text-lime-400">
              {selectedMemberIds.length} member{selectedMemberIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkRemind}
                className="px-3 py-1.5 rounded-lg bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send WhatsApp Reminder</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Selected</span>
              </button>
              <button
                onClick={() => setSelectedMemberIds([])}
                className="px-2 py-1.5 text-slate-400 hover:text-white"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MEMBERS TABLE */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={paginatedMembers.length > 0 && selectedMemberIds.length === paginatedMembers.length}
                    onChange={handleToggleSelectAll}
                    className="rounded bg-slate-900 border-slate-700 text-lime-400"
                  />
                </th>
                <th className="py-3.5 px-4">Member Name & ID</th>
                <th className="py-3.5 px-4">Tier & Demographics</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Status & Validity</th>
                <th className="py-3.5 px-4">Wallet</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No members found matching filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((m) => {
                  const isSelected = selectedMemberIds.includes(m.id);
                  const expDate = new Date(m.expiryDate);
                  const diff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <tr
                      key={m.id}
                      onClick={() => openMember360(m.id)}
                      className={`hover:bg-slate-800/40 cursor-pointer transition ${
                        isSelected ? 'bg-lime-400/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(m.id)}
                          className="rounded bg-slate-900 border-slate-700 text-lime-400"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.avatar}
                            alt={m.fullName}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-white hover:text-lime-400 transition">
                              {m.fullName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {m.memberNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${getTierBadgeClass(m.tier)}`}>
                          {m.tier}
                        </span>
                        <div className="text-[10px] text-slate-400 capitalize mt-1">
                          {m.gender || 'Member'} • {m.preferredSports.join(', ')}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-white">{m.phone}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{m.email}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            m.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : m.status === 'expiring'
                              ? 'bg-amber-500/20 text-amber-300'
                              : m.status === 'frozen'
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {diff < 0 ? (
                            <span className="text-rose-400 font-bold">Expired {Math.abs(diff)}d ago</span>
                          ) : diff <= 7 ? (
                            <span className="text-amber-400 font-bold">Expires in {diff}d</span>
                          ) : (
                            <span>Expires {formatDate(m.expiryDate)}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-lime-400 font-heading">
                        {formatINR(m.walletBalance)}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openMember360(m.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-lime-400 hover:text-slate-950 text-slate-200 text-xs font-semibold transition"
                        >
                          View 360°
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Showing {filteredMembers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, filteredMembers.length)} of {filteredMembers.length} members
            </span>
            <button
              onClick={handleExportCSV}
              className="text-xs text-lime-400 hover:underline flex items-center gap-1 ml-3"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All to CSV</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        </div>
        </div>
      )}

      {/* FRONT DESK REGISTRATION MODAL */}
      {registrationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400">
                  Front Desk Registration
                </span>
                <h3 className="font-heading font-extrabold text-xl text-white">
                  Enroll New Club Member
                </h3>
              </div>
              <button
                onClick={() => setRegistrationModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <MemberRegistrationModal />
          </div>
        </div>
      )}
    </div>
  );
};
