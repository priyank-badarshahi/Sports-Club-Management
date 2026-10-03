import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { MembershipTier } from '../../types';
import { CheckCircle2, ShieldCheck, ArrowRight, X, Sparkles, CreditCard } from 'lucide-react';

export const PublicMemberships: React.FC = () => {
  const { addMember, setCurrentView, currentUser, isAuthenticated, setAuthIntent, switchRole } = useClub();

  const [selectedPlan, setSelectedPlan] = useState<MembershipTier | null>(null);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    dateOfBirth: '1995-05-10',
    paymentMethod: 'UPI' as 'UPI' | 'Card' | 'Online',
  });
  const [successMember, setSuccessMember] = useState<any>(null);

  const plans: {
    tier: MembershipTier;
    subtitle: string;
    annualPrice: number;
    discountPct: number;
    recommended?: boolean;
    features: string[];
    courtDiscount: string;
    shopDiscount: string;
    barDiscount: string;
    bookingWindow: string;
    guestPasses: number;
  }[] = [
    {
      tier: 'Gold',
      subtitle: 'All-inclusive premium tier for competitive & avid athletes',
      annualPrice: 45000,
      discountPct: 20,
      recommended: true,
      features: [
        'Full unlimited access to Tennis, Padel & Badminton facilities',
        '20% member discount on all court bookings & ball machine rentals',
        '20% member pricing on Pro Shop gear & stringing service',
        '20% member tab discount at Champions Bar & Cafeteria',
        '7-day priority advance court booking window',
        'Access to VIP lockers, steam sauna & recovery lounge',
        '6 complimentary guest passes per year',
        'Invitations to Champions Club Invitational tournaments',
      ],
      courtDiscount: '20% Off',
      shopDiscount: '20% Off',
      barDiscount: '20% Off',
      bookingWindow: '7 Days Ahead',
      guestPasses: 6,
    },
    {
      tier: 'Silver',
      subtitle: 'Standard membership for weekly regular court sports players',
      annualPrice: 28000,
      discountPct: 10,
      features: [
        'Full access to all court surfaces during operational hours',
        '10% member discount on standard court bookings',
        '10% member discount on Pro Shop apparel & footwear',
        '10% member discount on Cafeteria refreshments',
        '3-day advance court booking window',
        'Standard club locker room access',
        '2 complimentary guest passes per year',
        'Club ladder and social mixer entry',
      ],
      courtDiscount: '10% Off',
      shopDiscount: '10% Off',
      barDiscount: '10% Off',
      bookingWindow: '3 Days Ahead',
      guestPasses: 2,
    },
    {
      tier: 'Junior',
      subtitle: 'Dedicated athletic progression for juniors under 18 years of age',
      annualPrice: 22000,
      discountPct: 15,
      features: [
        'Dedicated junior coaching clinics and after-school court access',
        '15% discount on all off-peak and weekend court slots',
        '15% discount on junior equipment, racquets & junior apparel',
        'Complimentary entry to Champions Junior Summer Trophy',
        'Quarterly coach evaluation report card',
        'Parent spectator lounge pass',
      ],
      courtDiscount: '15% Off (Off-Peak)',
      shopDiscount: '15% Off',
      barDiscount: '10% Off',
      bookingWindow: '3 Days Ahead',
      guestPasses: 0,
    },
  ];

  const handleOpenEnroll = (tier: MembershipTier) => {
    setSelectedPlan(tier);
    if (!isAuthenticated) {
      setAuthIntent({
        view: 'public_memberships',
        message: `Please create an account or login to activate your ${tier} Membership.`,
      });
      setCurrentView('public_signup');
      return;
    }
    setEnrollModalOpen(true);
    setSuccessMember(null);
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !selectedPlan) return;

    const today = new Date();
    const expiry = new Date();
    expiry.setFullYear(today.getFullYear() + 1);

    const created = addMember({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      plan: selectedPlan,
      startDate: today.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      initialPaymentMethod: formData.paymentMethod,
    });

    setSuccessMember(created);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Annual Tier Privileges</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Champions Club Memberships
        </h1>
        <p className="text-slate-600 text-sm mt-3 leading-relaxed">
          Select the tier that matches your passion. Every membership unlocks discounted court reservations, sports shop concessions, and cafeteria privileges.
        </p>
        <div className="mt-2 text-xs font-mono text-slate-500">
          * Demo prices shown. System allows instant enrollment & member ID creation.
        </div>
      </div>

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((p) => (
          <div
            key={p.tier}
            className={`rounded-3xl p-8 flex flex-col justify-between transition-all relative ${
              p.recommended
                ? 'bg-white text-slate-900 border-2 border-blue-600 shadow-md ring-2 ring-blue-500/20'
                : 'bg-white text-slate-900 border border-slate-200 shadow-xs'
            }`}
          >
            {p.recommended && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-extrabold text-xs uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-white" />
                <span>Most Recommended</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">{p.tier}</h3>
                <span
                  className={`text-xs font-mono px-2.5 py-0.5 rounded-full ${
                    p.recommended
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'bg-slate-100 text-slate-600 font-medium'
                  }`}
                >
                  {p.discountPct}% Benefit Rate
                </span>
              </div>
              <p className="text-xs mt-2 text-slate-500">
                {p.subtitle}
              </p>

              <div className="my-6 pt-6 border-t border-slate-100">
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-4xl font-extrabold text-slate-900">₹{p.annualPrice.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-500">
                    / year
                  </span>
                </div>
                <div className="text-[11px] text-blue-600 font-semibold mt-1">Configurable Demo Rate</div>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-3 pt-2">
                {p.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        p.recommended ? 'text-blue-600' : 'text-emerald-600'
                      }`}
                    />
                    <span className="text-slate-700">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => handleOpenEnroll(p.tier)}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  p.recommended
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                }`}
              >
                <span>Choose {p.tier} Membership</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs overflow-hidden">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Detailed Tier Comparison Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-mono uppercase text-[11px]">
                <th className="py-3 px-4 font-semibold">Benefit Category</th>
                <th className="py-3 px-4 font-semibold text-blue-700">Gold Tier</th>
                <th className="py-3 px-4 font-semibold">Silver Tier</th>
                <th className="py-3 px-4 font-semibold">Junior Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-sans font-medium text-slate-800">Court Booking Discount</td>
                <td className="py-3 px-4 text-blue-600 font-bold">20% off all courts</td>
                <td className="py-3 px-4 text-slate-600">10% off all courts</td>
                <td className="py-3 px-4 text-slate-600">15% off off-peak</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-sans font-medium text-slate-800">Advance Booking Window</td>
                <td className="py-3 px-4 text-blue-600 font-bold">7 days ahead</td>
                <td className="py-3 px-4 text-slate-600">3 days ahead</td>
                <td className="py-3 px-4 text-slate-600">3 days ahead</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-sans font-medium text-slate-800">Sports Pro Shop Discount</td>
                <td className="py-3 px-4 text-blue-600 font-bold">20% off gear & racquets</td>
                <td className="py-3 px-4 text-slate-600">10% off gear</td>
                <td className="py-3 px-4 text-slate-600">15% off junior lines</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-sans font-medium text-slate-800">Bar & Cafeteria Tab Discount</td>
                <td className="py-3 px-4 text-blue-600 font-bold">20% automatic discount</td>
                <td className="py-3 px-4 text-slate-600">10% automatic discount</td>
                <td className="py-3 px-4 text-slate-600">10% juice & fruit bars</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-sans font-medium text-slate-800">Guest Passes Included</td>
                <td className="py-3 px-4 text-slate-900 font-bold">6 Passes / Year</td>
                <td className="py-3 px-4 text-slate-600">2 Passes / Year</td>
                <td className="py-3 px-4 text-slate-400">None</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Enrollment Modal */}
      {enrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative">
            <button
              onClick={() => setEnrollModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {!successMember ? (
              <form onSubmit={handleEnrollSubmit} className="space-y-4">
                <div>
                  <div className="text-xs font-mono uppercase text-blue-600 font-semibold">Join Champions Club</div>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                    Enroll for {selectedPlan} Membership
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Complete your details. This will generate your official Member ID and register your card immediately.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Vikram Malhotra"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="vikram@example.com"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98200 12345"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        required
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                      >
                        <option value="UPI">UPI (Google Pay / PhonePe)</option>
                        <option value="Card">Credit / Debit Card</option>
                        <option value="Online">Net Banking</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between font-mono">
                  <span className="text-slate-600">Total Enrollment Amount:</span>
                  <span className="text-sm font-bold text-slate-900">
                    ₹{selectedPlan === 'Gold' ? '45,000' : selectedPlan === 'Silver' ? '28,000' : '22,000'}
                  </span>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEnrollModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                  >
                    Confirm & Pay
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Membership Activated!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Welcome to Champions Club. Your digital card is active.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-blue-600 font-bold text-sm">CHAMPIONS CLUB</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                      {successMember.plan} MEMBER
                    </span>
                  </div>
                  <div>Member: <span className="text-slate-900 font-bold">{successMember.name}</span></div>
                  <div>Member ID: <span className="text-blue-600 font-bold">{successMember.memberId}</span></div>
                  <div>Valid Thru: <span className="text-slate-600">{successMember.expiryDate}</span></div>
                  <div>Discount Rate: <span className="text-emerald-700 font-semibold">{(successMember.discountRate * 100).toFixed(0)}% Off Bookings</span></div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setEnrollModalOpen(false);
                      setCurrentView('public_courts');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                  >
                    Book a Court Now
                  </button>
                  <button
                    onClick={() => {
                      setEnrollModalOpen(false);
                      switchRole('member');
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs"
                  >
                    Go to Member Portal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
