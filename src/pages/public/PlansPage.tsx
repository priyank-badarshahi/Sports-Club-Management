import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { MembershipTier, SportType, Member } from '../../types';
import { PaymentPanel, PaymentResult } from '../../components/PaymentPanel';
import { 
  Check, 
  X, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  ShoppingBag, 
  Coffee, 
  Users, 
  Calendar,
  Zap,
  QrCode,
  AlertCircle,
  FileText,
  User,
  ArrowLeft
} from 'lucide-react';
import { formatINR, getTierBadgeClass, getTierName } from '../../lib/formatters';

export const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { plans, registerMember, setRole, setCurrentUser } = useAppStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annual'>('annual');

  // Multi-step modal state
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | null>(null);
  const [selectedTier, setSelectedTier] = useState<MembershipTier>('gold');

  // Form details
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '1995-05-15',
    gender: 'Male' as 'Male' | 'Female' | 'Other' | 'Prefer not to say',
    address: 'Indiranagar 100ft Road, Bengaluru',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: 'Spouse',
    guardianName: '',
    guardianPhone: '',
    guardianRelation: 'Parent',
    preferredSport: 'tennis' as SportType,
  });

  const [isJuniorAuto, setIsJuniorAuto] = useState(false);
  const [createdResult, setCreatedResult] = useState<{ member: Member; invoiceNumber: string } | null>(null);

  const handleJoinClick = (tier: MembershipTier) => {
    setSelectedTier(tier);
    setActiveStep(1);
  };

  // Handle DOB change for Junior auto-detection
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    const birthYear = new Date(dob).getFullYear();
    const age = 2026 - birthYear;
    const isUnder18 = age < 18;

    setIsJuniorAuto(isUnder18);
    if (isUnder18) {
      setSelectedTier('junior');
    }
    setForm((prev) => ({ ...prev, dateOfBirth: dob }));
  };

  const currentPlan = plans.find((p) => p.tier === selectedTier) || plans[0];
  const basePrice = billingCycle === 'annual'
    ? currentPlan.annualPrice
    : billingCycle === 'quarterly'
    ? currentPlan.quarterlyPrice
    : currentPlan.monthlyPrice;
  const gstAmount = Math.round(basePrice * 0.18);
  const totalAmount = basePrice + gstAmount;

  // Handle Step 2 -> Step 3
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.email) return;
    if (isJuniorAuto && (!form.guardianName || !form.guardianPhone)) return;
    setActiveStep(3);
  };

  // Handle Step 3 Payment Completed
  const handlePaymentComplete = (result: PaymentResult) => {
    const start = new Date();
    const expiry = new Date(start);
    if (billingCycle === 'annual') expiry.setFullYear(expiry.getFullYear() + 1);
    else if (billingCycle === 'quarterly') expiry.setMonth(expiry.getMonth() + 3);
    else expiry.setMonth(expiry.getMonth() + 1);

    const { member, invoice } = registerMember(
      {
        fullName: form.fullName,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        email: form.email,
        phone: form.phone,
        address: form.address,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
        tier: selectedTier,
        status: 'active',
        expiryDate: expiry.toISOString().split('T')[0],
        walletBalance: selectedTier === 'gold' ? 5000 : selectedTier === 'silver' ? 2500 : 1000,
        activeTabBalance: 0,
        guardian: isJuniorAuto
          ? {
              name: form.guardianName,
              phone: form.guardianPhone,
              relation: form.guardianRelation,
            }
          : undefined,
        emergencyContact: {
          name: form.emergencyName || form.guardianName || 'Family Contact',
          phone: form.emergencyPhone || form.phone,
          relation: form.emergencyRelation || 'Self',
        },
        preferredSports: [form.preferredSport],
        notes: `Online Self-Enrollment (${billingCycle.toUpperCase()}). Payment Ref: ${result.transactionRef}`,
      },
      result.method,
      totalAmount,
      billingCycle
    );

    setCreatedResult({ member, invoiceNumber: invoice.invoiceNumber });
    setActiveStep(4);
  };

  const handleCompleteAndLogin = () => {
    if (createdResult) {
      setCurrentUser({
        name: createdResult.member.fullName,
        email: createdResult.member.email,
        role: 'member',
        avatar: createdResult.member.avatar,
        memberId: createdResult.member.id,
        tier: createdResult.member.tier,
      });
      setRole('member');
      setActiveStep(null);
      navigate('/member/home');
    }
  };

  const calculatePrice = (plan: typeof plans[0]) => {
    if (plan.tier === 'walk_in') return '₹0';
    if (billingCycle === 'monthly') return formatINR(plan.monthlyPrice);
    if (billingCycle === 'quarterly') return formatINR(plan.quarterlyPrice);
    return formatINR(plan.annualPrice);
  };

  const calculatePeriodLabel = () => {
    if (billingCycle === 'monthly') return '/ month';
    if (billingCycle === 'quarterly') return '/ quarter';
    return '/ year';
  };

  // Detailed comparison metrics
  const comparisonRows = [
    {
      title: 'Advance Court Booking Window',
      desc: 'How early you can reserve court slots before public release',
      gold: '14 Days in advance',
      silver: '7 Days in advance',
      junior: '5 Days in advance',
      walk_in: '1 Day (24 hrs only)',
    },
    {
      title: 'Free Prime-time Court Hours / Month',
      desc: 'Complimentary court reservations credited monthly',
      gold: '8 Hours / month included',
      silver: '4 Hours / month included',
      junior: '2 Hours / month included',
      walk_in: '0 (Full hourly rate)',
    },
    {
      title: 'Court Hourly Discount Rates',
      desc: 'Discount on court bookings beyond complimentary hours',
      gold: 'Lowest Rate (Up to 75% off)',
      silver: 'Standard (Up to 40% off)',
      junior: '50% off non-peak slots',
      walk_in: 'Standard Rack Rate',
    },
    {
      title: 'Pro Shop Equipment & Gear Discount',
      desc: 'Savings on performance racquets, balls, footwear & apparel',
      gold: '20% Flat Discount',
      silver: '10% Flat Discount',
      junior: '5% Junior Equipment',
      walk_in: '0% (Standard MRP)',
    },
    {
      title: 'Café & Sports Bar Discount',
      desc: 'Food, smoothies, protein shakes, craft beers & cocktails',
      gold: '15% Off Total Bill',
      silver: '10% Off Total Bill',
      junior: '5% Off (Juices/Shakes)',
      walk_in: '0% (Standard Menu)',
    },
    {
      title: 'Digital Bar & Café Tab Privileges',
      desc: 'Charge dining directly to member account with monthly settlement',
      gold: 'Full Credit Tab (₹25,000 limit)',
      silver: 'Credit Tab (₹10,000 limit)',
      junior: 'Prepaid Wallet Only',
      walk_in: 'Immediate Pay-as-you-go',
    },
    {
      title: 'Social Play & Weekend Mixers Access',
      desc: 'Saturday Sunset Padel Americano & Sunday Tennis Ladders',
      gold: 'Free Unlimited Entry',
      silver: '50% Off Drop-in Fee',
      junior: 'Youth Academy Only',
      walk_in: 'Full Drop-in Fee (₹750)',
    },
    {
      title: 'Complimentary Guest Passes',
      desc: 'Bring playing partners or guests to the club each month',
      gold: '4 Passes / month',
      silver: '2 Passes / month',
      junior: '1 Pass / month',
      walk_in: 'None',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Page Title & Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-lime-400">
          Memberships & Privileges
        </span>
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-white">
          Invest in Your Game & Lifestyle
        </h1>
        <p className="text-sm sm:text-base text-slate-300">
          Transparent pricing in Indian Rupees with 18% GST. Choose the tier that matches your frequency of play, with no hidden lock-ins.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mt-4">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              billingCycle === 'monthly'
                ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('quarterly')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              billingCycle === 'quarterly'
                ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Quarterly (Save 10%)
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              billingCycle === 'annual'
                ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Annual (Best Value - Save 25%)</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-bold uppercase">
              Popular
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isGold = plan.tier === 'gold';
          const isWalkIn = plan.tier === 'walk_in';

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                isGold
                  ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400/60 shadow-2xl shadow-amber-500/10 scale-105 z-10'
                  : 'bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl'
              }`}
            >
              {isGold && (
                <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 font-extrabold text-[10px] uppercase px-4 py-1 rounded-bl-2xl tracking-widest shadow-md">
                  Most Popular
                </div>
              )}

              <div>
                <span className={`text-[10px] uppercase px-2.5 py-1 rounded-full w-fit block mb-3 ${getTierBadgeClass(plan.tier)}`}>
                  {getTierName(plan.tier)}
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-white">{plan.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{plan.tagline}</p>

                {/* Price Display */}
                <div className="my-6 pb-6 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
                      {calculatePrice(plan)}
                    </span>
                    {!isWalkIn && (
                      <span className="text-xs text-slate-400 font-medium">
                        {calculatePeriodLabel()}
                      </span>
                    )}
                  </div>
                  {!isWalkIn && (
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      + 18% GST Applicable • Billed {billingCycle}
                    </span>
                  )}
                </div>

                {/* Feature List */}
                <div className="space-y-3 mb-8">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                    Key Entitlements:
                  </span>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <Check className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleJoinClick(plan.tier)}
                className={`w-full py-3.5 rounded-2xl font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg ${
                  isGold
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                    : isWalkIn
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    : 'bg-lime-400 hover:bg-lime-300 text-slate-950 shadow-lime-400/20'
                }`}
              >
                <span>{isWalkIn ? 'Create Free Guest Account' : 'Join Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-lime-400">
            Feature Comparison Matrix
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Compare Plan Privileges Side-by-Side
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-4 px-4 min-w-[220px]">Plan Entitlement</th>
                <th className="py-4 px-4 text-amber-400 font-bold">Gold Tier</th>
                <th className="py-4 px-4 text-slate-200 font-bold">Silver Tier</th>
                <th className="py-4 px-4 text-sky-400 font-bold">Junior Tier</th>
                <th className="py-4 px-4 text-slate-400 font-bold">Walk-In / Guest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{row.title}</div>
                    <div className="text-[10px] text-slate-500">{row.desc}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-amber-300">{row.gold}</td>
                  <td className="py-3.5 px-4 text-slate-300">{row.silver}</td>
                  <td className="py-3.5 px-4 text-sky-300">{row.junior}</td>
                  <td className="py-3.5 px-4 text-slate-500">{row.walk_in}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MULTI-STEP ONLINE MEMBERSHIP SIGNUP MODAL */}
      {activeStep !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">
                  Step {activeStep} of 4 • Online Membership Sign-up
                </span>
                <h3 className="font-heading font-extrabold text-xl text-white mt-0.5">
                  {activeStep === 1 && '1. Choose Plan & Billing Period'}
                  {activeStep === 2 && '2. Member Identity & Demographics'}
                  {activeStep === 3 && '3. Payment & Settlement'}
                  {activeStep === 4 && '4. Passport Credentials Issued'}
                </h3>
              </div>
              <button
                onClick={() => setActiveStep(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: CHOOSE PLAN & BILLING */}
            {activeStep === 1 && (
              <div className="space-y-6 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-2">Select Membership Tier</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {plans.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedTier(p.tier)}
                        className={`p-3 rounded-2xl border font-bold text-left transition ${
                          selectedTier === p.tier
                            ? 'bg-lime-400 text-slate-950 border-lime-400 shadow-md'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="block capitalize">{p.name}</span>
                        <span className="text-[10px] opacity-80 block">{calculatePrice(p)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-2">Billing Cycle</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['monthly', 'quarterly', 'annual'] as const).map((cycle) => (
                      <button
                        key={cycle}
                        type="button"
                        onClick={() => setBillingCycle(cycle)}
                        className={`py-3 rounded-2xl font-bold border capitalize transition ${
                          billingCycle === cycle
                            ? 'bg-lime-400 text-slate-950 border-lime-400'
                            : 'bg-slate-950 text-slate-300 border-slate-800'
                        }`}
                      >
                        {cycle}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing Summary Box */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Subscription ({billingCycle}):</span>
                    <span className="text-white font-mono">{formatINR(basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST (18% Statutory Rate):</span>
                    <span className="text-white font-mono">{formatINR(gstAmount)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                    <span className="text-white">Total Payable Amount:</span>
                    <span className="text-lime-400 font-mono text-base">{formatINR(totalAmount)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="px-6 py-3 rounded-2xl bg-lime-400 text-slate-950 font-bold text-xs shadow-lg shadow-lime-400/20 flex items-center gap-2"
                  >
                    <span>Proceed to Personal Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PERSONAL DETAILS */}
            {activeStep === 2 && (
              <form onSubmit={handleProceedToPayment} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Full Legal Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Siddharth Singhania"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Date of Birth * (Auto-detects Junior if &lt; 18)
                    </label>
                    <input
                      required
                      type="date"
                      value={form.dateOfBirth}
                      onChange={handleDobChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                {isJuniorAuto && (
                  <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Junior athlete under 18 detected. Guardian authorization required below.</span>
                  </div>
                )}

                {isJuniorAuto && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-sky-500/40 space-y-3">
                    <span className="font-bold text-sky-300 block uppercase text-[10px]">Guardian Authorization</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Guardian Name *</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Rajesh Singhania"
                          value={form.guardianName}
                          onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Guardian Phone *</label>
                        <input
                          required
                          type="tel"
                          placeholder="+91 98401 00000"
                          value={form.guardianPhone}
                          onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">Relation</label>
                        <input
                          type="text"
                          value={form.guardianRelation}
                          onChange={(e) => setForm({ ...form, guardianRelation: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Mobile Phone Number *</label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 98201 12345"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-lime-400 text-slate-950 font-bold shadow-lg shadow-lime-400/20 flex items-center gap-2"
                  >
                    <span>Proceed to Payment ({formatINR(totalAmount)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: PAYMENT */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <PaymentPanel
                  totalAmount={totalAmount}
                  title={`Membership Fee (${selectedTier.toUpperCase()} - ${billingCycle.toUpperCase()})`}
                  customerName={form.fullName}
                  allowedMethods={['upi', 'card', 'cash']}
                  allowSplit={false}
                  allowPayLater={false}
                  onPaymentComplete={handlePaymentComplete}
                />

                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Modify Personal Details
                </button>
              </div>
            )}

            {/* STEP 4: SUCCESS CREDENTIALS & AUTO LOGIN */}
            {activeStep === 4 && createdResult && (
              <div className="text-center space-y-6 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-lime-400/20 border-2 border-lime-400 flex items-center justify-center text-lime-400 mx-auto">
                  <Sparkles className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="font-heading font-extrabold text-2xl text-white">
                    Welcome to Champions Club, {createdResult.member.fullName.split(' ')[0]}!
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Your membership passport and invoice have been generated and posted to the ledger.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-slate-950 border border-lime-400/40 text-left space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Digital Passport ID</span>
                      <span className="font-heading font-extrabold text-xl text-lime-400">
                        {createdResult.member.memberNumber}
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-xl">
                      <QrCode className="w-10 h-10 text-slate-950" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 uppercase text-[10px] font-bold block">Tax Invoice No</span>
                      <span className="text-white font-mono font-bold">{createdResult.invoiceNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase text-[10px] font-bold block">Valid Until</span>
                      <span className="text-lime-400 font-bold">{createdResult.member.expiryDate}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCompleteAndLogin}
                  className="w-full py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-lime-400/20 transition"
                >
                  Enter Member Portal Now →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
