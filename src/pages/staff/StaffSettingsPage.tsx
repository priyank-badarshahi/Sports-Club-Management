import React, { useState } from 'react';
import { useAppStore, DEMO_USERS } from '../../store';
import { PlanEntitlementsEditor } from '../../components/PlanEntitlementsEditor';
import { 
  Sliders, 
  ShieldAlert, 
  RotateCcw, 
  Check, 
  Save, 
  Clock, 
  MapPin, 
  Award, 
  Download, 
  CreditCard, 
  Truck, 
  Users, 
  Calendar, 
  Percent, 
  Settings2,
  FileText
} from 'lucide-react';
import { formatDateTime } from '../../lib/formatters';

export const StaffSettingsPage: React.FC = () => {
  const { settings, updateSettings, auditLogs, resetDemoData, addToast, courts, plans } = useAppStore();
  const [activeTab, setActiveTab] = useState<'entitlements' | 'booking_rules' | 'taxes_delivery' | 'roles' | 'audit'>('entitlements');
  const [form, setForm] = useState({ ...settings });
  const [confirmReset, setConfirmReset] = useState(false);

  // Booking rules form state
  const [bookingRulesForm, setBookingRulesForm] = useState({
    slotDurationMinutes: 60,
    timeStepMinutes: 30,
    maxBookingsPerDay: settings.dailyBookingCap || 2,
    cancellationWindowHours: settings.bookingCancellationWindowHours || 4,
    socialPlayDay: 'Friday',
    socialPlayStartTime: '18:00',
    socialPlayFeeGold: 0,
    socialPlayFeeSilver: 200,
    socialPlayFeeJunior: 150,
  });

  // Tax & Delivery state
  const [taxDeliveryForm, setTaxDeliveryForm] = useState({
    defaultGstPercent: settings.defaultGstPercent || 18,
    proShopGstPercent: 18,
    cafeGstPercent: 5,
    deliveryFeeLocal: 100,
    minOrderFreeDelivery: 2000,
    acceptUpi: true,
    acceptCard: true,
    acceptCash: true,
    acceptWallet: true,
  });

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...form,
      dailyBookingCap: bookingRulesForm.maxBookingsPerDay,
      bookingCancellationWindowHours: bookingRulesForm.cancellationWindowHours,
      defaultGstPercent: taxDeliveryForm.defaultGstPercent,
    });
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'General club parameters and operating rules updated.',
    });
  };

  const exportAuditCSV = () => {
    const csvHeader = 'Timestamp,Actor,Role,Action,Target Entity,Details,IP Address\n';
    const csvRows = auditLogs
      .map((log) => `"${log.timestamp}","${log.actorName}","${log.actorRole}","${log.action}","${log.entity}","${log.details.replace(/"/g, '""')}","${log.ipAddress}"`)
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `champions_club_audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400">
          Executive Settings • Operations & Governance
        </span>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
          Club Configuration & Security Rules
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Configure membership entitlements, booking windows, pricing matrix, GST tax rates, user roles, and security audit trails.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('entitlements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'entitlements'
              ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Plan Entitlements
        </button>
        <button
          onClick={() => setActiveTab('booking_rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'booking_rules'
              ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Booking Rules & Friday Social
        </button>
        <button
          onClick={() => setActiveTab('taxes_delivery')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'taxes_delivery'
              ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Tax Rates & Payments
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'roles'
              ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          User & Role Access
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'audit'
              ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Audit Log ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: PLAN ENTITLEMENTS EDITOR */}
      {activeTab === 'entitlements' && (
        <PlanEntitlementsEditor />
      )}

      {/* TAB 2: BOOKING RULES & FRIDAY SOCIAL PLAY CONFIG */}
      {activeTab === 'booking_rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-lime-400 font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>Court Allocation & Booking Matrix</span>
              </div>
              <span className="text-xs font-mono text-slate-400">Step: 30m • Slot: 60m</span>
            </div>

            <form onSubmit={handleSaveGeneral} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Standard Slot Duration</label>
                  <select
                    value={bookingRulesForm.slotDurationMinutes}
                    onChange={(e) => setBookingRulesForm({ ...bookingRulesForm, slotDurationMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    <option value={60}>60 Minutes (Standard Match Slot)</option>
                    <option value={90}>90 Minutes (Long Match)</option>
                    <option value={120}>120 Minutes (Tournament Block)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Grid Step Interval</label>
                  <select
                    value={bookingRulesForm.timeStepMinutes}
                    onChange={(e) => setBookingRulesForm({ ...bookingRulesForm, timeStepMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    <option value={30}>30 Minutes Grid Step</option>
                    <option value={60}>60 Minutes Grid Step</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Daily Booking Limit Per Member</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={bookingRulesForm.maxBookingsPerDay}
                    onChange={(e) => setBookingRulesForm({ ...bookingRulesForm, maxBookingsPerDay: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:border-lime-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Maximum 2 bookings per day enforced by default.</span>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Free Cancellation Cutoff Window (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={bookingRulesForm.cancellationWindowHours}
                    onChange={(e) => setBookingRulesForm({ ...bookingRulesForm, cancellationWindowHours: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:border-lime-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Cancellations under 4 hours incur late fee.</span>
                </div>
              </div>

              {/* Friday Social Play Config */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="font-heading font-bold text-sm text-lime-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Friday Social Play Evening Setup</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Social Day</label>
                    <input
                      type="text"
                      value={bookingRulesForm.socialPlayDay}
                      readOnly
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Start Time</label>
                    <input
                      type="text"
                      value={bookingRulesForm.socialPlayStartTime}
                      onChange={(e) => setBookingRulesForm({ ...bookingRulesForm, socialPlayStartTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Gold Member Fee</label>
                    <input
                      type="text"
                      value="FREE (Included)"
                      readOnly
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-lime-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 flex items-center gap-2 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Booking Rules</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Court Summary */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-base text-white">Court Setup Overview ({courts.length} Active)</h3>
            <div className="space-y-2 text-xs">
              {courts.map((court) => (
                <div key={court.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{court.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{court.sport} • {court.surface}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-lime-400 font-bold">
                    ₹{court.hourlyRate.gold}/hr
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TAX RATES & PAYMENT GATEWAYS */}
      {activeTab === 'taxes_delivery' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl max-w-4xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-lime-400" />
              <span>Tax Rates, Payment Methods & Delivery Settings</span>
            </h3>
            <span className="text-xs font-mono text-lime-400">GSTIN: {settings.gstNumber}</span>
          </div>

          <form onSubmit={handleSaveGeneral} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Court & Membership GST (%)</label>
                <input
                  type="number"
                  value={taxDeliveryForm.defaultGstPercent}
                  onChange={(e) => setTaxDeliveryForm({ ...taxDeliveryForm, defaultGstPercent: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Pro Shop Merchandise GST (%)</label>
                <input
                  type="number"
                  value={taxDeliveryForm.proShopGstPercent}
                  onChange={(e) => setTaxDeliveryForm({ ...taxDeliveryForm, proShopGstPercent: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Bar & Café GST (%)</label>
                <input
                  type="number"
                  value={taxDeliveryForm.cafeGstPercent}
                  onChange={(e) => setTaxDeliveryForm({ ...taxDeliveryForm, cafeGstPercent: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h4 className="font-heading font-bold text-sm text-white mb-3">Accepted Payment Gateways & Channels</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taxDeliveryForm.acceptUpi}
                    onChange={(e) => setTaxDeliveryForm({ ...taxDeliveryForm, acceptUpi: e.target.checked })}
                    className="rounded accent-lime-400"
                  />
                  <span className="font-bold text-white">UPI (GPay/PhonePe)</span>
                </label>
                <label className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taxDeliveryForm.acceptCard}
                    onChange={(e) => setTaxDeliveryForm({ ...taxDeliveryForm, acceptCard: e.target.checked })}
                    className="rounded accent-lime-400"
                  />
                  <span className="font-bold text-white">Credit/Debit Card</span>
                </label>
                <label className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taxDeliveryForm.acceptCash}
                    onChange={(e) => setTaxDeliveryForm({ ...taxDeliveryForm, acceptCash: e.target.checked })}
                    className="rounded accent-lime-400"
                  />
                  <span className="font-bold text-white">Front Desk Cash</span>
                </label>
                <label className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taxDeliveryForm.acceptWallet}
                    onChange={(e) => setTaxDeliveryForm({ ...taxDeliveryForm, acceptWallet: e.target.checked })}
                    className="rounded accent-lime-400"
                  />
                  <span className="font-bold text-white">Club Wallet</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h4 className="font-heading font-bold text-sm text-white mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-lime-400" />
                <span>Pro Shop Delivery Settings</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Local Courier Shipping Fee (₹)</label>
                  <input
                    type="number"
                    value={taxDeliveryForm.deliveryFeeLocal}
                    onChange={(e) => setTaxDeliveryForm({ ...taxDeliveryForm, deliveryFeeLocal: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Free Delivery Threshold (₹)</label>
                  <input
                    type="number"
                    value={taxDeliveryForm.minOrderFreeDelivery}
                    onChange={(e) => setTaxDeliveryForm({ ...taxDeliveryForm, minOrderFreeDelivery: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 flex items-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Tax & Payment Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: USER & ROLE MANAGEMENT */}
      {activeTab === 'roles' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl max-w-4xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-lime-400" />
                <span>User Roles & System Permission Matrix</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Simulate or manage active staff credentials and security clearance.</p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.values(DEMO_USERS).map((usr) => (
              <div key={usr.email} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={usr.avatar} alt={usr.name} className="w-10 h-10 rounded-xl object-cover ring-1 ring-lime-400/40" />
                  <div>
                    <div className="font-bold text-white text-sm">{usr.name}</div>
                    <div className="text-xs text-slate-400">{usr.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-slate-800 text-lime-400 uppercase">
                    {usr.role.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Active Access</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL & RESET DEMO DATA */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base text-white">Security & Operational Audit Trail</h3>
                <span className="text-xs text-slate-400">{auditLogs.length} events logged in real-time</span>
              </div>
              <button
                onClick={exportAuditCSV}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-lime-400" />
                <span>Export Audit CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-white">{log.actorName}</td>
                      <td className="py-2.5 px-4">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-bold">
                          {log.actorRole}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-lime-400">{log.action}</td>
                      <td className="py-2.5 px-4 text-slate-300">{log.entity}</td>
                      <td className="py-2.5 px-4 text-slate-400 text-[11px]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reset Demo Data Banner */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-white">Reset Demo Database</h3>
                <p className="text-xs text-slate-400">
                  Restores all members, court bookings, bar tabs, HR shifts, payroll records, and invoices to clean initial seed state.
                </p>
              </div>
            </div>

            <div>
              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-600/30 hover:border-rose-500/50 text-slate-300 hover:text-rose-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Demo Data</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-2xl bg-rose-950/40 border border-rose-500/40">
                  <span className="text-xs font-bold text-rose-300">Confirm Reset?</span>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      resetDemoData();
                      setConfirmReset(false);
                    }}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                  >
                    Yes, Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
