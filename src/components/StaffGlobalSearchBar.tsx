import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Search, QrCode, X, User, ArrowRight, UserCheck } from 'lucide-react';
import { getTierBadgeClass } from '../lib/formatters';

export const StaffGlobalSearchBar: React.FC = () => {
  const { members, openMember360 } = useAppStore();
  const [query, setQuery] = useState('');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState('');

  const q = query.toLowerCase().trim();
  const searchResults = q
    ? members.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.memberNumber.toLowerCase().includes(q) ||
          m.phone.includes(q)
      ).slice(0, 5)
    : [];

  const handleSelectMember = (memberId: string) => {
    openMember360(memberId);
    setQuery('');
  };

  const handleSimulateQrScan = (codeToScan?: string) => {
    const code = (codeToScan || scannedCode).trim();
    if (!code) return;
    const found = members.find(
      (m) => m.memberNumber.toLowerCase() === code.toLowerCase() || m.id.toLowerCase() === code.toLowerCase()
    );
    if (found) {
      openMember360(found.id);
      setQrModalOpen(false);
      setScannedCode('');
    } else {
      // Fallback: search partial
      const partial = members.find((m) => m.memberNumber.toLowerCase().includes(code.toLowerCase()));
      if (partial) {
        openMember360(partial.id);
        setQrModalOpen(false);
        setScannedCode('');
      }
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-lime-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Quick Member 360° Search (Name, Phone, or Member ID e.g. CC-2026-1001)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-lime-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setQrModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition shrink-0"
          title="Simulate Gate QR Code Scan"
        >
          <QrCode className="w-4 h-4 text-lime-400" />
          <span className="hidden sm:inline">Simulate QR Scan</span>
        </button>
      </div>

      {/* Dropdown Live Results */}
      {searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 overflow-hidden divide-y divide-slate-800 animate-in fade-in">
          {searchResults.map((m) => (
            <div
              key={m.id}
              onClick={() => handleSelectMember(m.id)}
              className="p-3 hover:bg-slate-800/80 cursor-pointer transition flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <img
                  src={m.avatar}
                  alt={m.fullName}
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-lime-400/40"
                />
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>{m.fullName}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-bold ${getTierBadgeClass(m.tier)}`}>
                      {m.tier}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {m.memberNumber} • {m.phone}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-lime-400 font-medium text-[11px]">
                <span>Open 360°</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Scanner Simulation Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-lime-400" />
                <h3 className="font-heading font-bold text-base text-white">Gate QR Code Scanner</h3>
              </div>
              <button
                onClick={() => setQrModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Simulate scanning a member's digital membership pass at the turnstile gate:
            </p>

            {/* Quick sample chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Quick Sample Scans:</span>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'CC-2026-1001', name: 'Vikram Malhotra (Gold)' },
                  { id: 'CC-2026-1002', name: 'Ananya Sharma (Silver)' },
                  { id: 'CC-2026-1045', name: 'Varun Rao (Expiring Soon)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSimulateQrScan(s.id)}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs flex justify-between items-center transition"
                  >
                    <span className="font-mono text-lime-400">{s.id}</span>
                    <span className="text-slate-300 text-[11px]">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs text-slate-300 font-semibold block mb-1">Or Paste QR Code / ID</label>
              <input
                type="text"
                placeholder="e.g. CC-2026-1001"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setQrModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSimulateQrScan()}
                className="px-4 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md"
              >
                Scan & Open 360°
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
