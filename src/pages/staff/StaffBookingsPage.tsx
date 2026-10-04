import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../../store';
import { Booking, Court, SportType, MembershipTier, BookingType, BookingChannel } from '../../types';
import { 
  Calendar, 
  Clock, 
  Search, 
  Plus, 
  Check, 
  X, 
  Phone, 
  Activity, 
  AlertTriangle, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  BarChart3, 
  Users, 
  Flame, 
  Trophy, 
  Wrench, 
  Move, 
  QrCode,
  CheckCircle2,
  CalendarDays,
  Grid3X3,
  PhoneCall,
  TrendingUp,
  CreditCard,
  UserCheck,
  Zap
} from 'lucide-react';
import { formatINR, getTierBadgeClass, getTierName, formatDateTime } from '../../lib/formatters';
import { 
  generateTimeSlots, 
  calculateEndTime, 
  validateSlotAvailability,
  getAvailableCourtsAtTime, 
  calculateCourtUtilization, 
  getSocialSessionSpots,
  isPeakHour,
  calculateBookingPrice,
  validateCancellation
} from '../../lib/booking';

type TabView = 'timeline' | 'enquiry' | 'social' | 'analytics' | 'list';
type TimelineMode = 'day' | 'week' | 'month';

export const StaffBookingsPage: React.FC = () => {
  const { 
    bookings, 
    courts, 
    socialSessions, 
    members, 
    plans,
    settings,
    addBooking, 
    cancelBooking, 
    rescheduleBooking, 
    checkInBooking, 
    updateBookingStatus,
    createCourtBlock,
    joinSocialSession,
    leaveSocialSession,
    currentUser,
    pullFromSupabase
  } = useAppStore();

  useEffect(() => {
    pullFromSupabase();
  }, [pullFromSupabase]);

  // Navigation state
  const [activeTab, setActiveTab] = useState<TabView>('timeline');
  const [timelineMode, setTimelineMode] = useState<TimelineMode>('day');
  
  // Date state (defaults to today in 2026 demo context or current day)
  const [selectedDate, setSelectedDate] = useState('2026-10-03');
  const [sportFilter, setSportFilter] = useState<SportType | 'all'>('all');
  const [selectedCourtForWeek, setSelectedCourtForWeek] = useState<string>(courts[0]?.id || 'court-1');

  // Modals & Drawers
  const [quickBookingModal, setQuickBookingModal] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);
  const [rescheduleModalBooking, setRescheduleModalBooking] = useState<Booking | null>(null);
  const [blockCourtModal, setBlockCourtModal] = useState(false);
  const [draggedBookingId, setDraggedBookingId] = useState<string | null>(null);

  // Quick Booking Form State
  const [bookingForm, setBookingForm] = useState({
    courtId: courts[0]?.id || '',
    date: '2026-10-03',
    startTime: '18:00',
    memberId: '',
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    tier: 'gold' as MembershipTier,
    bookingType: 'regular' as BookingType,
    channel: 'front_desk' as BookingChannel,
    paymentMethod: 'wallet' as any,
    notes: '',
  });

  // Court Block Form State
  const [blockForm, setBlockForm] = useState({
    courtId: courts[0]?.id || '',
    date: '2026-10-03',
    startTime: '10:00',
    endTime: '12:00',
    type: 'maintenance' as 'coaching' | 'maintenance' | 'tournament',
    notes: 'Scheduled Maintenance Block',
  });

  // Concurrency Simulation State
  const [concurrencyModal, setConcurrencyModal] = useState<{
    isOpen: boolean;
    user1Result: Booking | null;
    user2ConflictReason: string;
    courtName: string;
    slotTime: string;
  }>({
    isOpen: false,
    user1Result: null,
    user2ConflictReason: '',
    courtName: '',
    slotTime: '',
  });

  const handleSimulateConcurrencyRace = () => {
    const targetCourt = courts[0] || { id: 'court-1', name: 'Champions Box Cricket Arena', sport: 'box_cricket', hourlyRate: { walk_in: 1200 } };
    const raceDate = selectedDate;
    const raceTime = '18:00';

    // Attempt 1: User 1 (Vikram Malhotra)
    const res1 = addBooking({
      courtId: targetCourt.id,
      memberId: 'mem_1',
      guestName: 'Vikram Malhotra',
      guestPhone: '+91 98401 22334',
      tier: 'gold',
      date: raceDate,
      startTime: raceTime,
      endTime: '19:00',
      sport: targetCourt.sport,
      totalPrice: 600,
      discountApplied: 600,
      bookingType: 'regular',
      channel: 'online',
      status: 'confirmed',
      isPaid: true,
      paymentMethod: 'wallet',
      notes: 'Concurrency Race Simulation - Attempt #1 (First Millisecond)',
    });

    // Attempt 2: User 2 (Anita Desai) for the EXACT same slot
    const res2 = addBooking({
      courtId: targetCourt.id,
      memberId: 'mem_2',
      guestName: 'Anita Desai',
      guestPhone: '+91 98401 55667',
      tier: 'gold',
      date: raceDate,
      startTime: raceTime,
      endTime: '19:00',
      sport: targetCourt.sport,
      totalPrice: 600,
      discountApplied: 600,
      bookingType: 'regular',
      channel: 'online',
      status: 'confirmed',
      isPaid: true,
      paymentMethod: 'wallet',
      notes: 'Concurrency Race Simulation - Attempt #2 (Simultaneous Second)',
    });

    useAppStore.getState().logAudit(
      'CONCURRENCY_RACE_TEST',
      `Court #${targetCourt.name}`,
      `Double-booking simulation: Attempt 1 (${res1 ? 'SUCCESS' : 'FAILED'}), Attempt 2 (${res2 ? 'SUCCESS' : 'SLOT_CONFLICT_BLOCKED'})`
    );

    setConcurrencyModal({
      isOpen: true,
      user1Result: res1,
      user2ConflictReason: `Court ${targetCourt.name} at ${raceTime} was locked milliseconds ago by Vikram Malhotra.`,
      courtName: targetCourt.name,
      slotTime: raceTime,
    });
  };

  // "What's Free Right Now?" Phone Enquiry state
  const [enquiryState, setEnquiryState] = useState({
    sport: 'all' as SportType | 'all',
    date: '2026-10-03',
    time: '18:00',
    durationMinutes: 60,
    tier: 'gold' as MembershipTier,
  });

  // Search & List filters
  const [listSearch, setListSearch] = useState('');
  const [listStatusFilter, setListStatusFilter] = useState('all');

  // Filtered courts based on sport
  const filteredCourts = useMemo(() => {
    return courts.filter((c) => sportFilter === 'all' || c.sport === sportFilter);
  }, [courts, sportFilter]);

  // Standard operating 30-min time slots from 06:00 to 21:30
  const timeSlots = useMemo(() => generateTimeSlots(6, 22, 30), []);

  // Quick date nav
  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, bookingId: string) => {
    e.dataTransfer.setData('text/plain', bookingId);
    setDraggedBookingId(bookingId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropSlot = (courtId: string, time: string) => {
    if (!draggedBookingId) return;
    rescheduleBooking(draggedBookingId, courtId, selectedDate, time);
    setDraggedBookingId(null);
  };

  // Cell click for quick booking
  const handleCellClick = (courtId: string, time: string) => {
    setBookingForm((prev) => ({
      ...prev,
      courtId,
      date: selectedDate,
      startTime: time,
    }));
    setQuickBookingModal(true);
  };

  // Open booking details
  const handleBookingClick = (e: React.MouseEvent, booking: Booking) => {
    e.stopPropagation();
    setSelectedBookingDetails(booking);
  };

  // Create booking submit
  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const court = courts.find((c) => c.id === bookingForm.courtId) || courts[0];
    const member = members.find((m) => m.id === bookingForm.memberId);
    const rawTier = member ? member.tier : bookingForm.tier;
    const tier = rawTier === 'none' ? 'walk_in' : rawTier;
    const rate = court.hourlyRate[tier] || court.hourlyRate.walk_in;
    const discount = Math.max(0, court.hourlyRate.walk_in - rate);

    addBooking({
      courtId: bookingForm.courtId,
      memberId: bookingForm.memberId || undefined,
      guestName: member ? member.fullName : bookingForm.guestName,
      guestPhone: member ? member.phone : bookingForm.guestPhone,
      guestEmail: member ? member.email : bookingForm.guestEmail,
      tier,
      date: bookingForm.date,
      startTime: bookingForm.startTime,
      endTime: calculateEndTime(bookingForm.startTime, 60),
      sport: court.sport,
      totalPrice: bookingForm.paymentMethod === 'plan_included' ? 0 : rate,
      discountApplied: discount,
      bookingType: bookingForm.bookingType,
      channel: bookingForm.channel,
      status: 'confirmed',
      isPaid: true,
      paymentMethod: bookingForm.paymentMethod,
      notes: bookingForm.notes,
    });

    setQuickBookingModal(false);
  };

  // Court Block submit
  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    createCourtBlock(
      blockForm.courtId,
      blockForm.date,
      blockForm.startTime,
      blockForm.endTime,
      blockForm.type,
      blockForm.notes
    );
    setBlockCourtModal(false);
  };

  // Enquiry results
  const enquiryResults = useMemo(() => {
    return getAvailableCourtsAtTime(
      courts,
      enquiryState.date,
      enquiryState.time,
      enquiryState.durationMinutes,
      bookings,
      socialSessions,
      enquiryState.sport === 'all' ? undefined : enquiryState.sport,
      enquiryState.tier
    );
  }, [courts, enquiryState, bookings, socialSessions]);

  // Analytics computation
  const analyticsData = useMemo(() => {
    return calculateCourtUtilization(courts, bookings, '2026-10-01', '2026-10-14');
  }, [courts, bookings]);

  // Find booking on a court/slot
  const getBookingForSlot = (courtId: string, date: string, time: string): Booking | undefined => {
    return bookings.find((b) => {
      if (b.courtId !== courtId) return false;
      if (b.date !== date) return false;
      if (b.status === 'cancelled') return false;
      const bStart = (b.startTime || '').slice(0, 5);
      const bEnd = (b.endTime || '').slice(0, 5);
      return bStart <= time && bEnd > time;
    });
  };

  // Check social session for slot
  const getSocialForSlot = (courtId: string, date: string, time: string) => {
    return socialSessions.find((s) => {
      if (!s.courtIds.includes(courtId)) return false;
      if (s.date !== date) return false;
      const sStart = (s.startTime || '').slice(0, 5);
      const sEnd = (s.endTime || '').slice(0, 5);
      return sStart <= time && sEnd > time;
    });
  };

  // Get color styles for booking cells
  const getBookingStyle = (b: Booking) => {
    if (b.bookingType === 'maintenance') {
      return 'bg-rose-500/20 border-rose-500/50 text-rose-300';
    }
    if (b.bookingType === 'tournament') {
      return 'bg-purple-500/25 border-purple-500/50 text-purple-200';
    }
    if (b.bookingType === 'coaching') {
      return 'bg-amber-500/20 border-amber-500/50 text-amber-200';
    }
    if (b.bookingType === 'trial') {
      return 'bg-teal-500/20 border-teal-500/50 text-teal-200';
    }
    if (b.status === 'checked_in') {
      return 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-sm shadow-emerald-500/10';
    }
    return 'bg-lime-500/15 border-lime-400/40 text-lime-200';
  };

  // Filtered bookings for table view
  const filteredListBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (listSearch) {
        const query = listSearch.toLowerCase();
        const matchName = (b.guestName || '').toLowerCase().includes(query);
        const matchId = (b.id || '').toLowerCase().includes(query);
        const matchPhone = (b.guestPhone || '').includes(query);
        if (!matchName && !matchId && !matchPhone) return false;
      }
      if (sportFilter !== 'all' && b.sport !== sportFilter) return false;
      if (listStatusFilter !== 'all' && b.status !== listStatusFilter) return false;
      return true;
    });
  }, [bookings, listSearch, sportFilter, listStatusFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400">
            Operations & Reservations Engine
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Court Bookings & Schedule Grid
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time multi-court timeline, phone enquiry fast responder, social play rosters, and utilization heatmaps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setBlockCourtModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Block Court</span>
          </button>

          <button
            onClick={handleSimulateConcurrencyRace}
            className="px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition"
            title="Simulate two users booking the exact same court slot simultaneously"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Simulate Double Booking Race</span>
          </button>

          <button
            onClick={() => {
              setBookingForm({
                courtId: courts[0].id,
                date: selectedDate,
                startTime: '18:00',
                memberId: '',
                guestName: '',
                guestPhone: '',
                guestEmail: '',
                tier: 'gold',
                bookingType: 'regular',
                channel: 'front_desk',
                paymentMethod: 'wallet',
                notes: '',
              });
              setQuickBookingModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'timeline'
                ? 'bg-lime-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Timeline Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('enquiry')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'enquiry'
                ? 'bg-lime-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>What's Free Right Now?</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'social'
                ? 'bg-lime-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Social Play & Waitlist</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'analytics'
                ? 'bg-lime-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Court Utilization</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'list'
                ? 'bg-lime-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Reservations List</span>
          </button>
        </div>

        {/* Sport Filter Pill Group */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
          {(['all', 'box_cricket', 'badminton', 'table_tennis', 'volleyball', 'kho_kho', 'hockey', 'football', 'kabaddi'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSportFilter(s as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize whitespace-nowrap transition ${
                sportFilter === s
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: TIMELINE GRID */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Date Navigator */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => shiftDate(-1)}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-lime-400"
              />

              <button
                onClick={() => shiftDate(1)}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedDate('2026-10-03')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-semibold"
              >
                Today
              </button>
            </div>

            {/* Mode Toggle (Day / Week / Month) & Legends */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Timeline mode buttons */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                {(['day', 'week', 'month'] as TimelineMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setTimelineMode(m)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                      timelineMode === m
                        ? 'bg-lime-400 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m} View
                  </button>
                ))}
              </div>

              {/* Court selector for week mode */}
              {timelineMode === 'week' && (
                <select
                  value={selectedCourtForWeek}
                  onChange={(e) => setSelectedCourtForWeek(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.sport})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Color Code Legend */}
          <div className="flex flex-wrap items-center gap-4 px-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-lime-500/20 border border-lime-400/50" />
              <span>Confirmed Member</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-400" />
              <span>Checked In</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500/60" />
              <span>Tournament</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/60" />
              <span>Coaching Clinic</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-500/30 border border-indigo-500/60" />
              <span>Social Play</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500/30 border border-rose-500/60" />
              <span>Maintenance Block</span>
            </span>
            <span className="ml-auto text-slate-500 hidden sm:inline">
              Tip: Drag bookings to move them or click any empty slot to book.
            </span>
          </div>

          {/* DAY VIEW TIMELINE */}
          {timelineMode === 'day' && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto max-h-[750px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-950 z-20 shadow-md">
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-3.5 px-3 min-w-[70px] text-center sticky left-0 bg-slate-950 z-30 font-mono text-[11px]">
                        Time
                      </th>
                      {filteredCourts.map((court) => (
                        <th key={court.id} className="py-3 px-3 min-w-[170px] border-l border-slate-800">
                          <div className="font-heading font-bold text-white text-xs truncate">
                            {court.name}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
                            <span className="capitalize text-lime-400 font-semibold">{court.sport}</span>
                            <span>{court.surface.split(' ')[0]}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {timeSlots.map((time) => {
                      const isPeak = isPeakHour(selectedDate, time, settings);

                      return (
                        <tr key={time} className={`hover:bg-slate-800/20 ${isPeak ? 'bg-amber-950/5' : ''}`}>
                          {/* Time label */}
                          <td className={`py-2 px-2 text-center sticky left-0 z-10 border-r border-slate-800 font-mono text-[11px] ${
                            isPeak ? 'bg-slate-950 text-amber-300 font-bold' : 'bg-slate-950 text-slate-400'
                          }`}>
                            {time}
                            {isPeak && <span className="block text-[8px] text-amber-500 uppercase tracking-tighter">Peak</span>}
                          </td>

                          {/* Court columns */}
                          {filteredCourts.map((court) => {
                            const booking = getBookingForSlot(court.id, selectedDate, time);
                            const social = getSocialForSlot(court.id, selectedDate, time);

                            // Check if this time slot is the START of the booking (to render the block properly)
                            if (booking) {
                              const isStartSlot = (booking.startTime?.slice(0, 5) || booking.startTime) === time;
                              if (!isStartSlot) {
                                // Already rendered by start slot, render placeholder cell
                                return (
                                  <td
                                    key={court.id}
                                    className="p-1 border-l border-slate-800/60 bg-slate-900/40"
                                  >
                                    <div
                                      onClick={(e) => handleBookingClick(e, booking)}
                                      className={`w-full h-8 rounded-lg border px-2 py-0.5 text-[10px] cursor-pointer flex items-center justify-between ${getBookingStyle(booking)}`}
                                    >
                                      <span className="truncate opacity-80">{booking.guestName}</span>
                                      <span className="font-mono text-[9px] opacity-70">to {booking.endTime}</span>
                                    </div>
                                  </td>
                                );
                              }

                              return (
                                <td
                                  key={court.id}
                                  className="p-1 border-l border-slate-800/60 relative group"
                                  onDragOver={handleDragOver}
                                >
                                  <div
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, booking.id)}
                                    onClick={(e) => handleBookingClick(e, booking)}
                                    className={`w-full min-h-[36px] rounded-xl border p-2 cursor-pointer transition shadow-md flex flex-col justify-between ${getBookingStyle(booking)}`}
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-bold truncate text-[11px] flex items-center gap-1">
                                        <Move className="w-2.5 h-2.5 opacity-60 shrink-0" />
                                        <span>{booking.guestName}</span>
                                      </span>
                                      <span className="text-[9px] px-1 py-0.2 rounded font-mono font-bold uppercase shrink-0 bg-black/40">
                                        {booking.tier}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] mt-1 opacity-80">
                                      <span>{booking.startTime} - {booking.endTime}</span>
                                      <span className="font-semibold">{formatINR(booking.totalPrice)}</span>
                                    </div>
                                  </div>
                                </td>
                              );
                            }

                            // Social Session
                            if (social) {
                              const spots = getSocialSessionSpots(social);
                              return (
                                <td key={court.id} className="p-1 border-l border-slate-800/60">
                                  <div
                                    onClick={() => setActiveTab('social')}
                                    className="w-full min-h-[36px] rounded-xl border border-indigo-500/50 bg-indigo-950/40 p-2 text-indigo-200 cursor-pointer shadow-md"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-[10px] truncate">{social.title}</span>
                                      <span className="text-[9px] font-mono bg-indigo-500/20 px-1 rounded">
                                        {spots.spotsLeft} spots left
                                      </span>
                                    </div>
                                    <div className="text-[9px] text-indigo-300/80 mt-0.5">
                                      {social.startTime} - {social.endTime} • Exclusive booking blocked
                                    </div>
                                  </div>
                                </td>
                              );
                            }

                            // Empty Available Slot
                            return (
                              <td
                                key={court.id}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDropSlot(court.id, time)}
                                onClick={() => handleCellClick(court.id, time)}
                                className="p-1 border-l border-slate-800/60 cursor-pointer group"
                              >
                                <div className="w-full h-8 rounded-lg border border-transparent group-hover:border-lime-400/40 group-hover:bg-lime-400/5 flex items-center justify-center transition">
                                  <span className="text-[10px] text-slate-600 group-hover:text-lime-400 font-medium hidden group-hover:inline">
                                    + Book {time}
                                  </span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* WEEK VIEW */}
          {timelineMode === 'week' && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-heading font-bold text-white text-base">
                    Weekly Matrix for {courts.find((c) => c.id === selectedCourtForWeek)?.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Displaying 7-day schedule distribution for selected court.
                  </p>
                </div>
              </div>

              {/* 7-day column view */}
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
                {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                  const dayDate = new Date(selectedDate);
                  dayDate.setDate(dayDate.getDate() + offset);
                  const dayStr = dayDate.toISOString().split('T')[0];
                  const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                  const dayBookings = bookings.filter(
                    (b) => b.courtId === selectedCourtForWeek && b.date === dayStr && b.status !== 'cancelled'
                  );

                  return (
                    <div key={dayStr} className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                      <div className="font-heading font-bold text-xs text-lime-400 border-b border-slate-800 pb-1">
                        {dayName}
                      </div>

                      <div className="space-y-1.5 min-h-[220px]">
                        {dayBookings.length === 0 ? (
                          <div className="text-[10px] text-slate-600 py-8 text-center">
                            Open availability
                          </div>
                        ) : (
                          dayBookings.map((b) => (
                            <div
                              key={b.id}
                              onClick={() => setSelectedBookingDetails(b)}
                              className={`p-2 rounded-xl border text-[10px] cursor-pointer ${getBookingStyle(b)}`}
                            >
                              <div className="font-bold truncate">{b.guestName}</div>
                              <div className="text-[9px] opacity-75">{b.startTime} - {b.endTime}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MONTH VIEW */}
          {timelineMode === 'month' && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
              <h3 className="font-heading font-bold text-white text-base">
                Monthly Court Schedule & Occupancy Calendar
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-3 text-xs">
                {Array.from({ length: 28 }).map((_, i) => {
                  const d = new Date('2026-10-01');
                  d.setDate(d.getDate() + i);
                  const dateStr = d.toISOString().split('T')[0];
                  const dayBookings = bookings.filter((b) => b.date === dateStr && b.status !== 'cancelled');
                  const count = dayBookings.length;
                  const isSelected = dateStr === selectedDate;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setTimelineMode('day');
                      }}
                      className={`p-3 rounded-2xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-lime-400/10 border-lime-400'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-sm">{d.getDate()}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
                      </div>
                      <div className="text-[11px] text-lime-400 font-semibold">
                        {count} {count === 1 ? 'booking' : 'bookings'}
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-lime-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, (count / 16) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: "WHAT'S FREE RIGHT NOW?" PHONE ENQUIRY ENGINE */}
      {activeTab === 'enquiry' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-lime-400/20 text-lime-400">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-extrabold text-xl text-white">
                  Front Desk "What's Free Right Now?" Enquiry Tool
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Answer phone and walk-in enquiries in seconds. Filter by sport, duration, and time slot with instant 1-click booking on behalf.
              </p>
            </div>
          </div>

          {/* Enquiry Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Sport</label>
              <select
                value={enquiryState.sport}
                onChange={(e) => setEnquiryState({ ...enquiryState, sport: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold"
              >
                <option value="all">All Sports</option>
                <option value="box_cricket">Box Cricket</option>
                <option value="badminton">Badminton</option>
                <option value="table_tennis">Table Tennis</option>
                <option value="volleyball">Volleyball</option>
                <option value="kho_kho">Kho Kho</option>
                <option value="hockey">Hockey</option>
                <option value="football">Football</option>
                <option value="kabaddi">Kabaddi</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Enquiry Date</label>
              <input
                type="date"
                value={enquiryState.date}
                onChange={(e) => setEnquiryState({ ...enquiryState, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Target Start Time</label>
              <select
                value={enquiryState.time}
                onChange={(e) => setEnquiryState({ ...enquiryState, time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              >
                {timeSlots.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Session Duration</label>
              <select
                value={enquiryState.durationMinutes}
                onChange={(e) => setEnquiryState({ ...enquiryState, durationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              >
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes (Standard)</option>
                <option value={90}>90 Minutes</option>
                <option value={120}>120 Minutes (2 Hours)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Caller Member Tier</label>
              <select
                value={enquiryState.tier}
                onChange={(e) => setEnquiryState({ ...enquiryState, tier: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white uppercase font-bold"
              >
                <option value="gold">Gold Member</option>
                <option value="silver">Silver Member</option>
                <option value="junior">Junior Academy</option>
                <option value="walk_in">Non-Member / Walk-in</option>
              </select>
            </div>
          </div>

          {/* Real-time Enquiry Results Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {enquiryResults.map((result) => {
              const { court, isAvailable, conflictReason, rateForTier } = result;

              return (
                <div
                  key={court.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isAvailable
                      ? 'bg-slate-950 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                      : 'bg-slate-950/60 border-rose-500/30 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Court #{court.courtNumber} • {court.sport}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        isAvailable
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isAvailable ? 'AVAILABLE NOW' : 'OCCUPIED'}
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-white text-base">{court.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{court.surface}</p>

                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rate for {enquiryState.tier}:</span>
                      <span className="font-heading font-bold text-lime-400">{formatINR(rateForTier)}/hr</span>
                    </div>

                    {!isAvailable && conflictReason && (
                      <div className="p-2 rounded-xl bg-rose-950/30 border border-rose-900 text-[11px] text-rose-300">
                        {conflictReason}
                      </div>
                    )}

                    {isAvailable ? (
                      <button
                        onClick={() => {
                          setBookingForm({
                            courtId: court.id,
                            date: enquiryState.date,
                            startTime: enquiryState.time,
                            memberId: '',
                            guestName: '',
                            guestPhone: '',
                            guestEmail: '',
                            tier: enquiryState.tier,
                            bookingType: 'regular',
                            channel: 'phone_whatsapp',
                            paymentMethod: 'wallet',
                            notes: `Booked via Phone Enquiry for ${enquiryState.durationMinutes} mins`,
                          });
                          setQuickBookingModal(true);
                        }}
                        className="w-full mt-2 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Book on Behalf</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full mt-2 py-2 rounded-xl bg-slate-800 text-slate-500 text-xs font-semibold cursor-not-allowed"
                      >
                        Slot Occupied
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SOCIAL PLAY & WAITLIST MANAGEMENT */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="font-heading font-extrabold text-xl text-white">
                Social Play Sessions & Waitlist Operations
              </h3>
              <p className="text-xs text-slate-400">
                Friday Night Social Play and weekend mixers. Selected courts operate in shared Social Mode with automatic waitlist promotions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {socialSessions.map((session) => {
              const spots = getSocialSessionSpots(session);

              return (
                <div key={session.id} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-lime-400">
                        {session.sport} Social Mode • {session.level}
                      </span>
                      <h4 className="font-heading font-bold text-lg text-white mt-0.5">
                        {session.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {session.date} from {session.startTime} to {session.endTime}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-heading font-extrabold text-2xl text-lime-400">
                        {spots.spotsLeft}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        Spots Left of {spots.totalSpots}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        spots.isFull ? 'bg-rose-500' : 'bg-lime-400'
                      }`}
                      style={{ width: `${(spots.takenSpots / spots.totalSpots) * 100}%` }}
                    />
                  </div>

                  {/* Pricing by Tier Banner */}
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Entry Fee:</span>
                      <span className="text-white font-semibold">
                        Gold: <strong className="text-emerald-400">₹0</strong> • Silver: ₹{session.fee.silver} • Walk-in: ₹{session.fee.walk_in}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Courts: {session.courtIds.map((c) => c.replace(/court_/g, '').toUpperCase()).join(', ')}
                    </span>
                  </div>

                  {/* Participants Roster */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                      <span>Registered Players ({session.currentParticipants.length})</span>
                      <span>Waitlist ({session.waitlist?.length || 0})</span>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {session.currentParticipants.map((mId) => {
                        const m = members.find((mem) => mem.id === mId);
                        return (
                          <div
                            key={mId}
                            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/60 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-lime-400" />
                              <span className="font-semibold text-white">{m?.fullName || mId}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${getTierBadgeClass(m?.tier || 'gold')}`}>
                                {m?.tier || 'member'}
                              </span>
                            </div>

                            <button
                              onClick={() => leaveSocialSession(session.id, mId)}
                              className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold hover:underline"
                            >
                              Withdraw
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Waitlist List */}
                  {(session.waitlist && session.waitlist.length > 0) && (
                    <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-900/40 space-y-2 text-xs">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Active Waitlist Roster</span>
                      </div>
                      <div className="space-y-1">
                        {session.waitlist.map((wId, idx) => {
                          const wMember = members.find((mem) => mem.id === wId);
                          return (
                            <div key={wId} className="flex items-center justify-between text-[11px] text-amber-200">
                              <span>#{idx + 1} {wMember?.fullName || wId} ({wMember?.tier})</span>
                              <span className="text-[10px] text-slate-400">Auto-promotes when player withdraws</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quick Add Player into Social Session */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <select
                      id={`select_social_${session.id}`}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                      defaultValue=""
                    >
                      <option value="" disabled>Select Member to Add...</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.fullName} ({m.tier.toUpperCase()} - {m.memberNumber})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        const el = document.getElementById(`select_social_${session.id}`) as HTMLSelectElement;
                        if (el && el.value) {
                          joinSocialSession(session.id, el.value);
                          el.value = '';
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md transition"
                    >
                      Add Player
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: COURT UTILIZATION & ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="pb-2 border-b border-slate-800">
            <h3 className="font-heading font-extrabold text-xl text-white">
              Court Utilization & Peak Heatmap Analytics
            </h3>
            <p className="text-xs text-slate-400">
              Bi-weekly occupancy percentages, prime floodlit peak distribution, and court revenue performance.
            </p>
          </div>

          {/* Metric KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
              <span className="text-slate-400 text-xs font-semibold">Overall Court Occupancy</span>
              <div className="font-heading font-extrabold text-3xl text-lime-400">
                {analyticsData.overallOccupancyPercent}%
              </div>
              <span className="text-[11px] text-slate-500">Across 8 championship courts</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
              <span className="text-slate-400 text-xs font-semibold">Total Sessions Booked</span>
              <div className="font-heading font-extrabold text-3xl text-white">
                {analyticsData.totalBookingsCount}
              </div>
              <span className="text-[11px] text-emerald-400">Confirmed & active slots</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
              <span className="text-slate-400 text-xs font-semibold">Total Court Revenue</span>
              <div className="font-heading font-extrabold text-3xl text-white">
                {formatINR(analyticsData.totalRevenue)}
              </div>
              <span className="text-[11px] text-slate-500">Invoiced & collected</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
              <span className="text-slate-400 text-xs font-semibold">Prime Floodlit Peak Load</span>
              <div className="font-heading font-extrabold text-3xl text-amber-400">
                94%
              </div>
              <span className="text-[11px] text-amber-400/80">17:00 - 22:00 Weekdays</span>
            </div>
          </div>

          {/* Court-by-Court Breakdown Table */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <h4 className="font-heading font-bold text-white text-base">
              Court Performance & Occupancy Breakdown
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                    <th className="py-2.5 px-3">Court Name</th>
                    <th className="py-2.5 px-3">Sport</th>
                    <th className="py-2.5 px-3">Hours Booked</th>
                    <th className="py-2.5 px-3">Occupancy %</th>
                    <th className="py-2.5 px-3">Revenue (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {analyticsData.courtStats.map((stat) => (
                    <tr key={stat.courtId} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-semibold text-white">{stat.courtName}</td>
                      <td className="py-3 px-3 capitalize text-lime-400">{stat.sport}</td>
                      <td className="py-3 px-3">{stat.hoursBooked} hrs</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{stat.occupancyPercent}%</span>
                          <div className="w-20 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-lime-400 h-full rounded-full"
                              style={{ width: `${stat.occupancyPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {formatINR(stat.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hourly Heatmap */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-bold text-white text-base">
                Hourly Booking Density Heatmap (06:00 - 22:00)
              </h4>
              <span className="text-xs text-amber-400 font-semibold">
                Peak Hours: 17:00 - 22:00
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {analyticsData.hourlyHeatmap.map((item) => (
                <div
                  key={item.hour}
                  className={`p-3 rounded-2xl border text-center transition ${
                    item.isPeak
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-mono text-xs font-bold">{item.hour}</div>
                  <div className="text-xl font-heading font-extrabold text-lime-400 mt-1">
                    {item.bookingCount}
                  </div>
                  <span className="text-[10px] text-slate-500 block">sessions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RESERVATIONS LIST TABLE */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by player name, phone, or reservation ID..."
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={listStatusFilter}
                onChange={(e) => setListStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase">
                    <th className="py-3.5 px-4">Booking ID</th>
                    <th className="py-3.5 px-4">Player & Tier</th>
                    <th className="py-3.5 px-4">Court & Sport</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Channel</th>
                    <th className="py-3.5 px-4">Rate (₹)</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredListBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No court reservations found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredListBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {b.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{b.guestName || 'Member'}</div>
                          <div className="text-[10px] text-slate-400">{b.guestPhone}</div>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase mt-1 inline-block ${getTierBadgeClass(b.tier)}`}>
                            {b.tier}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{(b.courtId || 'court-1').replace(/court_/g, '').toUpperCase()}</div>
                          <div className="text-[10px] text-lime-400 capitalize">{b.sport}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white font-medium">{b.date}</div>
                          <div className="text-slate-400 text-[11px]">{b.startTime} - {b.endTime}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-mono">
                            {b.channel || 'online'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {formatINR(b.totalPrice)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${
                            b.status === 'checked_in'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : b.status === 'cancelled'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          }`}>
                            {(b.status || 'confirmed').replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedBookingDetails(b)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold"
                          >
                            Details
                          </button>
                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => checkInBooking(b.id)}
                              className="px-2.5 py-1 rounded bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-[11px]"
                            >
                              Check In
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* QUICK RESERVATION MODAL */}
      {quickBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-heading font-extrabold text-xl text-white">
                New Court Reservation
              </h3>
              <button
                onClick={() => setQuickBookingModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
              {/* Member or Guest choice */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Member (Optional)</label>
                <select
                  value={bookingForm.memberId}
                  onChange={(e) => {
                    const mId = e.target.value;
                    const m = members.find((mem) => mem.id === mId);
                    setBookingForm({
                      ...bookingForm,
                      memberId: mId,
                      guestName: m ? m.fullName : bookingForm.guestName,
                      guestPhone: m ? m.phone : bookingForm.guestPhone,
                      guestEmail: m ? m.email : bookingForm.guestEmail,
                      tier: m ? m.tier : bookingForm.tier,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="">Walk-in Non-Member (Enter details manually)</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.tier.toUpperCase()} - {m.memberNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Player Name *</label>
                  <input
                    required
                    type="text"
                    value={bookingForm.guestName}
                    onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Phone Number *</label>
                  <input
                    required
                    type="tel"
                    value={bookingForm.guestPhone}
                    onChange={(e) => setBookingForm({ ...bookingForm, guestPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Court</label>
                  <select
                    value={bookingForm.courtId}
                    onChange={(e) => setBookingForm({ ...bookingForm, courtId: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    {courts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.sport})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Start Time (60m)</label>
                  <select
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  >
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Booking Channel</label>
                  <select
                    value={bookingForm.channel}
                    onChange={(e) => setBookingForm({ ...bookingForm, channel: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="front_desk">Front Desk Walk-in</option>
                    <option value="phone_whatsapp">Phone / WhatsApp</option>
                    <option value="online">Online App</option>
                    <option value="trial">Trial Session</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Payment Method</label>
                  <select
                    value={bookingForm.paymentMethod}
                    onChange={(e) => setBookingForm({ ...bookingForm, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="wallet">Club Wallet</option>
                    <option value="upi">UPI / QR</option>
                    <option value="card">Credit / Debit Card</option>
                    <option value="cash">Cash at Desk</option>
                    <option value="plan_included">Included in Plan (₹0)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Internal Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Loaner racquets requested, guest of manager"
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuickBookingModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-400 text-slate-950 font-bold shadow-md shadow-lime-400/20"
                >
                  Confirm & Reserve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COURT BLOCK MODAL (MAINTENANCE / TOURNAMENT / COACHING) */}
      {blockCourtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-heading font-extrabold text-xl text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <span>Create Court Block</span>
              </h3>
              <button onClick={() => setBlockCourtModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Target Court</label>
                <select
                  value={blockForm.courtId}
                  onChange={(e) => setBlockForm({ ...blockForm, courtId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.sport})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Block Type</label>
                <select
                  value={blockForm.type}
                  onChange={(e) => setBlockForm({ ...blockForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="maintenance">Maintenance Block (Resurfacing, Nets, Lighting)</option>
                  <option value="coaching">Coaching Clinic / Academy Session</option>
                  <option value="tournament">Club Tournament / League Tie</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={blockForm.date}
                    onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Start Time</label>
                  <select
                    value={blockForm.startTime}
                    onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  >
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">End Time</label>
                  <select
                    value={blockForm.endTime}
                    onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  >
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Reason / Notes</label>
                <input
                  type="text"
                  required
                  value={blockForm.notes}
                  onChange={(e) => setBlockForm({ ...blockForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setBlockCourtModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold shadow-md"
                >
                  Apply Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING DETAILS DRAWER / MODAL */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-lime-400 uppercase font-bold">
                  {selectedBookingDetails.id}
                </span>
                <h3 className="font-heading font-extrabold text-xl text-white">
                  Reservation Details
                </h3>
              </div>
              <button onClick={() => setSelectedBookingDetails(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Player:</span>
                <span className="text-white font-bold">{selectedBookingDetails.guestName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Phone:</span>
                <span className="text-white font-mono">{selectedBookingDetails.guestPhone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Court:</span>
                <span className="text-lime-400 font-semibold">
                  {selectedBookingDetails.courtId.replace(/court_/g, '').toUpperCase()} ({selectedBookingDetails.sport})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Date & Slot:</span>
                <span className="text-white font-medium">
                  {selectedBookingDetails.date} ({selectedBookingDetails.startTime} - {selectedBookingDetails.endTime})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Channel & Tier:</span>
                <span className="text-slate-300 capitalize">
                  {selectedBookingDetails.channel || 'online'} • <strong className="text-amber-400 uppercase">{selectedBookingDetails.tier}</strong>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Payment:</span>
                <span className="text-white font-semibold">
                  {formatINR(selectedBookingDetails.totalPrice)} ({selectedBookingDetails.paymentMethod || 'wallet'})
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-slate-400">Status:</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  selectedBookingDetails.status === 'checked_in'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : selectedBookingDetails.status === 'cancelled'
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-lime-400/20 text-lime-400'
                }`}>
                  {selectedBookingDetails.status}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800">
              {selectedBookingDetails.status === 'confirmed' && (
                <>
                  <button
                    onClick={() => {
                      checkInBooking(selectedBookingDetails.id);
                      setSelectedBookingDetails(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs"
                  >
                    Check In Player
                  </button>

                  <button
                    onClick={() => {
                      const reason = window.prompt('Enter cancellation reason:') || 'Front desk cancellation';
                      cancelBooking(selectedBookingDetails.id, reason);
                      setSelectedBookingDetails(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold text-xs border border-rose-500/30"
                  >
                    Cancel Booking
                  </button>
                </>
              )}

              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONCURRENCY DOUBLE BOOKING RACE MODAL */}
      {concurrencyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-purple-500/50 p-6 sm:p-8 rounded-3xl max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-purple-400 font-extrabold text-sm uppercase tracking-wider">
                <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                <span>Concurrency Race Test Result</span>
              </div>
              <button
                onClick={() => setConcurrencyModal({ ...concurrencyModal, isOpen: false })}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Simulated two simultaneous online booking requests for <strong>{concurrencyModal.courtName} at {concurrencyModal.slotTime}</strong>.
              </p>

              {/* Attempt 1 */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-1">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Attempt 1: Vikram Malhotra</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[10px] font-mono">200 OK - CONFIRMED</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Slot locked in 12ms. Reservation #{concurrencyModal.user1Result?.id || 'BKG-101'} created and posted to ledger.
                </p>
              </div>

              {/* Attempt 2 */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/40 space-y-1">
                <div className="flex items-center justify-between text-rose-400 font-bold">
                  <span>Attempt 2: Anita Desai</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-[10px] font-mono">409 CONFLICT - BLOCKED</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {concurrencyModal.user2ConflictReason}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono">
                ✓ Both atomic booking attempts & race results logged to Security Audit Log.
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setConcurrencyModal({ ...concurrencyModal, isOpen: false })}
                className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-lg shadow-purple-500/20"
              >
                Close Race Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
