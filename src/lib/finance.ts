import { 
  Invoice, 
  Payment, 
  Expense, 
  Booking, 
  Order, 
  Tab, 
  Member, 
  Court, 
  UnifiedLedgerEntry, 
  CreditNote,
  Product
} from '../types';

export interface PLStatement {
  periodLabel: string;
  startDate: string;
  endDate: string;
  revenue: {
    courts: number;
    shop: number;
    bar_cafe: number;
    membership: number;
    coaching: number;
    total: number;
  };
  cogsAndDirectExpenses: {
    shopInventoryCost: number;
    barStockCost: number;
    courtMaintenance: number;
    total: number;
  };
  operatingExpenses: {
    staffSalaries: number;
    utilitiesPower: number;
    rentLease: number;
    marketing: number;
    licensesSoftware: number;
    other: number;
    total: number;
  };
  grossProfit: number;
  grossMarginPercent: number;
  netOperatingProfit: number;
  netMarginPercent: number;
}

export interface GstTaxSummary {
  periodLabel: string;
  outputTax: {
    taxable5Percent: number;
    gst5Percent: number;
    taxable18Percent: number;
    gst18Percent: number;
    totalTaxable: number;
    totalOutputGst: number;
  };
  inputTaxCredit: {
    itcEligibleExpenses: number;
    totalInputGst: number;
  };
  netGstPayable: number;
  streamBreakdown: {
    stream: string;
    grossSales: number;
    taxableValue: number;
    gstCollected: number;
    applicableRate: string;
  }[];
}

export interface AgingBucket {
  range: '0-30 days' | '31-60 days' | '61-90 days' | '90+ days';
  amount: number;
  count: number;
  items: {
    id: string;
    reference: string;
    entityName: string;
    amount: number;
    dueDate: string;
    daysOverdue: number;
  }[];
}

export interface AgingReport {
  receivables: {
    total: number;
    buckets: AgingBucket[];
  };
  payables: {
    total: number;
    buckets: AgingBucket[];
  };
}

/**
 * Pure function: Build unified financial ledger combining all 4 revenue streams
 */
