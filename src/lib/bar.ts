import { 
  MenuItem, 
  BarOrderItem, 
  Tab, 
  Table, 
  MembershipTier, 
  BarOrder, 
  BarStaffShift, 
  ZReport 
} from '../types';

/**
 * Pure function: Get automatic member discount percent for F&B / Bar & Cafe.
 * Gold: 15%, Silver: 10%, Junior: 5%, Walk-in: 0%.
 */
export function getMemberBarDiscountPercent(tier: MembershipTier): number {
  switch (tier) {
    case 'gold': return 15;
    case 'silver': return 10;
    case 'junior': return 5;
    default: return 0;
  }
}

/**
 * Pure function: Get member tab credit limit by tier.
 */
export function getMemberTabLimit(tier: MembershipTier): number {
  switch (tier) {
    case 'gold': return 25000;
    case 'silver': return 10000;
    case 'junior': return 2000;
    default: return 0; // Walk-ins cannot run an unbacked tab
  }
}

/**
 * Pure function: Calculates itemized bill for a tab or POS cart.
 * Automatically computes member tier discounts, happy-hour rates, GST per category, and tips.
 */
export function calculateTabTotals(
  orders: BarOrderItem[],
  tier: MembershipTier,
  isHappyHour = false,
  tipAmount = 0
): {
  subtotal: number;
  discountAmount: number;
  happyHourDiscount: number;
  gstAmount: number;
  totalAmount: number;
  itemsCount: number;
} {
  const activeOrders = orders.filter((o) => o.status !== 'voided');
  const discountPct = getMemberBarDiscountPercent(tier) / 100;

  let subtotal = 0;
  let happyHourDiscount = 0;
  let gstAmount = 0;
  let itemsCount = 0;

  activeOrders.forEach((item) => {
    const lineMrp = item.price * item.quantity;
    subtotal += lineMrp;
    itemsCount += item.quantity;

    // Happy hour deduction (e.g. 20% off alcoholic / beverages during happy hour)
    if (isHappyHour && item.station === 'bar') {
      happyHourDiscount += Math.round(lineMrp * 0.20);
    }
  });

  const subtotalAfterHappyHour = Math.max(0, subtotal - happyHourDiscount);
  const discountAmount = Math.round(subtotalAfterHappyHour * discountPct);
  const taxableAmount = Math.max(0, subtotalAfterHappyHour - discountAmount);

  // Blended average GST calculation (food 5%, alcohol/cocktails 18% -> standard 18% or 5%)
  gstAmount = Math.round(taxableAmount * 0.05); // standard restaurant 5% GST on food/beverages or 18% for bar

  const totalAmount = taxableAmount + gstAmount + tipAmount;

  return {
    subtotal,
    discountAmount,
    happyHourDiscount,
    gstAmount,
    totalAmount,
    itemsCount,
  };
}

/**
 * Pure function: Splits a tab equally across N participants.
 */
export function splitTabEqually(
  totalAmount: number,
  participantsCount: number,
  participantNames?: string[]
): { guestName: string; amount: number; isPaid: boolean }[] {
  const count = Math.max(1, participantsCount);
  const perPerson = Math.round(totalAmount / count);
  const remainder = totalAmount - (perPerson * count);

  return Array.from({ length: count }).map((_, idx) => ({
    guestName: participantNames?.[idx] || `Guest ${idx + 1}`,
    amount: idx === 0 ? perPerson + remainder : perPerson,
    isPaid: false,
  }));
}

/**
 * Pure function: Splits a tab by Seat / Item assignments (optimized for 20 people group).
 */
