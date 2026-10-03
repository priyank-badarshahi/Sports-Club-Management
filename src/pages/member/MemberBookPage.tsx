import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { Court, SportType, Booking, MembershipTier } from '../../types';
import { 
  Calendar, 
  Clock, 
  Check, 
  Zap, 
  Sparkles, 
  AlertTriangle, 
  Lock, 
  QrCode, 
  Users, 
  Repeat, 
  CreditCard, 
  Wallet, 
  DollarSign, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  RotateCcw, 
  X, 
  Info,
  CalendarDays,
  Flame,
  Trophy,
  Activity,
  History,
  LogIn,
  UserPlus
} from 'lucide-react';
import { formatINR, getCourtStatusBadge, formatDate, getTierBadgeClass } from '../../lib/formatters';
import { 
  generateTimeSlots, 
  calculateEndTime, 
  validateSlotAvailability, 
  validateMemberDailyCap, 
  calculateBookingPrice,
  isPeakHour,
  validateCancellation,
  validateRecurringBookings
} from '../../lib/booking';

type WizardStep = 1 | 2 | 3 | 4 | 5;

export const MemberBookPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    courts, 
    currentUser, 
    currentRole,
    members, 
    bookings, 
    socialSessions, 
    plans,
    settings, 
    addBooking, 
    cancelBooking,
    rescheduleBooking,
    addRecurringBookings 
  } = useAppStore();

  const currentMember = members.find((m) => m.id === currentUser.memberId);
  const tier: MembershipTier = currentMember?.tier || currentUser.tier || 'gold';
  const plan = plans.find((p) => p.tier === tier);

  // Main Page View (Wizard vs My Bookings)
  const [activeTab, setActiveTab] = useState<'wizard' | 'my_bookings'>('wizard');

  // Benefits auto-block check
  const today = new Date();
  const expDate = currentMember ? new Date(currentMember.expiryDate) : null;
  const graceDays = settings.gracePeriodDays || 7;
  const diffDays = expDate ? Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const isExpiredPastGrace = diffDays < -graceDays;
  const isFrozen = currentMember?.status === 'frozen';
  const isBenefitsBlocked = isExpiredPastGrace || isFrozen;

  // Wizard state
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedSport, setSelectedSport] = useState<SportType>('tennis');
  const [selectedDate, setSelectedDate] = useState('2026-10-04');
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  // Guests & Recurring
  const [guests, setGuests] = useState<{ name: string; phone: string }[]>([]);
  const [guestNameInput, setGuestNameInput] = useState('');
  const [guestPhoneInput, setGuestPhoneInput] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(4);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'plan_included' | 'upi' | 'card' | 'cash' | 'pay_at_desk'>('wallet');
  const [lastConfirmedBooking, setLastConfirmedBooking] = useState<Booking | null>(null);

  // Modals for My Bookings
  const [qrModalBooking, setQrModalBooking] = useState<Booking | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [rescheduleModalBooking, setRescheduleModalBooking] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('2026-10-05');
  const [rescheduleTime, setRescheduleTime] = useState('18:00');
  const [rescheduleCourtId, setRescheduleCourtId] = useState('');

  // 30-min time slots from 06:00 to 21:00
  const timeSlots = useMemo(() => generateTimeSlots(6, 22, 30), []);

  // Filtered courts for current sport
  const sportCourts = useMemo(() => {
    return courts.filter((c) => c.sport === selectedSport);
  }, [courts, selectedSport]);

  // Daily booking cap check for chosen member and date
  const dailyCapStatus = useMemo(() => {
    return validateMemberDailyCap(
      currentUser.memberId,
      selectedDate,
      bookings,
      settings.dailyBookingCap || 2
    );
  }, [currentUser.memberId, selectedDate, bookings, settings]);

  // Peak hour check
  const isSelectedSlotPeak = useMemo(() => {
    return isPeakHour(selectedDate, selectedTime, settings);
  }, [selectedDate, selectedTime, settings]);

  // Price breakdown for selected court and slot
  const priceBreakdown = useMemo(() => {
    if (!selectedCourt) return null;
    return calculateBookingPrice({
      court: selectedCourt,
      memberTier: tier,
      date: selectedDate,
      startTime: selectedTime,
      plan,
      settings,
      overrideFree: paymentMethod === 'plan_included',
    });
  }, [selectedCourt, tier, selectedDate, selectedTime, plan, settings, paymentMethod]);

  // My bookings list
  const myBookings = useMemo(() => {
    return bookings.filter(
      (b) => b.memberId === currentUser.memberId || b.guestPhone === '+91 98201 44520'
    );
  }, [bookings, currentUser]);

  const upcomingBookings = myBookings.filter((b) => b.status !== 'cancelled' && b.status !== 'completed');
  const pastBookings = myBookings.filter((b) => b.status === 'cancelled' || b.status === 'completed');

  // Add guest player
  const handleAddGuest = () => {
    if (!guestNameInput) return;
    setGuests([...guests, { name: guestNameInput, phone: guestPhoneInput }]);
    setGuestNameInput('');
    setGuestPhoneInput('');
  };

  // Remove guest player
  const handleRemoveGuest = (index: number) => {
    setGuests(guests.filter((_, i) => i !== index));
  };

  // Handle final reservation submit
  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'visitor' || currentUser.role === 'visitor') {
      alert('You must log in or sign up before booking a court.');
      navigate('/login?redirect=/member/book');
      return;
    }
    if (!selectedCourt || isBenefitsBlocked) return;

    if (isRecurring) {
      const result = addRecurringBookings({
        courtId: selectedCourt.id,
        startDate: selectedDate,
        weeksCount: recurringWeeks,
        startTime: selectedTime,
        memberId: currentUser.memberId,
        guestName: currentUser.name,
        guestPhone: currentMember?.phone || '+91 98201 44520',
        tier,
        sport: selectedCourt.sport,
        paymentMethod: paymentMethod as any,
      });

      if (result.success) {
        setStep(5);
      }
      return;
    }

    const newBooking = addBooking({
      courtId: selectedCourt.id,
      memberId: currentUser.memberId,
      guestName: currentUser.name,
      guestPhone: currentMember?.phone || '+91 98201 44520',
      guestEmail: currentMember?.email,
      tier,
      date: selectedDate,
      startTime: selectedTime,
      endTime: calculateEndTime(selectedTime, 60),
      sport: selectedCourt.sport,
      bookingType: 'regular',
      channel: 'online',
      status: 'confirmed',
      isPaid: true,
      paymentMethod,
      guests,
      priceBreakdown: priceBreakdown || undefined,
      discountApplied: priceBreakdown?.tierDiscount || 0,
      totalPrice: paymentMethod === 'plan_included' ? 0 : (priceBreakdown?.totalAmount ?? 0),
    });

    if (newBooking) {
      setLastConfirmedBooking(newBooking);
      setStep(5);
    }
  };

  // Rebook favourite slot: 1-click wizard pre-fill
  const handleRebookSlot = (booking: Booking) => {
    setSelectedSport(booking.sport);
    const court = courts.find((c) => c.id === booking.courtId) || courts[0];
    setSelectedCourt(court);
    
    // Set date to next week same day
    const origDate = new Date(booking.date);
    origDate.setDate(origDate.getDate() + 7);
    setSelectedDate(origDate.toISOString().split('T')[0]);
    setSelectedTime(booking.startTime);
    setActiveTab('wizard');
    setStep(3);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-lime-400">
            Championship Court Reservations
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Reserve Your Court
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Strictly enforced 60-minute sessions, tier privileges, live daily booking counter, and instant wallet settlement.
          </p>
        </div>

        {/* Tab switcher: Book a Court vs My Bookings */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'wizard'
                ? 'bg-lime-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Book a Court
          </button>
          <button
            onClick={() => setActiveTab('my_bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'my_bookings'
                ? 'bg-lime-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>My Bookings ({upcomingBookings.length})</span>
          </button>
        </div>
      </div>

      {/* AUTH GATE FOR VISITORS */}
      {(currentRole === 'visitor' || currentUser.role === 'visitor') ? (
        <div className="p-8 sm:p-14 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-6 max-w-2xl mx-auto shadow-2xl animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Authentication Required
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              Log In or Sign Up to Book Courts
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Court reservations, real-time availability booking, and exclusive membership privileges are reserved for registered users. Please log in or create an account to reserve your slot.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              to="/login?redirect=/member/book"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-lg shadow-lime-400/20 transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login?register=true&redirect=/member/book"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-lime-400" />
              <span>Create New Account (Sign Up)</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Auto-Blocked Warning Banner */}
      {isBenefitsBlocked && (
        <div className="p-5 rounded-3xl bg-rose-950/40 border-2 border-rose-500/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 shrink-0">
              {isFrozen ? <Lock className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-heading font-bold text-white text-base">
                {isFrozen ? 'Member Privileges Temporarily Frozen' : 'Complimentary Privileges Auto-Blocked'}
              </h3>
              <p className="text-xs text-rose-200/80 mt-0.5">
                {isFrozen
                  ? 'Your membership is paused. Court reservations are temporarily held.'
                  : `Your membership expired on ${currentMember?.expiryDate} and is beyond the ${graceDays}-day grace period. Please renew to restore discounted bookings.`}
              </p>
            </div>
          </div>
          <Link
            to="/member/profile"
            className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shrink-0 text-center shadow-lg shadow-lime-400/20 transition"
          >
            Go to Profile / Renew →
          </Link>
        </div>
      )}

      {/* VIEW 1: BOOKING WIZARD */}
      {activeTab === 'wizard' && (
        <div className="space-y-6">
          {/* Wizard Step Progress Tracker */}
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {[
              { num: 1, label: 'Sport' },
              { num: 2, label: 'Date & Slot' },
              { num: 3, label: 'Court' },
              { num: 4, label: 'Guests & Series' },
              { num: 5, label: 'Pay & Confirm' },
            ].map((s) => (
              <div
                key={s.num}
                onClick={() => {
                  if (s.num < step) setStep(s.num as WizardStep);
                }}
                className={`p-3 rounded-2xl border transition-all ${
                  step === s.num
                    ? 'bg-lime-400/10 border-lime-400 text-lime-400 shadow-md font-bold'
                    : step > s.num
                    ? 'bg-slate-900 border-slate-700 text-white cursor-pointer'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="font-mono text-[10px] uppercase">Step 0{s.num}</div>
                <div className="font-heading text-xs font-bold mt-0.5 truncate">{s.label}</div>
              </div>
            ))}
          </div>

          {/* STEP 1: SPORT SELECTION */}
          {step === 1 && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
              <div>
                <h3 className="font-heading font-extrabold text-xl text-white">
                  Step 1: Select Your Preferred Sport
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose from our international standard racquet and cricket facilities.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    id: 'tennis' as SportType,
                    name: 'Championship Tennis',
                    desc: 'European Red Clay & DecoTurf Hardcourt with Musco floodlights',
                    icon: Trophy,
                    courtsCount: 2,
                  },
                  {
                    id: 'padel' as SportType,
                    name: 'Panoramic Padel',
                    desc: 'Mondo Supercourt XN Turf, tempered glass and LED play',
                    icon: Flame,
                    courtsCount: 2,
                  },
                  {
                    id: 'badminton' as SportType,
                    name: 'BWF Badminton',
                    desc: 'BWF-certified 9mm Olympic mats on teakwood sprung floor',
                    icon: Activity,
                    courtsCount: 2,
                  },
                  {
                    id: 'cricket' as SportType,
                    name: 'Cricket Nets',
                    desc: 'Synthetic dual-turf with programmable 150 km/h bowling machine',
                    icon: Zap,
                    courtsCount: 2,
                  },
                ].map((sport) => {
                  const Icon = sport.icon;
                  const isSelected = selectedSport === sport.id;

                  return (
                    <div
                      key={sport.id}
                      onClick={() => {
                        setSelectedSport(sport.id);
                        setSelectedCourt(null);
                      }}
                      className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-lime-400/10 border-lime-400 shadow-xl shadow-lime-400/10'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${
                        isSelected ? 'bg-lime-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <h4 className="font-heading font-bold text-white text-base">{sport.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{sport.desc}</p>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">{sport.courtsCount} Courts</span>
                        <span className="text-lime-400 font-bold capitalize">Select →</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-lime-400/20 transition"
                >
                  <span>Continue to Date & Slot</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DATE & TIME SLOT SELECTION */}
          {step === 2 && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-white">
                    Step 2: Choose Date & 60-Minute Session
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Slots start every 30 minutes. As a <strong className="text-amber-400 uppercase">{tier} Member</strong>, enjoy your advance window.
                  </p>
                </div>

                {/* Daily Cap Counter Badge */}
                <div className={`p-3 rounded-2xl border text-xs ${
                  dailyCapStatus.usedToday >= 2
                    ? 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Daily Limit Rule</span>
                  <span className="font-bold text-white text-sm">
                    {dailyCapStatus.usedToday} of {dailyCapStatus.maxAllowed} used today
                  </span>
                </div>
              </div>

              {/* Date Input */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Reservation Date</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-lime-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Advance window: up to {plan?.entitlements.bookingWindowDays || 14} days
                  </span>
                </div>

                <div className="sm:col-span-2 flex items-center p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <Info className="w-5 h-5 text-amber-400 shrink-0 mr-3" />
                  <p className="text-xs text-slate-300">
                    Sessions are strictly 60 minutes. Prime Floodlit Peak Hours apply from <strong>17:00 to 22:00</strong>.
                  </p>
                </div>
              </div>

              {/* 30-Min Time Slots Grid */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Select Start Time (1-Hour Session)</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {timeSlots.map((time) => {
                    const isSelected = selectedTime === time;
                    const peak = isPeakHour(selectedDate, time, settings);

                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          isSelected
                            ? 'bg-lime-400 text-slate-950 font-bold border-lime-400 shadow-md'
                            : peak
                            ? 'bg-amber-950/20 border-amber-500/30 text-amber-200 hover:border-amber-400'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-mono text-xs font-bold">{time}</div>
                        <div className="text-[9px] opacity-75 mt-0.5">
                          {peak ? 'Peak' : 'Off-Peak'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-lime-400/20 transition"
                >
                  <span>Select Court</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: COURT SELECTION */}
          {step === 3 && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-white">
                    Step 3: Select Available Championship Court
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    For {formatDate(selectedDate)} at {selectedTime} - {calculateEndTime(selectedTime, 60)}.
                  </p>
                </div>

                <div className="text-xs text-lime-400 font-mono font-semibold">
                  {sportCourts.length} {selectedSport.toUpperCase()} Courts Registered
                </div>
              </div>

              {/* Daily Limit Warning if Cap is Hit */}
              {!dailyCapStatus.allowed && (
                <div className="p-4 rounded-2xl bg-rose-950/40 border-2 border-rose-500/50 flex items-center gap-3 text-xs text-rose-200">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <strong className="block text-white font-bold">Daily Booking Cap Reached</strong>
                    <span>{dailyCapStatus.message}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sportCourts.map((court) => {
                  const check = validateSlotAvailability(
                    court.id,
                    selectedDate,
                    selectedTime,
                    calculateEndTime(selectedTime, 60),
                    bookings,
                    socialSessions
                  );

                  const isAvailable = check.available && dailyCapStatus.allowed;
                  const isSelected = selectedCourt?.id === court.id;
                  const badge = getCourtStatusBadge(court.status);
                  const tierRate = court.hourlyRate[tier] || court.hourlyRate.walk_in;

                  return (
                    <div
                      key={court.id}
                      onClick={() => {
                        if (isAvailable) setSelectedCourt(court);
                      }}
                      className={`p-5 rounded-3xl border transition-all ${
                        !isAvailable
                          ? 'bg-slate-950/60 border-rose-500/30 opacity-70 cursor-not-allowed'
                          : isSelected
                          ? 'bg-lime-400/10 border-lime-400 shadow-xl shadow-lime-400/10 cursor-pointer'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 cursor-pointer'
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
                          {isAvailable ? 'AVAILABLE' : 'SLOT TAKEN'}
                        </span>
                      </div>

                      <h4 className="font-heading font-bold text-white text-base">{court.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{court.surface}</p>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-slate-400">Your Tier Rate: </span>
                          <span className="font-heading font-extrabold text-lime-400">
                            {formatINR(tierRate)}/hr
                          </span>
                        </div>

                        {!isAvailable && check.conflictReason ? (
                          <span className="text-[11px] text-rose-400 font-semibold truncate max-w-[150px]">
                            {check.conflictReason}
                          </span>
                        ) : isSelected ? (
                          <span className="text-xs text-lime-400 font-bold flex items-center gap-1">
                            <Check className="w-4 h-4" /> Selected
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 hover:text-white">Choose →</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={!selectedCourt || !dailyCapStatus.allowed}
                  onClick={() => setStep(4)}
                  className="px-6 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-lime-400/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Guests & Series Options</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ADD GUESTS & RECURRING BOOKING */}
          {step === 4 && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
              <div>
                <h3 className="font-heading font-extrabold text-xl text-white">
                  Step 4: Guest Players & Recurring Weekly Booking
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add companion players or reserve this slot every week for seamless recurring practice.
                </p>
              </div>

              {/* Add Guests Section */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-lime-400" />
                    <h4 className="font-heading font-bold text-sm text-white">Playing Partners / Guests</h4>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Complimentary guest passes: {plan?.entitlements.guestPassesPerMonth || 2}/mo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Guest Full Name"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <input
                    type="tel"
                    placeholder="Guest Phone (Optional)"
                    value={guestPhoneInput}
                    onChange={(e) => setGuestPhoneInput(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddGuest}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
                  >
                    + Add Partner
                  </button>
                </div>

                {guests.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    {guests.map((g, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="font-semibold text-white">{g.name} ({g.phone || 'No phone'})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGuest(idx)}
                          className="text-rose-400 hover:text-rose-300 text-[11px]"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recurring Weekly Bookings */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-lime-400" />
                    <div>
                      <h4 className="font-heading font-bold text-sm text-white">Recurring Weekly Series</h4>
                      <p className="text-[11px] text-slate-400">Lock this exact slot every week automatically</p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-lime-400 focus:ring-0"
                    />
                    <span className="text-xs text-white font-bold">Enable Weekly</span>
                  </label>
                </div>

                {isRecurring && (
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Select Duration:</span>
                    <div className="flex items-center gap-2">
                      {[2, 4, 8].map((weeks) => (
                        <button
                          key={weeks}
                          type="button"
                          onClick={() => setRecurringWeeks(weeks)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            recurringWeeks === weeks
                              ? 'bg-lime-400 text-slate-950'
                              : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {weeks} Weeks
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="px-6 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-lime-400/20 transition"
                >
                  <span>Review Price & Pay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW PRICE BREAKDOWN & CONFIRM */}
          {step === 5 && !lastConfirmedBooking && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
              <div>
                <h3 className="font-heading font-extrabold text-xl text-white">
                  Step 5: Review & Settle Reservation
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirm price breakdown, select payment method, and generate your digital QR court pass.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Booking Summary & Itemized Breakdown */}
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
                  <h4 className="font-heading font-bold text-sm text-white">Reservation Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Championship Court:</span>
                      <span className="text-white font-semibold">{selectedCourt?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sport & Surface:</span>
                      <span className="text-lime-400 font-semibold capitalize">{selectedSport} • {selectedCourt?.surface}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Session Window:</span>
                      <span className="text-white font-medium">{formatDate(selectedDate)} ({selectedTime} - {calculateEndTime(selectedTime, 60)})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Registered Player:</span>
                      <span className="text-white">{currentUser.name} ({tier.toUpperCase()} Member)</span>
                    </div>
                    {guests.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Guests Included:</span>
                        <span className="text-slate-300">{guests.map((g) => g.name).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  {priceBreakdown && (
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-2 pt-3">
                      <div className="flex justify-between text-slate-400">
                        <span>Rack Walk-in Rate:</span>
                        <span className="line-through">{formatINR(selectedCourt?.hourlyRate.walk_in || 0)}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Tier Base Rate ({tier.toUpperCase()}):</span>
                        <span>{formatINR(priceBreakdown.baseRate)}</span>
                      </div>
                      {priceBreakdown.isPeak && (
                        <div className="flex justify-between text-amber-400">
                          <span>Prime Floodlit Peak Load (1.25x):</span>
                          <span>+{formatINR(priceBreakdown.subtotal - priceBreakdown.baseRate)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-400">
                        <span>Goods & Services Tax (18% GST):</span>
                        <span>{formatINR(priceBreakdown.gstAmount)}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                        <span className="text-white">Total Payable:</span>
                        <span className="text-lime-400 font-mono text-base">
                          {paymentMethod === 'plan_included' ? '₹0 (Included)' : formatINR(priceBreakdown.totalAmount)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Payment Option Selector */}
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                  <h4 className="font-heading font-bold text-sm text-white">Payment Options</h4>

                  <div className="space-y-2.5">
                    {/* Club Wallet */}
                    <label
                      onClick={() => setPaymentMethod('wallet')}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                        paymentMethod === 'wallet'
                          ? 'bg-lime-400/10 border-lime-400 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-lime-400" />
                        <div>
                          <div className="font-bold text-xs">Prepaid Club Wallet</div>
                          <div className="text-[10px] text-slate-400">
                            Current Balance: {formatINR(currentMember?.walletBalance || 0)}
                          </div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={paymentMethod === 'wallet'}
                        onChange={() => setPaymentMethod('wallet')}
                        className="text-lime-400 focus:ring-0"
                      />
                    </label>

                    {/* Included in Plan (Gold Free hour) */}
                    {tier === 'gold' && (
                      <label
                        onClick={() => setPaymentMethod('plan_included')}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                          paymentMethod === 'plan_included'
                            ? 'bg-lime-400/10 border-lime-400 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-5 h-5 text-amber-400" />
                          <div>
                            <div className="font-bold text-xs">Included in Plan (₹0)</div>
                            <div className="text-[10px] text-slate-400">Gold VIP complimentary allowance</div>
                          </div>
                        </div>
                        <input
                          type="radio"
                          checked={paymentMethod === 'plan_included'}
                          onChange={() => setPaymentMethod('plan_included')}
                          className="text-lime-400 focus:ring-0"
                        />
                      </label>
                    )}

                    {/* Instant UPI */}
                    <label
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                        paymentMethod === 'upi'
                          ? 'bg-lime-400/10 border-lime-400 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-sky-400" />
                        <div>
                          <div className="font-bold text-xs">Instant UPI / QR</div>
                          <div className="text-[10px] text-slate-400">Google Pay, PhonePe, Paytm</div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                        className="text-lime-400 focus:ring-0"
                      />
                    </label>

                    {/* Credit / Debit Card */}
                    <label
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                        paymentMethod === 'card'
                          ? 'bg-lime-400/10 border-lime-400 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-purple-400" />
                        <div>
                          <div className="font-bold text-xs">Credit / Debit Card</div>
                          <div className="text-[10px] text-slate-400">Visa, Mastercard, RuPay</div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="text-lime-400 focus:ring-0"
                      />
                    </label>

                    {/* Pay Later at Desk */}
                    <label
                      onClick={() => setPaymentMethod('pay_at_desk')}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                        paymentMethod === 'pay_at_desk'
                          ? 'bg-lime-400/10 border-lime-400 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                        <div>
                          <div className="font-bold text-xs">Pay Later at Front Desk</div>
                          <div className="text-[10px] text-slate-400">Settle cash or card on arrival</div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={paymentMethod === 'pay_at_desk'}
                        onChange={() => setPaymentMethod('pay_at_desk')}
                        className="text-lime-400 focus:ring-0"
                      />
                    </label>
                  </div>

                  <button
                    onClick={handleConfirmReservation}
                    disabled={isBenefitsBlocked}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-lime-400/20 flex items-center justify-center gap-2 transition disabled:opacity-40"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Authorize & Generate QR Pass</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 CONFIRMATION SUCCESS CARD */}
          {lastConfirmedBooking && (
            <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-lime-400/30 text-center shadow-2xl space-y-6 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-lime-400/20 border-2 border-lime-400 flex items-center justify-center text-lime-400 mx-auto">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-lime-400 font-bold">
                  Reservation Confirmed • ID: {lastConfirmedBooking.id}
                </span>
                <h2 className="font-heading font-extrabold text-3xl text-white mt-1">
                  Court Reserved Successfully!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
                  Your court is confirmed. An official invoice line has been posted to your account ledger.
                </p>
              </div>

              {/* Digital Court Pass with Simulated QR */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 max-w-sm mx-auto space-y-4 text-xs text-left shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-heading font-extrabold text-white text-base">CHAMPIONS PASS</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getTierBadgeClass(tier)}`}>
                    {tier}
                  </span>
                </div>

                {/* QR Code Container */}
                <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-inner">
                  <QrCode className="w-32 h-32 text-slate-950" />
                  <span className="font-mono text-[9px] text-slate-800 mt-1">{lastConfirmedBooking.id}</span>
                </div>

                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Court:</span>
                    <span className="font-bold text-white">{selectedCourt?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Timing:</span>
                    <span className="text-lime-400 font-semibold">{lastConfirmedBooking.date} • {lastConfirmedBooking.startTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Player:</span>
                    <span className="text-white">{currentUser.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setLastConfirmedBooking(null);
                    setStep(1);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
                >
                  Book Another Session
                </button>
                <button
                  onClick={() => {
                    setLastConfirmedBooking(null);
                    setActiveTab('my_bookings');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20"
                >
                  View in My Bookings
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MY BOOKINGS (UPCOMING & PAST) */}
      {activeTab === 'my_bookings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-heading font-extrabold text-xl text-white">
                My Court Reservations
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage upcoming sessions, reschedule, download digital entry passes, or rebook favourite slots.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveTab('wizard');
                setStep(1);
              }}
              className="px-4 py-2 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs"
            >
              + Reserve Court
            </button>
          </div>

          {/* Upcoming Sessions */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-lime-400">
              Upcoming Reservations ({upcomingBookings.length})
            </h4>

            {upcomingBookings.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                No active upcoming bookings. Click "Reserve Court" to book a court!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingBookings.map((b) => {
                  const court = courts.find((c) => c.id === b.courtId);
                  return (
                    <div
                      key={b.id}
                      className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {b.sport} • {b.channel || 'online'}
                        </span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {b.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-heading font-bold text-white text-base">
                          {court?.name || b.courtId}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-lime-400 font-semibold mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(b.date)} at {b.startTime} - {b.endTime}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Paid: <strong className="text-white">{formatINR(b.totalPrice)}</strong></span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQrModalBooking(b)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1"
                            title="Show QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5 text-lime-400" />
                            <span>QR Pass</span>
                          </button>

                          <button
                            onClick={() => {
                              setRescheduleModalBooking(b);
                              setRescheduleCourtId(b.courtId);
                              setRescheduleDate(b.date);
                              setRescheduleTime(b.startTime);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                          >
                            Reschedule
                          </button>

                          <button
                            onClick={() => setCancelModalBooking(b)}
                            className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past History & Rebook favourite slot */}
          {pastBookings.length > 0 && (
            <div className="space-y-3 pt-4">
              <h4 className="font-heading font-bold text-sm text-slate-400">
                Past Sessions & Rebooking ({pastBookings.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{b.courtId.replace(/court_/g, '').toUpperCase()}</div>
                      <div className="text-[11px] text-slate-400">{b.date} • {b.startTime} ({b.status})</div>
                    </div>

                    <button
                      onClick={() => handleRebookSlot(b)}
                      className="px-3 py-1.5 rounded-xl bg-lime-400/20 hover:bg-lime-400 text-lime-400 hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Rebook Slot</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
        </>
      )}

      {/* QR PASS MODAL */}
      {qrModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-heading font-bold text-white text-base">Digital Court Pass</span>
              <button onClick={() => setQrModalBooking(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-inner flex flex-col items-center justify-center">
              <QrCode className="w-40 h-40 text-slate-950" />
              <span className="font-mono text-xs text-slate-800 font-bold mt-2">
                {qrModalBooking.id}
              </span>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <div>Court: <strong className="text-white">{qrModalBooking.courtId}</strong></div>
              <div>Slot: <span className="text-lime-400">{qrModalBooking.date} at {qrModalBooking.startTime}</span></div>
              <div className="text-[10px] text-slate-500">Scan at Reception or Court Gate Scanner</div>
            </div>

            <button
              onClick={() => setQrModalBooking(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-heading font-extrabold text-xl text-white">
                Reschedule Reservation
              </h3>
              <button onClick={() => setRescheduleModalBooking(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-400">
              Rescheduling is permitted up to {settings.bookingCancellationWindowHours || 4} hours in advance without fees.
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Target Court</label>
                <select
                  value={rescheduleCourtId}
                  onChange={(e) => setRescheduleCourtId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  {courts.filter((c) => c.sport === rescheduleModalBooking.sport).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">New Date</label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">New Start Time</label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  >
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setRescheduleModalBooking(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const res = rescheduleBooking(
                    rescheduleModalBooking.id,
                    rescheduleCourtId,
                    rescheduleDate,
                    rescheduleTime
                  );
                  if (res.success) {
                    setRescheduleModalBooking(null);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-heading font-extrabold text-xl text-white">
              Cancel Court Booking
            </h3>

            {(() => {
              const evalRes = validateCancellation(cancelModalBooking, settings);
              return (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-300">
                    Are you sure you want to cancel booking <strong>#{cancelModalBooking.id}</strong> on {cancelModalBooking.date}?
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hours to session:</span>
                      <span className="text-white font-mono">{evalRes.hoursRemaining} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Late cancellation fee:</span>
                      <span className="text-rose-400 font-semibold">{formatINR(evalRes.lateCancelFee)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-slate-800">
                      <span className="text-white">Refund to Club Wallet:</span>
                      <span className="text-emerald-400 font-mono text-sm">{formatINR(evalRes.refundAmount)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Keep Booking
              </button>
              <button
                onClick={() => {
                  cancelBooking(cancelModalBooking.id, 'User self-cancelled via app');
                  setCancelModalBooking(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
