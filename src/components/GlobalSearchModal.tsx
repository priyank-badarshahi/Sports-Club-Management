import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Search, X, Users, MapPin, ShoppingBag, Coffee, Calendar } from 'lucide-react';
import { formatINR } from '../lib/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { members, courts, products, menuItems, bookings, invoices, leads, openMember360 } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredMembers = q
    ? members.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.memberNumber.toLowerCase().includes(q) ||
          m.phone.includes(q)
      ).slice(0, 4)
    : [];

  const filteredCourts = q
    ? courts.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.sport.toLowerCase().includes(q) ||
          c.surface.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const filteredProducts = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const filteredMenuItems = q
    ? menuItems.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const filteredBookings = q
    ? bookings.filter(
        (b) =>
          b.guestName.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.sport.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const filteredInvoices = q
    ? invoices.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.recipientName.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const filteredLeads = q
    ? leads.filter(
        (l) =>
          l.fullName.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.email.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const totalResults =
    filteredMembers.length +
    filteredCourts.length +
    filteredProducts.length +
    filteredMenuItems.length +
    filteredBookings.length +
    filteredInvoices.length +
    filteredLeads.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-lime-400 mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search members, courts, products, café menu, bookings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 focus:outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs bg-slate-800 text-slate-400 hover:text-slate-200 px-2 py-1 rounded border border-slate-700"
          >
            ESC
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="text-center py-8 text-slate-400">
              <Search className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-medium">Quick search across the entire club system</p>
              <p className="text-xs text-slate-500 mt-1">Try "Tennis", "Vikram", "Wilson", "Espresso", "Padel"</p>
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">No matching records found for "{query}"</p>
            </div>
          )}

          {/* Members */}
          {filteredMembers.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-lime-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Members ({filteredMembers.length})
              </div>
              <div className="space-y-1">
                {filteredMembers.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      onClose();
                      openMember360(m.id);
                      navigate('/staff/members');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-lime-400">
                        {m.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{m.fullName}</div>
                        <div className="text-xs text-slate-400">{m.memberNumber} • {m.phone}</div>
                      </div>
                    </div>
                    <span className="text-xs capitalize px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      {m.tier}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courts */}
          {filteredCourts.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Courts ({filteredCourts.length})
              </div>
              <div className="space-y-1">
                {filteredCourts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onClose();
                      navigate('/courts');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{c.name}</div>
                      <div className="text-xs text-slate-400 capitalize">{c.sport} • {c.surface}</div>
                    </div>
                    <span className="text-xs text-lime-400 font-medium">
                      From {formatINR(c.hourlyRate.gold)}/hr
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {filteredProducts.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" /> Pro Shop ({filteredProducts.length})
              </div>
              <div className="space-y-1">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onClose();
                      navigate('/shop');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.brand} • Qty: {p.stockQty} in stock</div>
                    </div>
                    <span className="text-xs text-amber-400 font-semibold">{formatINR(p.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Café & Bar */}
          {filteredMenuItems.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5" /> Café & Sports Bar ({filteredMenuItems.length})
              </div>
              <div className="space-y-1">
                {filteredMenuItems.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      onClose();
                      navigate('/staff/bar');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{m.name}</div>
                      <div className="text-xs text-slate-400 capitalize">{m.category.replace('_', ' ')}</div>
                    </div>
                    <span className="text-xs text-purple-300 font-semibold">{formatINR(m.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookings */}
          {filteredBookings.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Bookings ({filteredBookings.length})
              </div>
              <div className="space-y-1">
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      onClose();
                      navigate('/staff/bookings');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{b.guestName} ({b.sport.toUpperCase()})</div>
                      <div className="text-xs text-slate-400">{b.date} at {b.startTime}</div>
                    </div>
                    <span className="text-xs capitalize px-2 py-0.5 rounded bg-slate-800 text-sky-300">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoices */}
          {filteredInvoices.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Invoices ({filteredInvoices.length})
              </div>
              <div className="space-y-1">
                {filteredInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      onClose();
                      navigate('/staff/finance');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{inv.invoiceNumber} • {inv.recipientName}</div>
                      <div className="text-xs text-slate-400 capitalize">{inv.category.replace('_', ' ')} • Due {inv.dueDate}</div>
                    </div>
                    <span className="text-xs font-bold text-lime-400">
                      {formatINR(inv.totalAmount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leads */}
          {filteredLeads.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> CRM Leads ({filteredLeads.length})
              </div>
              <div className="space-y-1">
                {filteredLeads.map((ld) => (
                  <div
                    key={ld.id}
                    onClick={() => {
                      onClose();
                      navigate('/staff/crm');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{ld.fullName}</div>
                      <div className="text-xs text-slate-400">{ld.phone} • {ld.source}</div>
                    </div>
                    <span className="text-xs capitalize px-2 py-0.5 rounded bg-slate-800 text-rose-300">
                      {ld.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-500">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">Ctrl+K</kbd> anywhere</span>
          <span>Champions Club OS</span>
        </div>
      </div>
    </div>
  );
};
