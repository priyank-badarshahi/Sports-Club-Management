import React from 'react';
import { UnifiedLedgerEntry } from '../types';
import { formatINR, formatDateTime, formatDate } from '../lib/formatters';
import { 
  Receipt, 
  CalendarCheck, 
  ShoppingBag, 
  Coffee, 
  GraduationCap, 
  X, 
  ExternalLink,
  CreditCard,
  User,
  Clock,
  ShieldCheck,
  Tag
} from 'lucide-react';

interface TransactionDrilldownModalProps {
  entry: UnifiedLedgerEntry;
  onClose: () => void;
  onViewInvoice?: (invoiceId: string) => void;
}

export const TransactionDrilldownModal: React.FC<TransactionDrilldownModalProps> = ({
  entry,
  onClose,
  onViewInvoice,
}) => {
  const getStreamIcon = (stream: string) => {
    switch (stream) {
      case 'courts':
        return <CalendarCheck className="w-5 h-5 text-sky-400" />;
      case 'shop':
        return <ShoppingBag className="w-5 h-5 text-amber-400" />;
      case 'bar_cafe':
        return <Coffee className="w-5 h-5 text-purple-400" />;
      case 'coaching':
        return <GraduationCap className="w-5 h-5 text-emerald-400" />;
      default:
        return <Receipt className="w-5 h-5 text-lime-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
              {getStreamIcon(entry.stream)}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">
                Ledger Source Record • {entry.sourceType.toUpperCase()}
              </span>
              <h3 className="font-heading font-extrabold text-base text-white">
                {entry.transactionRef}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Main Gross Amount Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Gross Value</span>
              <div className="font-heading font-extrabold text-2xl text-lime-400 mt-0.5">
                {formatINR(entry.grossAmount)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Revenue Stream</span>
              <div className="font-heading font-bold text-sm text-white capitalize mt-0.5">
                {entry.stream.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Customer / Member</span>
              <div className="font-semibold text-white truncate">{entry.customerName}</div>
              {entry.memberId && (
                <span className="text-[10px] text-lime-400 font-mono">Member ID: {entry.memberId}</span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Payment Method</span>
              <div className="font-semibold text-white flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                {entry.paymentMethod}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Posted Date & Time</span>
              <div className="font-medium text-slate-200">{formatDateTime(entry.timestamp)}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Handled By</span>
              <div className="font-medium text-slate-200">{entry.staffName}</div>
            </div>
          </div>

          {/* Description & Tax Breakdown */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-2">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Transaction Description</span>
            <p className="text-slate-200 leading-relaxed font-medium">{entry.description}</p>
            
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Taxable Net: <strong className="text-slate-200">{formatINR(entry.netAmount)}</strong></span>
              <span className="text-amber-400">GST Collected: <strong>{formatINR(entry.gstAmount)}</strong></span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            {entry.sourceType === 'invoice' && onViewInvoice && (
              <button
                onClick={() => {
                  onViewInvoice(entry.sourceId);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition"
              >
                <Receipt className="w-3.5 h-3.5" />
                View Full Tax Invoice
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
