import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { BarCategory, BarItem } from '../../types';
import {
  Coffee,
  UtensilsCrossed,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  CreditCard,
  UserCheck,
  Clock,
  Sparkles,
  Send,
  X,
} from 'lucide-react';

export const BarPOS: React.FC = () => {
  const {
    barItems,
    barTables,
    addBarOrderItem,
    settleBarTab,
    openBarTabForCustomer,
    closeBarTable,
    members,
  } = useClub();

  const [selectedTableId, setSelectedTableId] = useState<number>(3); // Table 3 has Rahul Patel
  const [selectedCategory, setSelectedCategory] = useState<'All' | BarCategory>('All');
  const [posCart, setPosCart] = useState<{ item: BarItem; qty: number }[]>([]);
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [settleSuccessMsg, setSettleSuccessMsg] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Card' | 'Cash'>('UPI');

  // Customer assign state
  const [assignCustomerModal, setAssignCustomerModal] = useState(false);
  const [assignMemberId, setAssignMemberId] = useState('M001');

  const selectedTable = barTables.find((t) => t.id === selectedTableId) || barTables[0];
  const assignedMember = selectedTable.memberId ? members.find((m) => m.memberId === selectedTable.memberId) : undefined;

  const categories: ('All' | BarCategory)[] = ['All', 'Food', 'Drinks', 'Snacks', 'Desserts'];

  const filteredItems = barItems.filter((i) => {
    if (selectedCategory !== 'All' && i.category !== selectedCategory) return false;
    return true;
  });

  const handleAddItemToPosCart = (item: BarItem) => {
    setPosCart((prev) => {
      const existing = prev.find((p) => p.item.id === item.id);
      if (existing) {
        return prev.map((p) => (p.item.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const handleSendToKitchen = () => {
    if (posCart.length === 0) return;
    posCart.forEach((p) => {
      addBarOrderItem(selectedTable.id, p.item, p.qty);
    });
    setPosCart([]);
  };

  const handleExecuteSettle = () => {
    const res = settleBarTab(selectedTable.id, paymentMode);
    if (res.success) {
      setSettleSuccessMsg(`Table ${selectedTable.id} bill settled: ₹${res.totalSettled.toLocaleString('en-IN')} via ${paymentMode}.`);
      setSettleModalOpen(false);
      setPosCart([]);
      setTimeout(() => setSettleSuccessMsg(null), 4000);
    }
  };

  const handleAssignMember = (e: React.FormEvent) => {
    e.preventDefault();
    const mem = members.find((m) => m.memberId === assignMemberId);
    if (mem) {
      openBarTabForCustomer(selectedTable.id, mem.name, mem.memberId);
      setAssignCustomerModal(false);
    }
  };

  // Pricing calculations for active POS cart
  const posSubtotal = posCart.reduce((sum, p) => sum + p.item.price * p.qty, 0);
  const memberDiscountRate = assignedMember ? assignedMember.discountRate : selectedTable.membershipTier === 'Gold' ? 0.20 : 0;
  const posDiscount = Math.round(posSubtotal * memberDiscountRate);
  const posTax = Math.round((posSubtotal - posDiscount) * 0.05); // 5% GST
  const posTotal = posSubtotal - posDiscount + posTax;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
            Lounge POS & Table Billing
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Bar & Cafeteria Point of Sale
          </h1>
          <p className="text-xs text-slate-500">
            Real-time table orders · Automatic member tier discount calculation · Multi-item tabs
          </p>
        </div>
      </div>

      {settleSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium text-center shadow-xs">
          {settleSuccessMsg}
        </div>
      )}

      {/* 6 Tables Selector Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {barTables.map((t) => {
          const isSelected = t.id === selectedTable.id;
          const isOccupied = t.status === 'occupied';

          return (
            <button
              key={t.id}
              onClick={() => setSelectedTableId(t.id)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                  : isOccupied
                  ? 'bg-amber-50/90 border-amber-200 text-slate-900 hover:border-amber-300'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {t.name.split(' ')[0]} {t.name.split(' ')[1]}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-white' : isOccupied ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
              </div>

              <div className="mt-2 text-[11px] font-mono">
                {isOccupied ? (
                  <>
                    <div className={`truncate font-sans font-medium ${isSelected ? 'text-blue-100' : 'text-slate-600'}`}>
                      {t.currentCustomer?.split(' ')[0]}
                    </div>
                    <div className={`font-bold ${isSelected ? 'text-white' : 'text-amber-600'}`}>
                      ₹{t.tabTotal}
                    </div>
                  </>
                ) : (
                  <div className={isSelected ? 'text-blue-100' : 'text-slate-400'}>Available</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Order Workstation: Left Menu Grid + Right Order Pad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Menu Items Grid (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === c
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleAddItemToPosCart(item)}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 cursor-pointer shadow-xs flex items-center justify-between group transition-all"
              >
                <div className="flex-1 pr-2">
                  <div className="text-[10px] font-mono uppercase text-slate-400">{item.category}</div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-600 font-semibold mt-1">
                    ₹{item.price}
                  </div>
                </div>

                <button
                  type="button"
                  className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Table Order Pad (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Order Terminal</div>
              <h3 className="text-base font-bold text-slate-900">
                {selectedTable.name}
              </h3>
            </div>

            <button
              onClick={() => setAssignCustomerModal(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 font-mono transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{selectedTable.currentCustomer ? 'Change Guest' : 'Assign Member'}</span>
            </button>
          </div>

          {/* Member Discount Notice Banner */}
          {selectedTable.currentCustomer && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-emerald-950">
                  Customer: {selectedTable.currentCustomer}
                </span>
                <div className="text-[11px] text-emerald-700 font-mono mt-0.5">
                  {selectedTable.membershipTier || 'Gold'} Member Discount Applied (20% Off)
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          )}

          {/* Items Currently in Draft Order Pad */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500 font-mono uppercase">
              Current Draft Order:
            </div>
            {posCart.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Click menu items to add to {selectedTable.name} tab
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {posCart.map((p) => (
                  <div
                    key={p.item.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 truncate max-w-[160px]">
                        {p.item.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        ₹{p.item.price} × {p.qty}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-slate-900">
                        ₹{p.item.price * p.qty}
                      </span>
                      <button
                        onClick={() =>
                          setPosCart((prev) => prev.filter((item) => item.item.id !== p.item.id))
                        }
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kitchen / Tab Actions */}
          {posCart.length > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>₹{posSubtotal}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Gold Member Discount (20%):</span>
                <span>-₹{posDiscount}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST (5%):</span>
                <span>+₹{posTax}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-1 border-t border-slate-200">
                <span>New Additions Total:</span>
                <span>₹{posTotal}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {posCart.length > 0 && (
              <button
                onClick={handleSendToKitchen}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to Kitchen (+ Add to Tab)</span>
              </button>
            )}

            {selectedTable.tabTotal > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <div className="flex justify-between text-sm font-bold text-slate-900 mb-2 font-mono">
                  <span>Current Outstanding Tab:</span>
                  <span className="text-amber-600 font-black">
                    ₹{selectedTable.tabTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <button
                  onClick={() => setSettleModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors"
                >
                  Settle Table Tab (Pay Bill)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settle Bill Modal */}
      {settleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-sm w-full p-6 relative">
            <button
              onClick={() => setSettleModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4 text-xs">
              <div>
                <div className="text-xs font-mono uppercase text-blue-600 font-semibold">
                  Billing & Settlement
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  Settle {selectedTable.name} Tab
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Customer:</span>
                  <span className="font-sans font-bold text-slate-900">
                    {selectedTable.currentCustomer}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Membership:</span>
                  <span className="text-emerald-600 font-bold">
                    {selectedTable.membershipTier || 'Gold'} Tier
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Due:</span>
                  <span className="text-amber-600">₹{selectedTable.tabTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-2 font-semibold">
                  {(['UPI', 'Card', 'Cash'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMode(m)}
                      className={`py-2 px-2 rounded-lg border text-center transition-colors ${
                        paymentMode === m
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSettleModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteSettle}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors"
                >
                  Complete Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Member Modal */}
      {assignCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-sm w-full p-6 relative">
            <button
              onClick={() => setAssignCustomerModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleAssignMember} className="space-y-4 text-xs">
              <div>
                <div className="text-xs font-mono uppercase text-blue-600 font-semibold">
                  Customer Tab Link
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Assign Table {selectedTable.id}
                </h3>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Club Member
                </label>
                <select
                  value={assignMemberId}
                  onChange={(e) => setAssignMemberId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {members.map((m) => (
                    <option key={m.memberId} value={m.memberId}>
                      {m.name} ({m.memberId} - {m.plan})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAssignCustomerModal(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors"
                >
                  Link & Apply Discount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
