import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { Booking, BookingStatus } from '../../types';
import {
  CalendarCheck,
  Search,
  Filter,
  Plus,
  XCircle,
  CheckCircle,
  Clock,
  Sparkles,
  CreditCard,
} from 'lucide-react';

export const BookingsAdmin: React.FC = () => {
  const { bookings, cancelBooking, setCurrentView, courts } = useClub();

  const [courtFilter, setCourtFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | BookingStatus>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBookings = bookings.filter((b) => {
    if (courtFilter !== 'All' && b.courtId !== courtFilter) return false;
    if (statusFilter !== 'All' && b.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        b.customerName.toLowerCase().includes(q) ||
        b.bookingCode.toLowerCase().includes(q) ||
        b.courtName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
            Reservations Desk
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Court Bookings & Schedule Ledger
          </h1>
          <p className="text-xs text-slate-500">
            {bookings.length} Registered Reservations · Double booking visibly prohibited across all courts.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('public_courts')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Court Booking</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search booking code, customer, court..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={courtFilter}
            onChange={(e) => setCourtFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Courts</option>
            {courts.map((c) => (
              <option key={c.id} value={c.id}>
                Court {c.number}: {c.name.split(' ')[0]}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="social_play">Social Play</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-mono uppercase text-slate-700">
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Court Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Time Interval</th>
                <th className="py-3 px-4">Sport</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{b.bookingCode}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-900 whitespace-nowrap">
                    {b.customerName}
                    {b.membershipTier && b.membershipTier !== 'Guest' && (
                      <span className="ml-1 text-[10px] text-blue-600 font-mono">
                        ({b.membershipTier})
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-700 whitespace-nowrap">
                    {b.courtName}
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{b.date}</td>
                  <td className="py-3 px-4 text-slate-900 font-semibold whitespace-nowrap">
                    {b.startTime} – {b.endTime}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{b.sport}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    ₹{b.amount}
                  </td>
                  <td className="py-3 px-4">
                    {b.status === 'confirmed' ? (
                      <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 w-fit">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Confirmed
                      </span>
                    ) : b.status === 'social_play' ? (
                      <span className="text-purple-700 font-semibold text-[11px] flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 w-fit">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Social Play
                      </span>
                    ) : b.status === 'completed' ? (
                      <span className="text-slate-600 font-semibold text-[11px] flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 w-fit">
                        ● Completed
                      </span>
                    ) : (
                      <span className="text-rose-700 font-semibold text-[11px] flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 w-fit">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Cancelled
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => cancelBooking(b.id)}
                        className="text-[10px] font-sans font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 border border-rose-200 transition-colors"
                      >
                        Cancel Slot
                      </button>
                    )}
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
