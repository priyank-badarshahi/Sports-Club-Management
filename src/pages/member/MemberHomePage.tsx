import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Coffee, 
  ShoppingBag, 
  Wallet, 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  MapPin, 
  CreditCard,
  Plus
} from 'lucide-react';
import { formatINR, getTierBadgeClass, getTierName, formatDate } from '../../lib/formatters';

export const MemberHomePage: React.FC = () => {
  const { currentUser, members, bookings, tabs, cancelBooking, addToast, updateMember } = useAppStore();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletAddAmount, setWalletAddAmount] = useState('2000');

  const currentMember = members.find((m) => m.id === currentUser.memberId) || members[0];
  const userBookings = bookings.filter((b) => b.memberId === currentMember.id && b.status !== 'cancelled');
  const userTab = tabs.find((t) => t.memberId === currentMember.id && t.status === 'open');

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(walletAddAmount, 10);
    if (isNaN(amount) || amount <= 0) return;

    updateMember(currentMember.id, {
      walletBalance: currentMember.walletBalance + amount,
    });
    addToast({
      type: 'success',
      title: 'Wallet Recharged',
      message: `Added ${formatINR(amount)} to your Champions Club Wallet.`,
    });
    setWalletModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome & Digital Membership Card */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-400/40 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={currentMember.avatar}
              alt={currentMember.fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-amber-400/60 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2">
                {currentMember.tier && currentMember.tier !== 'none' && currentMember.tier !== 'walk_in' ? (
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${getTierBadgeClass(currentMember.tier)}`}>
                    {getTierName(currentMember.tier)}
                  </span>
                ) : (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                    Standard Member
                  </span>
                )}
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active Membership
                </span>
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
                Welcome back, {currentMember.fullName.split(' ')[0]}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Member ID: <strong className="text-slate-200">{currentMember.memberNumber}</strong> • Valid until {formatDate(currentMember.expiryDate)}
              </p>
            </div>
          </div>

          {/* Quick Wallet & Tab Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 px-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Club Wallet</span>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg text-lime-400">
                  {formatINR(currentMember.walletBalance)}
                </span>
                <button
                  onClick={() => setWalletModalOpen(true)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-lime-400 transition"
                  title="Top-up Wallet"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {userTab && (
              <Link
                to="/member/tab"
                className="p-3 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition"
              >
                <span className="text-[10px] uppercase font-bold text-amber-400 block">Open Bar Tab</span>
                <span className="font-heading font-extrabold text-lg text-amber-300">
                  {formatINR(Math.round(userTab.totalAmount))}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/member/book"
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-lime-400/40 transition group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center group-hover:scale-110 transition">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <h4 className="font-heading font-bold text-sm text-white">Book a Court</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">14-Day advance window</p>
          </div>
        </Link>

        <Link
          to="/member/tab"
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-400/40 transition group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
            <Coffee className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <h4 className="font-heading font-bold text-sm text-white">Bar & Café Tab</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">15% Gold discount active</p>
          </div>
        </Link>

        <Link
          to="/member/shop"
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-400/40 transition group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <h4 className="font-heading font-bold text-sm text-white">Pro Gear Shop</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">20% Tier savings</p>
          </div>
        </Link>

        <Link
          to="/member/profile"
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-400/40 transition group flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-400/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <h4 className="font-heading font-bold text-sm text-white">My Passport</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">4 Guest passes remaining</p>
          </div>
        </Link>
      </div>

      {/* Active Upcoming Reservations */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-lime-400" />
            <h3 className="font-heading font-bold text-lg text-white">Your Upcoming Court Bookings</h3>
          </div>
          <Link to="/member/book" className="text-xs font-semibold text-lime-400 hover:underline">
            + Reserve New Slot
          </Link>
        </div>

        {userBookings.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="text-xs">You have no active court reservations.</p>
            <Link
              to="/member/book"
              className="mt-3 inline-block px-4 py-2 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs"
            >
              Reserve a Court Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">
                      {b.sport} Court
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                      {b.status}
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-sm text-white">{b.courtId.replace(/_/g, ' ').toUpperCase()}</h4>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {b.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {b.startTime} - {b.endTime}
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Paid: <strong className="text-white">{formatINR(b.totalPrice)}</strong>
                  </span>
                  <button
                    onClick={() => cancelBooking(b.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:underline"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top-up Wallet Modal */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-heading font-extrabold text-lg text-white">Top-up Club Wallet</h3>
            <p className="text-xs text-slate-400">
              Add funds to pay for court bookings, pro shop gear, and settling café tabs instantly.
            </p>

            <form onSubmit={handleAddWallet} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Select Amount (₹)</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {['1000', '2000', '5000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWalletAddAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-semibold border ${
                        walletAddAmount === amt
                          ? 'bg-lime-400 text-slate-950 border-lime-400'
                          : 'bg-slate-950 text-slate-300 border-slate-700'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={walletAddAmount}
                  onChange={(e) => setWalletAddAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWalletModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-400 text-slate-950 text-xs font-bold shadow-md shadow-lime-400/20"
                >
                  Add via UPI / Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
