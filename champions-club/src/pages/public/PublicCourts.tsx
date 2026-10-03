import React, { useState, useEffect } from 'react';
import { useClub } from '../../context/ClubContext';
import { Court, SportType, Booking } from '../../types';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
  CreditCard,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export const PublicCourts: React.FC = () => {
  const {
    courts,
    bookings,
    addBooking,
    currentUser,
    isAuthenticated,
    setCurrentView,
    authIntent,
    setAuthIntent,
  } = useClub();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSport, setSelectedSport] = useState<'All' | SportType>('All');
  const [selectedCourtId, setSelectedCourtId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Login Required Modal state
  const [loginRequiredModal, setLoginRequiredModal] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<{
    court: Court;
    startTime: string;
    endTime: string;
  } | null>(null);

  // Authenticated Booking Confirmation Modal state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<{
    court: Court;
    startTime: string;
    endTime: string;
  } | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash' | 'Online'>('UPI');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Resume intent after login if returning from auth redirect
  useEffect(() => {
    if (isAuthenticated && authIntent?.extraData && authIntent.view === 'public_courts') {
      const { court, startTime, endTime, date } = authIntent.extraData;
      if (court && startTime && endTime) {
        if (date) setSelectedDate(date);
        setActiveSlot({ court, startTime, endTime });
        setBookingModalOpen(true);
        // Clear intent once picked up
        setAuthIntent(null);
      }
    }
  }, [isAuthenticated, authIntent]);

  // Generate 30-minute interval slots from 06:00 to 22:00
  const timeSlots: string[] = [];
  for (let hour = 6; hour <= 21; hour++) {
    const hh = String(hour).padStart(2, '0');
    timeSlots.push(`${hh}:00`);
    timeSlots.push(`${hh}:30`);
  }

  const calculateEndTime = (startTime: string): string => {
    const [h, m] = startTime.split(':').map(Number);
    const endH = h + 1;
    return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Filter courts by sport and courtId
  const filteredCourts = courts.filter((c) => {
    if (selectedSport !== 'All' && c.sport !== selectedSport) return false;
    if (selectedCourtId !== 'all' && c.id !== selectedCourtId) return false;
    return true;
  });

  // Calculate next 7 days for week view
  const weekDays: { dateStr: string; label: string; dayName: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    weekDays.push({ dateStr: dStr, label, dayName });
  }

  // Check if a court slot is booked, social play, or available (STRICT PRIVACY: NO CUSTOMER INFO EXPOSED)
  const getSlotState = (courtId: string, slotTime: string, date = selectedDate) => {
    const endTime = calculateEndTime(slotTime);
    const booking = bookings.find((b) => {
      if (b.courtId !== courtId || b.date !== date || b.status === 'cancelled') {
        return false;
      }
      return b.startTime < endTime && b.endTime > slotTime;
    });

    if (!booking) return { state: 'available', isSocial: false };
    if (booking.isSocialPlay) return { state: 'social_play', isSocial: true };
    return { state: 'booked', isSocial: false };
  };

  // Click handler on slot
  const handleSlotClick = (court: Court, startTime: string) => {
    const { state } = getSlotState(court.id, startTime);
    if (state === 'booked') {
      return; // Cannot book an already booked slot
    }

    const endTime = calculateEndTime(startTime);

    if (!isAuthenticated) {
      // Unauthenticated visitor -> Show Login Required prompt
      setPendingSlot({ court, startTime, endTime });
      setLoginRequiredModal(true);
      return;
    }

    // Authenticated user -> Open Booking Confirmation
    setActiveSlot({ court, startTime, endTime });
    setBookingError(null);
    setBookingModalOpen(true);
  };

  // Redirect to login or signup with intent preserved
  const handleLoginToBook = () => {
    if (pendingSlot) {
      setAuthIntent({
        view: 'public_courts',
        extraData: {
          court: pendingSlot.court,
          startTime: pendingSlot.startTime,
          endTime: pendingSlot.endTime,
          date: selectedDate,
        },
        message: `Please login to confirm booking for ${pendingSlot.court.name} at ${pendingSlot.startTime} on ${selectedDate}.`,
      });
    }
    setLoginRequiredModal(false);
    setCurrentView('public_login');
  };

  const handleSignupToBook = () => {
    if (pendingSlot) {
      setAuthIntent({
        view: 'public_courts',
        extraData: {
          court: pendingSlot.court,
          startTime: pendingSlot.startTime,
          endTime: pendingSlot.endTime,
          date: selectedDate,
        },
        message: `Create an account to book ${pendingSlot.court.name} at ${pendingSlot.startTime}.`,
      });
    }
    setLoginRequiredModal(false);
    setCurrentView('public_signup');
  };

  // Execute authenticated booking
  const handleConfirmBooking = () => {
    if (!activeSlot) return;

    // Strict double-booking validation
    const currentSlotStatus = getSlotState(activeSlot.court.id, activeSlot.startTime, selectedDate);
    if (currentSlotStatus.state === 'booked') {
      setBookingError('This slot is no longer available. Please select another slot.');
      return;
    }

    const result = addBooking({
      courtId: activeSlot.court.id,
      sport: activeSlot.court.sport,
      date: selectedDate,
      startTime: activeSlot.startTime,
      endTime: activeSlot.endTime,
      customerName: currentUser.name || 'Member',
      customerPhone: currentUser.phone,
      customerEmail: currentUser.email,
      memberId: currentUser.memberId,
      paymentMethod,
    });

    if (result.success && result.booking) {
      setConfirmedBooking(result.booking);
      setActiveSlot(null);
      setBookingModalOpen(false);
      setBookingError(null);
    } else {
      setBookingError(result.error || 'Failed to complete court booking.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
            Live Public Schedule
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Court Availability
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse real-time open court slots across our championship facilities. Log in to book your slot.
          </p>
        </div>

        {/* Legend: Strictly Anonymized */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-700 font-medium">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-slate-700 font-medium">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-slate-700 font-medium">Social Play</span>
          </div>
        </div>
      </div>

      {/* Top Filter & Calendar Controls */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Date Selector: Today / Tomorrow / Other Date */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
            Select Date
          </label>
          <div className="flex items-center gap-1.5 mb-2">
            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium text-xs transition-colors ${
                selectedDate === todayStr
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(tomorrowStr)}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium text-xs transition-colors ${
                selectedDate === tomorrowStr
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tomorrow
            </button>
          </div>
          <input
            type="date"
            value={selectedDate}
            min={todayStr}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs bg-white"
          />
        </div>

        {/* Game Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
            Select Game
          </label>
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="All">All Games</option>
            <option value="Tennis">Tennis</option>
            <option value="Padel">Padel</option>
            <option value="Badminton">Badminton</option>
          </select>
          <div className="text-[10px] text-slate-400 mt-1">
            Displaying {filteredCourts.length} facilities
          </div>
        </div>

        {/* Court Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
            Court Filter
          </label>
          <select
            value={selectedCourtId}
            onChange={(e) => setSelectedCourtId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Courts (Court 1 – 4)</option>
            {courts.map((c) => (
              <option key={c.id} value={c.id}>
                Court {c.number}: {c.name} ({c.sport})
              </option>
            ))}
          </select>
          <div className="text-[10px] text-slate-400 mt-1">
            Rate: ₹{courts[0]?.hourlyRate || 800} – ₹{courts[3]?.hourlyRate || 1100}/hr
          </div>
        </div>

        {/* View Mode: Day vs Week */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
            Calendar View
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setViewMode('day')}
              className={`py-2 px-3 rounded-lg border font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                viewMode === 'day'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Day Slots</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`py-2 px-3 rounded-lg border font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                viewMode === 'week'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>7-Day View</span>
            </button>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            {viewMode === 'day' ? `Showing ${selectedDate}` : 'Next 7 days schedule'}
          </div>
        </div>
      </div>

      {/* Booking Success Notice */}
      {confirmedBooking && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold">Court Booking Confirmed! Code: {confirmedBooking.bookingCode}</div>
              <div>
                {confirmedBooking.courtName} reserved for {confirmedBooking.date} ({confirmedBooking.startTime} – {confirmedBooking.endTime}).
              </div>
            </div>
          </div>
          <button
            onClick={() => setConfirmedBooking(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* VIEW 1: DAY SCHEDULE GRID */}
      {viewMode === 'day' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 text-xs font-mono uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 w-28 border-r border-slate-200">Time</th>
                  {filteredCourts.map((court) => (
                    <th key={court.id} className="py-3 px-4 border-r border-slate-200 last:border-0">
                      <div className="font-bold text-slate-900">Court {court.number}</div>
                      <div className="text-[10px] text-blue-600 font-semibold normal-case">
                        {court.name} · {court.sport}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-mono">
                {timeSlots.map((slotTime) => (
                  <tr key={slotTime} className="hover:bg-slate-50/70 transition-colors">
                    {/* Time Label */}
                    <td className="py-2.5 px-4 font-semibold text-slate-700 bg-slate-50/50 border-r border-slate-200 whitespace-nowrap">
                      {slotTime}
                    </td>

                    {/* Court Slots — STRICT PRIVACY: NO CUSTOMER NAMES */}
                    {filteredCourts.map((court) => {
                      const { state } = getSlotState(court.id, slotTime);

                      if (state === 'booked') {
                        return (
                          <td key={court.id} className="p-1 border-r border-slate-100 last:border-0">
                            <div
                              className="w-full py-2 px-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed flex items-center justify-between"
                              title="Court slot is currently booked"
                            >
                              <span className="font-sans font-semibold text-[11px] flex items-center gap-1.5 text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-slate-400" />
                                Booked
                              </span>
                              <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            </div>
                          </td>
                        );
                      }

                      if (state === 'social_play') {
                        return (
                          <td key={court.id} className="p-1 border-r border-slate-100 last:border-0">
                            <div
                              className="w-full py-2 px-2.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 cursor-pointer flex items-center justify-between hover:bg-purple-100 transition-colors"
                              onClick={() => {
                                if (!isAuthenticated) {
                                  setPendingSlot({ court, startTime: slotTime, endTime: calculateEndTime(slotTime) });
                                  setLoginRequiredModal(true);
                                } else {
                                  setCurrentView('public_social');
                                }
                              }}
                            >
                              <span className="font-sans font-semibold text-[11px] flex items-center gap-1.5 text-purple-700">
                                <span className="w-2 h-2 rounded-full bg-purple-500" />
                                Social Play
                              </span>
                              <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={court.id} className="p-1 border-r border-slate-100 last:border-0">
                          <button
                            onClick={() => handleSlotClick(court, slotTime)}
                            className="w-full py-2 px-2.5 rounded-lg text-left transition-all flex items-center justify-between bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 hover:border-emerald-300 group shadow-2xs"
                          >
                            <span className="font-sans font-semibold text-[11px] flex items-center gap-1.5 text-emerald-700">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              Available
                            </span>
                            <span className="text-[10px] text-blue-600 font-semibold font-mono group-hover:underline">
                              Book →
                            </span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW 2: 7-DAY OVERVIEW MATRIX */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">7-Day Court Utilization Summary</h3>
            <span className="text-xs text-slate-400">Click any date to switch to slot view</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCourts.map((court) => (
              <div key={court.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">Court {court.number}</div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                    {court.sport}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">₹{court.hourlyRate}/hour rate</div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                  {weekDays.map((d) => {
                    const bookedCount = bookings.filter(
                      (b) => b.courtId === court.id && b.date === d.dateStr && b.status !== 'cancelled'
                    ).length;
                    const totalSlots = 32;
                    const openSlots = totalSlots - bookedCount;

                    return (
                      <div
                        key={d.dateStr}
                        onClick={() => {
                          setSelectedDate(d.dateStr);
                          setViewMode('day');
                        }}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-colors shadow-2xs"
                      >
                        <span className="font-medium text-slate-700">
                          {d.dayName}, {d.label}
                        </span>
                        <span className="font-mono text-[11px] text-emerald-700 font-semibold">
                          {openSlots} slots open
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: "LOGIN REQUIRED" */}
      {loginRequiredModal && pendingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative">
            <button
              onClick={() => setLoginRequiredModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Login Required</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Please login or create a Champions Club account to book this court.
                </p>
              </div>

              {/* Selected Slot Summary Preview */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left font-mono text-xs space-y-1">
                <div className="font-bold text-slate-900 font-sans text-sm">{pendingSlot.court.name}</div>
                <div className="text-blue-700 font-semibold">
                  Date: {selectedDate} · {pendingSlot.startTime} – {pendingSlot.endTime} (1 hr)
                </div>
                <div className="text-[11px] text-slate-500">
                  Game: {pendingSlot.court.sport} · Rate: ₹{pendingSlot.court.hourlyRate}/hr
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleLoginToBook}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Log In to Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSignupToBook}
                  className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors"
                >
                  Create New Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM BOOKING */}
      {bookingModalOpen && activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative">
            <button
              onClick={() => setBookingModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5">
              <div>
                <div className="text-xs font-mono uppercase text-blue-600 font-semibold">
                  Member Reservation
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  Confirm Court Booking
                </h3>
              </div>

              {bookingError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {bookingError}
                </div>
              )}

              {/* Slot Details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Court:</span>
                  <span className="font-bold text-slate-900">{activeSlot.court.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-mono text-slate-900">{selectedDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Time Session:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {activeSlot.startTime} – {activeSlot.endTime} (1 Hour)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Reserved For:</span>
                  <span className="font-semibold text-slate-900">
                    {currentUser.name} {currentUser.memberId && `(${currentUser.memberId})`}
                  </span>
                </div>
              </div>

              {/* Price Calculation with Member Discount */}
              {(() => {
                const baseRate = activeSlot.court.hourlyRate;
                const isMember = currentUser.role === 'member';
                const discountRate = isMember ? 0.20 : 0;
                const discount = Math.round(baseRate * discountRate);
                const finalPayable = baseRate - discount;

                return (
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1 font-mono text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Standard Court Rate:</span>
                      <span>₹{baseRate}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-blue-700 font-semibold">
                        <span>Member Discount (20%):</span>
                        <span>-₹{discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1 border-t border-blue-200">
                      <span>Total Payable:</span>
                      <span>₹{finalPayable}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Card', 'Cash'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                        paymentMethod === method
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors"
                >
                  Confirm & Reserve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
