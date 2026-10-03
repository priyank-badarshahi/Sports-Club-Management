import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { Court, CourtStatus, SportType } from '../../types';
import { Grid, Settings, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, X, Edit3 } from 'lucide-react';

export const CourtsAdmin: React.FC = () => {
  const { courts, updateCourt, bookings } = useClub();
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);

  const [editForm, setEditForm] = useState({
    name: '',
    hourlyRate: 800,
    status: 'available' as CourtStatus,
    surface: '',
    capacity: 4,
  });

  const handleOpenEdit = (court: Court) => {
    setEditingCourt(court);
    setEditForm({
      name: court.name,
      hourlyRate: court.hourlyRate,
      status: court.status,
      surface: court.surface,
      capacity: court.capacity,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourt) return;
    updateCourt(editingCourt.id, {
      name: editForm.name,
      hourlyRate: Number(editForm.hourlyRate),
      status: editForm.status,
      surface: editForm.surface,
      capacity: Number(editForm.capacity),
    });
    setEditingCourt(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
            Facilities Management
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Court Configurations & Maintenance
          </h1>
          <p className="text-xs text-slate-500">
            Configure hourly rates, maintenance windows, court lighting, and sporting surfaces.
          </p>
        </div>
      </div>

      {/* Courts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courts.map((court) => {
          const activeBookingsCount = bookings.filter(
            (b) => b.courtId === court.id && b.status === 'confirmed'
          ).length;

          return (
            <div
              key={court.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                      C{court.number}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{court.name}</h3>
                      <div className="text-[11px] font-mono text-blue-600 font-semibold">
                        {court.sport} · {court.isIndoor ? 'Indoor Arena' : 'Outdoor Floodlit'}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                      court.status === 'available'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : court.status === 'maintenance'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {court.status}
                  </span>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Surface Specification:</span>
                    <span className="font-sans font-medium text-slate-900 truncate max-w-[200px]">
                      {court.surface}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Walk-in Hourly Rate:</span>
                    <span className="font-bold text-slate-900">
                      ₹{court.hourlyRate} / hour
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gold Member Rate (20% off):</span>
                    <span className="font-bold text-blue-600">
                      ₹{Math.round(court.hourlyRate * 0.8)} / hour
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Upcoming Reservations:</span>
                    <span className="font-bold text-blue-700">{activeBookingsCount} booked slots</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  onClick={() =>
                    updateCourt(court.id, {
                      status: court.status === 'available' ? 'maintenance' : 'available',
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    court.status === 'maintenance'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  {court.status === 'maintenance' ? 'Set as Operational' : 'Mark for Maintenance'}
                </button>

                <button
                  onClick={() => handleOpenEdit(court)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Court Modal */}
      {editingCourt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative">
            <button
              onClick={() => setEditingCourt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <div className="text-xs font-mono uppercase text-blue-600 font-semibold">
                  Facility Setup
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  Configure Court {editingCourt.number}
                </h3>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Court Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Surface Specification
                </label>
                <input
                  type="text"
                  required
                  value={editForm.surface}
                  onChange={(e) => setEditForm({ ...editForm, surface: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hourly Rate (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={editForm.hourlyRate}
                    onChange={(e) => setEditForm({ ...editForm, hourlyRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Operational Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">Available (Operational)</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCourt(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
