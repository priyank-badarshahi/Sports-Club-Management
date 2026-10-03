import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import {
  FileBarChart,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  DollarSign,
  Users,
  Grid,
  ShoppingBag,
  Coffee,
  CheckCircle2,
} from 'lucide-react';

export const ReportsAdmin: React.FC = () => {
  const { members, bookings, products, transactions, courts } = useClub();
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const reportsList = [
    {
      id: 'rev_rep',
      title: 'Consolidated Revenue Report',
      description: 'Departmental breakdown of Courts, Pro Shop, Bar POS, and Membership recurring dues.',
      category: 'Financial',
      icon: DollarSign,
      records: transactions.length,
      lastGenerated: 'Today, 20:30',
    },
    {
      id: 'mem_rep',
      title: 'Membership Roster & Retention Report',
      description: 'Active, expiring, and churned member profiles with tier distribution and lifetime value.',
      category: 'Memberships',
      icon: Users,
      records: members.length,
      lastGenerated: 'Today, 18:00',
    },
    {
      id: 'court_rep',
      title: 'Court Facility Utilization & Peak Hours',
      description: 'Court 1 - 4 slot occupancy percentages, prime-time reservations, and weather downtime.',
      category: 'Operations',
      icon: Grid,
      records: bookings.length,
      lastGenerated: 'Today, 19:45',
    },
    {
      id: 'shop_rep',
      title: 'Sports Shop Sales & Inventory Velocity',
      description: 'SKU turnover rate, low-stock reorder velocity, and online vs counter sales split.',
      category: 'Commercial',
      icon: ShoppingBag,
      records: products.length,
      lastGenerated: 'Today, 17:15',
    },
    {
      id: 'bar_rep',
      title: 'Bar & Cafeteria Consumption Audit',
      description: 'Popular menu items, member discount absorption, and average table turn time.',
      category: 'Hospitality',
      icon: Coffee,
      records: 24,
      lastGenerated: 'Today, 16:30',
    },
    {
      id: 'exp_rep',
      title: 'Overhead & Operating Expense Ledger',
      description: 'Staff payroll, coaching disbursements, floodlight utility bills, and inventory restocking.',
      category: 'Financial',
      icon: FileBarChart,
      records: 48,
      lastGenerated: 'Yesterday',
    },
    {
      id: 'pay_rep',
      title: 'Payment Gateway Settlement & Reconciliation',
      description: 'UPI, Credit/Debit Card, Net Banking and Cash reconciliation for club accounting audit.',
      category: 'Audit',
      icon: FileText,
      records: transactions.length,
      lastGenerated: 'Today, 21:00',
    },
  ];

  const handleExport = (title: string, format: 'PDF' | 'Excel') => {
    setDownloadNotice(`Generated & Downloaded ${title} (${format} format)!`);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
            Executive Intelligence
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Operational Reports & Data Exports
          </h1>
          <p className="text-xs text-slate-500">
            Export club performance metrics for board meetings, tax filing, and committee audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('Champions Club Complete Annual Audit', 'Excel')}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export All (Excel)</span>
          </button>
          <button
            onClick={() => handleExport('Champions Club Executive Briefing', 'PDF')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export All (PDF)</span>
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportsList.map((rep) => {
          const Icon = rep.icon;
          return (
            <div
              key={rep.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs space-y-4 hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase font-semibold">
                    {rep.category}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{rep.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {rep.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{rep.records} Data Rows</span>
                  <span>{rep.lastGenerated}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleExport(rep.title, 'PDF')}
                  className="py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  <span>PDF Export</span>
                </button>
                <button
                  onClick={() => handleExport(rep.title, 'Excel')}
                  className="py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Excel XLSX</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
