import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store';
import { 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  PieChart, 
  Calendar, 
  Filter, 
  Download, 
  Share2, 
  Plus, 
  Check, 
  Clock, 
  AlertTriangle, 
  CreditCard, 
  Printer, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Send,
  Building,
  RefreshCw
} from 'lucide-react';
import { formatINR, formatDateTime, formatDate } from '../../lib/formatters';
import { 
  buildUnifiedLedger, 
  calculatePLReport, 
  calculateGstTaxSummary, 
  calculateAgingReport,
  calculateCourtOccupancy,
  exportToCSV
} from '../../lib/finance';
import { Invoice, Expense, UnifiedLedgerEntry, InvoiceStatus, Payment } from '../../types';
import { InvoicePrintModal } from '../../components/InvoicePrintModal';
import { TransactionDrilldownModal } from '../../components/TransactionDrilldownModal';
import { ShareReportModal } from '../../components/ShareReportModal';

export const StaffFinancePage: React.FC = () => {
  const { 
    invoices, 
    creditNotes, 
    payments, 
    expenses, 
    bookings, 
    orders, 
    tabs, 
    members, 
    products, 
    courts, 
    businessClients, 
    settings,
    createInvoice,
    updateInvoiceStatus,
    recordInvoicePayment,
    issueCreditNote,
    sendInvoiceReminder,
    addExpense,
    markExpensePaid,
    deleteExpense
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'ledger' | 'invoices' | 'expenses' | 'taxes' | 'reports'>('ledger');
  
  // Modals state
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [selectedLedgerEntry, setSelectedLedgerEntry] = useState<UnifiedLedgerEntry | null>(null);
  const [shareReportData, setShareReportData] = useState<{ title: string; subtitle?: string; summaryText: string; exportData?: any[] } | null>(null);

  // Invoicing Modals
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<Invoice | null>(null);
  const [showCreditNoteModal, setShowCreditNoteModal] = useState<Invoice | null>(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // Filters for Ledger
  const [ledgerStreamFilter, setLedgerStreamFilter] = useState<string>('all');
  const [ledgerMethodFilter, setLedgerMethodFilter] = useState<string>('all');
  const [ledgerSearch, setLedgerSearch] = useState<string>('');
  const [ledgerDateRange, setLedgerDateRange] = useState<'all' | 'today' | '7days' | 'month' | '3months'>('all');

  // Invoices filter
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('all');
  const [invoiceSearch, setInvoiceSearch] = useState<string>('');

  // Expenses filter
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');
  const [expenseStatusFilter, setExpenseStatusFilter] = useState<string>('all');

  // Reports state
  const [selectedReport, setSelectedReport] = useState<'pnl' | 'stream' | 'payment_method' | 'member_revenue' | 'court_util' | 'inventory_val' | 'bar_closing' | 'aging' | 'tax_summary'>('pnl');
  const [reportPeriod, setReportPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  // Computed Unified Ledger
  const rawLedger = useMemo(() => {
    return buildUnifiedLedger(bookings, orders, tabs, invoices, payments);
  }, [bookings, orders, tabs, invoices, payments]);

  const filteredLedger = useMemo(() => {
    const now = new Date().getTime();
    return rawLedger.filter((entry) => {
      if (ledgerStreamFilter !== 'all' && entry.stream !== ledgerStreamFilter) return false;
      if (ledgerMethodFilter !== 'all' && !entry.paymentMethod.toLowerCase().includes(ledgerMethodFilter.toLowerCase())) return false;
      if (ledgerSearch) {
        const query = ledgerSearch.toLowerCase();
        const matchesRef = entry.transactionRef.toLowerCase().includes(query);
        const matchesCust = entry.customerName.toLowerCase().includes(query);
        const matchesDesc = entry.description.toLowerCase().includes(query);
        const matchesStaff = entry.staffName.toLowerCase().includes(query);
        if (!matchesRef && !matchesCust && !matchesDesc && !matchesStaff) return false;
      }
      if (ledgerDateRange !== 'all') {
        const entryTime = new Date(entry.timestamp).getTime();
        const daysAgo = (now - entryTime) / (1000 * 60 * 60 * 24);
        if (ledgerDateRange === 'today' && daysAgo > 1) return false;
        if (ledgerDateRange === '7days' && daysAgo > 7) return false;
        if (ledgerDateRange === 'month' && daysAgo > 30) return false;
        if (ledgerDateRange === '3months' && daysAgo > 90) return false;
      }
      return true;
    });
  }, [rawLedger, ledgerStreamFilter, ledgerMethodFilter, ledgerSearch, ledgerDateRange]);

  const ledgerTotalGross = useMemo(() => filteredLedger.reduce((sum, item) => sum + item.grossAmount, 0), [filteredLedger]);
  const ledgerTotalGst = useMemo(() => filteredLedger.reduce((sum, item) => sum + item.gstAmount, 0), [filteredLedger]);
  const ledgerTotalNet = useMemo(() => filteredLedger.reduce((sum, item) => sum + item.netAmount, 0), [filteredLedger]);

  // Aging Analysis
  const agingData = useMemo(() => {
    return calculateAgingReport(invoices, expenses);
  }, [invoices, expenses]);

  // Tax Summary
  const gstSummary = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return calculateGstTaxSummary(threeMonthsAgo, today, invoices, expenses);
  }, [invoices, expenses]);

  // P&L Statement
  const pnlData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const startPeriod = reportPeriod === 'month' 
      ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : reportPeriod === 'quarter'
      ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return calculatePLReport(startPeriod, today, invoices, expenses);
  }, [reportPeriod, invoices, expenses]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (invoiceStatusFilter !== 'all' && inv.status !== invoiceStatusFilter) return false;
      if (invoiceSearch) {
        const query = invoiceSearch.toLowerCase();
        const matchesNum = inv.invoiceNumber.toLowerCase().includes(query);
        const matchesName = inv.recipientName.toLowerCase().includes(query);
        const matchesEmail = inv.recipientEmail.toLowerCase().includes(query);
        if (!matchesNum && !matchesName && !matchesEmail) return false;
      }
      return true;
    });
  }, [invoices, invoiceStatusFilter, invoiceSearch]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      if (expenseCategoryFilter !== 'all' && exp.category !== expenseCategoryFilter) return false;
      if (expenseStatusFilter !== 'all' && (exp.status || 'paid') !== expenseStatusFilter) return false;
      return true;
    });
  }, [expenses, expenseCategoryFilter, expenseStatusFilter]);

  // Form states for modals
  const [newInvoiceForm, setNewInvoiceForm] = useState({
    businessClientId: '',
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    recipientGst: '',
    recipientAddress: '',
    category: 'membership' as Invoice['category'],
    stream: 'membership' as Invoice['stream'],
    itemDesc: 'Corporate Multi-Sport Passes (Q4 Package)',
    quantity: 1,
    unitRate: 150000,
    gstRate: 0.18,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Payment terms: Net-30 from receipt of tax invoice.',
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'upi' as Payment['method'],
    transactionRef: '',
    purpose: '',
  });

  const [creditNoteForm, setCreditNoteForm] = useState({
    amount: 0,
    reason: 'Court session weather cancellation credit adjustment',
  });

  const [newExpenseForm, setNewExpenseForm] = useState({
    title: '',
    vendor: '',
    category: 'court_maintenance' as Expense['category'],
    amount: 0,
    inputGstAmount: 0,
    gstRate: 0.18,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'bank_transfer' as Expense['paymentMethod'],
    approvedBy: 'Arjun Rao (Manager)',
    isRecurring: false,
    recurringInterval: 'monthly' as Expense['recurringInterval'],
    notes: '',
  });

  // Handle Business Client selection
  const handleSelectBusinessClient = (clientId: string) => {
    const client = businessClients.find((c) => c.id === clientId);
    if (client) {
      const subtotal = Math.round(client.contractValue / 1.18);
      setNewInvoiceForm({
        ...newInvoiceForm,
        businessClientId: client.id,
        recipientName: client.companyName,
        recipientEmail: client.email,
        recipientPhone: client.phone,
        recipientGst: client.gstNumber || '',
        recipientAddress: client.address || '',
        itemDesc: `${client.packageType} (${client.companyName} Corporate SLA Retainer)`,
        quantity: 1,
        unitRate: subtotal,
        notes: `Credit Terms: ${client.creditTerms.toUpperCase()}. Corporate Code: ${client.clientCode}`,
      });
    }
  };

  // Submit Invoice
  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = newInvoiceForm.quantity * newInvoiceForm.unitRate;
    const gstAmount = Math.round(subtotal * newInvoiceForm.gstRate);
    const totalAmount = subtotal + gstAmount;

    createInvoice({
      recipientName: newInvoiceForm.recipientName,
      recipientEmail: newInvoiceForm.recipientEmail,
      recipientPhone: newInvoiceForm.recipientPhone,
      recipientGst: newInvoiceForm.recipientGst,
      recipientAddress: newInvoiceForm.recipientAddress,
      category: newInvoiceForm.category,
      stream: newInvoiceForm.stream,
      sourceReference: newInvoiceForm.businessClientId ? `CORP-${Date.now().toString().slice(-4)}` : undefined,
      items: [
        {
          description: newInvoiceForm.itemDesc,
          quantity: newInvoiceForm.quantity,
          rate: newInvoiceForm.unitRate,
          amount: subtotal,
        }
      ],
      subtotal,
      gstRate: newInvoiceForm.gstRate,
      gstAmount,
      totalAmount,
      status: 'sent',
      dueDate: newInvoiceForm.dueDate,
      notes: newInvoiceForm.notes,
    });

    setShowCreateInvoiceModal(false);
  };

  // Submit Record Payment
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentModal) return;
    recordInvoicePayment(
      showPaymentModal.id,
      paymentForm.amount,
      paymentForm.method,
      paymentForm.transactionRef,
      paymentForm.purpose
    );
    setShowPaymentModal(null);
  };

  // Submit Credit Note
  const handleCreditNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCreditNoteModal) return;
    issueCreditNote(showCreditNoteModal.id, creditNoteForm.amount, creditNoteForm.reason);
    setShowCreditNoteModal(null);
  };

  // Submit Add Expense
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputGst = newExpenseForm.inputGstAmount > 0 
      ? newExpenseForm.inputGstAmount 
      : Math.round((newExpenseForm.amount * newExpenseForm.gstRate) / (1 + newExpenseForm.gstRate));

    addExpense({
      title: newExpenseForm.title,
      vendor: newExpenseForm.vendor,
      category: newExpenseForm.category,
      amount: newExpenseForm.amount,
      inputGstAmount: inputGst,
      gstRate: newExpenseForm.gstRate,
      date: new Date().toISOString().split('T')[0],
      dueDate: newExpenseForm.dueDate,
      status: 'pending',
      paymentMethod: newExpenseForm.paymentMethod,
      approvedBy: newExpenseForm.approvedBy,
      isRecurring: newExpenseForm.isRecurring,
      recurringInterval: newExpenseForm.recurringInterval,
      notes: newExpenseForm.notes,
    });
    setShowAddExpenseModal(false);
  };

  // Share report handler
  const triggerShareReport = (title: string, summary: string, data?: any[]) => {
    setShareReportData({
      title,
      summaryText: summary,
      exportData: data,
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400">
            Financial Ledger & Operations Center
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Finance, Ledger & Tax Compliance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            GSTIN: <strong className="text-slate-200">{settings.gstNumber}</strong> • Unified 4-stream reconciliation, automated tax invoicing, vendor payables & P&L.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateInvoiceModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            + Manual / B2B Invoice
          </button>
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            <Plus className="w-3.5 h-3.5 text-rose-400" />
            + Record Expense
          </button>
        </div>
      </div>

      {/* Main KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Revenue Volume</span>
            <TrendingUp className="w-4 h-4 text-lime-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-lime-400">
            {formatINR(Math.round(ledgerTotalGross))}
          </div>
          <div className="text-[11px] text-slate-500">
            Net Taxable: {formatINR(Math.round(ledgerTotalNet))} • {filteredLedger.length} entries
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Net GST Liability (GSTR-3B)</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-amber-400">
            {formatINR(Math.round(gstSummary.netGstPayable))}
          </div>
          <div className="text-[11px] text-slate-500">
            Output: {formatINR(gstSummary.outputTax.totalOutputGst)} | ITC: {formatINR(gstSummary.inputTaxCredit.totalInputGst)}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Accounts Receivable</span>
            <ArrowDownRight className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-white">
            {formatINR(Math.round(agingData.receivables.total))}
          </div>
          <div className="text-[11px] text-slate-500">
            Unpaid / Overdue client invoices
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Vendor Payables (Owed)</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-rose-400">
            {formatINR(Math.round(agingData.payables.total))}
          </div>
          <div className="text-[11px] text-slate-500">
            Due to suppliers, rent & utilities
          </div>
        </div>
      </div>

      {/* Module Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === 'ledger' ? 'bg-lime-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Unified Financial Ledger ({rawLedger.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === 'invoices' ? 'bg-lime-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Invoices & Billing ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === 'expenses' ? 'bg-lime-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Payables & Expenses ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('taxes')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === 'taxes' ? 'bg-lime-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          4. Taxes & GSTR Summary
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            activeTab === 'reports' ? 'bg-lime-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          5. Executive Reports Centre
        </button>
      </div>

      {/* TAB 1: UNIFIED FINANCIAL LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ledger / customer / ref..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 w-48 sm:w-60 text-xs"
                />
              </div>

              {/* Stream Filter */}
              <select
                value={ledgerStreamFilter}
                onChange={(e) => setLedgerStreamFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-lime-400 capitalize"
              >
                <option value="all">All Revenue Streams</option>
                <option value="courts">Courts (Bookings)</option>
                <option value="shop">Pro Shop (Counter & Online)</option>
                <option value="bar_cafe">Bar & Cafeteria</option>
                <option value="membership">Memberships & Corporate</option>
                <option value="coaching">Coaching Academy</option>
              </select>

              {/* Payment Method Filter */}
              <select
                value={ledgerMethodFilter}
                onChange={(e) => setLedgerMethodFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-lime-400"
              >
                <option value="all">All Payment Methods</option>
                <option value="upi">UPI</option>
                <option value="card">Credit / Debit Card</option>
                <option value="cash">Cash Counter</option>
                <option value="netbanking">Netbanking</option>
                <option value="wallet">Club Wallet</option>
              </select>

              {/* Date Filter */}
              <select
                value={ledgerDateRange}
                onChange={(e) => setLedgerDateRange(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-lime-400"
              >
                <option value="all">Full 3-Month Archive</option>
                <option value="today">Today Only</option>
                <option value="7days">Last 7 Days</option>
                <option value="month">Current Month (Oct)</option>
                <option value="3months">Last 90 Days</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToCSV(filteredLedger, `champions_club_ledger_${new Date().toISOString().split('T')[0]}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase">
                    <th className="py-3.5 px-4">Ref # & Date</th>
                    <th className="py-3.5 px-4">Revenue Stream</th>
                    <th className="py-3.5 px-4">Customer / Member</th>
                    <th className="py-3.5 px-4">Transaction Description</th>
                    <th className="py-3.5 px-4 text-right">Taxable Net</th>
                    <th className="py-3.5 px-4 text-right">GST</th>
                    <th className="py-3.5 px-4 text-right">Gross Total</th>
                    <th className="py-3.5 px-4 text-center">Payment Mode</th>
                    <th className="py-3.5 px-4 text-center">Drilldown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLedger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white">{entry.transactionRef}</div>
                        <div className="text-[10px] text-slate-500">{formatDateTime(entry.timestamp)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          entry.stream === 'courts' ? 'bg-sky-500/20 text-sky-400' :
                          entry.stream === 'shop' ? 'bg-amber-500/20 text-amber-400' :
                          entry.stream === 'bar_cafe' ? 'bg-purple-500/20 text-purple-400' :
                          entry.stream === 'coaching' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-lime-500/20 text-lime-400'
                        }`}>
                          {entry.stream.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{entry.customerName}</div>
                        {entry.memberId && <div className="text-[10px] text-slate-500 font-mono">{entry.memberId}</div>}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-300">
                        {entry.description}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {formatINR(entry.netAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-400">
                        {formatINR(entry.gstAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white font-heading">
                        {formatINR(entry.grossAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                          {entry.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedLedgerEntry(entry)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition"
                        >
                          Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES & BILLING */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search invoices by recipient / invoice #..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-lime-400 w-52 sm:w-64 text-xs"
                />
              </div>

              <select
                value={invoiceStatusFilter}
                onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-lime-400"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="sent">Sent / Pending</option>
                <option value="overdue">Overdue</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <button
              onClick={() => setShowCreateInvoiceModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              + Create Corporate / B2B Invoice
            </button>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase">
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Recipient / Company</th>
                    <th className="py-3.5 px-4">Stream</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4 text-right">Taxable</th>
                    <th className="py-3.5 px-4 text-right">GST (18%)</th>
                    <th className="py-3.5 px-4 text-right">Total Invoice</th>
                    <th className="py-3.5 px-4 text-right">Balance Due</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white">{inv.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-500">{formatDate(inv.createdAt)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{inv.recipientName}</div>
                        <div className="text-[10px] text-slate-400">{inv.recipientEmail}</div>
                        {inv.recipientGst && (
                          <div className="text-[10px] font-mono text-lime-400 font-medium">GST: {inv.recipientGst}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-300">
                        {inv.category.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {formatINR(inv.subtotal)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-400">
                        {formatINR(inv.gstAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white font-heading">
                        {formatINR(inv.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                        {formatINR(inv.balanceAmount !== undefined ? inv.balanceAmount : (inv.status === 'paid' ? 0 : inv.totalAmount))}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          inv.status === 'partially_paid' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          inv.status === 'overdue' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {inv.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedInvoiceForPrint(inv)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition"
                            title="Print / Share Official GST Tax Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => {
                                setPaymentForm({
                                  amount: inv.balanceAmount || inv.totalAmount,
                                  method: 'upi',
                                  transactionRef: '',
                                  purpose: `Payment towards ${inv.invoiceNumber}`,
                                });
                                setShowPaymentModal(inv);
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[11px] font-bold transition"
                              title="Record payment towards invoice"
                            >
                              + Pay
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setCreditNoteForm({
                                amount: Math.min(5000, inv.totalAmount),
                                reason: 'Service quality credit note adjustment',
                              });
                              setShowCreditNoteModal(inv);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                            title="Issue Credit Note"
                          >
                            CRN
                          </button>

                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => sendInvoiceReminder(inv.id, 'whatsapp')}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition"
                              title="Send WhatsApp payment reminder"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYABLES & EXPENSES ("What do we owe?") */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {/* Summary Banner for What We Owe */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-rose-950/40 border border-rose-900/50 shadow-xl space-y-1">
              <span className="text-xs text-rose-400 font-semibold uppercase">Total Outstanding Payables</span>
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-rose-300">
                {formatINR(agingData.payables.total)}
              </div>
              <p className="text-[11px] text-slate-400">Total liability owed to suppliers & utilities</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
              <span className="text-xs text-amber-400 font-semibold uppercase">Recurring Monthly Commitments</span>
              <div className="font-heading font-extrabold text-2xl text-white">
                {formatINR(expenses.filter(e => e.isRecurring).reduce((sum, e) => sum + e.amount, 0))}
              </div>
              <p className="text-[11px] text-slate-500">Rent ground lease, salaries & facility power</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
              <span className="text-xs text-emerald-400 font-semibold uppercase">Total ITC on Expenses</span>
              <div className="font-heading font-extrabold text-2xl text-emerald-400">
                {formatINR(Math.round(gstSummary.inputTaxCredit.totalInputGst))}
              </div>
              <p className="text-[11px] text-slate-500">Input Tax Credit eligible for GST set-off</p>
            </div>
          </div>

          {/* Aging Breakdown of Payables */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-bold text-sm text-white">
                Payables Aging Schedule ("What do we owe by due timeline?")
              </h3>
              <span className="text-xs text-slate-400">{expenses.length} total vendor records</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {agingData.payables.buckets.map((b) => (
                <div key={b.range} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">{b.range}</span>
                  <div className="font-heading font-bold text-base text-white">{formatINR(b.amount)}</div>
                  <div className="text-[10px] text-slate-500">{b.count} vendor bills</div>
                </div>
              ))}
            </div>
          </div>

          {/* Expenses Table */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-white">Vendor Bills & Operating Expense Ledger</h3>
              <button
                onClick={() => setShowAddExpenseModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                + Add Vendor Bill
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase">
                    <th className="py-3.5 px-4">Expense #</th>
                    <th className="py-3.5 px-4">Description & Vendor</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-right">Input GST (ITC)</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-300">
                        {exp.expenseNumber}
                        {exp.isRecurring && (
                          <span className="block text-[9px] text-amber-400 font-mono">Recurring ({exp.recurringInterval})</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{exp.title}</div>
                        <div className="text-[10px] text-slate-400">{exp.vendor}</div>
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-300">
                        {exp.category.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {formatDate(exp.dueDate || exp.date)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white font-heading">
                        {formatINR(exp.amount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-400">
                        {formatINR(exp.inputGstAmount || 0)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          exp.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                          exp.status === 'overdue' ? 'bg-rose-500/20 text-rose-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {exp.status || 'paid'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {exp.status !== 'paid' ? (
                          <button
                            onClick={() => markExpensePaid(exp.id, 'bank_transfer')}
                            className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[11px] font-bold transition"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500">Paid {formatDate(exp.paidAt || exp.date)}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TAXES & GSTR SUMMARY */}
      {activeTab === 'taxes' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">
                  GST Compliance Engine • Form GSTR-3B & GSTR-1 Summary
                </span>
                <h3 className="font-heading font-extrabold text-lg text-white mt-0.5">
                  Output Tax vs Input Tax Credit (ITC) Reconciliation
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerShareReport(
                    'GST Tax Compliance & GSTR Summary',
                    `🧾 *Champions Club - GST Return Summary*\n` +
                    `GSTIN: ${settings.gstNumber}\n` +
                    `Total Taxable Turnover: ${formatINR(gstSummary.outputTax.totalTaxable)}\n` +
                    `Total Output Tax Collected: ${formatINR(gstSummary.outputTax.totalOutputGst)}\n` +
                    `Total Input Tax Credit (ITC): ${formatINR(gstSummary.inputTaxCredit.totalInputGst)}\n` +
                    `*Net GST Payable: ${formatINR(gstSummary.netGstPayable)}*\n`
                  )}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share GST Summary
                </button>
              </div>
            </div>

            {/* Output vs Input Tax Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs text-amber-400 font-semibold uppercase">1. Gross Output Tax Collected</span>
                <div className="font-heading font-extrabold text-2xl text-white">
                  {formatINR(gstSummary.outputTax.totalOutputGst)}
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <p>18% Rate Category: {formatINR(gstSummary.outputTax.gst18Percent)}</p>
                  <p>5% F&B Dining Rate: {formatINR(gstSummary.outputTax.gst5Percent)}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs text-emerald-400 font-semibold uppercase">2. Input Tax Credit (ITC)</span>
                <div className="font-heading font-extrabold text-2xl text-emerald-400">
                  - {formatINR(gstSummary.inputTaxCredit.totalInputGst)}
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <p>Eligible Vendor Invoices: {formatINR(gstSummary.inputTaxCredit.itcEligibleExpenses)}</p>
                  <p>Claimed on Power, Inventory & Maintenance</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs text-lime-400 font-semibold uppercase">3. Net GST Cash Liability</span>
                <div className="font-heading font-extrabold text-2xl text-lime-400">
                  {formatINR(gstSummary.netGstPayable)}
                </div>
                <div className="text-[11px] text-slate-400">
                  Payable to GSTN Portal before 20th of current month
                </div>
              </div>
            </div>

            {/* Stream Breakdown Table */}
            <div className="rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase">
                    <th className="py-2.5 px-4">Supply Category / Head</th>
                    <th className="py-2.5 px-4 text-center">Applicable Rate</th>
                    <th className="py-2.5 px-4 text-right">Taxable Turnover</th>
                    <th className="py-2.5 px-4 text-right">CGST</th>
                    <th className="py-2.5 px-4 text-right">SGST</th>
                    <th className="py-2.5 px-4 text-right">Total GST Collected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {gstSummary.streamBreakdown.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20">
                      <td className="py-3 px-4 font-semibold text-white">{row.stream}</td>
                      <td className="py-3 px-4 text-center font-mono text-slate-300">{row.applicableRate}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-200">{formatINR(row.taxableValue)}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">{formatINR(Math.round(row.gstCollected / 2))}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">{formatINR(Math.round(row.gstCollected / 2))}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">{formatINR(row.gstCollected)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS CENTRE */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Subtabs for Reports */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto text-xs">
              <button
                onClick={() => setSelectedReport('pnl')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  selectedReport === 'pnl' ? 'bg-lime-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                P&L Statement
              </button>
              <button
                onClick={() => setSelectedReport('stream')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  selectedReport === 'stream' ? 'bg-lime-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Revenue by Stream
              </button>
              <button
                onClick={() => setSelectedReport('payment_method')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  selectedReport === 'payment_method' ? 'bg-lime-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Payment Methods
              </button>
              <button
                onClick={() => setSelectedReport('member_revenue')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  selectedReport === 'member_revenue' ? 'bg-lime-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Member Lifetime
              </button>
              <button
                onClick={() => setSelectedReport('aging')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  selectedReport === 'aging' ? 'bg-lime-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Receivables Aging
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-lime-400"
              >
                <option value="month">Current Month (Oct 2026)</option>
                <option value="quarter">Last 90 Days</option>
                <option value="year">Full Year (2026)</option>
              </select>

              <button
                onClick={() => triggerShareReport(
                  'Champions Club - Financial Report',
                  `📊 *Financial Performance Summary*\n` +
                  `Gross Revenue: ${formatINR(pnlData.revenue.total)}\n` +
                  `Gross Profit: ${formatINR(pnlData.grossProfit)} (${pnlData.grossMarginPercent}%)\n` +
                  `Operating Expenses: ${formatINR(pnlData.operatingExpenses.total)}\n` +
                  `*Net Operating Profit: ${formatINR(pnlData.netOperatingProfit)} (${pnlData.netMarginPercent}%)*\n`
                )}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share Report
              </button>
            </div>
          </div>

          {/* Report View Body */}
          {selectedReport === 'pnl' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-white">Executive Profit & Loss Statement</h3>
                  <p className="text-xs text-slate-400">Period: {pnlData.periodLabel}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Net Operating Margin</span>
                  <div className="font-heading font-extrabold text-xl text-emerald-400">{pnlData.netMarginPercent}%</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs">
                {/* Revenue Streams Column */}
                <div className="space-y-4">
                  <h4 className="font-heading font-bold text-sm text-lime-400 uppercase tracking-wider">
                    A. Net Revenue Streams
                  </h4>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-300">Court Bookings & Tournaments:</span>
                      <span className="font-mono font-bold text-white">{formatINR(pnlData.revenue.courts)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-300">Pro Shop Merchandise & Racquets:</span>
                      <span className="font-mono font-bold text-white">{formatINR(pnlData.revenue.shop)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-300">Bar, Cafe & Dining Lounge:</span>
                      <span className="font-mono font-bold text-white">{formatINR(pnlData.revenue.bar_cafe)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-300">Membership Dues & Corporate SLA:</span>
                      <span className="font-mono font-bold text-white">{formatINR(pnlData.revenue.membership)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-300">Coaching Academy & Clinics:</span>
                      <span className="font-mono font-bold text-white">{formatINR(pnlData.revenue.coaching)}</span>
                    </div>
                    <div className="flex justify-between pt-2 font-heading font-bold text-sm text-lime-400">
                      <span>Total Net Revenue:</span>
                      <span className="font-mono">{formatINR(pnlData.revenue.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Operating Expenses Column */}
                <div className="space-y-4">
                  <h4 className="font-heading font-bold text-sm text-rose-400 uppercase tracking-wider">
                    B. Operating Expenses (OPEX)
                  </h4>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-300">Staff & Coach Salaries:</span>
                      <span className="font-mono text-slate-200">{formatINR(pnlData.operatingExpenses.staffSalaries)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-300">Arena Electricity & Floodlights:</span>
                      <span className="font-mono text-slate-200">{formatINR(pnlData.operatingExpenses.utilitiesPower)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-300">Complex Ground Lease (Rent):</span>
                      <span className="font-mono text-slate-200">{formatINR(pnlData.operatingExpenses.rentLease)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-300">Digital Marketing & Meta Ads:</span>
                      <span className="font-mono text-slate-200">{formatINR(pnlData.operatingExpenses.marketing)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-300">Licenses, AITA Sanctioning & SaaS:</span>
                      <span className="font-mono text-slate-200">{formatINR(pnlData.operatingExpenses.licensesSoftware)}</span>
                    </div>
                    <div className="flex justify-between pt-2 font-heading font-bold text-sm text-rose-400">
                      <span>Total Operating OPEX:</span>
                      <span className="font-mono">{formatINR(pnlData.operatingExpenses.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Line Card */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Net Operating Profit</span>
                  <div className="font-heading font-extrabold text-2xl sm:text-3xl text-emerald-400">
                    {formatINR(pnlData.netOperatingProfit)}
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>Gross Profit: <strong className="text-white">{formatINR(pnlData.grossProfit)}</strong></p>
                  <p>Operating Margin: <strong className="text-emerald-400">{pnlData.netMarginPercent}%</strong></p>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'stream' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <h3 className="font-heading font-bold text-base text-white">Revenue Split Across 4 Streams</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-sky-400 font-semibold">Courts & Bookings</span>
                  <div className="font-heading font-bold text-lg text-white mt-1">{formatINR(pnlData.revenue.courts)}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-amber-400 font-semibold">Pro Shop Sales</span>
                  <div className="font-heading font-bold text-lg text-white mt-1">{formatINR(pnlData.revenue.shop)}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-purple-400 font-semibold">Bar & Cafeteria</span>
                  <div className="font-heading font-bold text-lg text-white mt-1">{formatINR(pnlData.revenue.bar_cafe)}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-lime-400 font-semibold">Memberships & SLA</span>
                  <div className="font-heading font-bold text-lg text-white mt-1">{formatINR(pnlData.revenue.membership)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Create B2B / Manual Invoice */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="font-heading font-extrabold text-base text-white">Create Manual / Corporate Invoice</h3>
            
            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Select Corporate Client (Optional)</label>
                <select
                  value={newInvoiceForm.businessClientId}
                  onChange={(e) => handleSelectBusinessClient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                >
                  <option value="">-- Manual Individual / Custom Recipient --</option>
                  {businessClients.map((b) => (
                    <option key={b.id} value={b.id}>{b.companyName} ({b.clientCode})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Recipient / Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newInvoiceForm.recipientName}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, recipientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Recipient Email *</label>
                  <input
                    type="email"
                    required
                    value={newInvoiceForm.recipientEmail}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, recipientEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Customer GSTIN (B2B)</label>
                  <input
                    type="text"
                    placeholder="29ABCDE1234F1Z5"
                    value={newInvoiceForm.recipientGst}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, recipientGst: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newInvoiceForm.dueDate}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Item Description</label>
                <input
                  type="text"
                  required
                  value={newInvoiceForm.itemDesc}
                  onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, itemDesc: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newInvoiceForm.quantity}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Unit Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newInvoiceForm.unitRate}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, unitRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">GST Rate</label>
                  <select
                    value={newInvoiceForm.gstRate}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, gstRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                  >
                    <option value={0.18}>18% Standard</option>
                    <option value={0.05}>5% F&B</option>
                    <option value={0}>0% Exempt</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold shadow-md shadow-lime-400/20"
                >
                  Generate Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Payment */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="font-heading font-extrabold text-base text-white">Record Invoice Payment</h3>
            <p className="text-slate-400">Invoice: <strong className="text-white">{showPaymentModal.invoiceNumber}</strong> • Balance Due: <strong className="text-rose-400">{formatINR(showPaymentModal.balanceAmount || showPaymentModal.totalAmount)}</strong></p>

            <form onSubmit={handlePaymentSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Payment Amount Received (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={showPaymentModal.balanceAmount || showPaymentModal.totalAmount}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold font-mono focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Payment Method</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                >
                  <option value="upi">UPI / QR</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="netbanking">Netbanking / Corporate Wire</option>
                  <option value="cash">Cash Counter</option>
                  <option value="wallet">Club Wallet</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Transaction Ref / Cheque No.</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-984410294 or HDFC-CHQ-1049"
                  value={paymentForm.transactionRef}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold"
                >
                  Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Issue Credit Note */}
      {showCreditNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="font-heading font-extrabold text-base text-white">Issue Credit Note Adjustment</h3>
            <p className="text-slate-400">Against Invoice: <strong className="text-white">{showCreditNoteModal.invoiceNumber}</strong></p>

            <form onSubmit={handleCreditNoteSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Credit Note Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={showCreditNoteModal.totalAmount}
                  value={creditNoteForm.amount}
                  onChange={(e) => setCreditNoteForm({ ...creditNoteForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Reason for Credit Note</label>
                <input
                  type="text"
                  required
                  value={creditNoteForm.reason}
                  onChange={(e) => setCreditNoteForm({ ...creditNoteForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreditNoteModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold"
                >
                  Issue Credit Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Add Vendor Expense */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="font-heading font-extrabold text-base text-white">Record Vendor Bill / Operating Expense</h3>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red Clay Rolling or Electricity Dues"
                  value={newExpenseForm.title}
                  onChange={(e) => setNewExpenseForm({ ...newExpenseForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Vendor / Payee *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RedCourt Surfaces LLP"
                    value={newExpenseForm.vendor}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, vendor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Category</label>
                  <select
                    value={newExpenseForm.category}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400 capitalize"
                  >
                    <option value="court_maintenance">Court Maintenance</option>
                    <option value="utilities_power">Utilities & Power</option>
                    <option value="staff_salaries">Staff Salaries</option>
                    <option value="shop_inventory">Shop Inventory</option>
                    <option value="bar_stock">Bar Stock</option>
                    <option value="rent_lease">Ground Rent / Lease</option>
                    <option value="marketing">Marketing & Ads</option>
                    <option value="licenses">Licenses & Sanctioning</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Total Bill Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newExpenseForm.amount}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold font-mono focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newExpenseForm.dueDate}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recExp"
                  checked={newExpenseForm.isRecurring}
                  onChange={(e) => setNewExpenseForm({ ...newExpenseForm, isRecurring: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-lime-400 focus:ring-0"
                />
                <label htmlFor="recExp" className="text-slate-300 text-xs">
                  This is a recurring expense (Rent / Retainer / Utility)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold"
                >
                  Save Bill to Payables
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Print & Share Modal */}
      {selectedInvoiceForPrint && (
        <InvoicePrintModal
          invoice={selectedInvoiceForPrint}
          settings={settings}
          creditNotes={creditNotes}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}

      {/* Transaction Drill-down Modal */}
      {selectedLedgerEntry && (
        <TransactionDrilldownModal
          entry={selectedLedgerEntry}
          onClose={() => setSelectedLedgerEntry(null)}
          onViewInvoice={(invId) => {
            const found = invoices.find((i) => i.id === invId);
            if (found) setSelectedInvoiceForPrint(found);
          }}
        />
      )}

      {/* Share Report Modal */}
      {shareReportData && (
        <ShareReportModal
          title={shareReportData.title}
          subtitle={shareReportData.subtitle}
          summaryText={shareReportData.summaryText}
          onExportCSV={shareReportData.exportData ? () => exportToCSV(shareReportData.exportData!, 'champions_club_report') : undefined}
          onClose={() => setShareReportData(null)}
        />
      )}
    </div>
  );
};