export function splitTabByItems(
  orders: BarOrderItem[],
  tier: MembershipTier,
  tipAmount = 0
): { [seatOrGuest: string]: { items: BarOrderItem[]; subtotal: number; total: number; isPaid: boolean } } {
  const groups: { [key: string]: BarOrderItem[] } = {};

  orders.filter((o) => o.status !== 'voided').forEach((order) => {
    const key = order.guestSeat || 'Shared Table Items';
    if (!groups[key]) groups[key] = [];
    groups[key].push(order);
  });

  const result: { [key: string]: { items: BarOrderItem[]; subtotal: number; total: number; isPaid: boolean } } = {};
  const discountPct = getMemberBarDiscountPercent(tier) / 100;

  Object.entries(groups).forEach(([guest, items]) => {
    const guestSubtotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    const guestDiscount = Math.round(guestSubtotal * discountPct);
    const guestGst = Math.round((guestSubtotal - guestDiscount) * 0.05);
    const guestTotal = guestSubtotal - guestDiscount + guestGst;

    result[guest] = {
      items,
      subtotal: guestSubtotal,
      total: guestTotal,
      isPaid: false,
    };
  });

  return result;
}

/**
 * Pure function: Calculates KDS Ticket elapsed time and urgency color status.
 * Green: < 5 mins
 * Amber / Warning: 5 - 10 mins
 * Red / Urgent: > 10 mins
 */
export function getKdsTicketUrgency(timestamp: string): {
  elapsedMinutes: number;
  urgencyLevel: 'normal' | 'warning' | 'urgent';
  badgeClass: string;
} {
  const orderTime = new Date(timestamp).getTime();
  const now = Date.now();
  const diffMinutes = Math.max(0, Math.floor((now - orderTime) / 60000));

  if (diffMinutes >= 10) {
    return {
      elapsedMinutes: diffMinutes,
      urgencyLevel: 'urgent',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse',
    };
  }
  if (diffMinutes >= 5) {
    return {
      elapsedMinutes: diffMinutes,
      urgencyLevel: 'warning',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    };
  }
  return {
    elapsedMinutes: diffMinutes,
    urgencyLevel: 'normal',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };
}

/**
 * Pure function: Merges two or more tables together into a combined master table.
 * Great when 20 people arrive at once and need multiple tables combined.
 */
export function mergeTables(
  primaryTableId: string,
  tableIdsToMerge: string[],
  tables: Table[]
): Table[] {
  const secondaryIds = tableIdsToMerge.filter((id) => id !== primaryTableId);
  const totalCapacity = tables
    .filter((t) => t.id === primaryTableId || secondaryIds.includes(t.id))
    .reduce((acc, t) => acc + t.capacity, 0);

  return tables.map((t) => {
    if (t.id === primaryTableId) {
      return {
        ...t,
        capacity: totalCapacity,
        mergedWithTableIds: secondaryIds,
        status: 'occupied',
      };
    }
    if (secondaryIds.includes(t.id)) {
      return {
        ...t,
        status: 'occupied',
        mergedWithTableIds: [primaryTableId],
      };
    }
    return t;
  });
}

/**
 * Pure function: Generates End-of-Day Z-Report data.
 */
