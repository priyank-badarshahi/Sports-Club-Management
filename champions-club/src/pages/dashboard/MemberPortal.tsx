import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import {
  UserCheck,
  CalendarCheck,
  ShoppingBag,
  CreditCard,
  RefreshCw,
  Clock,
  Sparkles,
  Award,
  ArrowRight,
  ShieldCheck,
  Coffee,
} from 'lucide-react';

export const MemberPortal: React.FC = () => {
  const {
    members,
    bookings,
    transactions,
    renewMember,
    cancelBooking,
    setCurrentView,
    shopOrders,
    currentUser,
  } = useClub();

  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'orders' | 'payments'>('overview');

  // Dynamically resolve member profile based on logged-in user
  const activeMember = members.find((m) => m.memberId === currentUser.memberId) ||
    members.find((m) => m.email.toLowerCase() === (currentUser.email || '').toLowerCase()) ||
    members[0];

  // Member's bookings
  const memberBookings = bookings.filter(
    (b) => b.memberId === activeMember.memberId || b.customerName.toLowerCase().includes(activeMember.name.toLowerCase().split(' ')[0])
  );

  // Today's upcoming booking
  const today = new Date().toISOString().split('T')[0];
  const upcomingBooking = memberBookings.find(
    (b) => b.date >= today && b.status === 'confirmed'
  ) || memberBookings[0];

  // Member's transactions
  const memberTransactions = transactions.filter(
    (t) => t.memberId === activeMember.memberId || t.customerName.toLowerCase().includes(activeMember.name.toLowerCase().split(' ')[0])
  );

  // Member's orders
  const memberOrders = shopOrders.filter(
    (o) => o.memberId === activeMember.memberId || o.customerName.toLowerCase().includes(activeMember.name.toLowerCase().split(' ')[0])
  );

  return (
    <div className="space-y-8">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
            Member Private Space
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Welcome back, {activeMember.name}
          </h1>
          <p className="text-xs text-slate-500">
            {activeMember.plan} Member ({activeMember.memberId}) · Priority court reservations · 20% privilege rate across all facilities
          </p>
        </div>

        <button
          onClick={() => setCurrentView('public_courts')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Book a Court</span>
        </button>
      </div>

      {/* Row 1: Digital Membership Card + Upcoming Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Digital Membership Card (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-xs">
                CC
              </div>
              <div>
                <div className="font-extrabold text-sm tracking-tight text-white">CHAMPIONS CLUB</div>
                <div className="text-[10px] font-mono text-amber-300 uppercase tracking-widest">
                  VIP Athletic Pass
                </div>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/20 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeMember.plan} Member</span>
            </span>
          </div>

          <div className="my-8 space-y-1">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Cardholder</div>
            <div className="text-2xl font-black tracking-tight text-white">{activeMember.name}</div>
            <div className="text-xs font-mono text-amber-300">ID: {activeMember.memberId}</div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="space-y-0.5">
              <div className="text-slate-400 text-[10px] uppercase">Valid Until</div>
              <div className="text-white font-bold">{activeMember.expiryDate} (Active)</div>
            </div>

            <button
              onClick={() => renewMember(activeMember.memberId, 1)}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-sans flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Renew Membership</span>
            </button>
          </div>
        </div>

        {/* Upcoming Booking Card (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400 mb-2">
              <span className="flex items-center gap-1 text-blue-600 font-semibold">
                <Clock className="w-3.5 h-3.5" /> Next Confirmed Slot
              </span>
              <span>Today</span>
            </div>

            {upcomingBooking ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {upcomingBooking.courtName}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono mt-1">
                    {upcomingBooking.sport} · 1-Hour Session
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 font-mono space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Time Interval:</span>
                    <span className="font-bold text-slate-900">
                      {upcomingBooking.startTime} – {upcomingBooking.endTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Booking Code:</span>
                    <span className="font-bold text-blue-600">
                      {upcomingBooking.bookingCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Privilege Rate:</span>
                    <span className="font-bold text-slate-900">
                      ₹{upcomingBooking.amount} (Paid)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No active booking for today.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <button
              onClick={() => setCurrentView('public_courts')}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
            >
              Book Another Court
            </button>
            <button
              onClick={() => setCurrentView('public_social')}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200"
            >
              Friday Social Play
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Book a Court', icon: CalendarCheck, view: 'public_courts' as const, desc: 'Reserve 1-4' },
          { label: 'Pro Sports Shop', icon: ShoppingBag, view: 'public_shop' as const, desc: 'Balls & Gear' },
          { label: 'Cafeteria & Bar', icon: Coffee, view: 'public_bar' as const, desc: 'Open Tab & Menu' },
          { label: 'Friday Social Play', icon: Sparkles, view: 'public_social' as const, desc: 'Weekly Mixer' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => setCurrentView(item.view)}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs text-left transition-all group shadow-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-900 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors mb-3">
                <Icon className="w-4 h-4" />
              </div>
              <div className="font-bold text-slate-900 text-xs">{item.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Member Activity Tabs: Overview, Bookings, Orders, Payments */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
          {(['overview', 'bookings', 'orders', 'payments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 rounded-xl capitalize font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Recent Account Activity</h3>
            <div className="space-y-3 font-mono text-xs">
              {memberTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-sans font-bold text-slate-900">{tx.description}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {tx.date} · Paid via {tx.paymentMethod}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-sm">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      Completed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-3 font-mono text-xs">
            {memberBookings.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <div className="font-sans font-bold text-slate-900">{b.courtName}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {b.date} · {b.startTime} - {b.endTime} ({b.sport})
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-sm">₹{b.amount}</span>
                  <div className="text-[10px] text-emerald-600 font-semibold">
                    {b.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-3 font-mono text-xs">
            {memberOrders.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">No orders recorded yet.</div>
            ) : (
              memberOrders.map((o) => (
                <div
                  key={o.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-sans font-bold text-slate-900">{o.orderNumber}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {o.items.length} items · Fulfillment: {o.deliveryType}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-sm">
                      ₹{o.total.toLocaleString('en-IN')}
                    </span>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      {o.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-3 font-mono text-xs">
            {memberTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900">{tx.txCode}</div>
                  <div className="font-sans text-[11px] text-slate-500 mt-0.5">{tx.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400">{tx.paymentMethod}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