export function buildUnifiedLedger(
  bookings: Booking[],
  orders: Order[],
  tabs: Tab[],
  invoices: Invoice[],
  payments: Payment[]
): UnifiedLedgerEntry[] {
  const ledger: UnifiedLedgerEntry[] = [];

  // 1. Invoices (Official Tax Invoices posted across all modules)
  invoices.forEach((inv) => {
    let stream: 'courts' | 'shop' | 'bar_cafe' | 'membership' | 'coaching' = 'membership';
    if (inv.category === 'court_rental') stream = 'courts';
    else if (inv.category === 'pro_shop') stream = 'shop';
    else if (inv.category === 'bar_cafe') stream = 'bar_cafe';
    else if (inv.category === 'coaching_clinic') stream = 'coaching';
    else if (inv.stream) stream = inv.stream;

    ledger.push({
      id: `ledg_inv_${inv.id}`,
      timestamp: inv.paidAt || inv.createdAt,
      transactionRef: inv.invoiceNumber,
      stream,
      type: 'income',
      description: `${inv.items.map((i) => i.description).join(', ')}`,
      customerName: inv.recipientName,
      memberId: inv.memberId,
      grossAmount: inv.totalAmount,
      gstAmount: inv.gstAmount,
      netAmount: inv.subtotal,
      paymentMethod: inv.paymentMethod || 'NETBANKING',
      staffName: inv.staffName || 'System Billing',
      sourceType: 'invoice',
      sourceId: inv.id,
    });
  });

  // 2. Direct Booking Transactions that might not have a separate invoice record
  bookings.forEach((b) => {
    if (b.status === 'confirmed' || b.status === 'completed' || b.status === 'checked_in') {
      const alreadyInLedger = ledger.some((l) => l.sourceId === b.id || l.transactionRef.includes(b.id));
      if (!alreadyInLedger && b.totalPrice > 0) {
        const net = Math.round(b.totalPrice / 1.18);
        const gst = b.totalPrice - net;
        ledger.push({
          id: `ledg_bkg_${b.id}`,
          timestamp: b.createdAt,
          transactionRef: `BKG-${b.id.slice(-6).toUpperCase()}`,
          stream: 'courts',
          type: 'income',
          description: `${b.sport.toUpperCase()} Court Booking (${b.startTime}-${b.endTime})`,
          customerName: b.guestName,
          memberId: b.memberId,
          grossAmount: b.totalPrice,
          gstAmount: gst,
          netAmount: net,
          paymentMethod: (b.paymentMethod || 'plan_included').toUpperCase(),
          staffName: 'Court Reservation Engine',
          sourceType: 'booking',
          sourceId: b.id,
        });
      }
    }
  });

  // Sort chronological descending
  return ledger.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Pure function: Calculate Profit & Loss statement for any date range
 */
export function calculatePLReport(
  startDate: string,
  endDate: string,
  invoices: Invoice[],
  expenses: Expense[]
): PLStatement {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate + 'T23:59:59').getTime();

  // Filter paid/valid invoices within date range
  const periodInvoices = invoices.filter((inv) => {
    if (inv.status === 'void') return false;
    const invTime = new Date(inv.paidAt || inv.createdAt).getTime();
    return invTime >= start && invTime <= end;
  });

  const revenue = {
    courts: 0,
    shop: 0,
    bar_cafe: 0,
    membership: 0,
    coaching: 0,
    total: 0,
  };

  periodInvoices.forEach((inv) => {
    const net = inv.subtotal;
    if (inv.category === 'court_rental') revenue.courts += net;
    else if (inv.category === 'pro_shop') revenue.shop += net;
    else if (inv.category === 'bar_cafe') revenue.bar_cafe += net;
    else if (inv.category === 'coaching_clinic') revenue.coaching += net;
    else revenue.membership += net;
    revenue.total += net;
  });

  // Filter expenses in period
  const periodExpenses = expenses.filter((exp) => {
    const expTime = new Date(exp.date).getTime();
    return expTime >= start && expTime <= end;
  });

  const cogsAndDirect = {
    shopInventoryCost: 0,
    barStockCost: 0,
    courtMaintenance: 0,
    total: 0,
  };

  const opex = {
    staffSalaries: 0,
    utilitiesPower: 0,
    rentLease: 0,
    marketing: 0,
    licensesSoftware: 0,
    other: 0,
    total: 0,
  };

  periodExpenses.forEach((exp) => {
    const amt = exp.amount;
    if (exp.category === 'shop_inventory') cogsAndDirect.shopInventoryCost += amt;
    else if (exp.category === 'bar_stock') cogsAndDirect.barStockCost += amt;
    else if (exp.category === 'court_maintenance') cogsAndDirect.courtMaintenance += amt;
    else if (exp.category === 'staff_salaries') opex.staffSalaries += amt;
    else if (exp.category === 'utilities_power') opex.utilitiesPower += amt;
    else if (exp.category === 'rent_lease') opex.rentLease += amt;
    else if (exp.category === 'marketing') opex.marketing += amt;
    else if (exp.category === 'licenses') opex.licensesSoftware += amt;
    else opex.other += amt;
  });

  cogsAndDirect.total = cogsAndDirect.shopInventoryCost + cogsAndDirect.barStockCost + cogsAndDirect.courtMaintenance;
  opex.total = opex.staffSalaries + opex.utilitiesPower + opex.rentLease + opex.marketing + opex.licensesSoftware + opex.other;

  const grossProfit = revenue.total - cogsAndDirect.total;
  const grossMarginPercent = revenue.total > 0 ? Math.round((grossProfit / revenue.total) * 100) : 0;
  const netOperatingProfit = grossProfit - opex.total;
  const netMarginPercent = revenue.total > 0 ? Math.round((netOperatingProfit / revenue.total) * 100) : 0;

  return {
    periodLabel: `${startDate} to ${endDate}`,
    startDate,
    endDate,
    revenue,
    cogsAndDirectExpenses: cogsAndDirect,
    operatingExpenses: opex,
    grossProfit,
    grossMarginPercent,
    netOperatingProfit,
    netMarginPercent,
  };
}

/**
 * Pure function: Calculate GSTR-style Tax audit
 */
