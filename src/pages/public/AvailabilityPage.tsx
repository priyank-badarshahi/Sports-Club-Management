import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../../store';
import { Court, SportType } from '../../types';
import { 
  Calendar, 
  Clock, 
  Filter, 
  Check, 
  Zap, 
  MapPin, 
  Sparkles, 
  LogIn, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Trophy,
  Flame,
  Activity
} from 'lucide-react';
import { formatINR, getCourtStatusBadge } from '../../lib/formatters';
import { generateTimeSlots, calculateEndTime, isPeakHour } from '../../lib/booking';

export const AvailabilityPage: React.FC = () => {
  const navigate = useNavigate();
  const { courts, bookings, socialSessions, currentUser } = useAppStore();
  
  // Date selection (defaults to 2026-10-03 demo base or today)
  const [selectedDate, setSelectedDate] = useState('2026-10-03');
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('all');
  
  // Selected slot for public action modal
  const [activeSlot, setActiveSlot] = useState<{ court: Court; time: string } | null>(null);

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
  };

  const handleGoToTrial = () => {
    if (!activeSlot) return;
    navigate(`/book-trial?sport=${activeSlot.court.sport}&date=${selectedDate}&time=${activeSlot.time}`);
  };

  const handleGoToLogin = () => {
    if (currentUser.role === 'member') {
      navigate('/member/book');
    } else {
      navigate('/login?redirect=/member/book');
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
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start md:self-auto overflow-x-auto">
          {(['all', 'tennis', 'padel', 'badminton', 'cricket'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSport(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
                selectedSport === s
                  ? 'bg-lime-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
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
          <div className="flex items-center gap-4">
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
              <span>Friday Social Play</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
              <span>Maintenance</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-500">
            Selected Date: <strong className="text-white font-mono">{selectedDate}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase">
                <th className="py-3 px-4 min-w-[200px] sticky left-0 bg-slate-950/95 z-10 backdrop-blur-md">
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
                    <div className="font-heading font-semibold text-white truncate max-w-[190px]">
                      {court.name}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {court.sport} • {court.surface.split(' ')[0]}
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
                            title="Friday Night Social Play"
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

      {/* SLOT CLICK ACTION MODAL: "Book Trial" or "Login to Book" */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-lime-400">Available Slot</span>
                <h3 className="font-heading font-extrabold text-xl text-white">
                  Reserve This Court
                </h3>
              </div>
              <button
                onClick={() => setActiveSlot(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Slot Information */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Championship Court:</span>
                <span className="text-white font-bold">{activeSlot.court.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Time:</span>
                <span className="text-lime-400 font-bold font-mono">
                  {selectedDate} at {activeSlot.time} (60 Mins)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Surface & Sport:</span>
                <span className="text-slate-300 capitalize">{activeSlot.court.sport} • {activeSlot.court.surface}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
                <span className="text-slate-400">Member Privilege Rate:</span>
                <span className="text-lime-400">
                  From {formatINR(activeSlot.court.hourlyRate.gold)} (Gold) to {formatINR(activeSlot.court.hourlyRate.walk_in)} (Walk-in)
                </span>
              </div>
            </div>

            {/* Action Buttons: Book Trial vs Login to Book */}
            <div className="space-y-3">
              <button
                onClick={handleGoToTrial}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-lime-400/20 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-bold">Book Complimentary VIP Trial</div>
                    <div className="text-[10px] font-normal opacity-85">Includes free racquet loaner & coach consult</div>
                  </div>
                </div>
                <span>Free Trial →</span>
              </button>

              <button
                onClick={handleGoToLogin}
                className="w-full p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-bold text-xs flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2.5">
                  <LogIn className="w-4 h-4 text-lime-400" />
                  <div className="text-left">
                    <div className="font-bold">Login to Book as Member</div>
                    <div className="text-[10px] font-normal text-slate-400">Apply tier rates, wallet balance & quota</div>
                  </div>
                </div>
                <span>Member Portal →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
