import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { CRMLead, LeadStage, MembershipTier } from '../../types';
import {
  UserPlus,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileText,
  X,
  CreditCard,
} from 'lucide-react';

export const CRMAdmin: React.FC = () => {
  const { leads, updateLeadStage, convertLeadToMember, setCurrentView } = useClub();

  const [convertModalLead, setConvertModalLead] = useState<CRMLead | null>(null);
  const [targetPlan, setTargetPlan] = useState<MembershipTier>('Gold');
  const [convertSuccessMsg, setConvertSuccessMsg] = useState<string | null>(null);

  const stages: { stage: LeadStage; title: string; color: string }[] = [
    { stage: 'new', title: 'New Leads', color: 'border-blue-500 text-blue-500' },
    { stage: 'contacted', title: 'Contacted', color: 'border-indigo-500 text-indigo-500' },
    { stage: 'interested', title: 'Interested', color: 'border-purple-500 text-purple-500' },
    { stage: 'quote_sent', title: 'Quote Sent', color: 'border-amber-500 text-amber-500' },
    { stage: 'follow_up', title: 'Follow-up', color: 'border-orange-500 text-orange-500' },
    { stage: 'converted', title: 'Converted Members', color: 'border-emerald-500 text-emerald-500' },
  ];

  const handleConvertLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertModalLead) return;

    const newMember = convertLeadToMember(convertModalLead.id, targetPlan, 'Online');
    setConvertSuccessMsg(
      `${convertModalLead.name} successfully converted to ${targetPlan} Member (ID: ${newMember.memberId})! Viewable in Members Directory.`
    );
    setConvertModalLead(null);
    setTimeout(() => setConvertSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
            Sales & Member Acquisition
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            CRM & Enquiry Conversion Pipeline
          </h1>
          <p className="text-xs text-slate-500">
            Track inquiries from public website, phone & walk-ins. Convert qualified prospects directly into club members.
          </p>
        </div>
      </div>

      {convertSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{convertSuccessMsg}</span>
          </div>
          <button
            onClick={() => setCurrentView('admin_members')}
            className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold font-mono hover:bg-emerald-700 transition-colors"
          >
            View in Members
          </button>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {stages.map(({ stage, title, color }) => {
          const stageLeads = leads.filter((l) => l.stage === stage);

          return (
            <div
              key={stage}
              className="bg-slate-100/80 rounded-2xl p-3 border border-slate-200 flex flex-col min-w-[220px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 text-xs">
                <span className="font-bold text-slate-900">{title}</span>
                <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-700">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1">
                {stageLeads.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-slate-400">
                    No leads in {title}
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 hover:border-blue-400 hover:shadow-sm transition-all text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{lead.name}</div>
                          <div className="text-[10px] font-mono text-blue-600 font-medium">
                            {lead.interestedIn}
                          </div>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {lead.source}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {lead.notes}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100">
                        <span>Est: ₹{lead.estimatedValue.toLocaleString('en-IN')}</span>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <a href={`tel:${lead.phone}`} title={lead.phone}>
                            <Phone className="w-3 h-3 hover:text-blue-600 transition-colors" />
                          </a>
                          <a href={`mailto:${lead.email}`} title={lead.email}>
                            <Mail className="w-3 h-3 hover:text-blue-600 transition-colors" />
                          </a>
                        </div>
                      </div>

                      {/* Stage Progression Buttons */}
                      <div className="pt-2 flex items-center justify-between gap-1 border-t border-slate-100 text-[10px]">
                        {stage !== 'converted' ? (
                          <>
                            <button
                              onClick={() => {
                                const order: LeadStage[] = [
                                  'new',
                                  'contacted',
                                  'interested',
                                  'quote_sent',
                                  'follow_up',
                                  'converted',
                                ];
                                const currentIndex = order.indexOf(stage);
                                if (currentIndex < order.length - 1) {
                                  updateLeadStage(lead.id, order[currentIndex + 1]);
                                }
                              }}
                              className="text-slate-500 hover:text-slate-900 font-medium flex items-center gap-0.5"
                            >
                              <span>Next</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>

                            <button
                              onClick={() => {
                                setConvertModalLead(lead);
                                setTargetPlan(
                                  lead.interestedIn.includes('Gold')
                                    ? 'Gold'
                                    : lead.interestedIn.includes('Junior')
                                    ? 'Junior'
                                    : 'Silver'
                                );
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
                            >
                              Convert Member
                            </button>
                          </>
                        ) : (
                          <div className="w-full text-center text-emerald-600 font-semibold text-[10px] flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Member Active
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Convert to Member Modal */}
      {convertModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md w-full p-6 relative">
            <button
              onClick={() => setConvertModalLead(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleConvertLead} className="space-y-4 text-xs">
              <div>
                <div className="text-xs font-mono uppercase text-blue-600 font-semibold">
                  CRM Member Onboarding
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  Convert {convertModalLead.name}
                </h3>
                <p className="text-slate-500 mt-1">
                  Enrolls lead into official membership, creates subscription, and generates transaction.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono text-slate-700">
                <div>Email: <span className="text-slate-900 font-medium">{convertModalLead.email}</span></div>
                <div>Phone: <span className="text-slate-900 font-medium">{convertModalLead.phone}</span></div>
                <div>Source: <span className="text-slate-900 font-medium">{convertModalLead.source}</span></div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Membership Tier to Issue
                </label>
                <select
                  value={targetPlan}
                  onChange={(e) => setTargetPlan(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Gold">Gold Tier (₹45,000 / yr - 20% Court Discount)</option>
                  <option value="Silver">Silver Tier (₹28,000 / yr - 10% Court Discount)</option>
                  <option value="Junior">Junior Tier (₹22,000 / yr - 15% Court Discount)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setConvertModalLead(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors"
                >
                  Complete Conversion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
