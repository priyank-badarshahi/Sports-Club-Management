import React, { useState, useEffect } from 'react';
import { useClub, AppView } from '../../context/ClubContext';
import { Search, X, Users, CalendarCheck, ShoppingBag, UserPlus, Briefcase, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { members, bookings, products, leads, employees, setCurrentView } = useClub();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const clean = query.trim().toLowerCase();

  const matchedMembers = clean
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(clean) ||
          m.memberId.toLowerCase().includes(clean) ||
          m.plan.toLowerCase().includes(clean) ||
          m.email.toLowerCase().includes(clean)
      )
    : [];

  const matchedBookings = clean
    ? bookings.filter(
        (b) =>
          b.customerName.toLowerCase().includes(clean) ||
          b.courtName.toLowerCase().includes(clean) ||
          b.bookingCode.toLowerCase().includes(clean)
      )
    : [];

  const matchedProducts = clean
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(clean) ||
          p.sku.toLowerCase().includes(clean) ||
          p.category.toLowerCase().includes(clean)
      )
    : [];

  const matchedLeads = clean
    ? leads.filter(
        (l) =>
          l.name.toLowerCase().includes(clean) ||
          l.interestedIn.toLowerCase().includes(clean) ||
          l.email.toLowerCase().includes(clean)
      )
    : [];

  const matchedEmployees = clean
    ? employees.filter(
        (e) =>
          e.name.toLowerCase().includes(clean) ||
          e.role.toLowerCase().includes(clean) ||
          e.department.toLowerCase().includes(clean)
      )
    : [];

  const totalResults =
    matchedMembers.length +
    matchedBookings.length +
    matchedProducts.length +
    matchedLeads.length +
    matchedEmployees.length;

  const handleSelect = (view: AppView) => {
    setCurrentView(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members (e.g. 'Rahul'), courts, products, leads, employees..."
            className="flex-1 bg-transparent border-0 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-500 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!clean ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <p>Type to search across entire Champions Club database.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px]">
                <span className="text-slate-500">Quick queries:</span>
                {['Rahul', 'Court 2', 'Tennis Balls', 'Gold', 'Jay Shah', 'Coach'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching records found for "{query}".
            </div>
          ) : (
            <>
              {/* Members */}
              {matchedMembers.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5 font-semibold">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>Members ({matchedMembers.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedMembers.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleSelect('admin_members')}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors border border-transparent hover:border-slate-200"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                            <span>{m.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {m.memberId}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                              {m.plan}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">{m.email} · {m.phone}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookings */}
              {matchedBookings.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5 font-semibold">
                    <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bookings ({matchedBookings.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedBookings.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleSelect('admin_bookings')}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors border border-transparent hover:border-slate-200"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                            <span>{b.customerName}</span>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{b.bookingCode}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {b.courtName} · {b.date} ({b.startTime} - {b.endTime})
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {matchedProducts.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5 font-semibold">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                    <span>Sports Shop Products ({matchedProducts.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelect('admin_shop')}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors border border-transparent hover:border-slate-200"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                            <span>{p.name}</span>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">SKU: {p.sku}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            ₹{p.price.toLocaleString('en-IN')} · Stock: {p.stock} units {p.stock <= p.minStock && '(Low Stock)'}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CRM Leads */}
              {matchedLeads.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5 font-semibold">
                    <UserPlus className="w-3.5 h-3.5 text-purple-600" />
                    <span>CRM Enquiries & Leads ({matchedLeads.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedLeads.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => handleSelect('admin_crm')}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors border border-transparent hover:border-slate-200"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                            <span>{l.name}</span>
                            <span className="text-[10px] font-mono uppercase text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">{l.stage}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Interested: {l.interestedIn} · {l.email}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Employees */}
              {matchedEmployees.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5 font-semibold">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Club Staff ({matchedEmployees.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedEmployees.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => handleSelect('admin_employees')}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors border border-transparent hover:border-slate-200"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                            <span>{e.name}</span>
                            <span className="text-[10px] text-slate-500">({e.role})</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {e.department} · Shift: {e.shift}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