export function calculateGstTaxSummary(
  startDate: string,
  endDate: string,
  invoices: Invoice[],
  expenses: Expense[]
): GstTaxSummary {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate + 'T23:59:59').getTime();

  const periodInvoices = invoices.filter((inv) => {
    if (inv.status === 'void') return false;
    const t = new Date(inv.paidAt || inv.createdAt).getTime();
    return t >= start && t <= end;
  });

  let taxable5 = 0;
  let gst5 = 0;
  let taxable18 = 0;
  let gst18 = 0;

  const streamMap: { [stream: string]: { gross: number; taxable: number; gst: number; rate: string } } = {
    'Memberships (18%)': { gross: 0, taxable: 0, gst: 0, rate: '18%' },
    'Court Rentals (18%)': { gross: 0, taxable: 0, gst: 0, rate: '18%' },
    'Pro Shop Equipment (18%)': { gross: 0, taxable: 0, gst: 0, rate: '18%' },
    'Bar & Cafe Dining (5% / 18%)': { gross: 0, taxable: 0, gst: 0, rate: '5% / 18%' },
    'Coaching Academy (18%)': { gross: 0, taxable: 0, gst: 0, rate: '18%' },
  };

  periodInvoices.forEach((inv) => {
    if (inv.category === 'bar_cafe') {
      // Food at 5%
      taxable5 += inv.subtotal;
      gst5 += inv.gstAmount;
      streamMap['Bar & Cafe Dining (5% / 18%)'].gross += inv.totalAmount;
      streamMap['Bar & Cafe Dining (5% / 18%)'].taxable += inv.subtotal;
      streamMap['Bar & Cafe Dining (5% / 18%)'].gst += inv.gstAmount;
    } else {
      // 18% standard GST
      taxable18 += inv.subtotal;
      gst18 += inv.gstAmount;

      const targetKey = inv.category === 'court_rental' 
        ? 'Court Rentals (18%)' 
        : inv.category === 'pro_shop' 
        ? 'Pro Shop Equipment (18%)' 
        : inv.category === 'coaching_clinic' 
        ? 'Coaching Academy (18%)' 
        : 'Memberships (18%)';

      streamMap[targetKey].gross += inv.totalAmount;
      streamMap[targetKey].taxable += inv.subtotal;
      streamMap[targetKey].gst += inv.gstAmount;
    }
  });

  const periodExpenses = expenses.filter((exp) => {
    const t = new Date(exp.date).getTime();
    return t >= start && t <= end;
  });

  let itcEligibleExpenses = 0;
  let totalInputGst = 0;

  periodExpenses.forEach((exp) => {
    if (exp.inputGstAmount && exp.inputGstAmount > 0) {
      totalInputGst += exp.inputGstAmount;
      itcEligibleExpenses += (exp.amount - exp.inputGstAmount);
    } else {
      // Standard estimated ITC on power, equipment, maintenance (18%)
      if (['court_maintenance', 'shop_inventory', 'bar_stock', 'utilities_power'].includes(exp.category)) {
        const estGst = Math.round(exp.amount * 0.18 / 1.18);
        totalInputGst += estGst;
        itcEligibleExpenses += (exp.amount - estGst);
      }
    }
  });

  const totalOutputGst = gst5 + gst18;
  const netGstPayable = Math.max(0, totalOutputGst - totalInputGst);

  const streamBreakdown = Object.entries(streamMap).map(([stream, data]) => ({
    stream,
    grossSales: Math.round(data.gross),
    taxableValue: Math.round(data.taxable),
    gstCollected: Math.round(data.gst),
    applicableRate: data.rate,
  }));

  return {
    periodLabel: `${startDate} to ${endDate}`,
    outputTax: {
      taxable5Percent: Math.round(taxable5),
      gst5Percent: Math.round(gst5),
      taxable18Percent: Math.round(taxable18),
      gst18Percent: Math.round(gst18),
      totalTaxable: Math.round(taxable5 + taxable18),
      totalOutputGst: Math.round(totalOutputGst),
    },
    inputTaxCredit: {
      itcEligibleExpenses: Math.round(itcEligibleExpenses),
      totalInputGst: Math.round(totalInputGst),
    },
    netGstPayable: Math.round(netGstPayable),
    streamBreakdown,
  };
}

/**
 * Pure function: Calculate Aging Receivables & Payables (0-30, 31-60, 61-90, 90+ days)
 */
