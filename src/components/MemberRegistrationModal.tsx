import React, { useState } from 'react';
import { useAppStore } from '../store';
import { MembershipTier, SportType, Member } from '../types';
import { 
  X, 
  Sparkles, 
  QrCode, 
  User, 
  Check, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle,
  Camera,
  Upload
} from 'lucide-react';
import { formatINR, getTierBadgeClass, getTierName, formatDate } from '../lib/formatters';

interface MemberRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemberRegistrationModal: React.FC = () => {
  const { plans, registerMember, openMember360 } = useAppStore();

  const [form, setForm] = useState({
    fullName: '',
    dateOfBirth: '1995-05-15',
    gender: 'Male' as 'Male' | 'Female' | 'Other' | 'Prefer not to say',
    phone: '',
    email: '',
    address: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: 'Spouse / Parent',
    guardianName: '',
    guardianPhone: '',
    guardianRelation: 'Parent',
    preferredSports: ['tennis'] as SportType[],
    planTier: 'gold' as MembershipTier,
    billingCycle: 'annual' as 'monthly' | 'quarterly' | 'annual',
    startDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'upi' as 'cash' | 'card' | 'upi',
  });

  const [isJuniorAuto, setIsJuniorAuto] = useState(false);
  const [createdResult, setCreatedResult] = useState<{ member: Member; invoiceId: string } | null>(null);

  // Auto-calculate age from DOB
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    const birthYear = new Date(dob).getFullYear();
    const currentYear = 2026;
    const age = currentYear - birthYear;
    const isUnder18 = age < 18;

