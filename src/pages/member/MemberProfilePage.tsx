import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store';
import {
  Trophy,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  User,
  Check,
  Edit2,
  QrCode,
  Wallet,
  Plus,
  ArrowUpRight,
  CreditCard,
  Sparkles,
  History,
  Shield,
  Key,
  Eye,
  EyeOff,
  Camera,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { getTierBadgeClass, getTierName, formatDate, formatINR, formatDateTime } from '../../lib/formatters';

const AVATAR_PRESETS = [
  { label: 'Tennis Pro', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' },
  { label: 'Athletic Male', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
  { label: 'Athletic Female', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80' },
  { label: 'Padel Champion', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
  { label: 'Badminton Ace', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80' },
  { label: 'Executive Sport', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80' },
];

export const MemberProfilePage: React.FC = () => {
  const { currentUser, members, updateMember, updateUserProfile, addToast, plans, topupWallet, payments } = useAppStore();
  const currentMember =
    members.find(
      (m) =>
        Boolean(currentUser.memberId && m.id === currentUser.memberId) ||
        Boolean(currentUser.email && m.email?.toLowerCase() === currentUser.email?.toLowerCase())
    ) || {
      id: currentUser.memberId || `mem_${currentUser.email?.replace(/[^a-z0-9]/gi, '') || 'new'}`,
      memberNumber: currentUser.memberId ? `CC-2026-${currentUser.memberId}` : 'CC-2026-NEW',
      fullName: currentUser.name || 'Club Member',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      tier: currentUser.tier || 'walk_in',
      status: 'active' as const,
      joinDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      walletBalance: 0,
      activeTabBalance: 0,
      emergencyContact: { name: 'Emergency Contact', phone: currentUser.phone || '', relation: 'Self' },
      preferredSports: ['tennis'],
      attendanceLog: [],
      reminderLog: [],
    };
  const plan = plans.find((p) => p.tier === currentMember.tier) || plans[0];

  // Full Profile edit modal state
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: currentMember.fullName,
    phone: currentMember.phone,
    dateOfBirth: currentMember.dateOfBirth || '2000-01-01',
    preferredSport: currentMember.preferredSports?.[0] || 'tennis',
    avatar: currentMember.avatar,
    emergencyName: currentMember.emergencyContact?.name || '',
    emergencyPhone: currentMember.emergencyContact?.phone || '',
    emergencyRelation: currentMember.emergencyContact?.relation || '',
  });

  // Password change modal state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

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

  const handleOpenEdit = () => {
    setProfileForm({
      fullName: currentMember.fullName,
      phone: currentMember.phone,
      dateOfBirth: currentMember.dateOfBirth || '2000-01-01',
      preferredSport: currentMember.preferredSports?.[0] || 'tennis',
      avatar: currentMember.avatar,
      emergencyName: currentMember.emergencyContact?.name || '',
      emergencyPhone: currentMember.emergencyContact?.phone || '',
      emergencyRelation: currentMember.emergencyContact?.relation || '',
    });
    setProfileEditOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      addToast({
        type: 'error',
        title: 'Name Required',
        message: 'Please provide your full legal or member name.',
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentMember.email || currentUser.email,
          fullName: profileForm.fullName.trim(),
          phone: profileForm.phone.trim(),
          dateOfBirth: profileForm.dateOfBirth,
          avatar: profileForm.avatar.trim(),
          emergencyContact: {
            name: profileForm.emergencyName.trim(),
            phone: profileForm.emergencyPhone.trim(),
            relation: profileForm.emergencyRelation.trim(),
          },
          preferredSports: [profileForm.preferredSport],
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to update profile.');
      }

      // Update in client store
      updateUserProfile({
        name: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
        avatar: profileForm.avatar.trim(),
        dateOfBirth: profileForm.dateOfBirth,
        preferredSports: [profileForm.preferredSport as any],
        emergencyContact: {
          name: profileForm.emergencyName.trim(),
          phone: profileForm.emergencyPhone.trim(),
          relation: profileForm.emergencyRelation.trim(),
        },
      });

      updateMember(currentMember.id, {
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
        avatar: profileForm.avatar.trim(),
        dateOfBirth: profileForm.dateOfBirth,
        preferredSports: [profileForm.preferredSport as any],
        emergencyContact: {
          name: profileForm.emergencyName.trim(),
          phone: profileForm.emergencyPhone.trim(),
          relation: profileForm.emergencyRelation.trim(),
        },
      });

      setProfileEditOpen(false);
      addToast({
        type: 'success',
        title: 'Profile Updated Successfully',
        message: 'Your personal details, contact information, and avatar have been saved.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not save profile details.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match. Please re-enter.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentMember.email || currentUser.email,
          currentPassword,
          newPassword,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to change password. Please check your current password.');
      }

      setPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast({
        type: 'success',
        title: 'Password Changed Successfully',
        message: 'Your login credentials have been updated. Use your new password for your next sign-in.',
      });
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
      addToast({
        type: 'error',
        title: 'Password Change Failed',
        message: err.message || 'Could not change password.',
      });
    } finally {
      setIsChangingPassword(false);
    }
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
            <div className="relative group shrink-0">
              <img
                src={currentMember.avatar}
                alt={currentMember.fullName}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400/60 shadow-lg"
              />
              <button
                type="button"
                onClick={handleOpenEdit}
                title="Change Avatar & Profile Details"
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition backdrop-blur-xs"
              >
                <Camera className="w-5 h-5 text-lime-400" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2">
                {currentMember.tier && currentMember.tier !== 'none' && currentMember.tier !== 'walk_in' ? (
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${getTierBadgeClass(currentMember.tier)}`}>
                    {getTierName(currentMember.tier)}
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                      Walk-in Member
                    </span>
                    <Link
                      to="/plans"
                      className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold hover:brightness-110 shadow-sm shadow-amber-400/20 transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Upgrade</span>
                    </Link>
                  </div>
                )}
                <span className="text-xs font-bold text-lime-400">Official Pass</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <h2 className="font-heading font-extrabold text-2xl text-white">
                  {currentMember.fullName}
                </h2>
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-lime-400 transition"
                  title="Edit Profile Details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {currentMember.memberNumber} • {currentMember.phone}
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
          <div className="flex items-center justify-end gap-2">
            <Link
              to="/plans"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {currentMember.tier === 'walk_in' || currentMember.tier === 'none'
                  ? 'Purchase Membership'
                  : 'Upgrade / Change Plan'}
              </span>
            </Link>
            {currentMember.tier && currentMember.tier !== 'walk_in' && currentMember.tier !== 'none' && (
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
            )}
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
      {/* Contact & Personal Profile */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">Personal Credentials</span>
            <h3 className="font-heading font-extrabold text-xl text-white mt-0.5">
              Personal Profile & Emergency Contacts
            </h3>
            <p className="text-xs text-slate-400">
              Your registered identity details used across court bookings, club tournaments, and invoices.
            </p>
          </div>
          <button
            onClick={handleOpenEdit}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-lime-400 border border-slate-700 hover:border-lime-400/40 shadow-sm transition self-start sm:self-auto"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile Details</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px] block">Full Name</span>
            <div className="text-white font-semibold">{currentMember.fullName}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px] block">Verified Login Email</span>
            <div className="text-white font-medium truncate">{currentMember.email}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px] block">Mobile Phone</span>
            <div className="text-white font-medium">{currentMember.phone || 'Not provided'}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px] block">Date of Birth</span>
            <div className="text-white font-medium">{currentMember.dateOfBirth || '2000-01-01'}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px] block">Preferred Primary Sport</span>
            <div className="text-lime-400 font-semibold uppercase text-xs">
              {currentMember.preferredSports?.[0] || 'Tennis'}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px] block">Emergency Contact</span>
            <div className="text-white font-medium truncate">
              {currentMember.emergencyContact?.name || 'Contact'} ({currentMember.emergencyContact?.relation || 'Family'})
            </div>
            <div className="text-slate-400 text-[10px] font-mono mt-0.5">
              {currentMember.emergencyContact?.phone || currentMember.phone}
            </div>
          </div>
        </div>
      </div>

      {/* Account Security & Password Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-lime-400 font-bold text-xs uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>Account Credentials & Security</span>
            </div>
            <h3 className="font-heading font-extrabold text-xl text-white mt-1">
              Login Password & Security
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ensure your account is protected with a secure and unique login password.
            </p>
          </div>

          <button
            onClick={() => {
              setPasswordError('');
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setPasswordModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 transition self-start sm:self-auto"
          >
            <Key className="w-4 h-4" />
            <span>Change Password</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px] block">Login Email</span>
            <div className="text-white font-medium truncate">{currentMember.email}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px] block">Password Status</span>
            <div className="text-white font-mono font-bold tracking-widest">••••••••••••</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px] block">Security Protection</span>
            <div className="flex items-center gap-1.5 text-lime-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Active & Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Details Modal */}
      {profileEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">Personal Info</span>
                <h3 className="font-heading font-extrabold text-xl text-white mt-0.5">
                  Update Member Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setProfileEditOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              {/* DOB & Sport */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Primary Sport</label>
                  <select
                    value={profileForm.preferredSport}
                    onChange={(e) => setProfileForm({ ...profileForm, preferredSport: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-lime-400 capitalize"
                  >
                    <option value="tennis">Tennis</option>
                    <option value="padel">Padel</option>
                    <option value="badminton">Badminton</option>
                    <option value="cricket">Box Cricket</option>
                  </select>
                </div>
              </div>

              {/* Profile Avatar Selection & Preview */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-slate-300 font-semibold block">Profile Photo / Avatar</label>
                <div className="flex items-center gap-3">
                  <img
                    src={profileForm.avatar}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-lime-400/60 shrink-0"
                  />
                  <input
                    type="url"
                    value={profileForm.avatar}
                    onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                    placeholder="Enter image URL (https://...)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-[11px] focus:outline-none focus:border-lime-400 font-mono"
                  />
                </div>

                {/* Preset Avatar Selection */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Or choose an athletic avatar preset:</span>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfileForm({ ...profileForm, avatar: preset.url })}
                        className={`relative rounded-xl overflow-hidden shrink-0 border-2 transition ${
                          profileForm.avatar === preset.url
                            ? 'border-lime-400 scale-105 shadow-md shadow-lime-400/20'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                        title={preset.label}
                      >
                        <img src={preset.url} alt={preset.label} className="w-9 h-9 object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Emergency Contact Group */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-lime-400 block">Emergency Contact Information</span>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    value={profileForm.emergencyName}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyName: e.target.value })}
                    placeholder="e.g. Priya Malhotra"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Emergency Phone</label>
                    <input
                      type="tel"
                      value={profileForm.emergencyPhone}
                      onChange={(e) => setProfileForm({ ...profileForm, emergencyPhone: e.target.value })}
                      placeholder="+91 98765 11111"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-lime-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Relationship</label>
                    <input
                      type="text"
                      value={profileForm.emergencyRelation}
                      onChange={(e) => setProfileForm({ ...profileForm, emergencyRelation: e.target.value })}
                      placeholder="e.g. Spouse / Parent / Sibling"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-lime-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isSavingProfile}
                  onClick={() => setProfileEditOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold shadow-md shadow-lime-400/20 flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Profile Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/20">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-white">Change Account Password</h3>
                  <p className="text-[11px] text-slate-400">Update your Champions Club password</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-lime-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">New Password *</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-lime-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Password must contain minimum 6 characters.
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Confirm New Password *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-lime-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isChangingPassword}
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold shadow-md shadow-lime-400/20 flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
