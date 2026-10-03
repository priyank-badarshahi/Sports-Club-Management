import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Trophy, ShieldCheck, Mail, Phone, Calendar, User, Check, Edit2, QrCode, Wallet, Plus, ArrowUpRight, CreditCard, Sparkles, History } from 'lucide-react';
import { getTierBadgeClass, getTierName, formatDate, formatINR, formatDateTime } from '../../lib/formatters';

export const MemberProfilePage: React.FC = () => {
  const { currentUser, members, updateMember, addToast, plans, topupWallet, payments } = useAppStore();
  const currentMember = members.find((m) => m.id === currentUser.memberId) || members[0];
  const plan = plans.find((p) => p.tier === currentMember.tier) || plans[0];

  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    phone: currentMember.phone,
    emergencyName: currentMember.emergencyContact.name,
    emergencyPhone: currentMember.emergencyContact.phone,
    emergencyRelation: currentMember.emergencyContact.relation,
  });

  // Wallet Top-up state
  const [topupAmount, setTopupAmount] = useState('2000');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cash'>('upi');
  const [rechargeSuccess, setRechargeSuccess] = useState(false);

  const memberPayments = payments.filter((p) => p.memberId === currentMember.id);

  const handleWalletRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(topupAmount, 10);
    if (isNaN(amt) || amt <= 0) return;

    topupWallet(currentMember.id, amt, paymentMethod);
    setRechargeSuccess(true);
    setTimeout(() => setRechargeSuccess(false), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMember(currentMember.id, {
      phone: formData.phone,
      emergencyContact: {
        name: formData.emergencyName,
        phone: formData.emergencyPhone,
        relation: formData.emergencyRelation,
      },
    });
    setEditOpen(false);
    addToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your emergency contact information has been saved.',
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-lime-400">
          Digital Member ID
        </span>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
          Membership Passport & Privileges
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Official credentials for court gate access, locker room, and club billing.
        </p>
      </div>

      {/* Digital Passport Card */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400/60 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <img
              src={currentMember.avatar}
              alt={currentMember.fullName}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400/60"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${getTierBadgeClass(currentMember.tier)}`}>
                  {getTierName(currentMember.tier)}
                </span>
                <span className="text-xs font-bold text-lime-400">Official Pass</span>
              </div>
              <h2 className="font-heading font-extrabold text-2xl text-white mt-1">
                {currentMember.fullName}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {currentMember.memberNumber}
              </p>
            </div>
          </div>

          <div className="p-3 bg-white rounded-2xl w-fit self-start sm:self-auto">
            <QrCode className="w-16 h-16 text-slate-950" />
            <span className="text-[8px] text-center font-bold text-slate-800 block uppercase tracking-tighter mt-1">
              Gate Scan
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-xs">
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-bold block">Enrolled Date</span>
            <span className="text-white font-medium">{formatDate(currentMember.joinDate)}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-bold block">Expiry Countdown</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-lime-400 font-bold font-mono">
                {Math.max(0, Math.ceil((new Date(currentMember.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} Days Left
              </span>
            </div>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-bold block">Club Wallet</span>
            <span className="text-white font-semibold">{formatINR(currentMember.walletBalance)}</span>
          </div>
          <div className="flex items-center justify-end">
            <button
              onClick={() => {
                addToast({
                  type: 'success',
                  title: 'Membership Renewal Order Created',
                  message: `Renewal invoice generated for ${getTierName(currentMember.tier)}. Valid until Oct 2027.`,
                });
              }}
              className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 transition"
            >
              Renew Membership
            </button>
          </div>
        </div>
      </div>

      {/* Guest Pass Usage & Junior Linked Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guest Pass Usage */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase text-lime-400">Privilege Entitlement</span>
              <h3 className="font-heading font-bold text-base text-white mt-0.5">Guest Pass Allowance</h3>
            </div>
            <span className="text-2xl font-heading font-extrabold text-lime-400">
              {4 - (currentMember.guestPassesUsed || 0)} / 4
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Gold & Silver members receive 4 complimentary guest access passes per quarter for non-member court play and lounge access.
          </p>
          <button
            onClick={() => {
              addToast({
                type: 'info',
                title: 'Guest Pass QR Generated',
                message: 'Show the single-use Guest Pass QR code to Front Desk upon arrival.',
              });
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
          >
            + Generate Single-Use Guest QR Pass
          </button>
        </div>

        {/* Guardian-Linked Junior Accounts */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase text-sky-400">Family & Junior Links</span>
              <h3 className="font-heading font-bold text-base text-white mt-0.5">Junior Linked Accounts</h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
              1 Junior Linked
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <div className="font-bold text-white">Aryan Malhotra</div>
                <div className="text-[10px] text-slate-400">Junior Padel Clinic • Age 12</div>
              </div>
            </div>
            <span className="text-[10px] text-lime-400 font-semibold">Active Junior Pass</span>
          </div>
        </div>
      </div>

      {/* Member Referral Program */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
              Champions Club Referral Reward
            </span>
            <h3 className="font-heading font-bold text-lg text-white mt-0.5">
              Invite Friends & Earn ₹2,000 Wallet Bonus
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Share your personal referral code. When a friend joins Gold or Silver membership, both of you receive ₹2,000 in your Club Wallet.
            </p>
          </div>

          <div className="p-3 px-5 rounded-2xl bg-slate-950 border border-amber-400/40 shrink-0 text-center">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Your Personal Code</span>
            <span className="font-mono font-extrabold text-xl text-amber-400 tracking-widest">
              VIKRAM-CC2026
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => {
              navigator.clipboard?.writeText('https://championsclub.in/join?ref=VIKRAM-CC2026');
              addToast({
                type: 'success',
                title: 'Referral Link Copied!',
                message: 'Copied https://championsclub.in/join?ref=VIKRAM-CC2026 to clipboard.',
              });
            }}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 transition"
          >
            Copy Referral Link
          </button>
        </div>
      </div>

      {/* Interactive Club Wallet: Balance & Top-up Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-lime-400 font-bold text-xs uppercase tracking-wider">
              <Wallet className="w-4 h-4" />
              <span>Champions Club Prepaid Wallet</span>
            </div>
            <h3 className="font-heading font-extrabold text-2xl text-white mt-0.5">
              Wallet Balance & Instant Top-up
            </h3>
            <p className="text-xs text-slate-400">
              Use your prepaid balance for zero-hassle court bookings, gear purchases, and café bar tabs.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left sm:text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Balance</span>
            <div className="font-heading font-extrabold text-2xl sm:text-3xl text-lime-400">
              {formatINR(currentMember.walletBalance)}
            </div>
          </div>
        </div>

        {/* Top-up Form */}
        <form onSubmit={handleWalletRecharge} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-2">Select Recharge Amount</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['500', '1000', '2000', '5000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopupAmount(amt)}
                  className={`py-3 rounded-2xl font-bold border transition ${
                    topupAmount === amt
                      ? 'bg-lime-400 text-slate-950 border-lime-400 shadow-md shadow-lime-400/20'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800'
                  }`}
                >
                  +₹{parseInt(amt, 10).toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Custom Amount (₹)</label>
              <input
                type="number"
                min="100"
                step="100"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="Enter amount (e.g. 3500)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:border-lime-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-lime-400 uppercase font-semibold"
              >
                <option value="upi">UPI Instant (Google Pay / PhonePe)</option>
                <option value="card">Credit / Debit Card</option>
                <option value="cash">Front Desk Cash Handover</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              * Funds are credited instantly and logged in the finance ledger.
            </span>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-lg shadow-lime-400/20 flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Recharge {formatINR(parseInt(topupAmount, 10) || 0)}</span>
            </button>
          </div>

          {rechargeSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Wallet recharged successfully! Your new balance is {formatINR(currentMember.walletBalance)}.</span>
            </div>
          )}
        </form>

        {/* Recent Wallet Recharges / Payment Log */}
        {memberPayments.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-lime-400" />
                <span>Recent Recharges & Receipts</span>
              </span>
              <span className="text-slate-500">{memberPayments.length} recorded</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {memberPayments.slice(0, 4).map((pay) => (
                <div
                  key={pay.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">{pay.purpose}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {pay.paymentNumber} • {formatDateTime(pay.timestamp)} via {pay.method.toUpperCase()}
                    </div>
                  </div>
                  <span className="font-heading font-bold text-lime-400">
                    +{formatINR(pay.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Entitlements Checklist */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
        <h3 className="font-heading font-bold text-base text-white">Your Plan Entitlements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {plan.features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <Check className="w-4 h-4 text-lime-400 shrink-0" />
              <span className="text-slate-300">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact & Emergency Profile */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-white">Contact & Emergency Information</h3>
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Details</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Registered Phone</span>
            <div className="text-white font-medium">{currentMember.phone}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Email Address</span>
            <div className="text-white font-medium">{currentMember.email}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Emergency Contact Person</span>
            <div className="text-white font-medium">
              {currentMember.emergencyContact.name} ({currentMember.emergencyContact.relation})
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Emergency Phone</span>
            <div className="text-white font-medium">{currentMember.emergencyContact.phone}</div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-heading font-bold text-lg text-white">Update Contact Details</h3>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Relationship</label>
                  <input
                    type="text"
                    value={formData.emergencyRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-400 text-slate-950 font-bold shadow-md shadow-lime-400/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