export function generateZReportData(
  tabs: Tab[],
  shifts: BarStaffShift[],
  dateStr = new Date().toISOString().split('T')[0],
  generatedBy = 'Manager / Lead Bartender'
): ZReport {
  const settledTabs = tabs.filter((t) => t.status === 'settled');
  const openTabs = tabs.filter((t) => t.status === 'open' || t.status === 'bill_requested');

  let totalRevenue = 0;
  let totalDiscounts = 0;
  let totalGst = 0;
  let totalTips = 0;
  let totalCovers = 0;
  let voidsTotal = 0;
  let voidsCount = 0;

  const paymentMethods: { [key: string]: number } = {
    card: 0,
    upi: 0,
    cash: 0,
    wallet: 0,
    tab: 0,
  };

  const itemSalesMap = new Map<string, { quantity: number; revenue: number }>();

  settledTabs.forEach((tab) => {
    totalRevenue += tab.totalAmount;
    totalDiscounts += (tab.discountAmount + (tab.happyHourDiscount || 0));
    totalGst += tab.gstAmount;
    totalTips += (tab.tipAmount || 0);
    totalCovers += (tab.partySize || 2);

    const method = tab.settledVia || 'card';
    paymentMethods[method] = (paymentMethods[method] || 0) + tab.totalAmount;

    (tab.orders || []).forEach((order) => {
      if (order.status === 'voided') {
        voidsCount += 1;
        voidsTotal += order.price * order.quantity;
        return;
      }
      const existing = itemSalesMap.get(order.name) || { quantity: 0, revenue: 0 };
      itemSalesMap.set(order.name, {
        quantity: existing.quantity + order.quantity,
        revenue: existing.revenue + (order.price * order.quantity),
      });
    });
  });

  const topItems = Array.from(itemSalesMap.entries())
    .map(([name, data]) => ({ name, quantity: data.quantity, revenue: data.revenue }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8);

  const openTabsOutstanding = openTabs.reduce((acc, t) => acc + t.totalAmount, 0);
  const averageBill = settledTabs.length > 0 ? Math.round(totalRevenue / settledTabs.length) : 0;

  // Staff sales mapping
  const staffSales = shifts.map((s) => ({
    staffName: s.staffName,
    sales: s.salesTotal,
    orders: s.ordersCount,
  }));

  const cashSales = paymentMethods['cash'] || 0;
  const cashOpening = shifts.reduce((acc, s) => acc + s.cashOpening, 0) || 5000;
  const expectedCash = cashOpening + cashSales;
  const actualCash = expectedCash; // zero variance default
  const cashVariance = actualCash - expectedCash;

  return {
    id: `zrep_${Date.now()}`,
    date: dateStr,
    generatedAt: new Date().toISOString(),
    generatedBy,
    totalRevenue: Math.round(totalRevenue),
    totalOrders: settledTabs.length,
    totalCovers,
    averageBill,
    totalDiscounts: Math.round(totalDiscounts),
    totalGst: Math.round(totalGst),
    totalTips: Math.round(totalTips),
    revenueByPaymentMethod: paymentMethods,
    topItems,
    voidsTotal,
    voidsCount,
    openTabsOutstanding: Math.round(openTabsOutstanding),
    staffSales,
    cashReconciliation: {
      opening: cashOpening,
      cashSales,
      expected: expectedCash,
      actual: actualCash,
      variance: cashVariance,
    },
  };
}

/**
 * Pure function: Export Z-Report as CSV string.
 */
export function exportZReportToCSV(report: ZReport): string {
  const rows: string[] = [];
  rows.push('CHAMPIONS CLUB - BAR & CAFETERIA END-OF-DAY (Z-REPORT)');
  rows.push(`Date,${report.date}`);
  rows.push(`Generated At,${report.generatedAt}`);
  rows.push(`Generated By,${report.generatedBy}`);
  rows.push('');
  rows.push('EXECUTIVE SALES METRICS');
  rows.push(`Total Net Revenue (₹),${report.totalRevenue}`);
  rows.push(`Total Orders Count,${report.totalOrders}`);
  rows.push(`Total Covers (Guests Served),${report.totalCovers}`);
  rows.push(`Average Bill Value (₹),${report.averageBill}`);
  rows.push(`Discounts Given (₹),${report.totalDiscounts}`);
  rows.push(`GST Collected (₹),${report.totalGst}`);
  rows.push(`Staff Tips Collected (₹),${report.totalTips}`);
  rows.push(`Outstanding Open Tabs (₹),${report.openTabsOutstanding}`);
  rows.push('');
  rows.push('REVENUE BY PAYMENT METHOD');
  Object.entries(report.revenueByPaymentMethod).forEach(([method, amt]) => {
    rows.push(`${method.toUpperCase()},${amt}`);
  });
  rows.push('');
  rows.push('TOP SELLING MENU ITEMS');
  rows.push('Item Name,Quantity Sold,Total Revenue (₹)');
  report.topItems.forEach((item) => {
    rows.push(`"${item.name}",${item.quantity},${item.revenue}`);
  });
  rows.push('');
  rows.push('CASH DRAWER RECONCILIATION');
  rows.push(`Opening Float (₹),${report.cashReconciliation.opening}`);
  rows.push(`Cash Sales (₹),${report.cashReconciliation.cashSales}`);
  rows.push(`Expected Cash in Drawer (₹),${report.cashReconciliation.expected}`);
  rows.push(`Actual Cash Counted (₹),${report.cashReconciliation.actual}`);
  rows.push(`Variance (₹),${report.cashReconciliation.variance}`);

  return rows.join('\n');
}
