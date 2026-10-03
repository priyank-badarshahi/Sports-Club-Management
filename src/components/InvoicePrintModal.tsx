import React, { useState } from 'react';
import { Invoice, ClubSettings, CreditNote } from '../types';
import { formatINR, formatDateTime, formatDate } from '../lib/formatters';
import { 
  Printer, 
  X, 
  Share2, 
  Copy, 
  Check, 
  Mail, 
  MessageSquare, 
  Download, 
  Building, 
  ShieldCheck,
  QrCode
} from 'lucide-react';

interface InvoicePrintModalProps {
  invoice: Invoice;
  settings: ClubSettings;
  creditNotes?: CreditNote[];
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoice,
  settings,
  creditNotes = [],
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const relatedCredits = creditNotes.filter((c) => c.invoiceId === invoice.id);
  const totalCredits = relatedCredits.reduce((sum, c) => sum + c.amount, 0);
  const netDue = Math.max(0, (invoice.balanceAmount !== undefined ? invoice.balanceAmount : invoice.totalAmount) - totalCredits);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/invoices/${invoice.invoiceNumber}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulateShare = (channel: 'whatsapp' | 'email') => {
    const summary = `🧾 *${settings.clubName} - Tax Invoice #${invoice.invoiceNumber}*\n` +
      `Recipient: ${invoice.recipientName}\n` +
      `Amount: ${formatINR(invoice.totalAmount)}\n` +
      `Status: ${invoice.status.toUpperCase()}\n` +
      `Due Date: ${formatDate(invoice.dueDate)}\n` +
      `View Online: ${window.location.origin}/invoices/${invoice.invoiceNumber}`;

    if (channel === 'whatsapp') {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(summary)}`;
      window.open(waUrl, '_blank');
      setShareMsg('Opened WhatsApp with formatted invoice details');
    } else {
      const mailto = `mailto:${invoice.recipientEmail}?subject=Tax Invoice ${invoice.invoiceNumber} - ${settings.clubName}&body=${encodeURIComponent(summary)}`;
      window.location.href = mailto;
      setShareMsg('Opened default email client with invoice summary');
    }
    setTimeout(() => setShareMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Action Bar (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-lime-400">
              TAX INVOICE • {invoice.invoiceNumber}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              invoice.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              invoice.status === 'partially_paid' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              invoice.status === 'overdue' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
              'bg-slate-800 text-slate-300'
            }`}>
              {invoice.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold transition shadow-sm"
              title="Print official GST tax invoice"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / PDF
            </button>

            <button
              onClick={handleCopyShareLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              title="Copy shareable link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Link Copied!' : 'Copy Link'}
            </button>

            <button
              onClick={() => handleSimulateShare('whatsapp')}
              className="p-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition"
              title="Share via WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleSimulateShare('email')}
              className="p-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 transition"
              title="Share via Email"
            >
              <Mail className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {shareMsg && (
          <div className="px-6 py-2 bg-emerald-950/80 border-b border-emerald-800 text-xs text-emerald-300 text-center print:hidden">
            {shareMsg}
          </div>
        )}

        {/* Printable Tax Invoice Sheet */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-200 print:text-black print:bg-white text-xs sm:text-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800 print:border-gray-300">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-heading font-black text-base print:border print:border-black">
                  CC
                </div>
                <div>
                  <h2 className="font-heading font-extrabold text-xl text-white print:text-black">
                    {settings.clubName}
                  </h2>
                  <p className="text-[11px] text-slate-400 print:text-gray-600 font-medium">
                    {settings.tagline}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-400 print:text-gray-600 space-y-0.5">
                <p>{settings.address}</p>
                <p>Phone: {settings.phone} • Email: {settings.email}</p>
                <p className="font-mono font-semibold text-slate-200 print:text-black">
                  GSTIN: {settings.gstNumber} • State Code: 29 (Karnataka)
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400 print:text-gray-800">
                ORIGINAL TAX INVOICE
              </span>
              <div className="font-mono font-bold text-lg text-white print:text-black">
                {invoice.invoiceNumber}
              </div>
              <div className="text-[11px] text-slate-400 print:text-gray-600">
                Invoice Date: <strong className="text-slate-200 print:text-black">{formatDate(invoice.createdAt)}</strong>
              </div>
              <div className="text-[11px] text-slate-400 print:text-gray-600">
                Due Date: <strong className="text-slate-200 print:text-black">{formatDate(invoice.dueDate)}</strong>
              </div>
              {invoice.sourceReference && (
                <div className="text-[11px] text-slate-400 print:text-gray-600">
                  Ref: <span className="font-mono text-slate-300 print:text-black">{invoice.sourceReference}</span>
                </div>
              )}
            </div>
          </div>

          {/* Billed To & Supply Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 print:bg-gray-50 print:border-gray-200">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 print:text-gray-500 block mb-1">
                Billed To (Customer / Client):
              </span>
              <h4 className="font-heading font-bold text-sm text-white print:text-black">
                {invoice.recipientName}
              </h4>
              <p className="text-[11px] text-slate-400 print:text-gray-600 mt-0.5">{invoice.recipientEmail}</p>
              {invoice.recipientPhone && (
                <p className="text-[11px] text-slate-400 print:text-gray-600">{invoice.recipientPhone}</p>
              )}
              {invoice.recipientAddress && (
                <p className="text-[11px] text-slate-400 print:text-gray-600">{invoice.recipientAddress}</p>
              )}
              {invoice.recipientGst && (
                <p className="text-[11px] font-mono font-semibold text-lime-400 print:text-black mt-1">
                  Customer GSTIN: {invoice.recipientGst} (B2B Supply)
                </p>
              )}
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 print:text-gray-500 block mb-1">
                Tax Compliance & Supply Details:
              </span>
              <p className="text-[11px] text-slate-400 print:text-gray-600">
                Place of Supply: <strong className="text-slate-200 print:text-black">Bengaluru, Karnataka (29)</strong>
              </p>
              <p className="text-[11px] text-slate-400 print:text-gray-600">
                SAC Code: <strong className="text-slate-200 print:text-black">999651 (Sports & Recreational Services)</strong>
              </p>
              <p className="text-[11px] text-slate-400 print:text-gray-600">
                Category: <strong className="capitalize text-slate-200 print:text-black">{invoice.category.replace('_', ' ')}</strong>
              </p>
              {invoice.paymentMethod && (
                <p className="text-[11px] text-slate-400 print:text-gray-600">
                  Payment Mode: <strong className="text-emerald-400 print:text-black">{invoice.paymentMethod}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-gray-300">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 print:bg-gray-100 print:text-black font-bold uppercase">
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Item Description</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Unit Rate</th>
                  <th className="py-2.5 px-4 text-right">Taxable Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 print:divide-gray-200">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/20 print:hover:bg-transparent">
                    <td className="py-3 px-4 font-mono text-center text-slate-500 print:text-gray-600">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white print:text-black">{item.description}</div>
                      <div className="text-[10px] text-slate-400 print:text-gray-500">SAC: 999651 • GST @ {(invoice.gstRate * 100).toFixed(0)}%</div>
                    </td>
                    <td className="py-3 px-4 text-center font-medium">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono">{formatINR(item.rate)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white print:text-black">
                      {formatINR(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Tax Calculation Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 print:border-gray-200 print:bg-gray-50">
              <span className="text-[10px] font-bold uppercase text-slate-400 print:text-gray-600">
                Payment & Banking Details
              </span>
              <div className="text-[11px] text-slate-400 print:text-gray-600 space-y-1">
                <p>Beneficiary: <strong className="text-slate-200 print:text-black">CHAMPIONS ATHLETIC CLUB PRIVATE LIMITED</strong></p>
                <p>Bank: <strong className="text-slate-200 print:text-black">HDFC Bank, Koramangala 80ft Road</strong></p>
                <p>Account No: <strong className="font-mono text-slate-200 print:text-black">50200088192301</strong></p>
                <p>IFSC Code: <strong className="font-mono text-slate-200 print:text-black">HDFC0000428</strong></p>
                <p>UPI VPA: <strong className="font-mono text-lime-400 print:text-black">championsclub@hdfcbank</strong></p>
              </div>
              {invoice.notes && (
                <div className="pt-2 border-t border-slate-800 print:border-gray-300 text-[11px] text-slate-400 print:text-gray-600">
                  <strong>Notes:</strong> {invoice.notes}
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80 print:border-gray-200">
                <span className="text-slate-400 print:text-gray-600">Taxable Subtotal:</span>
                <span className="font-mono font-semibold text-white print:text-black">{formatINR(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80 print:border-gray-200">
                <span className="text-slate-400 print:text-gray-600">
                  CGST ({(invoice.gstRate * 50).toFixed(1)}%):
                </span>
                <span className="font-mono text-slate-300 print:text-black">{formatINR(Math.round(invoice.gstAmount / 2))}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80 print:border-gray-200">
                <span className="text-slate-400 print:text-gray-600">
                  SGST ({(invoice.gstRate * 50).toFixed(1)}%):
                </span>
                <span className="font-mono text-slate-300 print:text-black">{formatINR(Math.round(invoice.gstAmount / 2))}</span>
              </div>

              {invoice.creditNoteAmount && invoice.creditNoteAmount > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-800/80 text-amber-400 print:text-gray-800">
                  <span>Less: Credit Note Adjustment:</span>
                  <span className="font-mono">- {formatINR(invoice.creditNoteAmount)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 border-b-2 border-slate-700 print:border-black font-heading font-extrabold text-sm sm:text-base text-lime-400 print:text-black">
                <span>Total Invoice Value:</span>
                <span className="font-mono">{formatINR(invoice.totalAmount)}</span>
              </div>

              <div className="flex justify-between py-1 text-[11px] text-slate-400 print:text-gray-600">
                <span>Amount Paid:</span>
                <span className="font-mono text-emerald-400 print:text-black font-semibold">
                  {formatINR(invoice.paidAmount || (invoice.status === 'paid' ? invoice.totalAmount : 0))}
                </span>
              </div>

              <div className="flex justify-between py-1 text-xs font-bold text-white print:text-black">
                <span>Balance Payable:</span>
                <span className={`font-mono ${netDue > 0 ? 'text-rose-400 print:text-black' : 'text-emerald-400 print:text-black'}`}>
                  {formatINR(netDue)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer & Authorized Signatory */}
          <div className="pt-6 border-t border-slate-800 print:border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400 print:text-gray-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-lime-400 print:text-black" />
              <span>Electronically authenticated tax invoice under Section 31 of CGST Act, 2017.</span>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <div className="font-heading font-bold text-xs text-slate-200 print:text-black">
                For {settings.clubName}
              </div>
              <div className="text-[10px] text-slate-500 print:text-gray-500 italic">
                Authorized Signatory / Finance Controller
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
