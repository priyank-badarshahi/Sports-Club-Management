import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { Member, MembershipTier, MembershipStatus } from '../../types';
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  UserCheck,
  AlertTriangle,
  XCircle,
  Eye,
  X,
  CreditCard,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';

export const MembersAdmin: React.FC = () => {
  const { members, renewMember, addMember, updateMember } = useClub();

  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'All' | MembershipTier>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | MembershipStatus>('All');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailMember, setDetailMember] = useState<Member | null>(null);

  // New member form
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '1992-04-15',
    plan: 'Gold' as MembershipTier,
    paymentMethod: 'UPI',
  });

  const filteredMembers = members.filter((m) => {
    if (tierFilter !== 'All' && m.plan !== tierFilter) return false;
    if (statusFilter !== 'All' && m.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.memberId.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.includes(q)
      );
    }
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const expiry = new Date();
    expiry.setFullYear(today.getFullYear() + 1);

    addMember({
      name: newMemberForm.name,
      email: newMemberForm.email,
      phone: newMemberForm.phone,
      dateOfBirth: newMemberForm.dateOfBirth,
      plan: newMemberForm.plan,
      startDate: today.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      initialPaymentMethod: newMemberForm.paymentMethod,
    });

    setAddModalOpen(false);
    setNewMemberForm({
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '1992-04-15',
      plan: 'Gold',
      paymentMethod: 'UPI',
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
            Club Directory & Subscriptions
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Membership Management
          </h1>
          <p className="text-xs text-slate-500">
            {members.length} Registered Members · Plan-based court discounts · Subscription renewal tracking
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Member Registration</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search member name, ID, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
          >
            <option value="All">All Tiers</option>
            <option value="Gold">Gold Tier</option>
            <option value="Silver">Silver Tier</option>
            <option value="Junior">Junior Tier</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono uppercase text-slate-500">
                <th className="py-3 px-4">Member ID</th>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{m.memberId}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-900 whitespace-nowrap">
                    {m.name}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.plan === 'Gold'
                          ? 'bg-amber-100 text-amber-800'
                          : m.plan === 'Silver'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {m.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{m.startDate}</td>
                  <td className="py-3 px-4 text-slate-500">{m.expiryDate}</td>
                  <td className="py-3 px-4">
                    {m.status === 'active' ? (
                      <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                      </span>
                    ) : m.status === 'expiring_soon' ? (
                      <span className="text-amber-700 font-semibold text-[11px] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" /> Expiring
                      </span>
                    ) : (
                      <span className="text-rose-700 font-semibold text-[11px] flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-500" /> Expired
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{m.phone}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 font-sans">
                      <button
                        onClick={() => setDetailMember(m)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        title="View Member Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => renewMember(m.memberId, 1)}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[10px] font-semibold flex items-center gap-1 text-slate-700 border border-slate-200/80 transition-colors"
                        title="Renew 1 Year"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Renew</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details Modal */}
      {detailMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-lg w-full p-6 relative">
            <button
              onClick={() => setDetailMember(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold font-mono">
                  {detailMember.plan} MEMBER
                </span>
                <span className="text-xs font-mono text-slate-500 font-semibold">{detailMember.memberId}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {detailMember.name}
              </h2>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{detailMember.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{detailMember.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Valid Thru: {detailMember.expiryDate} ({detailMember.status.replace('_', ' ')})</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase">Total Lifetime Bookings</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">
                    {detailMember.totalBookings}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase">Total Club Spend</div>
                  <div className="text-lg font-bold text-emerald-600 mt-0.5">
                    ₹{detailMember.totalSpent.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => {
                  renewMember(detailMember.memberId, 1);
                  setDetailMember(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Renew Membership (+1 Year)
              </button>
              <button
                onClick={() => setDetailMember(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Member Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-lg w-full p-6 relative">
            <button
              onClick={() => setAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <div className="text-xs font-mono uppercase text-blue-600 font-semibold">
                  Club Membership Desk
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  Register New Club Member
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemberForm.name}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                    placeholder="e.g. Yashvardhan Goenka"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={newMemberForm.email}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                      placeholder="yash@example.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={newMemberForm.phone}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                      placeholder="+91 98200 99887"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Membership Plan Tier
                    </label>
                    <select
                      value={newMemberForm.plan}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, plan: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Gold">Gold Tier (₹45,000 / yr)</option>
                      <option value="Silver">Silver Tier (₹28,000 / yr)</option>
                      <option value="Junior">Junior Tier (₹22,000 / yr)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={newMemberForm.paymentMethod}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="UPI">UPI (Google Pay / PhonePe)</option>
                      <option value="Card">Credit / Debit Card</option>
                      <option value="Online">Net Banking</option>
                      <option value="Cash">Cash at Counter</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Register & Issue ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
