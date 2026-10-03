import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store';
import { 
  Lead, 
  Quote, 
  BusinessClient, 
  LeadStatus, 
  LeadSource, 
  LeadInterest, 
  MembershipTier, 
  SportType 
} from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Sparkles, 
  Building, 
  Briefcase, 
  FileText, 
  Send, 
  Check, 
  X, 
  Edit, 
  Trash2, 
  UserCheck, 
  ShieldAlert, 
  Award, 
  Percent, 
  Layers, 
  ArrowRight, 
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  HelpCircle,
  Copy,
  Printer,
  DollarSign
} from 'lucide-react';
import { formatINR, formatDateTime, getTierBadgeClass } from '../../lib/formatters';
import { 
  KANBAN_STAGES, 
  LEAD_SOURCE_LABELS, 
  LOST_REASON_OPTIONS, 
  calculateCrmMetrics, 
  estimateLeadValue, 
  calculateQuoteTotals 
} from '../../lib/crm';

export const StaffCrmPage: React.FC = () => {
  const { 
    leads, 
    quotes, 
    businessClients, 
    members, 
    employees, 
    settings, 
    currentUser,
    addLead, 
    updateLead, 
    updateLeadStatus, 
    addLeadActivity, 
    addLeadTask, 
    toggleLeadTask, 
    createQuote, 
    updateQuoteStatus, 
    convertLeadToMember, 
    convertLeadToBusinessClient, 
    addBusinessClient,
    addToast 
  } = useAppStore();

  // Active Main View: 'kanban' | 'inbox' | 'quotes' | 'corporate' | 'analytics'
  const [activeView, setActiveView] = useState<'kanban' | 'inbox' | 'quotes' | 'corporate' | 'analytics'>('kanban');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [interestFilter, setInterestFilter] = useState<string>('all');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Selected Lead Drawer
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Modals
  const [isManualLeadModalOpen, setIsManualLeadModalOpen] = useState(false);
  const [isQuoteBuilderModalOpen, setIsQuoteBuilderModalOpen] = useState(false);
  const [isConvertToMemberModalOpen, setIsConvertToMemberModalOpen] = useState(false);
  const [isConvertToCorpModalOpen, setIsConvertToCorpModalOpen] = useState(false);
  const [isMarkLostModalOpen, setIsMarkLostModalOpen] = useState(false);
  const [isInteractionLogModalOpen, setIsInteractionLogModalOpen] = useState<'call' | 'whatsapp' | 'email' | 'note' | null>(null);

  // Drag-and-drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // ----------------------------------------------------
  // Form States for Modals
  // ----------------------------------------------------
  const [manualLeadForm, setManualLeadForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    companyName: '',
    interest: 'membership' as LeadInterest,
    sports: ['tennis'] as SportType[],
    interestedTier: 'gold' as MembershipTier,
    source: 'walk_in' as LeadSource,
    estimatedValue: 49999,
    assignedStaffName: currentUser.name,
    followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  const [quoteForm, setQuoteForm] = useState({
    leadId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    companyName: '',
    packageType: 'membership_gold' as const,
    tierProposed: 'gold' as MembershipTier,
    tenureMonths: 12,
    baseAmount: 49999,
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountVal: 0,
    validityDays: 14,
    notes: 'Standard Champions Club VIP access agreement.',
  });

  const [convertMemberForm, setConvertMemberForm] = useState({
    tier: 'gold' as MembershipTier,
    billingCycle: 'annual' as 'monthly' | 'quarterly' | 'annual',
    paymentMethod: 'upi' as 'cash' | 'card' | 'upi',
    paymentAmount: 58998,
  });

  const [convertCorpForm, setConvertCorpForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstNumber: '29AAACT0000A1Z5',
    panNumber: 'AAACT0000A',
    address: 'Outer Ring Road, Bengaluru',
    creditTerms: 'net_30' as 'net_15' | 'net_30' | 'net_60' | 'prepaid',
    contractValue: 180000,
    packageType: 'Corporate Wellness & Multi-Sport League Retainer',
    allocatedPasses: 25,
    notes: 'Quarterly inter-department tournament access.',
  });

  const [lostForm, setLostForm] = useState({
    leadId: '',
    reason: LOST_REASON_OPTIONS[0],
    notes: '',
  });

  const [interactionForm, setInteractionForm] = useState({
    notes: '',
    callOutcome: 'Spoke with prospective member - positive interest',
    emailSubject: 'Champions Club VIP Membership Proposal & Invitation',
    whatsappMessage: 'Hi! Thank you for inquiring about Champions Club. We would love to host you for a private tour & trial session this week.',
  });

  const [newNoteInput, setNewNoteInput] = useState('');
  const [newTaskInput, setNewTaskInput] = useState({ title: '', dueDate: new Date().toISOString().split('T')[0] });

  // ----------------------------------------------------
  // Derived Analytics & Filters
  // ----------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];
  const metrics = useMemo(() => calculateCrmMetrics(leads, quotes, todayStr), [leads, quotes, todayStr]);

  const selectedLead = useMemo(() => leads.find((l) => l.id === selectedLeadId), [leads, selectedLeadId]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = l.fullName.toLowerCase().includes(q);
        const matchEmail = l.email.toLowerCase().includes(q);
        const matchPhone = l.phone.toLowerCase().includes(q);
        const matchRef = l.referenceNumber?.toLowerCase().includes(q);
        const matchCompany = l.companyName?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchRef && !matchCompany) return false;
      }

      if (stageFilter !== 'all') {
        const st = l.status === 'converted' ? 'won' : l.status;
        if (st !== stageFilter) return false;
      }

      if (sourceFilter !== 'all' && l.source !== sourceFilter) return false;
      if (interestFilter !== 'all' && l.interest !== interestFilter) return false;

      if (showOverdueOnly) {
        if (l.status === 'won' || l.status === 'converted' || l.status === 'lost') return false;
        if (!l.followUpDate || l.followUpDate >= todayStr) return false;
      }

      return true;
    });
  }, [leads, searchQuery, stageFilter, sourceFilter, interestFilter, showOverdueOnly, todayStr]);

  // ----------------------------------------------------
  // Drag and Drop Handlers
  // ----------------------------------------------------
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (!leadId) return;

    if (targetStage === 'lost') {
      setLostForm({ leadId, reason: LOST_REASON_OPTIONS[0], notes: '' });
      setIsMarkLostModalOpen(true);
    } else {
      updateLeadStatus(leadId, targetStage);
    }
    setDraggedLeadId(null);
  };

  // ----------------------------------------------------
  // Action Handlers
  // ----------------------------------------------------
  const handleCreateManualLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLeadForm.fullName || !manualLeadForm.phone) return;

    const ref = `ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const created = addLead({
      referenceNumber: ref,
      fullName: manualLeadForm.fullName,
      phone: manualLeadForm.phone,
      email: manualLeadForm.email,
      companyName: manualLeadForm.companyName || undefined,
      interest: manualLeadForm.interest,
      sportInterest: manualLeadForm.sports,
      interestedTier: manualLeadForm.interestedTier,
      source: manualLeadForm.source,
      status: 'new',
      estimatedValue: manualLeadForm.estimatedValue,
      assignedStaffName: manualLeadForm.assignedStaffName,
      followUpDate: manualLeadForm.followUpDate,
      notes: manualLeadForm.notes,
    });

    setIsManualLeadModalOpen(false);
    setSelectedLeadId(created.id);
  };

  const handleOpenQuoteModalForLead = (lead: Lead) => {
    const val = estimateLeadValue(lead);
    setQuoteForm({
      leadId: lead.id,
      clientName: lead.fullName,
      clientEmail: lead.email,
      clientPhone: lead.phone,
      companyName: lead.companyName || '',
      packageType: lead.interest === 'corporate' ? 'corporate_wellness' : `membership_${lead.interestedTier}` as any,
      tierProposed: lead.interestedTier,
      tenureMonths: 12,
      baseAmount: val > 0 ? val : 49999,
      discountType: 'percentage',
      discountVal: 0,
      validityDays: 14,
      notes: `Custom Champions Club proposal for ${lead.fullName}. Includes priority court allocation & club perks.`,
    });
    setIsQuoteBuilderModalOpen(true);
  };

  const handleGenerateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const calculated = calculateQuoteTotals(
      quoteForm.baseAmount,
      quoteForm.discountType,
      quoteForm.discountVal,
      18
    );

    const validDate = new Date(Date.now() + quoteForm.validityDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    createQuote({
      leadId: quoteForm.leadId || undefined,
      clientName: quoteForm.clientName,
      clientEmail: quoteForm.clientEmail,
      clientPhone: quoteForm.clientPhone,
      companyName: quoteForm.companyName || undefined,
      packageType: quoteForm.packageType,
      tierProposed: quoteForm.tierProposed,
      tenureMonths: quoteForm.tenureMonths,
      items: [
        {
          id: `qi_${Date.now()}`,
          name: `${quoteForm.packageType.replace('_', ' ').toUpperCase()} Package (${quoteForm.tenureMonths} Months)`,
          description: `All-inclusive athletic facility access, coaching privileges & clubhouse amenities.`,
          quantity: 1,
          unitRate: quoteForm.baseAmount,
          total: quoteForm.baseAmount,
        }
      ],
      baseAmount: calculated.baseAmount,
      discountType: quoteForm.discountType,
      discountPercent: quoteForm.discountType === 'percentage' ? quoteForm.discountVal : undefined,
      discountAmount: calculated.discountAmount,
      gstAmount: calculated.gstAmount,
      totalAmount: calculated.totalAmount,
      validUntil: validDate,
      status: 'sent',
      sentVia: 'email',
      notes: quoteForm.notes,
    });

    setIsQuoteBuilderModalOpen(false);
  };

  const handleOpenConvertMember = (lead: Lead) => {
    const isAnnual = true;
    const base = lead.interestedTier === 'gold' ? 49999 : lead.interestedTier === 'silver' ? 29999 : 19999;
    const withGst = Math.round(base * 1.18);

    setConvertMemberForm({
      tier: lead.interestedTier,
      billingCycle: isAnnual ? 'annual' : 'quarterly',
      paymentMethod: 'upi',
      paymentAmount: withGst,
    });
    setIsConvertToMemberModalOpen(true);
  };

  const handleExecuteConvertMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    convertLeadToMember(selectedLead.id, {
      tier: convertMemberForm.tier,
      paymentMethod: convertMemberForm.paymentMethod,
      billingCycle: convertMemberForm.billingCycle,
      paymentAmount: convertMemberForm.paymentAmount,
    });

    setIsConvertToMemberModalOpen(false);
  };

  const handleOpenConvertCorp = (lead: Lead) => {
    setConvertCorpForm({
      companyName: lead.companyName || lead.fullName,
      contactPerson: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      gstNumber: '29AAACT2727Q1ZW',
      panNumber: 'AAACT2727Q',
      address: 'Outer Ring Road, Bengaluru',
      creditTerms: 'net_30',
      contractValue: lead.estimatedValue && lead.estimatedValue > 50000 ? lead.estimatedValue : 240000,
      packageType: 'Corporate Multi-Sport League & Executive Wellness SLA',
      allocatedPasses: 30,
      notes: 'Master corporate billing agreement with Net-30 credit terms.',
    });
    setIsConvertToCorpModalOpen(true);
  };

  const handleExecuteConvertCorp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    convertLeadToBusinessClient(selectedLead.id, {
      companyName: convertCorpForm.companyName,
      contactPerson: convertCorpForm.contactPerson,
      email: convertCorpForm.email,
      phone: convertCorpForm.phone,
      gstNumber: convertCorpForm.gstNumber,
      panNumber: convertCorpForm.panNumber,
      address: convertCorpForm.address,
      creditTerms: convertCorpForm.creditTerms,
      contractValue: convertCorpForm.contractValue,
      packageType: convertCorpForm.packageType,
      allocatedPasses: convertCorpForm.allocatedPasses,
      notes: convertCorpForm.notes,
    });

    setIsConvertToCorpModalOpen(false);
  };

  const handleExecuteLost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostForm.leadId) return;

    updateLeadStatus(lostForm.leadId, 'lost', `${lostForm.reason}${lostForm.notes ? ` - ${lostForm.notes}` : ''}`);
    setIsMarkLostModalOpen(false);
  };

  const handleLogInteraction = () => {
    if (!selectedLead || !isInteractionLogModalOpen) return;

    let content = '';
    if (isInteractionLogModalOpen === 'call') {
      content = `Phone Call Logged: ${interactionForm.callOutcome}. Notes: ${interactionForm.notes || 'None'}`;
    } else if (isInteractionLogModalOpen === 'whatsapp') {
      content = `WhatsApp Message Dispatched: "${interactionForm.whatsappMessage}". Staff notes: ${interactionForm.notes || 'Delivered'}`;
    } else if (isInteractionLogModalOpen === 'email') {
      content = `Email Dispatched: Subject "${interactionForm.emailSubject}". Staff notes: ${interactionForm.notes || 'Delivered to inbox'}`;
    } else {
      content = `Note Logged: ${interactionForm.notes}`;
    }

    addLeadActivity(selectedLead.id, {
      type: isInteractionLogModalOpen === 'note' ? 'note' : isInteractionLogModalOpen,
      content,
    });

    setIsInteractionLogModalOpen(null);
    setInteractionForm({
      notes: '',
      callOutcome: 'Spoke with prospective member - positive interest',
      emailSubject: 'Champions Club VIP Membership Proposal & Invitation',
      whatsappMessage: 'Hi! Thank you for inquiring about Champions Club. We would love to host you for a private tour & trial session this week.',
    });
  };

  const handleAddQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newNoteInput.trim()) return;

    addLeadActivity(selectedLead.id, {
      type: 'note',
      content: newNoteInput.trim(),
    });
    setNewNoteInput('');
  };

  const handleAddQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newTaskInput.title.trim()) return;

    addLeadTask(selectedLead.id, {
      title: newTaskInput.title.trim(),
      dueDate: newTaskInput.dueDate,
      assignedTo: currentUser.name,
    });
    setNewTaskInput({ title: '', dueDate: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* HEADER & METRICS BAR */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400">
            Staff Module • Growth & Membership Concierge
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-0.5">
            CRM & Lead Conversion Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Ensure no enquiry ever vanishes. Track website forms, trial sessions, corporate SLAs, and conversion velocity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsManualLeadModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead Entry</span>
          </button>
          <button
            onClick={() => {
              setQuoteForm({
                leadId: '',
                clientName: '',
                clientEmail: '',
                clientPhone: '',
                companyName: '',
                packageType: 'membership_gold',
                tierProposed: 'gold',
                tenureMonths: 12,
                baseAmount: 49999,
                discountType: 'percentage',
                discountVal: 0,
                validityDays: 14,
                notes: 'Official Champions Club Membership Quotation.',
              });
              setIsQuoteBuilderModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Create Quote</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Total Leads</span>
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-xl sm:text-2xl text-white">{metrics.totalLeads}</span>
            <span className="text-[11px] text-sky-400 font-semibold">{metrics.openPipelineCount} Active</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Pipeline Value</span>
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-xl sm:text-2xl text-lime-400">{formatINR(metrics.pipelineValue)}</span>
            <span className="text-[10px] text-slate-500">Prospective</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Win / Conversion Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-xl sm:text-2xl text-white">{metrics.conversionRate}%</span>
            <span className="text-[11px] text-lime-400 font-semibold">{metrics.wonCount} Won</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Avg Response Time</span>
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-xl sm:text-2xl text-amber-400">{metrics.avgResponseTimeHours}h</span>
            <span className="text-[10px] text-slate-500">SLA &lt; 2h</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border space-y-1 ${metrics.overdueRemindersCount > 0 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-900 border-slate-800'}`}>
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Overdue Follow-ups</span>
          <div className="flex items-baseline justify-between">
            <span className={`font-heading font-extrabold text-xl sm:text-2xl ${metrics.overdueRemindersCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {metrics.overdueRemindersCount}
            </span>
            {metrics.overdueRemindersCount > 0 && (
              <button
                onClick={() => setShowOverdueOnly(!showOverdueOnly)}
                className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${showOverdueOnly ? 'bg-rose-500 text-white' : 'bg-rose-500/20 text-rose-300'}`}
              >
                {showOverdueOnly ? 'Showing' : 'Filter'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* NAVIGATION TABS & TOOLBAR */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'kanban', label: 'Kanban Pipeline', icon: Layers },
            { id: 'inbox', label: `Leads Inbox (${leads.length})`, icon: Users },
            { id: 'quotes', label: `Quotation Hub (${quotes.length})`, icon: FileText },
            { id: 'corporate', label: `Business Clients (${businessClients.length})`, icon: Building },
            { id: 'analytics', label: 'CRM Analytics', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                  active
                    ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Global Quick Filters */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads, ref, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Sources</option>
            <option value="website_contact">Web Form</option>
            <option value="website_trial">Online Trial</option>
            <option value="walk_in">Walk-in</option>
            <option value="social">Social / Insta</option>
            <option value="referral">Member Referral</option>
            <option value="corporate">Corporate</option>
          </select>

          <select
            value={interestFilter}
            onChange={(e) => setInterestFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Interests</option>
            <option value="membership">Membership</option>
            <option value="trial">Trial Pass</option>
            <option value="corporate">Corporate SLA</option>
            <option value="coaching">Coaching</option>
          </select>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* VIEW 1: KANBAN PIPELINE */}
      {/* ---------------------------------------------------- */}
      {activeView === 'kanban' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Drag and drop cards between stages or tap to open full lead intelligence drawer.</span>
            <span className="font-semibold text-lime-400">Showing {filteredLeads.length} leads</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 min-h-[600px] overflow-x-auto pb-4">
            {KANBAN_STAGES.map((stage) => {
              const stageLeads = filteredLeads.filter((l) => {
                const s = l.status === 'converted' ? 'won' : l.status;
                return s === stage.id;
              });
              const stageValue = stageLeads.reduce((acc, l) => acc + estimateLeadValue(l), 0);

              return (
                <div
                  key={stage.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                  className={`rounded-2xl bg-slate-900/80 border ${stage.borderColor} flex flex-col min-w-[240px] md:min-w-0 shadow-lg`}
                >
                  {/* Stage Header */}
                  <div className={`p-3 rounded-t-2xl ${stage.bg} border-b ${stage.borderColor} flex items-center justify-between`}>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${stage.color.replace('text-', 'bg-')}`} />
                        <span className={`font-bold text-xs uppercase tracking-wider ${stage.color}`}>
                          {stage.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {formatINR(stageValue)}
                      </span>
                    </div>
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 text-[11px] font-bold flex items-center justify-center">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Stage Lead Cards Container */}
                  <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[620px]">
                    {stageLeads.length === 0 ? (
                      <div className="h-28 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-[11px] text-slate-500">
                        Drop leads here
                      </div>
                    ) : (
                      stageLeads.map((lead) => {
                        const isOverdue = lead.followUpDate && lead.followUpDate < todayStr && lead.status !== 'won' && lead.status !== 'lost';
                        return (
                          <div
                            key={lead.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, lead.id)}
                            onClick={() => setSelectedLeadId(lead.id)}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-lime-400/50 cursor-grab active:cursor-grabbing hover:shadow-md transition space-y-2.5 group"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <span className="font-semibold text-xs text-white group-hover:text-lime-300 transition block">
                                  {lead.fullName}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {lead.referenceNumber || `#${lead.id.slice(-4)}`}
                                </span>
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${getTierBadgeClass(lead.interestedTier)}`}>
                                {lead.interestedTier}
                              </span>
                            </div>

                            {lead.companyName && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                                <Building className="w-3 h-3 text-slate-500 shrink-0" />
                                <span>{lead.companyName}</span>
                              </div>
                            )}

                            {/* Sports badges */}
                            <div className="flex flex-wrap gap-1">
                              {lead.sportInterest.map((s) => (
                                <span key={s} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 capitalize border border-slate-800">
                                  {s}
                                </span>
                              ))}
                            </div>

                            {/* Value & Follow-up */}
                            <div className="pt-1.5 border-t border-slate-900 flex items-center justify-between text-[10px]">
                              <span className="font-semibold text-lime-400">
                                {formatINR(estimateLeadValue(lead))}
                              </span>

                              {lead.followUpDate && (
                                <span className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
                                  <Clock className="w-3 h-3" />
                                  <span>{lead.followUpDate}</span>
                                </span>
                              )}
                            </div>

                            {/* Lost Reason if lost */}
                            {lead.status === 'lost' && lead.lostReason && (
                              <div className="text-[10px] text-rose-300 bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20 truncate">
                                <strong>Reason:</strong> {lead.lostReason}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 2: LEADS INBOX / TABLE */}
      {/* ---------------------------------------------------- */}
      {activeView === 'inbox' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase">
                  <th className="py-3.5 px-4">Ref & Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Source & Interest</th>
                  <th className="py-3.5 px-4">Target Tier</th>
                  <th className="py-3.5 px-4">Est. Value</th>
                  <th className="py-3.5 px-4">Follow-Up</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLeads.map((lead) => {
                  const isOverdue = lead.followUpDate && lead.followUpDate < todayStr && lead.status !== 'won' && lead.status !== 'lost';
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className="hover:bg-slate-800/40 cursor-pointer transition"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{lead.fullName}</span>
                          {lead.status === 'won' && <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {lead.referenceNumber || `#${lead.id.slice(-4)}`} {lead.companyName ? `• ${lead.companyName}` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-200">{lead.phone}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">{lead.email}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="capitalize text-slate-300 font-medium">{lead.interest || 'Membership'}</div>
                        <div className="text-[10px] text-slate-500">{LEAD_SOURCE_LABELS[lead.source] || lead.source}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getTierBadgeClass(lead.interestedTier)}`}>
                          {lead.interestedTier}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-lime-400">
                        {formatINR(estimateLeadValue(lead))}
                      </td>

                      <td className="py-3 px-4">
                        {lead.followUpDate ? (
                          <span className={`font-medium ${isOverdue ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                            {lead.followUpDate} {isOverdue && '(Overdue)'}
                          </span>
                        ) : (
                          <span className="text-slate-500">None</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase bg-slate-950 border border-slate-700 text-slate-200">
                          {lead.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedLeadId(lead.id);
                              setIsInteractionLogModalOpen('call');
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="Log Phone Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLeadId(lead.id);
                              setIsInteractionLogModalOpen('whatsapp');
                            }}
                            className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition"
                            title="Send WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenQuoteModalForLead(lead)}
                            className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition"
                            title="Generate Quote"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 3: QUOTE BUILDER & QUOTATION HUB */}
      {/* ---------------------------------------------------- */}
      {activeView === 'quotes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Quotation & Proposal Hub</h3>
              <p className="text-xs text-slate-400">
                Track formal price quotes, validity periods, and convert approved quotes into active memberships or corporate SLAs.
              </p>
            </div>
            <button
              onClick={() => {
                setQuoteForm({
                  leadId: '',
                  clientName: '',
                  clientEmail: '',
                  clientPhone: '',
                  companyName: '',
                  packageType: 'membership_gold',
                  tierProposed: 'gold',
                  tenureMonths: 12,
                  baseAmount: 49999,
                  discountType: 'percentage',
                  discountVal: 0,
                  validityDays: 14,
                  notes: 'Official Champions Club Membership Quotation.',
                });
                setIsQuoteBuilderModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>New Quotation</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quotes.map((quote) => (
              <div key={quote.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs text-amber-400 font-bold block">{quote.quoteNumber}</span>
                      <h4 className="font-semibold text-white text-sm">{quote.clientName}</h4>
                      {quote.companyName && <span className="text-[11px] text-slate-400 block">{quote.companyName}</span>}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      quote.status === 'accepted' ? 'bg-lime-500/20 text-lime-300' :
                      quote.status === 'sent' ? 'bg-sky-500/20 text-sky-300' :
                      quote.status === 'declined' ? 'bg-rose-500/20 text-rose-300' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {quote.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Tenure:</span>
                      <span className="text-slate-200 font-medium">{quote.tenureMonths} Months</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Base Plan:</span>
                      <span className="text-slate-200">{formatINR(quote.baseAmount)}</span>
                    </div>
                    {quote.discountAmount > 0 && (
                      <div className="flex justify-between text-lime-400">
                        <span>Discount:</span>
                        <span>-{formatINR(quote.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400">
                      <span>GST (18%):</span>
                      <span>{formatINR(quote.gstAmount)}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                      <span>Grand Total:</span>
                      <span className="text-lime-400">{formatINR(quote.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Valid until: <strong>{quote.validUntil}</strong></span>
                    {quote.sentVia && <span className="capitalize text-slate-500">Sent via {quote.sentVia}</span>}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  {quote.status === 'sent' && (
                    <>
                      <button
                        onClick={() => updateQuoteStatus(quote.id, 'accepted')}
                        className="flex-1 py-1.5 rounded-lg bg-lime-400/20 hover:bg-lime-400/30 text-lime-300 font-bold text-xs transition"
                      >
                        Accept Quote
                      </button>
                      <button
                        onClick={() => updateQuoteStatus(quote.id, 'declined')}
                        className="py-1.5 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs transition"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {quote.status === 'accepted' && (
                    <span className="w-full py-1.5 rounded-lg bg-lime-500/10 text-lime-400 text-xs text-center font-bold">
                      Accepted • Ready for Invoicing
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 4: CORPORATE & BUSINESS CLIENTS */}
      {/* ---------------------------------------------------- */}
      {activeView === 'corporate' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Business Client Master</h3>
              <p className="text-xs text-slate-400">
                Corporate retainers, inter-company tournaments, and allocated corporate member passes with GST invoicing.
              </p>
            </div>
            <button
              onClick={() => {
                setConvertCorpForm({
                  companyName: '',
                  contactPerson: '',
                  email: '',
                  phone: '',
                  gstNumber: '29AAACT0000A1Z5',
                  panNumber: 'AAACT0000A',
                  address: 'Outer Ring Road, Bengaluru',
                  creditTerms: 'net_30',
                  contractValue: 180000,
                  packageType: 'Corporate Wellness & Multi-Sport League Retainer',
                  allocatedPasses: 20,
                  notes: '',
                });
                setIsConvertToCorpModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Corporate Client</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businessClients.map((biz) => (
              <div key={biz.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs text-lime-400 font-bold">{biz.clientCode}</span>
                    <h4 className="font-heading font-bold text-lg text-white">{biz.companyName}</h4>
                    <span className="text-xs text-slate-400">{biz.contactPerson}</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-lime-400/20 text-lime-300 font-bold uppercase">
                    {biz.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-500 block">GSTIN / PAN</span>
                    <span className="font-mono text-slate-200 font-medium">{biz.gstNumber || 'N/A'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-500 block">Credit Terms</span>
                    <span className="uppercase text-amber-400 font-bold">{biz.creditTerms.replace('_', '-')}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-500 block">Contract Value</span>
                    <span className="font-bold text-lime-400">{formatINR(biz.contractValue)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-500 block">Allocated Passes</span>
                    <span className="text-white font-bold">{biz.allocatedPasses || 20} Corporate Members</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="text-lime-400 font-semibold block">SLA Package:</span>
                  <span>{biz.packageType}</span>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800">
                  <span>Contact: {biz.phone} • {biz.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 5: CRM ANALYTICS & INTELLIGENCE */}
      {/* ---------------------------------------------------- */}
      {activeView === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Funnel */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-lime-400" />
                <span>Conversion Stage Velocity</span>
              </h3>
              <div className="space-y-3">
                {KANBAN_STAGES.map((stage) => {
                  const count = metrics.stageCounts[stage.id] || 0;
                  const pct = metrics.totalLeads > 0 ? Math.round((count / metrics.totalLeads) * 100) : 0;
                  return (
                    <div key={stage.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className={`font-semibold ${stage.color}`}>{stage.label}</span>
                        <span className="text-slate-300">{count} leads ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${stage.color.replace('text-', 'bg-')}`}
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Source ROI Performance */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Channel & Acquisition Source ROI</span>
              </h3>
              <div className="space-y-3">
                {metrics.sourcePerformance.map((src) => (
                  <div key={src.source} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white block">{src.label}</span>
                      <span className="text-[11px] text-slate-400">{src.totalLeads} enquiries • {src.wonLeads} converted</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lime-400 block">{src.conversionRate}% Win Rate</span>
                      <span className="text-[10px] text-slate-500">{formatINR(src.totalValue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* LEAD DETAIL DRAWER (SLIDE-OVER) */}
      {/* ---------------------------------------------------- */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in slide-in-from-right">
            {/* Drawer Top */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-lime-400">
                    {selectedLead.referenceNumber || `#${selectedLead.id}`}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getTierBadgeClass(selectedLead.interestedTier)}`}>
                    {selectedLead.interestedTier}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-800 text-slate-200">
                    {selectedLead.status.replace('_', ' ')}
                  </span>
                </div>
                <h2 className="font-heading font-extrabold text-2xl text-white mt-1">
                  {selectedLead.fullName}
                </h2>
                {selectedLead.companyName && (
                  <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedLead.companyName}</span>
                  </span>
                )}
              </div>

              <button
                onClick={() => setSelectedLeadId(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Interaction Bar */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Quick Outreach & Interaction Logging
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setIsInteractionLogModalOpen('call')}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-lime-400 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>Log Call</span>
                </button>
                <button
                  onClick={() => setIsInteractionLogModalOpen('whatsapp')}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-400 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => setIsInteractionLogModalOpen('email')}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            {/* Key Lead Information */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                <span className="text-slate-500 block">Phone</span>
                <span className="text-slate-200 font-medium">{selectedLead.phone}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                <span className="text-slate-500 block">Email</span>
                <span className="text-slate-200 font-medium truncate block">{selectedLead.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                <span className="text-slate-500 block">Source</span>
                <span className="text-slate-200">{LEAD_SOURCE_LABELS[selectedLead.source] || selectedLead.source}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                <span className="text-slate-500 block">Estimated Pipeline Value</span>
                <span className="font-bold text-lime-400">{formatINR(estimateLeadValue(selectedLead))}</span>
              </div>
            </div>

            {/* Stage Transition Selector */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <label className="font-semibold text-slate-300 block">Change Pipeline Stage:</label>
              <div className="flex flex-wrap gap-1.5">
                {KANBAN_STAGES.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      if (st.id === 'lost') {
                        setLostForm({ leadId: selectedLead.id, reason: LOST_REASON_OPTIONS[0], notes: '' });
                        setIsMarkLostModalOpen(true);
                      } else {
                        updateLeadStatus(selectedLead.id, st.id);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      selectedLead.status === st.id
                        ? `${st.bg} ${st.borderColor} ${st.color}`
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lead Conversion Buttons */}
            {selectedLead.status !== 'won' && (
              <div className="p-4 rounded-2xl bg-lime-400/10 border border-lime-400/30 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-lime-300 block">
                  Close & Convert Lead
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenConvertMember(selectedLead)}
                    className="p-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-lime-400/20"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Convert to Member</span>
                  </button>
                  <button
                    onClick={() => handleOpenConvertCorp(selectedLead)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition"
                  >
                    <Building className="w-4 h-4 text-lime-400" />
                    <span>Convert to Corp SLA</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tasks & Follow-up Reminders */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">
                  Follow-up Tasks & Reminders
                </h4>
                {selectedLead.followUpDate && (
                  <span className="text-[11px] text-slate-400">
                    Next Due: <strong className="text-slate-200">{selectedLead.followUpDate}</strong>
                  </span>
                )}
              </div>

              {/* Task Checklist */}
              <div className="space-y-1.5">
                {(selectedLead.tasks || []).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleLeadTask(selectedLead.id, t.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      t.completed
                        ? 'bg-slate-950/40 border-slate-800 text-slate-500 line-through'
                        : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${t.completed ? 'bg-lime-400 border-lime-400 text-slate-950' : 'border-slate-700'}`}>
                        {t.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs">{t.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Due: {t.dueDate}</span>
                  </div>
                ))}

                <form onSubmit={handleAddQuickTask} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="New reminder task..."
                    value={newTaskInput.title}
                    onChange={(e) => setNewTaskInput({ ...newTaskInput, title: e.target.value })}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                  />
                  <input
                    type="date"
                    value={newTaskInput.dueDate}
                    onChange={(e) => setNewTaskInput({ ...newTaskInput, dueDate: e.target.value })}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
                  />
                  <button type="submit" className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold">
                    Add
                  </button>
                </form>
              </div>
            </div>

            {/* Interaction History & Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">
                Interaction Timeline & Activity Logs
              </h4>

              <form onSubmit={handleAddQuickNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a staff note and press Enter..."
                  value={newNoteInput}
                  onChange={(e) => setNewNoteInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
                <button type="submit" className="px-4 py-2 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs hover:bg-lime-300 transition">
                  Log
                </button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(selectedLead.activities || []).map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-lime-400 capitalize">{act.type.replace('_', ' ')}</span>
                      <span>{formatDateTime(act.timestamp)} by {act.authorName}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{act.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: MANUAL LEAD ENTRY */}
      {/* ---------------------------------------------------- */}
      {isManualLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-extrabold text-xl text-white">Manual Lead Entry</h3>
              <button onClick={() => setIsManualLeadModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualLead} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={manualLeadForm.fullName}
                    onChange={(e) => setManualLeadForm({ ...manualLeadForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number *</label>
                  <input
                    required
                    type="tel"
                    value={manualLeadForm.phone}
                    onChange={(e) => setManualLeadForm({ ...manualLeadForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={manualLeadForm.email}
                    onChange={(e) => setManualLeadForm({ ...manualLeadForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Company (Optional)</label>
                  <input
                    type="text"
                    value={manualLeadForm.companyName}
                    onChange={(e) => setManualLeadForm({ ...manualLeadForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Lead Source</label>
                  <select
                    value={manualLeadForm.source}
                    onChange={(e) => setManualLeadForm({ ...manualLeadForm, source: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                  >
                    <option value="walk_in">Reception Walk-In</option>
                    <option value="phone">Phone Concierge</option>
                    <option value="social">Social Media / Instagram</option>
                    <option value="referral">Member Referral</option>
                    <option value="corporate">Corporate Outreach</option>
                    <option value="website_trial">Website Trial Pass</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Primary Interest</label>
                  <select
                    value={manualLeadForm.interest}
                    onChange={(e) => setManualLeadForm({ ...manualLeadForm, interest: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                  >
                    <option value="membership">Club Membership</option>
                    <option value="trial">VIP Trial Pass</option>
                    <option value="corporate">Corporate SLA</option>
                    <option value="coaching">Coaching Academy</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Interested Tier</label>
                  <select
                    value={manualLeadForm.interestedTier}
                    onChange={(e) => setManualLeadForm({ ...manualLeadForm, interestedTier: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                  >
                    <option value="gold">Gold Championship</option>
                    <option value="silver">Silver Club</option>
                    <option value="junior">Junior Academy</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Follow-up Due Date</label>
                  <input
                    type="date"
                    value={manualLeadForm.followUpDate}
                    onChange={(e) => setManualLeadForm({ ...manualLeadForm, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Initial Notes</label>
                <textarea
                  rows={2}
                  value={manualLeadForm.notes}
                  onChange={(e) => setManualLeadForm({ ...manualLeadForm, notes: e.target.value })}
                  placeholder="Customer requirements, preferred slots, coach preference..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualLeadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: QUOTE BUILDER & PREVIEW */}
      {/* ---------------------------------------------------- */}
      {isQuoteBuilderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-2xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-heading font-extrabold text-xl text-white">Quotation & Proposal Builder</h3>
                <span className="text-xs text-slate-400">Generate a branded quotation with instant tax calculations</span>
              </div>
              <button onClick={() => setIsQuoteBuilderModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateQuote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Recipient Name *</label>
                  <input
                    required
                    type="text"
                    value={quoteForm.clientName}
                    onChange={(e) => setQuoteForm({ ...quoteForm, clientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Recipient Email *</label>
                  <input
                    required
                    type="email"
                    value={quoteForm.clientEmail}
                    onChange={(e) => setQuoteForm({ ...quoteForm, clientEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Package Structure</label>
                  <select
                    value={quoteForm.packageType}
                    onChange={(e) => {
                      const pkg = e.target.value;
                      const base = pkg === 'corporate_wellness' ? 120000 : pkg === 'membership_gold' ? 49999 : pkg === 'membership_silver' ? 29999 : 19999;
                      setQuoteForm({ ...quoteForm, packageType: pkg as any, baseAmount: base });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                  >
                    <option value="membership_gold">Gold Championship</option>
                    <option value="membership_silver">Silver Club</option>
                    <option value="membership_junior">Junior Academy</option>
                    <option value="corporate_wellness">Corporate Wellness Retainer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Base Price (₹) *</label>
                  <input
                    required
                    type="number"
                    value={quoteForm.baseAmount}
                    onChange={(e) => setQuoteForm({ ...quoteForm, baseAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={quoteForm.discountVal}
                    onChange={(e) => setQuoteForm({ ...quoteForm, discountVal: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Quotation Summary Box */}
              {(() => {
                const totals = calculateQuoteTotals(quoteForm.baseAmount, quoteForm.discountType, quoteForm.discountVal, 18);
                return (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider block">Financial Summary</span>
                    <div className="flex justify-between text-slate-300">
                      <span>Base Subscription:</span>
                      <span>{formatINR(totals.baseAmount)}</span>
                    </div>
                    {totals.discountAmount > 0 && (
                      <div className="flex justify-between text-lime-400">
                        <span>Discount Savings:</span>
                        <span>-{formatINR(totals.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400">
                      <span>GST (18%):</span>
                      <span>{formatINR(totals.gstAmount)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-base text-white">
                      <span>Grand Total Payable:</span>
                      <span className="text-lime-400 font-heading">{formatINR(totals.totalAmount)}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuoteBuilderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition"
                >
                  Issue & Send Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: CONVERT LEAD TO MEMBER */}
      {/* ---------------------------------------------------- */}
      {isConvertToMemberModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-extrabold text-xl text-white">Convert to Club Member</h3>
              <button onClick={() => setIsConvertToMemberModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="text-slate-500 block">Candidate:</span>
              <strong className="text-white text-sm block">{selectedLead.fullName}</strong>
              <span>{selectedLead.phone} • {selectedLead.email}</span>
            </div>

            <form onSubmit={handleExecuteConvertMember} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Select Tier</label>
                <select
                  value={convertMemberForm.tier}
                  onChange={(e) => {
                    const t = e.target.value as MembershipTier;
                    const base = t === 'gold' ? 49999 : t === 'silver' ? 29999 : 19999;
                    setConvertMemberForm({ ...convertMemberForm, tier: t, paymentAmount: Math.round(base * 1.18) });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                >
                  <option value="gold">Gold Championship</option>
                  <option value="silver">Silver Club</option>
                  <option value="junior">Junior Academy</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Billing Cycle</label>
                <select
                  value={convertMemberForm.billingCycle}
                  onChange={(e) => setConvertMemberForm({ ...convertMemberForm, billingCycle: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                >
                  <option value="annual">Annual (12 Months)</option>
                  <option value="quarterly">Quarterly (3 Months)</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Payment Method</label>
                <select
                  value={convertMemberForm.paymentMethod}
                  onChange={(e) => setConvertMemberForm({ ...convertMemberForm, paymentMethod: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                >
                  <option value="upi">UPI / Dynamic QR</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="cash">Cash at Reception</option>
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Invoice Payable:</span>
                <span className="font-heading font-bold text-lg text-lime-400">{formatINR(convertMemberForm.paymentAmount)}</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConvertToMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition"
                >
                  Register & Mark Won
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 4: CONVERT TO CORPORATE BUSINESS CLIENT */}
      {/* ---------------------------------------------------- */}
      {isConvertToCorpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-heading font-extrabold text-xl text-white">Corporate SLA Registration</h3>
                <span className="text-xs text-slate-400">Establish company master account with GST credit terms</span>
              </div>
              <button onClick={() => setIsConvertToCorpModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteConvertCorp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Company Legal Entity *</label>
                <input
                  required
                  type="text"
                  value={convertCorpForm.companyName}
                  onChange={(e) => setConvertCorpForm({ ...convertCorpForm, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Authorized Contact *</label>
                  <input
                    required
                    type="text"
                    value={convertCorpForm.contactPerson}
                    onChange={(e) => setConvertCorpForm({ ...convertCorpForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">GST Number</label>
                  <input
                    type="text"
                    value={convertCorpForm.gstNumber}
                    onChange={(e) => setConvertCorpForm({ ...convertCorpForm, gstNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Credit Terms</label>
                  <select
                    value={convertCorpForm.creditTerms}
                    onChange={(e) => setConvertCorpForm({ ...convertCorpForm, creditTerms: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                  >
                    <option value="net_30">Net-30 Days</option>
                    <option value="net_15">Net-15 Days</option>
                    <option value="net_60">Net-60 Days</option>
                    <option value="prepaid">Prepaid Retainer</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Contract Value (₹)</label>
                  <input
                    required
                    type="number"
                    value={convertCorpForm.contractValue}
                    onChange={(e) => setConvertCorpForm({ ...convertCorpForm, contractValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Allocated Passes / Capacity</label>
                <input
                  type="number"
                  value={convertCorpForm.allocatedPasses}
                  onChange={(e) => setConvertCorpForm({ ...convertCorpForm, allocatedPasses: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConvertToCorpModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition"
                >
                  Save Business Client & Mark Won
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 5: MARK LOST LEAD */}
      {/* ---------------------------------------------------- */}
      {isMarkLostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-heading font-bold text-lg text-white text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Mark Lead as Lost</span>
              </h3>
              <button onClick={() => setIsMarkLostModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteLost} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Primary Reason for Loss *</label>
                <select
                  value={lostForm.reason}
                  onChange={(e) => setLostForm({ ...lostForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                >
                  {LOST_REASON_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Additional Notes</label>
                <textarea
                  rows={3}
                  value={lostForm.notes}
                  onChange={(e) => setLostForm({ ...lostForm, notes: e.target.value })}
                  placeholder="Feedback, competitor chosen, or pricing objection details..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMarkLostModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition"
                >
                  Confirm Loss
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 6: LOG OUTREACH / CALL / WHATSAPP / EMAIL */}
      {/* ---------------------------------------------------- */}
      {isInteractionLogModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-extrabold text-xl text-white capitalize">
                Log {isInteractionLogModalOpen} with {selectedLead.fullName}
              </h3>
              <button onClick={() => setIsInteractionLogModalOpen(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {isInteractionLogModalOpen === 'call' && (
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Call Outcome</label>
                  <select
                    value={interactionForm.callOutcome}
                    onChange={(e) => setInteractionForm({ ...interactionForm, callOutcome: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Spoke with prospective member - positive interest">Spoke - Positive Interest</option>
                    <option value="Trial session scheduled">Trial Session Scheduled</option>
                    <option value="Requested quote sent via email">Requested Formal Quote</option>
                    <option value="Left voicemail / Busy - call back scheduled">Left Voicemail / Busy</option>
                    <option value="Not interested currently">Not Interested</option>
                  </select>
                </div>
              )}

              {isInteractionLogModalOpen === 'whatsapp' && (
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">WhatsApp Message Template</label>
                  <textarea
                    rows={3}
                    value={interactionForm.whatsappMessage}
                    onChange={(e) => setInteractionForm({ ...interactionForm, whatsappMessage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              )}

              {isInteractionLogModalOpen === 'email' && (
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Email Subject</label>
                  <input
                    type="text"
                    value={interactionForm.emailSubject}
                    onChange={(e) => setInteractionForm({ ...interactionForm, emailSubject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Staff Observation Notes</label>
                <textarea
                  rows={3}
                  value={interactionForm.notes}
                  onChange={(e) => setInteractionForm({ ...interactionForm, notes: e.target.value })}
                  placeholder="Record specifics from the conversation..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInteractionLogModalOpen(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogInteraction}
                  className="px-6 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold transition"
                >
                  Save & Log to Timeline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
