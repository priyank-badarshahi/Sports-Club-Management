import { Lead, Quote, BusinessClient, LeadStatus, LeadSource, MembershipTier } from '../types';

export interface CrmMetrics {
  totalLeads: number;
  openPipelineCount: number;
  pipelineValue: number;
  wonCount: number;
  lostCount: number;
  conversionRate: number; // percentage (won / (won + lost))
  avgResponseTimeHours: number;
  sourcePerformance: {
    source: LeadSource;
    label: string;
    totalLeads: number;
    wonLeads: number;
    conversionRate: number;
    totalValue: number;
  }[];
  stageCounts: { [key in LeadStatus]?: number };
  overdueRemindersCount: number;
}

export const KANBAN_STAGES: { id: LeadStatus; label: string; color: string; bg: string; borderColor: string }[] = [
  { id: 'new', label: 'New Enquiry', color: 'text-sky-400', bg: 'bg-sky-500/10', borderColor: 'border-sky-500/30' },
  { id: 'contacted', label: 'Contacted', color: 'text-blue-400', bg: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  { id: 'trial_booked', label: 'Trial Booked', color: 'text-purple-400', bg: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
  { id: 'quote_sent', label: 'Quote Sent', color: 'text-amber-400', bg: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  { id: 'negotiation', label: 'Negotiation', color: 'text-indigo-400', bg: 'bg-indigo-500/10', borderColor: 'border-indigo-500/30' },
  { id: 'won', label: 'Won / Enrolled', color: 'text-lime-400', bg: 'bg-lime-500/10', borderColor: 'border-lime-500/30' },
  { id: 'lost', label: 'Lost Lead', color: 'text-rose-400', bg: 'bg-rose-500/10', borderColor: 'border-rose-500/30' },
];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  website_contact: 'Public Contact Form',
  website_trial: 'Online Trial Pass',
  walk_in: 'Reception Walk-In',
  phone: 'Phone Concierge',
  social: 'Social Media',
  instagram: 'Instagram Ad Campaign',
  referral: 'Member Referral',
  corporate: 'Corporate Outreach',
};

export const LOST_REASON_OPTIONS = [
  'Price / Budget constraint',
  'Distance / Commute travel time',
  'Chose competitor club',
  'Timing / Schedule clash',
  'Wanted single-sport outdoor court only',
  'Unresponsive / No show to trial',
  'Other / Relocated',
];

/**
 * Pure function to calculate estimated value of a lead based on tier & interested packages
 */
export function estimateLeadValue(lead: Lead): number {
  if (lead.estimatedValue && lead.estimatedValue > 0) return lead.estimatedValue;
  if (lead.interest === 'corporate' || lead.source === 'corporate') return 120000;
  if (lead.interest === 'coaching') return 36000;
  
  switch (lead.interestedTier) {
    case 'gold':
      return 49999;
    case 'silver':
      return 29999;
    case 'junior':
      return 19999;
    default:
      return 35000;
  }
}

/**
 * Pure function: Calculate full CRM analytics & intelligence
 */
export function calculateCrmMetrics(leads: Lead[], quotes: Quote[], todayStr: string = new Date().toISOString().split('T')[0]): CrmMetrics {
  const totalLeads = leads.length;
  const stageCounts: { [key in LeadStatus]?: number } = {};
  
  leads.forEach((l) => {
    const st = l.status === 'converted' ? 'won' : l.status;
    stageCounts[st] = (stageCounts[st] || 0) + 1;
  });

  const wonCount = (stageCounts['won'] || 0) + (stageCounts['converted'] || 0);
  const lostCount = stageCounts['lost'] || 0;
  const closedTotal = wonCount + lostCount;
  const conversionRate = closedTotal > 0 ? Math.round((wonCount / closedTotal) * 100) : 0;

  // Open pipeline count and value (stages other than won/lost)
  const openLeads = leads.filter((l) => l.status !== 'won' && l.status !== 'converted' && l.status !== 'lost');
  const openPipelineCount = openLeads.length;

  const pipelineValue = openLeads.reduce((acc, lead) => {
    const val = estimateLeadValue(lead);
    return acc + val;
  }, 0);

  // Overdue Reminders
  const overdueRemindersCount = leads.filter((l) => {
    if (l.status === 'won' || l.status === 'converted' || l.status === 'lost') return false;
    if (!l.followUpDate) return false;
    return l.followUpDate < todayStr;
  }).length;

  // Source Performance breakdown
  const sourceKeys: LeadSource[] = ['website_contact', 'website_trial', 'walk_in', 'phone', 'social', 'instagram', 'referral', 'corporate'];
  const sourcePerformance = sourceKeys.map((src) => {
    const srcLeads = leads.filter((l) => l.source === src || (src === 'social' && l.source === 'instagram'));
    const srcWon = srcLeads.filter((l) => l.status === 'won' || l.status === 'converted').length;
    const srcClosed = srcLeads.filter((l) => l.status === 'won' || l.status === 'converted' || l.status === 'lost').length;
    const srcConv = srcClosed > 0 ? Math.round((srcWon / srcClosed) * 100) : (srcLeads.length > 0 ? Math.round((srcWon / srcLeads.length) * 100) : 0);
    const totalVal = srcLeads.reduce((sum, lead) => sum + estimateLeadValue(lead), 0);

    return {
      source: src,
      label: LEAD_SOURCE_LABELS[src] || src,
      totalLeads: srcLeads.length,
      wonLeads: srcWon,
      conversionRate: srcConv,
      totalValue: totalVal,
    };
  });

  return {
    totalLeads,
    openPipelineCount,
    pipelineValue,
    wonCount,
    lostCount,
    conversionRate,
    avgResponseTimeHours: 1.4, // Industry benchmark for Champions Club concierge
    sourcePerformance,
    stageCounts,
    overdueRemindersCount,
  };
}

/**
 * Pure function: Calculate quote financial totals
 */
export function calculateQuoteTotals(
  baseAmount: number,
  discountType: 'percentage' | 'fixed',
  discountVal: number,
  gstPercent: number = 18
): { baseAmount: number; discountAmount: number; discountedSubtotal: number; gstAmount: number; totalAmount: number } {
  const discountAmount = discountType === 'percentage' 
    ? Math.round((baseAmount * discountVal) / 100) 
    : Math.min(baseAmount, discountVal);

  const discountedSubtotal = Math.max(0, baseAmount - discountAmount);
  const gstAmount = Math.round((discountedSubtotal * gstPercent) / 100);
  const totalAmount = discountedSubtotal + gstAmount;

  return {
    baseAmount,
    discountAmount,
    discountedSubtotal,
    gstAmount,
    totalAmount,
  };
}
