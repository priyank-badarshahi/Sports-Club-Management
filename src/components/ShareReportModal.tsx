import React, { useState } from 'react';
import { 
  Share2, 
  X, 
  Copy, 
  Check, 
  Mail, 
  MessageSquare, 
  Download,
  FileText,
  Printer
} from 'lucide-react';

interface ShareReportModalProps {
  title: string;
  subtitle?: string;
  summaryText: string;
  onExportCSV?: () => void;
  onClose: () => void;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({
  title,
  subtitle,
  summaryText,
  onExportCSV,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setStatusMsg('Copied summary text to clipboard!');
    setTimeout(() => {
      setCopied(false);
      setStatusMsg(null);
    }, 2500);
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(summaryText)}`;
    window.open(url, '_blank');
    setStatusMsg('Opened WhatsApp with formatted report summary.');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`${title} - Champions Club Financials`);
    const body = encodeURIComponent(summaryText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setStatusMsg('Opened email client.');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">
                Export & Dispatch Summary
              </span>
              <h3 className="font-heading font-extrabold text-base text-white">
                {title}
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

        {statusMsg && (
          <div className="px-6 py-2 bg-emerald-950/80 border-b border-emerald-800 text-xs text-emerald-300 text-center font-medium">
            {statusMsg}
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {subtitle && (
            <p className="text-slate-400">{subtitle}</p>
          )}

          {/* Formatted Text Preview */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">
              Formatted Executive Summary Preview
            </span>
            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
              {summaryText}
            </pre>
          </div>

          {/* Quick Channels Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <button
              onClick={handleCopy}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition font-semibold"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition font-semibold"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleEmail}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 transition font-semibold"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </button>

            {onExportCSV ? (
              <button
                onClick={() => {
                  onExportCSV();
                  setStatusMsg('CSV export initiated.');
                }}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/30 text-lime-400 transition font-semibold"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            ) : (
              <button
                onClick={handlePrint}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 transition font-semibold"
              >
                <Printer className="w-4 h-4" />
                <span>Print PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
