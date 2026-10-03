import React, { useState } from 'react';
import { 
  CreditCard, 
  QrCode, 
  Wallet, 
  Banknote, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { formatINR } from '../lib/formatters';

export type PaymentMethodType = 
  | 'upi' 
  | 'card' 
  | 'cash' 
  | 'wallet' 
  | 'split' 
  | 'pay_later' 
  | 'plan_included';

export interface PaymentResult {
  method: PaymentMethodType;
  status: 'success';
  transactionRef: string;
  paidAmount: number;
  walletAmountUsed?: number;
  secondaryMethodAmount?: number;
  secondaryMethod?: string;
  notes?: string;
}

export interface PaymentPanelProps {
  totalAmount: number;
  title?: string;
  memberWalletBalance?: number;
  allowedMethods?: PaymentMethodType[];
  allowSplit?: boolean;
  allowPayLater?: boolean;
  allowPlanIncluded?: boolean;
  onPaymentComplete: (result: PaymentResult) => void;
  isProcessing?: boolean;
  customerName?: string;
}

export const PaymentPanel: React.FC<PaymentPanelProps> = ({
  totalAmount,
  title = 'Complete Payment',
  memberWalletBalance = 0,
  allowedMethods = ['upi', 'card', 'cash', 'wallet', 'split', 'pay_later', 'plan_included'],
  allowSplit = true,
  allowPayLater = true,
  allowPlanIncluded = false,
  onPaymentComplete,
  isProcessing = false,
  customerName = 'Valued Customer',
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(
    allowedMethods.includes('upi') ? 'upi' : allowedMethods[0]
  );

  // Form states per method
  // UPI
  const [vpaCopied, setVpaCopied] = useState(false);
  const [upiRefInput, setUpiRefInput] = useState('');

  // Card
  const [cardForm, setCardForm] = useState({
    number: '4532 •••• •••• 8821',
    expiry: '12/28',
    cvv: '921',
    name: customerName,
  });

  // Cash
  const [cashTendered, setCashTendered] = useState<string>(totalAmount.toString());

  // Split Payment
  const [splitWalletAmt, setSplitWalletAmt] = useState<number>(
    Math.min(memberWalletBalance, totalAmount)
  );
  const [splitSecondaryMethod, setSplitSecondaryMethod] = useState<'upi' | 'card' | 'cash'>('upi');

  // Tab / Pay Later
  const [tabNotes, setTabNotes] = useState('Added to open member account bill');

  const cashReturn = Math.max(0, (parseFloat(cashTendered) || 0) - totalAmount);

  const handleCopyVpa = () => {
    navigator.clipboard?.writeText('championsclub@hdfcbank');
    setVpaCopied(true);
    setTimeout(() => setVpaCopied(false), 2000);
  };

  const handlePay = () => {
    const txRef = `TXN-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    if (selectedMethod === 'upi') {
      onPaymentComplete({
        method: 'upi',
        status: 'success',
        transactionRef: upiRefInput.trim() || txRef,
        paidAmount: totalAmount,
        notes: 'Paid via UPI Instant QR Scan',
      });
    } else if (selectedMethod === 'card') {
      onPaymentComplete({
        method: 'card',
        status: 'success',
        transactionRef: txRef,
        paidAmount: totalAmount,
        notes: `Card payment approved (${cardForm.number.slice(-4)})`,
      });
    } else if (selectedMethod === 'cash') {
      const tendered = parseFloat(cashTendered) || totalAmount;
      onPaymentComplete({
        method: 'cash',
        status: 'success',
        transactionRef: txRef,
        paidAmount: totalAmount,
        notes: `Cash tendered ${formatINR(tendered)}. Change returned ${formatINR(tendered - totalAmount)}.`,
      });
    } else if (selectedMethod === 'wallet') {
      onPaymentComplete({
        method: 'wallet',
        status: 'success',
        transactionRef: txRef,
        paidAmount: totalAmount,
        walletAmountUsed: totalAmount,
        notes: 'Deducted directly from Club Prepaid Wallet',
      });
    } else if (selectedMethod === 'split') {
      const walletPart = Math.min(splitWalletAmt, totalAmount);
      const remaining = totalAmount - walletPart;
      onPaymentComplete({
        method: 'split',
        status: 'success',
        transactionRef: txRef,
        paidAmount: totalAmount,
        walletAmountUsed: walletPart,
        secondaryMethodAmount: remaining,
        secondaryMethod: splitSecondaryMethod,
        notes: `Split payment: ${formatINR(walletPart)} via Wallet + ${formatINR(remaining)} via ${splitSecondaryMethod.toUpperCase()}`,
      });
    } else if (selectedMethod === 'pay_later') {
      onPaymentComplete({
        method: 'pay_later',
        status: 'success',
        transactionRef: txRef,
        paidAmount: totalAmount,
        notes: tabNotes || 'Charged to Member Tab / Pay Later Account',
      });
    } else if (selectedMethod === 'plan_included') {
      onPaymentComplete({
        method: 'plan_included',
        status: 'success',
        transactionRef: txRef,
        paidAmount: 0,
        notes: 'Complimentary Plan Hour Deduction ($0 charged)',
      });
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">
            Unified Payment Gateway
          </span>
          <h3 className="font-heading font-extrabold text-xl text-white mt-0.5">{title}</h3>
          <p className="text-xs text-slate-400">Select payment channel and complete transaction.</p>
        </div>

        <div className="p-3 px-5 rounded-2xl bg-slate-950 border border-slate-800 text-left sm:text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Due Amount</span>
          <span className="font-heading font-extrabold text-2xl text-lime-400">
            {formatINR(totalAmount)}
          </span>
        </div>
      </div>

      {/* Payment Method Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {allowedMethods.includes('upi') && (
          <button
            type="button"
            onClick={() => setSelectedMethod('upi')}
            className={`p-3 rounded-2xl border font-bold flex items-center gap-2 transition ${
              selectedMethod === 'upi'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span className="truncate">UPI / QR Code</span>
          </button>
        )}

        {allowedMethods.includes('card') && (
          <button
            type="button"
            onClick={() => setSelectedMethod('card')}
            className={`p-3 rounded-2xl border font-bold flex items-center gap-2 transition ${
              selectedMethod === 'card'
                ? 'bg-sky-500/20 text-sky-400 border-sky-500 shadow-lg shadow-sky-500/10'
                : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span className="truncate">Credit / Debit Card</span>
          </button>
        )}

        {allowedMethods.includes('cash') && (
          <button
            type="button"
            onClick={() => setSelectedMethod('cash')}
            className={`p-3 rounded-2xl border font-bold flex items-center gap-2 transition ${
              selectedMethod === 'cash'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500 shadow-lg shadow-amber-500/10'
                : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <Banknote className="w-4 h-4 shrink-0" />
            <span className="truncate">Cash Handover</span>
          </button>
        )}

        {allowedMethods.includes('wallet') && (
          <button
            type="button"
            onClick={() => setSelectedMethod('wallet')}
            className={`p-3 rounded-2xl border font-bold flex items-center gap-2 transition ${
              selectedMethod === 'wallet'
                ? 'bg-lime-400/20 text-lime-400 border-lime-400 shadow-lg shadow-lime-400/10'
                : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4 shrink-0" />
            <span className="truncate">Club Wallet ({formatINR(memberWalletBalance)})</span>
          </button>
        )}

        {allowSplit && allowedMethods.includes('split') && (
          <button
            type="button"
            onClick={() => setSelectedMethod('split')}
            className={`p-3 rounded-2xl border font-bold flex items-center gap-2 transition ${
              selectedMethod === 'split'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500 shadow-lg shadow-purple-500/10'
                : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="truncate">Split Payment</span>
          </button>
        )}

        {allowPayLater && allowedMethods.includes('pay_later') && (
          <button
            type="button"
            onClick={() => setSelectedMethod('pay_later')}
            className={`p-3 rounded-2xl border font-bold flex items-center gap-2 transition ${
              selectedMethod === 'pay_later'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500 shadow-lg shadow-indigo-500/10'
                : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span className="truncate">Charge to Open Tab</span>
          </button>
        )}

        {allowPlanIncluded && allowedMethods.includes('plan_included') && (
          <button
            type="button"
            onClick={() => setSelectedMethod('plan_included')}
            className={`p-3 rounded-2xl border font-bold flex items-center gap-2 transition ${
              selectedMethod === 'plan_included'
                ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400 shadow-lg shadow-emerald-400/10'
                : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="truncate">Plan Included (₹0)</span>
          </button>
        )}
      </div>

      {/* Payment Channel Form Area */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
        {/* UPI Form */}
        {selectedMethod === 'upi' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200 text-center shrink-0">
                <QrCode className="w-28 h-28 text-slate-950" />
                <span className="text-[9px] font-bold text-slate-800 block uppercase mt-1">
                  Scan via GPay / PhonePe
                </span>
              </div>

              <div className="space-y-2 flex-1">
                <span className="text-slate-400 text-[11px] font-semibold block">UPI VPA Address:</span>
                <div className="flex items-center gap-2">
                  <code className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-lime-400 font-mono font-bold text-xs flex-1">
                    championsclub@hdfcbank
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyVpa}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition flex items-center gap-1.5"
                  >
                    {vpaCopied ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{vpaCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Scan the QR code or send payment to the VPA above. Once completed, click the button below to simulate instant gateway verification.
                </p>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Optional UTR / Ref Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 629102938102"
                    value={upiRefInput}
                    onChange={(e) => setUpiRefInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card Form */}
        {selectedMethod === 'card' && (
          <div className="space-y-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Cardholder Name</label>
              <input
                type="text"
                value={cardForm.name}
                onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-slate-300 font-semibold block mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardForm.number}
                  onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Expiry</label>
                  <input
                    type="text"
                    value={cardForm.expiry}
                    onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-center"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cash Form */}
        {selectedMethod === 'cash' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Cash Tendered by Customer (₹)</label>
                <input
                  type="number"
                  min={totalAmount}
                  step="10"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Change to Return</span>
                <span className={`font-heading font-extrabold text-xl ${cashReturn > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {formatINR(cashReturn)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Form */}
        {selectedMethod === 'wallet' && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Club Member Wallet</span>
                <span className="font-heading font-extrabold text-lg text-white">
                  Available: {formatINR(memberWalletBalance)}
                </span>
              </div>

              {memberWalletBalance < totalAmount ? (
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold">
                  Insufficient Balance (Short by {formatINR(totalAmount - memberWalletBalance)})
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                  Sufficient Balance
                </span>
              )}
            </div>

            {memberWalletBalance < totalAmount && (
              <p className="text-[11px] text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Switch to Split Payment to use your wallet balance and pay the remainder via UPI or Cash!</span>
              </p>
            )}
          </div>
        )}

        {/* Split Payment Form */}
        {selectedMethod === 'split' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Amount from Wallet (Max {formatINR(memberWalletBalance)})
                </label>
                <input
                  type="number"
                  min={0}
                  max={Math.min(memberWalletBalance, totalAmount)}
                  value={splitWalletAmt}
                  onChange={(e) => setSplitWalletAmt(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Secondary Payment Channel</label>
                <select
                  value={splitSecondaryMethod}
                  onChange={(e) => setSplitSecondaryMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold uppercase"
                >
                  <option value="upi">UPI Instant</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="cash">Cash Handover</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Split Summary:</span>
              <span className="text-lime-400">
                {formatINR(splitWalletAmt)} (Wallet) + {formatINR(Math.max(0, totalAmount - splitWalletAmt))} ({splitSecondaryMethod.toUpperCase()}) = {formatINR(totalAmount)}
              </span>
            </div>
          </div>
        )}

        {/* Pay Later Form */}
        {selectedMethod === 'pay_later' && (
          <div className="space-y-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Account Billing Note / Tab Tag</label>
              <input
                type="text"
                value={tabNotes}
                onChange={(e) => setTabNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              This amount will be added to the member’s open bar tab or account payable statement for monthly settlement.
            </p>
          </div>
        )}

        {/* Plan Included Form */}
        {selectedMethod === 'plan_included' && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
            <span className="font-bold block text-xs">Complimentary Plan Benefit Applied</span>
            <p className="text-[11px]">
              This reservation utilizes included complimentary court hours from your Gold/Silver plan tier. Net charge is ₹0.
            </p>
          </div>
        )}
      </div>

      {/* Submit Action Button */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] text-slate-400 font-mono">
          Safe & Encrypted 256-bit Gate
        </span>

        <button
          type="button"
          disabled={isProcessing || (selectedMethod === 'wallet' && memberWalletBalance < totalAmount)}
          onClick={handlePay}
          className="px-8 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-xl shadow-lime-400/20 flex items-center gap-2 transition"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>
            {selectedMethod === 'plan_included' ? 'Confirm Free Reservation' : `Confirm Payment of ${formatINR(totalAmount)}`}
          </span>
        </button>
      </div>
    </div>
  );
};
