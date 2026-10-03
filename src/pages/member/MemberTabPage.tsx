import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Coffee, Receipt, Check, CreditCard, Wallet, Smartphone, ArrowRight, Clock } from 'lucide-react';
import { formatINR, formatDateTime, getTierBadgeClass } from '../../lib/formatters';

export const MemberTabPage: React.FC = () => {
  const { tabs, currentUser, settleTab, addToast } = useAppStore();
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'upi' | 'card'>('wallet');

  const currentTab = tabs.find(
    (t) => t.memberId === currentUser.memberId && t.status === 'open'
  );

  const pastTabs = tabs.filter(
    (t) => t.memberId === currentUser.memberId && t.status === 'settled'
  );

  const handleSettle = () => {
    if (!currentTab) return;
    settleTab(currentTab.id, paymentMethod);
    setSettleModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-lime-400">
          Courtside Dining & Bar
        </span>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
          My Active Club Bar Tab
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Charge refreshments, protein bowls, and craft beers directly to your room/member tab.
        </p>
      </div>

      {currentTab ? (
        <div className="rounded-3xl bg-slate-900 border border-amber-500/40 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-heading font-bold text-lg text-white">Tab #{currentTab.id}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold">
                  Open Tab
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Table: <strong className="text-slate-200">{currentTab.tableName}</strong> • Opened {formatDateTime(currentTab.openedAt)}
              </p>
            </div>

            <button
              onClick={() => setSettleModalOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 flex items-center gap-2 transition self-start sm:self-auto"
            >
              <CreditCard className="w-4 h-4" />
              <span>Settle Tab ({formatINR(Math.round(currentTab.totalAmount))})</span>
            </button>
          </div>

          {/* Orders Itemized List */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Itemized Refreshments & Kitchen Orders
            </h4>
            <div className="divide-y divide-slate-800/80 bg-slate-950 rounded-2xl p-4 border border-slate-800/80">
              {currentTab.orders.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white">{item.name}</span>
                    <span className="text-slate-400 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="text-slate-200 font-semibold">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost & Tax Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-sm ml-auto space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Gross Food & Beverage:</span>
              <span>{formatINR(currentTab.subtotal)}</span>
            </div>
            <div className="flex justify-between text-lime-400 font-semibold">
              <span>Member Tier Savings:</span>
              <span>-{formatINR(Math.round(currentTab.discountAmount))}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>GST (18% on discounted):</span>
              <span>{formatINR(Math.round(currentTab.gstAmount))}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-base text-white">
              <span>Total Payable:</span>
              <span className="text-amber-400 font-heading">
                {formatINR(Math.round(currentTab.totalAmount))}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Coffee className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-heading font-bold text-lg text-white">No Open Bar Tab</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You do not have any active table tabs at the Courtside Café & Sports Bar right now. Visit the bar counter to start an open tab.
          </p>
        </div>
      )}

      {/* Settle Modal */}
      {settleModalOpen && currentTab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="font-heading font-extrabold text-xl text-white">Settle Active Tab</h3>
            <p className="text-xs text-slate-400">
              Total bill to clear: <strong className="text-lime-400">{formatINR(Math.round(currentTab.totalAmount))}</strong>
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'wallet', label: 'Club Wallet', icon: Wallet },
                  { id: 'upi', label: 'Instant UPI', icon: Smartphone },
                  { id: 'card', label: 'Credit Card', icon: CreditCard },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition ${
                        isSelected
                          ? 'bg-lime-400/10 border-lime-400 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-semibold">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setSettleModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSettle}
                className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold shadow-md shadow-lime-400/20"
              >
                Pay & Close Tab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Past Settled Tabs History */}
      {pastTabs.length > 0 && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <h3 className="font-heading font-bold text-base text-white">Settled Tabs History</h3>
          <div className="divide-y divide-slate-800">
            {pastTabs.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">Tab #{t.id} ({t.tableName})</div>
                  <div className="text-slate-400 mt-0.5">
                    {t.orders.length} items • Settled via {t.settledVia?.toUpperCase()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-heading font-bold text-sm text-lime-400">
                    {formatINR(Math.round(t.totalAmount))}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Paid</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