    setIsJuniorAuto(isUnder18);
    setForm((prev) => ({
      ...prev,
      dateOfBirth: dob,
      planTier: isUnder18 ? 'junior' : prev.planTier === 'junior' ? 'silver' : prev.planTier,
    }));
  };

  const toggleSport = (sport: SportType) => {
    setForm((prev) => {
      const exists = prev.preferredSports.includes(sport);
      if (exists) {
        return prev.preferredSports.length > 1
          ? { ...prev, preferredSports: prev.preferredSports.filter((s) => s !== sport) }
          : prev;
      }
      return { ...prev, preferredSports: [...prev.preferredSports, sport] };
    });
  };

  const selectedPlan = plans.find((p) => p.tier === form.planTier) || plans[0];
  const baseCost = form.billingCycle === 'annual'
    ? selectedPlan.annualPrice
    : form.billingCycle === 'quarterly'
    ? selectedPlan.quarterlyPrice
    : selectedPlan.monthlyPrice;
  const gstAmount = Math.round(baseCost * 0.18);
  const totalAmount = baseCost + gstAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate expiry date based on start date and billing cycle
    const start = new Date(form.startDate);
    const expiry = new Date(start);
    if (form.billingCycle === 'annual') expiry.setFullYear(expiry.getFullYear() + 1);
    else if (form.billingCycle === 'quarterly') expiry.setMonth(expiry.getMonth() + 3);
    else expiry.setMonth(expiry.getMonth() + 1);

    const expiryDateStr = expiry.toISOString().split('T')[0];

    const { member, invoice } = registerMember(
      {
        fullName: form.fullName,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        email: form.email,
        phone: form.phone,
        address: form.address || 'Champions Club Residential, Bengaluru',
        avatar: form.avatar,
        tier: form.planTier,
        status: 'active',
        expiryDate: expiryDateStr,
        walletBalance: form.planTier === 'gold' ? 5000 : form.planTier === 'silver' ? 2000 : 1000,
        activeTabBalance: 0,
        guardian: isJuniorAuto
          ? {
              name: form.guardianName,
              phone: form.guardianPhone,
              relation: form.guardianRelation,
            }
          : undefined,
        emergencyContact: {
          name: form.emergencyName,
          phone: form.emergencyPhone,
          relation: form.emergencyRelation,
        },
        preferredSports: form.preferredSports,
        notes: `Enrolled via Front Desk on ${form.startDate}. Payment Method: ${form.paymentMethod.toUpperCase()}`,
      },
      form.paymentMethod,
      totalAmount,
      form.billingCycle
    );

    setCreatedResult({ member, invoiceId: invoice.invoiceNumber });
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80',
  ];

  return (
    <div className="space-y-6">
      {!createdResult ? (
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Section 1: Basic Identity & DOB */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-lime-400">
              1. Member Identity & Demographics
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Legal Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Siddharth Singhania"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Date of Birth * (Auto-detects Junior if under 18)
                </label>
                <input
                  required
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleDobChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            {/* Junior Auto Alert */}
            {isJuniorAuto && (
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Junior Athlete Detected (Under 18):</strong> Junior plan selected automatically. Parent/guardian details are required below.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-lime-400"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Phone Number *</label>
                <input
                  required
                  type="tel"
                  placeholder="+91 98450 12345"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Email Address *</label>
                <input
                  required
                  type="email"
                  placeholder="siddharth@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Residential Address</label>
              <input
                type="text"
                placeholder="Apartment, Street, Area, Bengaluru"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
              />
            </div>

            {/* Photo Selection & Upload */}
            <div>
              <label className="text-slate-300 font-semibold block mb-2">Member Photo Upload / Avatar Selection</label>
              <div className="flex flex-wrap items-center gap-4">
                <img
                  src={form.avatar}
                  alt="Preview"
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-lime-400 shadow-md"
                />
                <div>
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer text-xs font-semibold transition">
                    <Upload className="w-3.5 h-3.5 text-lime-400" />
                    <span>Upload ID Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setForm((prev) => ({ ...prev, avatar: reader.result as string }));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <span className="text-[10px] text-slate-500 block mt-1">Or pick a preset club avatar:</span>
                </div>
                <div className="flex items-center gap-2">
                  {sampleAvatars.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Sample"
                      onClick={() => setForm({ ...form, avatar: url })}
                      className={`w-9 h-9 rounded-lg object-cover cursor-pointer transition ${
                        form.avatar === url ? 'ring-2 ring-lime-400' : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Guardian (if under 18) & Emergency Contact */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">
              2. Guardian & Emergency Contacts
            </h4>

            {isJuniorAuto && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-3 border-b border-slate-800/80">
                <div>
                  <label className="text-sky-300 font-semibold block mb-1">Guardian Full Name *</label>
                  <input
                    required={isJuniorAuto}
                    type="text"
                    placeholder="e.g. Ramesh Singhania"
                    value={form.guardianName}
                    onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="text-sky-300 font-semibold block mb-1">Guardian Phone *</label>
                  <input
                    required={isJuniorAuto}
                    type="tel"
                    placeholder="+91 98450 99887"
                    value={form.guardianPhone}
                    onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="text-sky-300 font-semibold block mb-1">Relationship</label>
                  <input
                    type="text"
                    value={form.guardianRelation}
                    onChange={(e) => setForm({ ...form, guardianRelation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Emergency Contact Person *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Priya Singhania"
                  value={form.emergencyName}
                  onChange={(e) => setForm({ ...form, emergencyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Emergency Phone *</label>
                <input
                  required
                  type="tel"
                  placeholder="+91 98450 66778"
                  value={form.emergencyPhone}
                  onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Relation</label>
                <input
                  type="text"
                  value={form.emergencyRelation}
                  onChange={(e) => setForm({ ...form, emergencyRelation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Sports, Plan Selection & Billing */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-sky-400">
              3. Plan & Payment Configuration
            </h4>

            <div>
              <label className="text-slate-300 font-semibold block mb-2">Preferred Sports</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'tennis', label: 'Tennis' },
                  { id: 'padel', label: 'Padel' },
                  { id: 'badminton', label: 'Badminton' },
                  { id: 'cricket', label: 'Cricket Nets' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSport(s.id as any)}
                    className={`p-2.5 rounded-xl border text-center font-semibold transition ${
                      form.preferredSports.includes(s.id as any)
                        ? 'bg-lime-400/10 border-lime-400 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Membership Tier</label>
                <select
                  value={form.planTier}
                  onChange={(e) => setForm({ ...form, planTier: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-lime-400"
                >
                  <option value="gold">Gold Championship</option>
                  <option value="silver">Silver Club</option>
                  <option value="junior">Junior Academy</option>
                  <option value="walk_in">Casual / Walk-in</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Billing Term</label>
                <select
                  value={form.billingCycle}
                  onChange={(e) => setForm({ ...form, billingCycle: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-lime-400"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual (Save 30%)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Payment Method</label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-lime-400 uppercase font-semibold"
                >
                  <option value="upi">UPI Instant Transfer</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="cash">Front Desk Cash</option>
                </select>
              </div>
            </div>

            {/* Live Pricing Breakdown */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Base Membership Fee:</span>
                <span>{formatINR(baseCost)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (18% Input Invoiced):</span>
                <span>{formatINR(gstAmount)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                <span>Total Due & Charged:</span>
                <span className="text-lime-400 font-heading">{formatINR(totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-lime-400/20 flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Enroll Member & Post Invoice</span>
            </button>
          </div>
        </form>
      ) : (
        /* Digital Pass & Success Card */
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-lime-400/40 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-lime-400/20 border-2 border-lime-400 flex items-center justify-center text-lime-400 mx-auto">
            <Check className="w-8 h-8" />
          </div>

          <div>
            <h3 className="font-heading font-extrabold text-2xl text-white">
              Membership Enrolled Successfully!
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Invoice #{createdResult.invoiceId} has been posted to the Finance Ledger and marked as paid via {form.paymentMethod.toUpperCase()}.
            </p>
          </div>

          {/* Digital Membership Pass preview */}
          <div className="max-w-sm mx-auto p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-amber-400/60 shadow-xl text-left relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={createdResult.member.avatar}
                  alt={createdResult.member.fullName}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-lime-400"
                />
                <div>
                  <h4 className="font-heading font-bold text-sm text-white">
                    {createdResult.member.fullName}
                  </h4>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${getTierBadgeClass(createdResult.member.tier)}`}>
                    {createdResult.member.tier}
                  </span>
                </div>
              </div>
              <QrCode className="w-10 h-10 text-lime-400" />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] text-slate-300 font-mono">
              <div>ID: <strong className="text-white">{createdResult.member.memberNumber}</strong></div>
              <div>Expiry: <strong>{formatDate(createdResult.member.expiryDate)}</strong></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                openMember360(createdResult.member.id);
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20"
            >
              Open Member 360° Profile →
            </button>
            <button
              onClick={() => setCreatedResult(null)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
            >
              Enroll Another Member
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
