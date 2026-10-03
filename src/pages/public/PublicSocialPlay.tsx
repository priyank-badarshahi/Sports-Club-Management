import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { SportsGraphic } from '../../components/common/SportsGraphic';
import { Users, Calendar, Sparkles, CheckCircle2, UserCheck, ShieldCheck, X } from 'lucide-react';

export const PublicSocialPlay: React.FC = () => {
  const { bookings, joinSocialPlay, currentUser } = useClub();

  // Find social play session
  const socialSession = bookings.find((b) => b.isSocialPlay);

  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [playerName, setPlayerName] = useState(currentUser.name || 'Rahul Patel');
  const [joinSuccess, setJoinSuccess] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialSession || !playerName) return;

    const ok = joinSocialPlay(socialSession.id, playerName);
    if (ok) {
      setJoinSuccess(true);
      setTimeout(() => {
        setJoinSuccess(false);
        setJoinModalOpen(false);
      }, 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Community Mixers & Social Play</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Champions Social Match Play
        </h1>
        <p className="text-slate-600 text-sm mt-3 leading-relaxed">
          Drop in, meet club players of all skill levels, and enjoy rotating doubles matches with complimentary balls and court lighting.
        </p>
      </div>

      {/* Featured Social Session Card */}
      {socialSession ? (
        <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-blue-600 font-bold">
                Weekly Flagship Session
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">Friday Night Tennis & Padel Mixer</h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Every Friday · {socialSession.startTime} – {socialSession.endTime}
                </span>
                <span>·</span>
                <span>{socialSession.courtName}</span>
              </div>
            </div>

            {/* Slots counter */}
            <div className="text-right">
              <div className="text-3xl font-black font-mono text-blue-600">
                {(socialSession.socialSlotsTotal ?? 8) - (socialSession.socialSlotsAvailable ?? 0)} / {socialSession.socialSlotsTotal ?? 8}
              </div>
              <div className="text-[11px] font-mono text-slate-500 font-medium">
                {socialSession.socialSlotsAvailable} spots remaining
              </div>
            </div>
          </div>

          {/* Registered Players List */}
          <div className="my-6">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Confirmed Registered Players:</span>
              <span className="text-[11px] text-blue-600 font-mono font-medium">Rotating King-of-Court Format</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {socialSession.registeredPlayers?.map((player, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-slate-900 font-medium">{player}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Call to action */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Session Fee: <span className="text-slate-900 font-bold font-mono">₹300</span> (Free for Gold Members)
            </div>

            <button
              disabled={(socialSession.socialSlotsAvailable ?? 0) <= 0}
              onClick={() => setJoinModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all"
            >
              {(socialSession.socialSlotsAvailable ?? 0) > 0 ? 'Join Social Play' : 'Session Full'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 text-xs">No active social session.</div>
      )}

      {/* Join Modal */}
      {joinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md w-full p-6 relative">
            <button
              onClick={() => setJoinModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {!joinSuccess ? (
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <div className="text-xs font-mono uppercase text-blue-600 font-semibold">
                    Friday Mixer Registration
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                    Register for Social Play
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Join Court 2 from 7:00 PM – 8:00 PM. Format: Doubles king of the court.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Player Name / Member
                  </label>
                  <input
                    type="text"
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setJoinModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Confirm Registration
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">You're on the Roster!</h3>
                <p className="text-xs text-slate-500">
                  {playerName} has been added to Friday Social Play. See you on Court 2!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
