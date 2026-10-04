import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppStore } from '../../store';
import { SportType, MembershipTier } from '../../types';
import { 
  Sparkles, 
  Check, 
  Calendar, 
  Clock, 
  Trophy, 
  Flame, 
  Wind, 
  Target, 
  ShieldCheck, 
  CreditCard, 
  Zap, 
  QrCode, 
  Lock,
  LogIn,
  UserPlus,
  Activity,
  Shield
} from 'lucide-react';
import { generateTimeSlots, calculateEndTime } from '../../lib/booking';
import { formatINR } from '../../lib/formatters';

export const BookTrialPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { courts, addBooking, addLead, currentRole, currentUser } = useAppStore();
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const prefillSport = (searchParams.get('sport') as SportType) || 'box_cricket';
  const prefillDate = searchParams.get('date') || '2026-10-05';
  const prefillTime = searchParams.get('time') || '17:00';

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    sports: [prefillSport] as SportType[],
    interestedTier: 'gold' as MembershipTier,
    date: prefillDate,
    time: prefillTime,
    notes: '',
    trialPassTier: 'free' as 'free' | 'premium',
    paymentMethod: 'upi' as 'upi' | 'card',
  });

  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('sport')) {
      const s = searchParams.get('sport') as SportType;
      setFormData((prev) => ({ ...prev, sports: [s] }));
    }
    if (searchParams.get('date')) {
      setFormData((prev) => ({ ...prev, date: searchParams.get('date')! }));
    }
    if (searchParams.get('time')) {
      setFormData((prev) => ({ ...prev, time: searchParams.get('time')! }));
    }
  }, [searchParams]);

  const toggleSport = (sport: SportType) => {
    if (formData.sports.includes(sport)) {
      if (formData.sports.length > 1) {
        setFormData({ ...formData, sports: formData.sports.filter((s) => s !== sport) });
      }
    } else {
      setFormData({ ...formData, sports: [...formData.sports, sport] });
    }
  };

  const timeSlots = generateTimeSlots(6, 22, 30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'visitor' || currentUser.role === 'visitor') {
      setAuthPromptOpen(true);
      return;
    }
    if (!formData.fullName || !formData.phone || !formData.email) return;

    // 1. Find suitable court for trial booking
    const primarySport = formData.sports[0] || 'box_cricket';
    const targetCourt = courts.find((c) => c.sport === primarySport) || courts[0];
    const trialFee = formData.trialPassTier === 'premium' ? 299 : 0;

    // 2. Create Trial Booking in store
    const booking = addBooking({
      courtId: targetCourt.id,
      guestName: `${formData.fullName} (Trial)`,
      guestPhone: formData.phone,
      guestEmail: formData.email,
      tier: formData.interestedTier,
      date: formData.date,
      startTime: formData.time,
      endTime: calculateEndTime(formData.time, 60),
      sport: targetCourt.sport,
      bookingType: 'trial',
      channel: 'trial',
      totalPrice: trialFee,
      discountApplied: targetCourt.hourlyRate.walk_in - trialFee,
      status: 'confirmed',
      isPaid: true,
      paymentMethod: formData.trialPassTier === 'premium' ? formData.paymentMethod : 'plan_included',
      notes: `VIP Trial Session: Interested in ${formData.interestedTier.toUpperCase()} plan. User experience: ${formData.notes || 'None'}`,
    });

    // 3. Create Lead in CRM store
    addLead({
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      sportInterest: formData.sports,
      interestedTier: formData.interestedTier,
      source: 'website_trial',
      status: 'trial_booked',
      notes: `Trial booked for ${formData.date} at ${formData.time} on ${targetCourt.name}. Pass: ${formData.trialPassTier.toUpperCase()}`,
      followUpDate: formData.date,
    });

    if (booking) {
      setConfirmedBookingId(booking.id);
    } else {
      setConfirmedBookingId(`tr_${Date.now()}`);
    }
  };

  const sportsOptions: { id: SportType; label: string; icon: any }[] = [
    { id: 'box_cricket', label: 'Box Cricket Arena (Artificial Turf)', icon: Target },
    { id: 'badminton', label: 'Olympic Badminton (Synthetic Mat)', icon: Wind },
    { id: 'table_tennis', label: 'Table Tennis (Tournament Arena)', icon: Activity },
    { id: 'volleyball', label: 'Volleyball (Synthetic Court)', icon: Zap },
    { id: 'kho_kho', label: 'Kho Kho Ground (Prepared Sports Ground)', icon: Flame },
    { id: 'hockey', label: 'Hockey Turf (Synthetic Arena)', icon: Trophy },
    { id: 'football', label: 'Football Turf (5-a-Side Arena)', icon: Sparkles },
    { id: 'kabaddi', label: 'Kabaddi Arena (Pro Mat)', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center space-y-3 mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-lime-400">
          Complimentary Club Experience
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white">
          Book Your VIP Trial Session
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Experience 60 minutes on our tournament courts, complimentary loaner racquets, and a 15-minute game analysis with our coaching staff.
        </p>
      </div>

      {!confirmedBookingId ? (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Select Sport */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                1. Select Sport(s) of Interest *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sportsOptions.map((s) => {
                  const Icon = s.icon;
                  const isSelected = formData.sports.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSport(s.id)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition ${
                        isSelected
                          ? 'bg-lime-400/10 border-lime-400/40 text-white shadow-sm'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-lime-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold">{s.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-lime-400 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Date & Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-lime-400 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Preferred Time Slot (60 Mins) *
                </label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-lime-400 font-mono"
                >
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>{t} - {calculateEndTime(t, 60)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 3: Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Siddharth Roy"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  WhatsApp Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98450 00000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="siddharth@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            {/* Step 4: Membership Interest & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Interested Membership Tier
                </label>
                <select
                  value={formData.interestedTier}
                  onChange={(e) => setFormData({ ...formData, interestedTier: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-lime-400"
                >
                  <option value="gold">Gold Championship Tier</option>
                  <option value="silver">Silver Club Tier</option>
                  <option value="junior">Junior Academy (Under 18)</option>
                  <option value="walk_in">Casual / Undecided</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Notes / Playing Experience
                </label>
                <input
                  type="text"
                  placeholder="e.g. Played college tennis, beginner in padel"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            {/* Step 5: Simulated Trial Pass Payment */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Trial Pass Selection & Simulated Settlement
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setFormData({ ...formData, trialPassTier: 'free' })}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    formData.trialPassTier === 'free'
                      ? 'bg-lime-400/10 border-lime-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Complimentary VIP Pass</span>
                    <span className="text-lime-400 font-extrabold text-sm">₹0 (Free)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    First-time club guest privilege with complimentary racquet loaners.
                  </p>
                </label>

                <label
                  onClick={() => setFormData({ ...formData, trialPassTier: 'premium', paymentMethod: 'upi' })}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    formData.trialPassTier === 'premium'
                      ? 'bg-lime-400/10 border-lime-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Premium Trial + Coaching</span>
                    <span className="text-white font-extrabold text-sm">₹299</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Includes 30-min private stroke assessment and recovery shake at Courtside Bar.
                  </p>
                </label>
              </div>

              {formData.trialPassTier === 'premium' && (
                <div className="pt-2 flex items-center gap-3 text-xs">
                  <span className="text-slate-400 font-semibold">Simulated Payment:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.paymentMethod === 'upi'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'upi' })}
                      className="text-lime-400 focus:ring-0"
                    />
                    <span className="text-slate-200">Instant UPI</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.paymentMethod === 'card'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                      className="text-lime-400 focus:ring-0"
                    />
                    <span className="text-slate-200">Credit / Debit Card</span>
                  </label>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-lime-400/20 flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-5 h-5" />
              <span>Confirm & Reserve VIP Trial Session</span>
            </button>
          </form>
        </div>
      ) : (
        /* Confirmation Screen */
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-lime-400/30 text-center shadow-2xl space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-lime-400/20 border-2 border-lime-400 flex items-center justify-center text-lime-400 mx-auto">
            <Check className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-lime-400 font-bold">
              VIP Pass Reserved • ID: {confirmedBookingId}
            </span>
            <h2 className="font-heading font-extrabold text-3xl text-white mt-1">
              Trial Session Scheduled!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
              Thank you, <strong>{formData.fullName}</strong>. Your session for {formData.date} at {formData.time} has been registered and a CRM consultation profile has been created.
            </p>
          </div>

          {/* Digital Trial Pass with QR */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 max-w-sm mx-auto text-xs text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-heading font-bold text-white text-sm">CHAMPIONS VIP TRIAL PASS</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-lime-400/20 text-lime-400">
                {formData.trialPassTier === 'premium' ? 'PREMIUM PASS' : 'GUEST PASS'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-inner">
              <QrCode className="w-32 h-32 text-slate-950" />
              <span className="font-mono text-[9px] text-slate-800 mt-1">{confirmedBookingId}</span>
            </div>

            <div className="space-y-1.5 text-slate-300">
              <div>Player: <strong className="text-white">{formData.fullName}</strong></div>
              <div>Timing: <span className="text-lime-400">{formData.date} • {formData.time} (60m)</span></div>
              <div>Sport: <span className="text-white capitalize">{formData.sports.join(', ')}</span></div>
              <div>Dress Code: <span className="text-slate-400">Non-marking sports shoes</span></div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setConfirmedBookingId(null)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Book Another Session
            </button>
            <Link
              to="/availability"
              className="px-6 py-2.5 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20"
            >
              View Court Grid
            </Link>
          </div>
        </div>
      )}

      {/* AUTH REQUIRED MODAL FOR TRIAL SESSIONS */}
      {authPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                Sign In Required
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-white">
                Log In or Sign Up to Book Trial
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                To confirm your complimentary VIP trial slot and receive your digital entrance pass, please log in or create a Champions Club account.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <Link
                to="/login?redirect=/book-trial"
                className="w-full py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 transition flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to Your Account</span>
              </Link>
              <Link
                to="/login?register=true&redirect=/book-trial"
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-lime-400" />
                <span>Create New Account (Sign Up)</span>
              </Link>
              <button
                type="button"
                onClick={() => setAuthPromptOpen(false)}
                className="w-full py-2.5 rounded-xl bg-transparent text-slate-400 hover:text-white font-semibold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
