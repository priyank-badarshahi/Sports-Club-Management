import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { SportType } from '../../types';
import { 
  Trophy, 
  Award, 
  Star, 
  Calendar, 
  Clock, 
  Send, 
  Check, 
  Sparkles, 
  Users, 
  ArrowRight, 
  X,
  Phone,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { formatINR } from '../../lib/formatters';

export const CoachingEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { employees, addLead, addToast } = useAppStore();

  // Filter coaches
  const coaches = employees.filter((e) => e.department === 'Sports & Coaching' || e.coachingProfile);

  // Enquiry modal state
  const [enquiryModal, setEnquiryModal] = useState<{
    isOpen: boolean;
    title: string;
    type: 'coaching' | 'tournament' | 'clinic';
  }>({
    isOpen: false,
    title: '',
    type: 'coaching',
  });

  const [enquiryForm, setEnquiryForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    sport: 'tennis' as SportType,
    notes: 'Interested in private coaching / clinic registration',
  });

  const programs = [
    {
      id: 'prog_1',
      title: 'High Performance Competition Tennis Academy',
      sport: 'tennis' as SportType,
      coach: 'Somdev Devvarman (Ex-Davis Cup Gold Medalist)',
      level: 'Advanced / Competitive',
      schedule: 'Mon / Wed / Fri • 06:00 - 08:00 AM',
      fee: 12000,
      description: 'Intensive drill academy focusing on footwork speed, match tactics, baseline depth, and tournament conditioning.',
      image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'prog_2',
      title: 'Padel Tactical Wall & Vibora Masterclass',
      sport: 'padel' as SportType,
      coach: 'Juan Carlos (FIP Madrid Certified)',
      level: 'Intermediate to Advanced',
      schedule: 'Tue / Thu / Sat • 05:00 - 07:00 PM',
      fee: 9500,
      description: 'Master glass rebound positioning, chiquita drops, tray smashes, and court geometry with Spanish pro instruction.',
      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'prog_3',
      title: 'BWF Junior Badminton Footwork & Smash Clinic',
      sport: 'badminton' as SportType,
      coach: 'Rajesh Varma (BWF Level 2)',
      level: 'Junior / Beginners & Intermediate',
      schedule: 'Sat / Sun • 08:00 - 10:00 AM',
      fee: 6500,
      description: 'Agility ladder footwork, wrist power generation, overhead smash mechanics, and junior tournament prep.',
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const tournaments = [
    {
      id: 'tourn_1',
      title: 'Champions Monsoon Red Clay Tennis Open 2026',
      date: 'October 18 - 20, 2026',
      sport: 'tennis' as SportType,
      category: 'Men\'s / Women\'s Singles & Doubles',
      prizePool: '₹2,50,000 Cash Purse + Trophy',
      entryFee: 1500,
      status: 'Registration Open',
    },
    {
      id: 'tourn_2',
      title: 'Bengaluru Glass Arena Padel Americano Cup',
      date: 'October 25, 2026 (Sunday)',
      sport: 'padel' as SportType,
      category: 'Open Americano Mixed Pairs',
      prizePool: '₹1,00,000 Gear Vouchers + Wilson Racquets',
      entryFee: 1200,
      status: 'Registration Open',
    },
  ];

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryForm.fullName || !enquiryForm.phone) return;

    addLead({
      fullName: enquiryForm.fullName,
      phone: enquiryForm.phone,
      email: enquiryForm.email || 'guest@example.com',
      sportInterest: [enquiryForm.sport],
      interestedTier: 'gold',
      source: 'website_contact',
      status: 'new',
      notes: `Enquiry for [${enquiryModal.title}]: ${enquiryForm.notes}`,
    });

    addToast({
      type: 'success',
      title: 'Enquiry Registered',
      message: `Thank you ${enquiryForm.fullName}! Our head coach desk will call you at ${enquiryForm.phone}.`,
    });

    setEnquiryModal({ isOpen: false, title: '', type: 'coaching' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-lime-400">
          Pro Coaching & Tournaments
        </span>
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-white">
          Elevate Your Performance Under World-Class Pros
        </h1>
        <p className="text-sm sm:text-base text-slate-300">
          From Asian Games gold medalists to certified international instructors. Join high-performance academies, weekend clinics, and cash tournaments.
        </p>
      </div>

      {/* SECTION 1: PRO COACHES FACULTY */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="font-heading font-extrabold text-2xl text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-lime-400" />
            <span>Master Coaching Faculty</span>
          </h2>
          <span className="text-xs text-slate-400">{coaches.length} Certified Pros On-court</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coaches.map((c) => {
            const profile = c.coachingProfile;
            return (
              <div
                key={c.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between space-y-4 shadow-xl hover:border-slate-700 transition"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-lime-400/50"
                    />
                    <div>
                      <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{profile?.rating || 4.9} / 5.0</span>
                      </div>
                      <h3 className="font-heading font-extrabold text-lg text-white mt-0.5">{c.name}</h3>
                      <span className="text-xs text-lime-400 font-semibold">{c.role.replace('_', ' ').toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Certification</span>
                      <span className="font-semibold text-white">{profile?.certification || 'AITA / PTR Master Pro'}</span>
                    </div>

                    <p className="text-slate-400 leading-relaxed line-clamp-3">
                      {profile?.bio || 'International high-performance specialist with tournament experience.'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Hourly Session Rate:</span>
                    <span className="font-heading font-extrabold text-lime-400 text-sm">
                      {formatINR(profile?.hourlyRate || c.salaryStructure?.hourlyCoachingRate || 2000)}/hr
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEnquiryForm({
                          fullName: '',
                          phone: '',
                          email: '',
                          sport: profile?.sports[0] || 'tennis',
                          notes: `Requesting private 1-on-1 coaching with ${c.name}`,
                        });
                        setEnquiryModal({
                          isOpen: true,
                          title: `Private Coaching: ${c.name}`,
                          type: 'coaching',
                        });
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 transition"
                    >
                      Enquire / Book
                    </button>
                    <button
                      onClick={() => navigate('/availability')}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
                    >
                      Court Slots
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: ACADEMIES & CLINICS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="font-heading font-extrabold text-2xl text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            <span>High-Performance Academies & Clinics</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between shadow-xl"
            >
              <div className="relative h-44 overflow-hidden">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-lime-400 text-[10px] font-bold uppercase tracking-wider border border-lime-400/30">
                  {p.sport.toUpperCase()}
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2 text-xs">
                  <h3 className="font-heading font-bold text-base text-white">{p.title}</h3>
                  <div className="text-lime-400 font-semibold">{p.coach}</div>
                  <p className="text-slate-400 leading-relaxed">{p.description}</p>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 mt-2">
                    <div className="text-slate-400">Schedule: <strong className="text-white">{p.schedule}</strong></div>
                    <div className="text-slate-400">Target Level: <strong className="text-white">{p.level}</strong></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Course Fee</span>
                    <span className="font-heading font-extrabold text-lg text-white">{formatINR(p.fee)} / month</span>
                  </div>

                  <button
                    onClick={() => {
                      setEnquiryForm({
                        fullName: '',
                        phone: '',
                        email: '',
                        sport: p.sport,
                        notes: `Enrolling in Clinic: ${p.title}`,
                      });
                      setEnquiryModal({
                        isOpen: true,
                        title: p.title,
                        type: 'clinic',
                      });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 transition"
                  >
                    Register Seat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: UPCOMING TOURNAMENTS */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Sanctioned Tournaments & Cash Purses
            </span>
            <h2 className="font-heading font-extrabold text-2xl text-white mt-0.5">
              Sanctioned Competitions
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournaments.map((t) => (
            <div key={t.id} className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[10px] uppercase border border-amber-400/30">
                    {t.sport} Tournament
                  </span>
                  <span className="text-lime-400 font-bold font-mono text-[11px]">{t.status}</span>
                </div>

                <h3 className="font-heading font-bold text-lg text-white">{t.title}</h3>
                <div className="text-slate-400">Date: <strong className="text-white">{t.date}</strong></div>
                <div className="text-slate-400">Categories: <strong className="text-white">{t.category}</strong></div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-semibold">
                  Prize Purse: {t.prizePool}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">Entry Fee: <strong className="text-white">{formatINR(t.entryFee)} / team</strong></span>
                <button
                  onClick={() => {
                    setEnquiryForm({
                      fullName: '',
                      phone: '',
                      email: '',
                      sport: t.sport,
                      notes: `Tournament Entry Registration for ${t.title}`,
                    });
                    setEnquiryModal({
                      isOpen: true,
                      title: t.title,
                      type: 'tournament',
                    });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 transition"
                >
                  Register Entry
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ENQUIRY MODAL */}
      {enquiryModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase text-lime-400">Public Registration & Enquiry</span>
                <h3 className="font-heading font-bold text-lg text-white mt-0.5">{enquiryModal.title}</h3>
              </div>
              <button
                onClick={() => setEnquiryModal({ isOpen: false, title: '', type: 'coaching' })}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnquirySubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Your Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={enquiryForm.fullName}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Phone Number *</label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 98401 00000"
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={enquiryForm.email}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Notes / Preferences</label>
                <textarea
                  rows={3}
                  value={enquiryForm.notes}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEnquiryModal({ isOpen: false, title: '', type: 'coaching' })}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-lime-400 text-slate-950 font-bold shadow-lg shadow-lime-400/20 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Registration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
