import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store';
import { Court, SportType } from '../../types';
import { 
  Trophy, 
  Flame, 
  Wind, 
  Target, 
  MapPin, 
  Sun, 
  CloudSun, 
  Zap, 
  Calendar, 
  Check, 
  Clock, 
  Filter,
  Sparkles,
  Lock,
  LogIn,
  UserPlus
} from 'lucide-react';
import { formatINR, getCourtStatusBadge, getTierBadgeClass } from '../../lib/formatters';

export const CourtsPage: React.FC = () => {
  const { courts, currentRole, currentUser, addBooking } = useAppStore();
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('all');
  const [filterIndoor, setFilterIndoor] = useState<'all' | 'indoor' | 'outdoor'>('all');
  const [bookingCourt, setBookingCourt] = useState<Court | null>(null);
  const [authRequiredModalOpen, setAuthRequiredModalOpen] = useState(false);

  // Quick booking drawer state
  const [bookingForm, setBookingForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    guestName: currentUser.name,
    guestPhone: currentUser.phone || '',
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const filteredCourts = courts.filter((c) => {
    if (selectedSport !== 'all' && c.sport !== selectedSport) return false;
    if (filterIndoor === 'indoor' && !c.isIndoor) return false;
    if (filterIndoor === 'outdoor' && c.isIndoor) return false;
    return true;
  });

  const handleOpenBooking = (court: Court) => {
    if (currentRole === 'visitor' || currentUser.role === 'visitor') {
      setAuthRequiredModalOpen(true);
      return;
    }
    setBookingCourt(court);
    setBookingForm({
      date: new Date().toISOString().split('T')[0],
      time: '18:00',
      guestName: currentUser.name,
      guestPhone: currentUser.phone || '',
    });
    setBookingSuccess(false);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'visitor' || currentUser.role === 'visitor') {
      setAuthRequiredModalOpen(true);
      return;
    }
    if (!bookingCourt) return;

    const rawTier = currentRole === 'member' ? (currentUser.tier || 'walk_in') : 'walk_in';
    const tier = rawTier === 'none' ? 'walk_in' : rawTier;
    const hourlyPrice = bookingCourt.hourlyRate[tier];

    addBooking({
      courtId: bookingCourt.id,
      memberId: currentUser.memberId,
      guestName: bookingForm.guestName,
      guestPhone: bookingForm.guestPhone,
      guestEmail: currentUser.email,
      tier,
      date: bookingForm.date,
      startTime: bookingForm.time,
      endTime: getEndTime(bookingForm.time),
      sport: bookingCourt.sport,
      totalPrice: hourlyPrice,
      discountApplied: bookingCourt.hourlyRate.walk_in - hourlyPrice,
      status: 'confirmed',
      isPaid: true,
      paymentMethod: tier === 'gold' ? 'wallet' : 'upi',
    });

    setBookingSuccess(true);
  };

  const getEndTime = (startTime: string) => {
    const [h, m] = startTime.split(':').map(Number);
    const endH = (h + 1).toString().padStart(2, '0');
    return `${endH}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-lime-400">
          Championship Venues
        </span>
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-white">
          Our Championship Courts & Nets
        </h1>
        <p className="text-sm sm:text-base text-slate-300">
          Every court is strictly maintained to world-tour specs with dedicated Musco glare-free floodlights, European clay maintenance, and precision sprung floors.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        {/* Sport filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Courts' },
            { id: 'tennis', label: 'Tennis (2)' },
            { id: 'padel', label: 'Padel (2)' },
            { id: 'badminton', label: 'Badminton (2)' },
            { id: 'cricket', label: 'Cricket Nets (2)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSport(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedSport === tab.id
                  ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Indoor/Outdoor filter */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-400">Setting:</span>
          <select
            value={filterIndoor}
            onChange={(e) => setFilterIndoor(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-lime-400"
          >
            <option value="all">All Arenas</option>
            <option value="indoor">Indoor Climate-Controlled</option>
            <option value="outdoor">Outdoor Floodlit</option>
          </select>
        </div>
      </div>

      {/* Courts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredCourts.map((court) => {
          const badge = getCourtStatusBadge(court.status);
          return (
            <div
              key={court.id}
              className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl hover:border-slate-700 transition flex flex-col justify-between group"
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-64 w-full overflow-hidden">
                  <img
                    src={court.image}
                    alt={court.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/85 text-lime-400 border border-lime-400/30 backdrop-blur-md">
                      Court {court.courtNumber} • {court.sport.toUpperCase()}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900/80 text-slate-300 border border-slate-700 backdrop-blur-md flex items-center gap-1">
                      {court.isIndoor ? 'Indoor' : 'Outdoor'}
                    </span>
                  </div>

                  {/* Status badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.className} shadow-lg backdrop-blur-md`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Bottom Title on Image */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-heading font-extrabold text-2xl text-white">{court.name}</h3>
                    <p className="text-xs text-lime-400 font-medium mt-0.5">{court.surface}</p>
                  </div>
                </div>

                {/* Description & Features */}
                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">{court.description}</p>

                  {court.maintenanceNote && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                      <strong>Maintenance Note:</strong> {court.maintenanceNote}
                    </div>
                  )}

                  {/* Rates by Tier Table */}
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Hourly Court Rental Rates by Membership Tier:
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <span className="text-[10px] font-bold text-amber-400 block uppercase">Gold Tier</span>
                        <span className="font-heading font-extrabold text-sm text-amber-300">
                          {formatINR(court.hourlyRate.gold)}
                        </span>
                        <span className="text-[9px] text-slate-400 block">/ hour</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                        <span className="text-[10px] font-bold text-slate-300 block uppercase">Silver</span>
                        <span className="font-heading font-extrabold text-sm text-slate-200">
                          {formatINR(court.hourlyRate.silver)}
                        </span>
                        <span className="text-[9px] text-slate-400 block">/ hour</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30">
                        <span className="text-[10px] font-bold text-sky-400 block uppercase">Junior</span>
                        <span className="font-heading font-extrabold text-sm text-sky-300">
                          {formatINR(court.hourlyRate.junior)}
                        </span>
                        <span className="text-[9px] text-slate-400 block">/ hour</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Walk-in</span>
                        <span className="font-heading font-extrabold text-sm text-slate-300">
                          {formatINR(court.hourlyRate.walk_in)}
                        </span>
                        <span className="text-[9px] text-slate-500 block">/ hour</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 pt-0 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Zap className="w-3.5 h-3.5 text-lime-400" />
                  <span>Musco 750 Lux LED</span>
                </div>

                <button
                  onClick={() => handleOpenBooking(court)}
                  disabled={court.status === 'maintenance'}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition ${
                    court.status === 'maintenance'
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-lime-400 hover:bg-lime-300 text-slate-950 shadow-lime-400/20'
                  }`}
                >
                  {court.status === 'maintenance' ? 'Under Maintenance' : 'Reserve This Court'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK COURT BOOKING DRAWER / MODAL */}
      {bookingCourt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-lg w-full shadow-2xl animate-in zoom-in-95">
            {!bookingSuccess ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400">
                      Reserve Championship Court
                    </span>
                    <h3 className="font-heading font-extrabold text-xl text-white">
                      {bookingCourt.name}
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                    {bookingCourt.surface}
                  </span>
                </div>

                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-lime-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Time Slot (1 hr)</label>
                      <select
                        value={bookingForm.time}
                        onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-lime-400"
                      >
                        <option value="06:00">06:00 AM - 07:00 AM</option>
                        <option value="07:00">07:00 AM - 08:00 AM</option>
                        <option value="08:00">08:00 AM - 09:00 AM</option>
                        <option value="16:00">04:00 PM - 05:00 PM</option>
                        <option value="17:00">05:00 PM - 06:00 PM</option>
                        <option value="18:00">06:00 PM - 07:00 PM</option>
                        <option value="19:00">07:00 PM - 08:00 PM</option>
                        <option value="20:00">08:00 PM - 09:00 PM</option>
                        <option value="21:00">09:00 PM - 10:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Player / Guest Name</label>
                    <input
                      type="text"
                      required
                      value={bookingForm.guestName}
                      onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-lime-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Phone (for SMS pass)</label>
                    <input
                      type="tel"
                      required
                      value={bookingForm.guestPhone}
                      onChange={(e) => setBookingForm({ ...bookingForm, guestPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-lime-400"
                    />
                  </div>

                  {/* Price Calculation Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Standard Walk-in Rate:</span>
                      <span>{formatINR(bookingCourt.hourlyRate.walk_in)}</span>
                    </div>
                    <div className="flex justify-between text-lime-400 font-semibold">
                      <span>Your Rate ({currentRole === 'member' && currentUser.tier && currentUser.tier !== 'none' ? currentUser.tier : 'Standard'}):</span>
                      <span>{formatINR(bookingCourt.hourlyRate[(currentRole === 'member' && currentUser.tier && currentUser.tier !== 'none' ? currentUser.tier : 'walk_in')])}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white text-sm">
                      <span>Total Due (incl. 18% GST):</span>
                      <span>{formatINR(bookingCourt.hourlyRate[(currentRole === 'member' && currentUser.tier && currentUser.tier !== 'none' ? currentUser.tier : 'walk_in')])}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setBookingCourt(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold shadow-md shadow-lime-400/20"
                    >
                      Confirm Court Booking
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-lime-400/20 border-2 border-lime-400 flex items-center justify-center text-lime-400 mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-white">Court Reserved!</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your reservation on <strong>{bookingCourt.name}</strong> for {bookingForm.date} ({bookingForm.time} - {getEndTime(bookingForm.time)}) is confirmed.
                </p>
                <button
                  onClick={() => setBookingCourt(null)}
                  className="w-full py-3 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* AUTH REQUIRED MODAL FOR VISITORS */}
      {authRequiredModalOpen && (
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
                Log In or Sign Up to Book
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                To reserve a championship court, you must be logged into a verified Champions Club member or visitor account.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <Link
                to="/login?redirect=/courts"
                className="w-full py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 transition flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to Your Account</span>
              </Link>
              <Link
                to="/login?register=true&redirect=/courts"
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-lime-400" />
                <span>Create New Account (Sign Up)</span>
              </Link>
              <button
                type="button"
                onClick={() => setAuthRequiredModalOpen(false)}
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