export function calculateAgingReport(
  invoices: Invoice[],
  expenses: Expense[],
  todayStr: string = new Date().toISOString().split('T')[0]
): AgingReport {
  const todayMs = new Date(todayStr).getTime();

  // Receivables: Unpaid or Partially Paid invoices
  const unpaidInvoices = invoices.filter((inv) => inv.status === 'unpaid' || inv.status === 'partially_paid' || inv.status === 'overdue' || inv.status === 'sent');
  
  const recBuckets: AgingBucket[] = [
    { range: '0-30 days', amount: 0, count: 0, items: [] },
    { range: '31-60 days', amount: 0, count: 0, items: [] },
    { range: '61-90 days', amount: 0, count: 0, items: [] },
    { range: '90+ days', amount: 0, count: 0, items: [] },
  ];

  let recTotal = 0;

  unpaidInvoices.forEach((inv) => {
    const dueMs = new Date(inv.dueDate || inv.createdAt).getTime();
    const diffDays = Math.max(0, Math.floor((todayMs - dueMs) / (1000 * 60 * 60 * 24)));
    const balance = inv.balanceAmount !== undefined ? inv.balanceAmount : inv.totalAmount;
    recTotal += balance;

    const item = {
      id: inv.id,
      reference: inv.invoiceNumber,
      entityName: inv.recipientName,
      amount: balance,
      dueDate: inv.dueDate,
      daysOverdue: diffDays,
    };

    if (diffDays <= 30) {
      recBuckets[0].amount += balance;
      recBuckets[0].count++;
      recBuckets[0].items.push(item);
    } else if (diffDays <= 60) {
      recBuckets[1].amount += balance;
      recBuckets[1].count++;
      recBuckets[1].items.push(item);
    } else if (diffDays <= 90) {
      recBuckets[2].amount += balance;
      recBuckets[2].count++;
      recBuckets[2].items.push(item);
    } else {
      recBuckets[3].amount += balance;
      recBuckets[3].count++;
      recBuckets[3].items.push(item);
    }
  });

  // Payables: Pending/Overdue Vendor Bills
  const unpaidExpenses = expenses.filter((exp) => exp.status === 'pending' || exp.status === 'overdue' || !exp.paidAt);
  const payBuckets: AgingBucket[] = [
    { range: '0-30 days', amount: 0, count: 0, items: [] },
    { range: '31-60 days', amount: 0, count: 0, items: [] },
    { range: '61-90 days', amount: 0, count: 0, items: [] },
    { range: '90+ days', amount: 0, count: 0, items: [] },
  ];

  let payTotal = 0;

  unpaidExpenses.forEach((exp) => {
    const dueMs = new Date(exp.dueDate || exp.date).getTime();
    const diffDays = Math.max(0, Math.floor((todayMs - dueMs) / (1000 * 60 * 60 * 24)));
    payTotal += exp.amount;

    const item = {
      id: exp.id,
      reference: exp.expenseNumber,
      entityName: exp.vendor,
      amount: exp.amount,
      dueDate: exp.dueDate || exp.date,
      daysOverdue: diffDays,
    };

    if (diffDays <= 30) {
      payBuckets[0].amount += exp.amount;
      payBuckets[0].count++;
      payBuckets[0].items.push(item);
    } else if (diffDays <= 60) {
      payBuckets[1].amount += exp.amount;
      payBuckets[1].count++;
      payBuckets[1].items.push(item);
    } else if (diffDays <= 90) {
      payBuckets[2].amount += exp.amount;
      payBuckets[2].count++;
      payBuckets[2].items.push(item);
    } else {
      payBuckets[3].amount += exp.amount;
      payBuckets[3].count++;
      payBuckets[3].items.push(item);
    }
  });

  return {
    receivables: {
      total: recTotal,
      buckets: recBuckets,
    },
    payables: {
      total: payTotal,
      buckets: payBuckets,
    },
  };
}

/**
 * Pure function: Calculate court occupancy rate for given time window
 */
export function calculateCourtOccupancy(
  bookings: Booking[],
  courtsCount: number = 8,
  operatingHoursPerDay: number = 17, // 6 AM to 11 PM
  daysCount: number = 1
): number {
  const totalOperatingHours = courtsCount * operatingHoursPerDay * Math.max(1, daysCount);
  const totalBookedHours = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((acc, b) => {
      const [sh, sm] = b.startTime.split(':').map(Number);
      const [eh, em] = b.endTime.split(':').map(Number);
      const durationHours = Math.max(0.5, (eh * 60 + em - (sh * 60 + sm)) / 60);
      return acc + durationHours;
    }, 0);

  return totalOperatingHours > 0 ? Math.min(100, Math.round((totalBookedHours / totalOperatingHours) * 100)) : 0;
}

/**
 * Pure function: Export dataset to CSV string
 */
export function exportToCSV(data: any[], filename: string): void {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const val = row[header];
          const escaped = ('' + (val !== undefined ? val : '')).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
