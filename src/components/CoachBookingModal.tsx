import React, { useState } from 'react';
import { Employee, Court } from '../types';
import { formatINR } from '../lib/formatters';
import { X, Calendar, Clock, Award, ShieldCheck } from 'lucide-react';

interface CoachBookingModalProps {
  coaches: Employee[];
  courts: Court[];
  onClose: () => void;
  onSubmit: (coachId: string, courtId: string, date: string, startTime: string, endTime: string, topic: string) => void;
}

export const CoachBookingModal: React.FC<CoachBookingModalProps> = ({
  coaches,
  courts,
  onClose,
  onSubmit,
}) => {
  const [selectedCoachId, setSelectedCoachId] = useState(coaches[0]?.id || '');
  const [selectedCourtId, setSelectedCourtId] = useState(courts[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('09:00');
  const [topic, setTopic] = useState('Master Padel Wall Play & Vibora Drills');

  const selectedCoach = coaches.find((c) => c.id === selectedCoachId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedCoachId, selectedCourtId, date, startTime, endTime, topic);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-xs">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">
              Coaching Academy Calendar
            </span>
            <h3 className="font-heading font-extrabold text-base text-white mt-0.5">
              Reserve Court Block for Coach Clinic
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Select Coach *</label>
            <select
              value={selectedCoachId}
              onChange={(e) => setSelectedCoachId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
            >
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>
                  Coach {c.name} ({c.coachingProfile?.certification || c.department}) - {formatINR(c.coachingProfile?.hourlyRate || 2000)}/h
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Clinic Topic / Title *</label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Court Selection *</label>
            <select
              value={selectedCourtId}
              onChange={(e) => setSelectedCourtId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
            >
              {courts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name} ({court.surface} - {court.sport.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Start Time</label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
              >
                {['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">End Time</label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
              >
                {['08:00', '09:00', '10:00', '11:00', '12:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedCoach && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-300">
              <span>Coaching Billing Rate:</span>
              <span className="font-mono font-bold text-lime-400">{formatINR(selectedCoach.coachingProfile?.hourlyRate || 2000)} / hour</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold shadow-md shadow-lime-400/20"
            >
              Reserve Coaching Block
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
