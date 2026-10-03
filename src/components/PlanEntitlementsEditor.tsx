import React, { useState } from 'react';
import { useAppStore } from '../store';
import { MembershipTier, PlanEntitlements } from '../types';
import { Sliders, Save, Check, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';
import { getTierBadgeClass, getTierName, formatINR } from '../lib/formatters';

export const PlanEntitlementsEditor: React.FC = () => {
  const { plans, updatePlanEntitlements, courts } = useAppStore();
  const [selectedTier, setSelectedTier] = useState<MembershipTier>('gold');

  const plan = plans.find((p) => p.tier === selectedTier) || plans[0];
  const [entitlements, setEntitlements] = useState<PlanEntitlements>({ ...plan.entitlements });

  const handleTierSwitch = (tier: MembershipTier) => {
    setSelectedTier(tier);
    const targetPlan = plans.find((p) => p.tier === tier) || plans[0];
    setEntitlements({ ...targetPlan.entitlements });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlanEntitlements(selectedTier, entitlements);
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400">
            System Entitlements Configuration
          </span>
          <h3 className="font-heading font-extrabold text-xl text-white mt-0.5">
            Plan Entitlements & Privileges Editor
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure court hourly discount rates, pro shop %, bar %, booking windows, and grace periods per tier.
          </p>
        </div>

        {/* Tier switcher pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
          {(['gold', 'silver', 'junior', 'walk_in'] as MembershipTier[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTierSwitch(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition ${
                selectedTier === t
                  ? 'bg-lime-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Tier Banner */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${getTierBadgeClass(selectedTier)}`}>
              {getTierName(selectedTier)}
            </span>
            <span className="text-slate-300 font-semibold">{plan.tagline}</span>
          </div>
          <span className="text-lime-400 font-mono font-bold">
            Fee: {formatINR(plan.monthlyPrice)}/mo • {formatINR(plan.annualPrice)}/yr
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Court Discount */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <label className="text-slate-300 font-bold block">
              Court Hourly Discount Rate (%)
            </label>
            <p className="text-[11px] text-slate-500">
              Discount applied on court bookings beyond complimentary hours.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={entitlements.courtDiscountPercent}
                onChange={(e) =>
                  setEntitlements({ ...entitlements, courtDiscountPercent: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
              />
              <span className="text-slate-400 font-bold">%</span>
            </div>
          </div>

          {/* Pro Shop Discount */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <label className="text-slate-300 font-bold block">
              Pro Shop Gear Discount (%)
            </label>
            <p className="text-[11px] text-slate-500">
              Savings on racquets, balls, apparel and strings.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={entitlements.shopDiscountPercent}
                onChange={(e) =>
                  setEntitlements({ ...entitlements, shopDiscountPercent: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
              />
              <span className="text-slate-400 font-bold">%</span>
            </div>
          </div>

          {/* Bar & Café Discount */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <label className="text-slate-300 font-bold block">
              Courtside Bar & Café Discount (%)
            </label>
            <p className="text-[11px] text-slate-500">
              Discount auto-applied on kitchen orders and bar tabs.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={entitlements.barDiscountPercent}
                onChange={(e) =>
                  setEntitlements({ ...entitlements, barDiscountPercent: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
              />
              <span className="text-slate-400 font-bold">%</span>
            </div>
          </div>

          {/* Booking Window */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <label className="text-slate-300 font-bold block">
              Advance Booking Window (Days)
            </label>
            <p className="text-[11px] text-slate-500">
              How many days in advance members can book slots.
            </p>
            <input
              type="number"
              min="1"
              max="60"
              value={entitlements.bookingWindowDays}
              onChange={(e) =>
                setEntitlements({ ...entitlements, bookingWindowDays: Number(e.target.value) })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
            />
          </div>

          {/* Free Monthly Bookings */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <label className="text-slate-300 font-bold block">
              Free Monthly Court Hours
            </label>
            <p className="text-[11px] text-slate-500">
              Complimentary hours credited at start of each month.
            </p>
            <input
              type="number"
              min="0"
              max="50"
              value={entitlements.freeBookingsPerMonth}
              onChange={(e) =>
                setEntitlements({ ...entitlements, freeBookingsPerMonth: Number(e.target.value) })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
            />
          </div>

          {/* Guest Passes */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <label className="text-slate-300 font-bold block">
              Guest Passes per Month
            </label>
            <p className="text-[11px] text-slate-500">
              Complimentary invitations for playing partners.
            </p>
            <input
              type="number"
              min="0"
              max="20"
              value={entitlements.guestPassesPerMonth}
              onChange={(e) =>
                setEntitlements({ ...entitlements, guestPassesPerMonth: Number(e.target.value) })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
            />
          </div>

          {/* Social Play Access */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <label className="text-slate-300 font-bold block">
              Social Play & Weekend Mixers
            </label>
            <p className="text-[11px] text-slate-500">
              Access level for Saturday Padel & Sunday Tennis ladders.
            </p>
            <select
              value={entitlements.socialPlayAccess}
              onChange={(e) =>
                setEntitlements({ ...entitlements, socialPlayAccess: e.target.value as any })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold"
            >
              <option value="all_inclusive">All Inclusive (Free)</option>
              <option value="discounted">Discounted Drop-in</option>
              <option value="restricted">Restricted Youth Only</option>
              <option value="full_price">Full Public Rack Price</option>
            </select>
          </div>

          {/* Grace Period */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <label className="text-slate-300 font-bold block">
              Expiry Grace Period (Days)
            </label>
            <p className="text-[11px] text-slate-500">
              Days allowed post-expiry before benefits are auto-blocked.
            </p>
            <input
              type="number"
              min="0"
              max="30"
              value={entitlements.gracePeriodDays || 7}
              onChange={(e) =>
                setEntitlements({ ...entitlements, gracePeriodDays: Number(e.target.value) })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
            />
          </div>

          {/* Peak Hour Access */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <label className="text-slate-300 font-bold block">
              Prime Peak Hours (5-11 PM)
            </label>
            <p className="text-[11px] text-slate-500">
              Permit floodlit prime-time bookings.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={entitlements.peakHourAccess}
                  onChange={(e) =>
                    setEntitlements({ ...entitlements, peakHourAccess: e.target.checked })
                  }
                  className="rounded bg-slate-900 border-slate-700 text-lime-400 focus:ring-0"
                />
                <span className="text-slate-300 font-semibold">Unrestricted Evening Access</span>
              </label>
            </div>
          </div>
        </div>

        {/* Court Hourly Rates by Tier Matrix */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-heading font-bold text-sm text-white">
                Court Hourly Rates for {getTierName(selectedTier)}
              </h4>
              <p className="text-[11px] text-slate-400">
                Effective rates charged per hour for each championship court.
              </p>
            </div>
            <span className="text-xs font-mono text-lime-400 font-bold">
              {entitlements.courtDiscountPercent}% Tier Discount Applied
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {courts.map((c) => {
              const regularRate = c.hourlyRate.walk_in;
              const tierRate = c.hourlyRate[selectedTier];
              const savings = regularRate - tierRate;

              return (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-white truncate">{c.name}</span>
                    <span className="text-slate-500 capitalize">{c.sport}</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="font-heading font-extrabold text-base text-lime-400">
                        {formatINR(tierRate)}
                      </span>
                      <span className="text-[10px] text-slate-400">/hr</span>
                    </div>
                    {savings > 0 ? (
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        Save {formatINR(savings)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Standard</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Validity & Plan Fees */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <h4 className="font-heading font-bold text-sm text-white">
            Plan Validity & Billing Cycle Tariffs
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Monthly Term</span>
              <div className="font-heading font-bold text-base text-white mt-1">
                {formatINR(plan.monthlyPrice)} <span className="text-xs font-normal text-slate-400">/mo</span>
              </div>
              <span className="text-[10px] text-slate-500">+18% GST invoice</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Quarterly Term (3 Mos)</span>
              <div className="font-heading font-bold text-base text-white mt-1">
                {formatINR(plan.quarterlyPrice)} <span className="text-xs font-normal text-slate-400">/qtr</span>
              </div>
              <span className="text-[10px] text-amber-400">Includes complimentary guest pass</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Annual Term (12 Mos)</span>
              <div className="font-heading font-bold text-base text-lime-400 mt-1">
                {formatINR(plan.annualPrice)} <span className="text-xs font-normal text-slate-400">/yr</span>
              </div>
              <span className="text-[10px] text-emerald-400">30% Maximum Value Savings</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-lg shadow-lime-400/20 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save {selectedTier.toUpperCase()} Entitlements</span>
          </button>
        </div>
      </form>
    </div>
  );
};
