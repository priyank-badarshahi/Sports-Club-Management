import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, DEMO_USERS } from '../../store';
import { Court, SportType, MembershipTier, Booking } from '../../types';
import { 
  Calendar, 
  Clock, 
  Filter, 
  Check, 
  Zap, 
  Sparkles, 
  LogIn, 
  X, 
  Trophy,
  Flame,
  Activity,
  Wallet,
  CreditCard,
  CheckCircle2,
  DollarSign,
  UserCheck,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { formatINR, getCourtStatusBadge, getSportDisplayName } from '../../lib/formatters';
import { generateTimeSlots, calculateEndTime, isPeakHour } from '../../lib/booking';

const SPORT_FILTER_OPTIONS: { id: SportType | 'all'; label: string }[] = [
  { id: 'all', label: 'All Arenas' },
  { id: 'box_cricket', label: 'Box Cricket' },
  { id: 'badminton', label: 'Badminton' },
  { id: 'table_tennis', label: 'Table Tennis' },
  { id: 'volleyball', label: 'Volleyball' },
  { id: 'kho_kho', label: 'Kho Kho' },
  { id: 'hockey', label: 'Hockey' },
  { id: 'football', label: 'Football' },
  { id: 'kabaddi', label: 'Kabaddi' },
];

export const AvailabilityPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    courts, 
    bookings, 
    socialSessions, 
    currentUser, 
    currentRole, 
    addBooking, 
    setCurrentUser, 
    setRole,
    members 
  } = useAppStore();
  
  // Date selection (defaults to 2026-10-03 demo base or today)
  const [selectedDate, setSelectedDate] = useState('2026-10-03');
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('all');
  
  // Selected slot for action modal
  const [activeSlot, setActiveSlot] = useState<{ court: Court; time: string } | null>(null);
  
  // Quick booking state in modal
  const [instantPaymentMethod, setInstantPaymentMethod] = useState<'wallet' | 'plan_included' | 'upi' | 'card' | 'pay_at_desk'>('wallet');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Check if member is logged in
  const isMemberLoggedIn = (currentRole === 'member' || currentUser.role === 'member') && currentUser.role !== 'visitor';
  const currentMemberRecord = members.find(
    (m) => (currentUser.memberId && m.id === currentUser.memberId) || (currentUser.email && m.email?.toLowerCase() === currentUser.email?.toLowerCase())
  );
  const rawTier = isMemberLoggedIn ? (currentMemberRecord?.tier || currentUser.tier || 'gold') : 'walk_in';
  const userTier: 'walk_in' | 'junior' | 'silver' | 'gold' = rawTier === 'none' ? 'walk_in' : rawTier;

  // Generate 7-day strip from selected base date
  const sevenDayDates = useMemo(() => {
    const dates = [];
    const base = new Date(selectedDate);
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, [selectedDate]);

  // Standard operating 30-min slots
  const timeSlots = useMemo(() => generateTimeSlots(6, 22, 30), []);

  const filteredCourts = useMemo(() => {
    return courts.filter((c) => selectedSport === 'all' || c.sport === selectedSport);
  }, [courts, selectedSport]);

  const isSlotBooked = (courtId: string, time: string) => {
    return bookings.some(
      (b) =>
        b.courtId === courtId &&
        b.date === selectedDate &&
        b.startTime <= time &&
        b.endTime > time &&
        b.status !== 'cancelled'
    );
  };

  const getSocialPlayOnSlot = (courtId: string, time: string) => {
    return socialSessions.find(
      (s) =>
        s.courtIds.includes(courtId) &&
        s.date === selectedDate &&
        s.startTime <= time &&
        s.endTime > time
    );
  };

  const handleOpenActionModal = (court: Court, time: string) => {
    setActiveSlot({ court, time });
    setConfirmedBooking(null);
  };

  const handleCloseModal = () => {
    setActiveSlot(null);
    setConfirmedBooking(null);
  };

  const handleGoToTrial = () => {
    if (!activeSlot) return;
    navigate(`/book-trial?sport=${activeSlot.court.sport}&date=${selectedDate}&time=${activeSlot.time}`);
  };

  const handleGoToMemberWizard = () => {
    if (!activeSlot) return;
    navigate(`/member/book?sport=${activeSlot.court.sport}&courtId=${activeSlot.court.id}&date=${selectedDate}&time=${activeSlot.time}&step=3`);
  };

  const handleGoToLogin = () => {
    if (!activeSlot) return;
    const redirectUrl = `/member/book?sport=${activeSlot.court.sport}&courtId=${activeSlot.court.id}&date=${selectedDate}&time=${activeSlot.time}&step=3`;
    navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
  };

  const handleQuickDemoMemberLogin = () => {
    setCurrentUser(DEMO_USERS.member);
    setRole('member');
  };

  // Instant booking right inside the modal
  const handleInstantBook = () => {
    if (!activeSlot) return;
    setIsSubmittingBooking(true);

    try {
      const hourlyPrice = (activeSlot.court.hourlyRate[userTier] ?? activeSlot.court.hourlyRate.walk_in) || activeSlot.court.hourlyRate.walk_in;
      const finalPrice = instantPaymentMethod === 'plan_included' ? 0 : hourlyPrice;

      const newBooking = addBooking({
        courtId: activeSlot.court.id,
        memberId: currentUser.memberId || currentMemberRecord?.id || 'mem_1',
        guestName: currentUser.name || 'Member',
        guestPhone: currentUser.phone || currentMemberRecord?.phone || '+91 98401 22334',
        guestEmail: currentUser.email || currentMemberRecord?.email || 'member@championsclub.in',
        tier: userTier,
        date: selectedDate,
        startTime: activeSlot.time,
        endTime: calculateEndTime(activeSlot.time, 60),
        sport: activeSlot.court.sport,
        bookingType: 'regular',
        channel: 'online',
        status: 'confirmed',
        isPaid: true,
        paymentMethod: instantPaymentMethod as any,
        totalPrice: finalPrice,
        discountApplied: Math.max(0, activeSlot.court.hourlyRate.walk_in - finalPrice),
      });

      if (newBooking) {
        setConfirmedBooking(newBooking);
      }
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-lime-400">
            Real-Time Public Schedule Matrix
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mt-1">
            Live Court Availability
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            View live court occupancy across 8 championship facilities. Click any green slot to reserve a complimentary trial or book with member privileges.
          </p>
        </div>

        {/* Sport filter controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start md:self-auto overflow-x-auto max-w-full">
          {SPORT_FILTER_OPTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSport(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
                selectedSport === s.id
                  ? 'bg-lime-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 7-DAY SELECTOR STRIP */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-lime-400">
            7-Day Schedule Window
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Pick custom start:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {sevenDayDates.map((dStr, idx) => {
            const d = new Date(dStr);
            const isSelected = selectedDate === dStr;
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const dayBookingsCount = bookings.filter((b) => b.date === dStr && b.status !== 'cancelled').length;

            return (
              <button
                key={dStr}
                onClick={() => setSelectedDate(dStr)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-lime-400/10 border-lime-400 shadow-lg shadow-lime-400/10 ring-1 ring-lime-400'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold ${isSelected ? 'text-lime-400' : 'text-slate-400'}`}>
                    {idx === 0 ? 'Today' : dayName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {dayBookingsCount} booked
                  </span>
                </div>
                <div className="font-heading font-extrabold text-sm text-white mt-1">
                  {dayNum}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AVAILABILITY MATRIX TABLE */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Legend */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/50" />
              <span>Available (Open)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/50" />
              <span>Reserved</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-500/30 border border-indigo-500/60" />
              <span>Social Play</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
              <span>Maintenance</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isMemberLoggedIn ? (
              <span className="text-[11px] text-lime-400 font-semibold flex items-center gap-1 bg-lime-400/10 px-2.5 py-1 rounded-full border border-lime-400/20">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Logged in: {currentUser.name} ({userTier.toUpperCase()})</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                Guest View • <button onClick={handleQuickDemoMemberLogin} className="text-lime-400 hover:underline font-semibold">Demo Login</button>
              </span>
            )}
            <span className="text-[11px] text-slate-500">
              Selected Date: <strong className="text-white font-mono">{selectedDate}</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase">
                <th className="py-3 px-4 min-w-[220px] sticky left-0 bg-slate-950/95 z-10 backdrop-blur-md">
                  Championship Court
                </th>
                {timeSlots.map((time) => (
                  <th key={time} className="py-3 px-2 text-center min-w-[70px] font-mono text-[11px]">
                    {time}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredCourts.map((court) => (
                <tr key={court.id} className="hover:bg-slate-800/20 transition-colors">
                  {/* Court Header Cell */}
                  <td className="py-3 px-4 sticky left-0 bg-slate-950/95 z-10 backdrop-blur-md border-r border-slate-800">
                    <div className="font-heading font-semibold text-white truncate max-w-[210px]">
                      {court.name}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1.5 mt-0.5">
                      <span className="text-lime-400 font-medium">{getSportDisplayName(court.sport)}</span>
                      <span>•</span>
                      <span>{court.surface.split(' ')[0]}</span>
                    </div>
                  </td>

                  {/* Slot Cells */}
                  {timeSlots.map((time) => {
                    const booked = isSlotBooked(court.id, time);
                    const social = getSocialPlayOnSlot(court.id, time);
                    const isMaint = court.status === 'maintenance';

                    if (isMaint) {
                      return (
                        <td key={time} className="p-1 text-center">
                          <div className="w-full h-9 rounded-lg bg-slate-800/40 border border-slate-800 text-[9px] text-slate-500 flex items-center justify-center font-mono">
                            Maint
                          </div>
                        </td>
                      );
                    }

                    if (social) {
                      return (
                        <td key={time} className="p-1 text-center">
                          <div
                            onClick={() => handleOpenActionModal(court, time)}
                            className="w-full h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-[9px] text-indigo-300 font-bold flex items-center justify-center cursor-pointer hover:bg-indigo-500/30 transition"
                            title={`Friday Social Play on ${court.name}`}
                          >
                            Social
                          </div>
                        </td>
                      );
                    }

                    if (booked) {
                      return (
                        <td key={time} className="p-1 text-center">
                          <div className="w-full h-9 rounded-lg bg-rose-500/15 border border-rose-500/30 text-[9px] text-rose-300/80 font-medium flex items-center justify-center font-mono">
                            Booked
                          </div>
                        </td>
                      );
                    }

                    // Open / Available Slot
                    return (
                      <td key={time} className="p-1 text-center">
                        <button
                          onClick={() => handleOpenActionModal(court, time)}
                          className="w-full h-9 rounded-lg bg-emerald-500/10 hover:bg-lime-400 hover:text-slate-950 border border-emerald-500/30 hover:border-lime-400 text-emerald-400 text-[11px] font-semibold flex items-center justify-center transition-all group shadow-sm"
                          title={`Click to book ${court.name} at ${time}`}
                        >
                          <span className="group-hover:hidden">Open</span>
                          <span className="hidden group-hover:inline font-bold text-[10px]">Book</span>
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

      {/* SLOT CLICK ACTION MODAL */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-lg w-full shadow-2xl space-y-6">
            
            {/* Confirmation Pass Screen */}
            {confirmedBooking ? (
              <div className="text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-lime-400/20 border-2 border-lime-400 flex items-center justify-center text-lime-400 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-lime-400 font-bold">
                    Reservation Confirmed • ID: {confirmedBooking.id}
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl text-white mt-1">
                    Court Booked Successfully!
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Your court reservation is active. Your digital pass and QR code are ready for gate check-in.
                  </p>
                </div>

                {/* Confirmed Court Image Banner */}
                {activeSlot.court.image && (
                  <div className="relative h-32 rounded-2xl overflow-hidden border border-lime-400/30 shadow-lg">
                    <img
                      src={activeSlot.court.image}
                      alt={activeSlot.court.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-white bg-slate-950/80 px-2.5 py-0.5 rounded-lg border border-slate-700">
                        {activeSlot.court.name}
                      </span>
                      <span className="text-[10px] font-bold text-lime-400 bg-lime-950/80 px-2 py-0.5 rounded border border-lime-400/30">
                        Confirmed Slot
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Championship Venue:</span>
                    <span className="text-white font-bold">{activeSlot.court.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date & Slot:</span>
                    <span className="text-lime-400 font-bold font-mono">
                      {confirmedBooking.date} ({confirmedBooking.startTime} - {confirmedBooking.endTime})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Player:</span>
                    <span className="text-white">{confirmedBooking.guestName} ({confirmedBooking.tier?.toUpperCase()} Member)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Settled:</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {formatINR(confirmedBooking.totalPrice)} ({(confirmedBooking.paymentMethod || 'wallet').toUpperCase()})
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Digital Access Pass:</span>
                    <span className="text-lime-400 font-mono font-bold">{confirmedBooking.qrCodeData || `CC-PASS-${confirmedBooking.id}`}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleCloseModal();
                      navigate('/member/book?tab=my_bookings');
                    }}
                    className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                  >
                    View in My Bookings
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition"
                  >
                    Done / Book More
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-lime-400">Available Slot Selection</span>
                    <h3 className="font-heading font-extrabold text-xl text-white">
                      Reserve Championship Court
                    </h3>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Court Image Banner */}
                {activeSlot.court.image && (
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-800 shadow-inner group">
                    <img
                      src={activeSlot.court.image}
                      alt={activeSlot.court.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-white bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700/80 shadow-md">
                        {activeSlot.court.name}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-lime-400/30 shadow-md">
                        {getSportDisplayName(activeSlot.court.sport)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Selected Slot Information */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Championship Venue:</span>
                    <span className="text-white font-bold">{activeSlot.court.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date & Session:</span>
                    <span className="text-lime-400 font-bold font-mono">
                      {selectedDate} at {activeSlot.time} (60 Mins)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sport & Surface:</span>
                    <span className="text-slate-300 capitalize">
                      {getSportDisplayName(activeSlot.court.sport)} • {activeSlot.court.surface}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lighting & Features:</span>
                    <span className="text-slate-300">
                      {activeSlot.court.facilityFeature || (activeSlot.court.hasFloodlights ? 'High-Intensity Floodlights' : 'Indoor Glare-Free LED')}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Rates by Tier:</span>
                    <div className="text-right">
                      <span className="text-xs text-lime-400 font-bold">
                        Gold: {formatINR(activeSlot.court.hourlyRate.gold)}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-2">
                        Silver: {formatINR(activeSlot.court.hourlyRate.silver)}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-2">
                        Walk-in: {formatINR(activeSlot.court.hourlyRate.walk_in)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* LOGGED IN MEMBER BOOKING SECTION */}
                {isMemberLoggedIn ? (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <UserCheck className="w-5 h-5 text-lime-400" />
                        <div>
                          <div className="text-white font-bold">{currentUser.name}</div>
                          <div className="text-lime-400 text-[10px] uppercase font-semibold">
                            {userTier} Member Privilege
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Your Session Rate</div>
                        <div className="font-heading font-extrabold text-lime-400 text-base">
                          {formatINR(activeSlot.court.hourlyRate[userTier] ?? activeSlot.court.hourlyRate.walk_in)}
                        </div>
                      </div>
                    </div>

                    {/* Instant Payment Selector */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                        Select Payment Method for Instant Booking
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setInstantPaymentMethod('wallet')}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                            instantPaymentMethod === 'wallet'
                              ? 'bg-lime-400 text-slate-950 font-bold border-lime-400'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <Wallet className="w-4 h-4" />
                          <span>Club Wallet</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setInstantPaymentMethod('upi')}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                            instantPaymentMethod === 'upi'
                              ? 'bg-lime-400 text-slate-950 font-bold border-lime-400'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <Zap className="w-4 h-4" />
                          <span>Instant UPI</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setInstantPaymentMethod('card')}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                            instantPaymentMethod === 'card'
                              ? 'bg-lime-400 text-slate-950 font-bold border-lime-400'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Card</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setInstantPaymentMethod('pay_at_desk')}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                            instantPaymentMethod === 'pay_at_desk'
                              ? 'bg-lime-400 text-slate-950 font-bold border-lime-400'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <DollarSign className="w-4 h-4" />
                          <span>Pay at Desk</span>
                        </button>
                      </div>
                    </div>

                    {/* Action buttons for Logged In User */}
                    <div className="space-y-2.5 pt-2">
                      <button
                        onClick={handleInstantBook}
                        disabled={isSubmittingBooking}
                        className="w-full p-4 rounded-2xl bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-lime-400/20 flex items-center justify-between transition group disabled:opacity-50"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <div className="text-left">
                            <div className="font-bold">Instant Book This Court</div>
                            <div className="text-[10px] font-normal opacity-85">Reserve slot & generate QR court pass</div>
                          </div>
                        </div>
                        <span className="font-mono text-sm">
                          {formatINR(activeSlot.court.hourlyRate[userTier] ?? activeSlot.court.hourlyRate.walk_in)} →
                        </span>
                      </button>

                      <button
                        onClick={handleGoToMemberWizard}
                        className="w-full p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-semibold text-xs flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-lime-400" />
                          <span>Open in Booking Wizard (Add Guests / Recurring)</span>
                        </div>
                        <span className="text-slate-400 text-[11px]">Advanced →</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* VISITOR / GUEST OPTIONS */
                  <div className="space-y-3">
                    <button
                      onClick={handleGoToLogin}
                      className="w-full p-4 rounded-2xl bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-lime-400/20 flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2.5">
                        <LogIn className="w-4 h-4" />
                        <div className="text-left">
                          <div className="font-bold">Login to Book as Member</div>
                          <div className="text-[10px] font-normal opacity-85">Apply tier rates, wallet balance & quota</div>
                        </div>
                      </div>
                      <span>Login & Book →</span>
                    </button>

                    <button
                      onClick={handleGoToTrial}
                      className="w-full p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-bold text-xs flex items-center justify-between transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-lime-400" />
                        <div className="text-left">
                          <div className="font-bold">Book Complimentary VIP Trial</div>
                          <div className="text-[10px] font-normal text-slate-400">Includes free racquet loaner & coach consult</div>
                        </div>
                      </div>
                      <span>Free Trial →</span>
                    </button>

                    <button
                      onClick={handleQuickDemoMemberLogin}
                      className="w-full py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>⚡ Quick Demo Login as Gold Member (Vikram)</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
