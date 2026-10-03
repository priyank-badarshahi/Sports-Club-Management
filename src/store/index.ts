import { create } from 'zustand';
import { 
  Role, 
  MembershipTier, 
  Member, 
  Court, 
  Plan, 
  Product, 
  StockMovement, 
  Order, 
  MenuItem, 
  Table, 
  Tab, 
  BarOrderItem,
  Booking, 
  SocialSession, 
  Lead, 
  Quote, 
  Invoice, 
  Payment, 
  Expense, 
  Employee, 
  Shift, 
  Leave, 
  Payroll, 
  Notification, 
  AuditLog, 
  ClubSettings,
  PlanEntitlements,
  MemberReminderLog,
  AttendanceRecord,
  BookingStatus,
  SportType,
  SocialSessionParticipant,
  Supplier,
  PurchaseOrder,
  OrderStatus,
  OrderType,
  OrderTrackingEvent,
  BarOrder,
  BarStaffShift,
  BusinessClient,
  LeadActivity,
  LeadTask,
  CreditNote,
  InvoiceStatus,
  ShiftSwapRequest,
  StaffAttendance
} from '../types';
import { formatINR } from '../lib/formatters';
import { calculateTabTotals, mergeTables } from '../lib/bar';
import { calculateEmployeePayroll } from '../lib/hr';
import {
  validateSlotAvailability,
  validateMemberDailyCap,
  calculateBookingPrice,
  validateCancellation,
  validateReschedule,
  validateRecurringBookings,
  getSocialSessionSpots,
  calculateEndTime,
} from '../lib/booking';
import {
  validateStockAvailability,
  reserveStock,
  releaseReservedStock,
  commitStockDeduction,
  restockProduct,
  adjustStock,
  receivePurchaseOrderStock
} from '../lib/inventory';
import {
  INITIAL_PLANS,
  INITIAL_COURTS,
  INITIAL_MEMBERS,
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_MENU_ITEMS,
  INITIAL_TABLES,
  INITIAL_TABS,
  INITIAL_BAR_ORDERS,
  INITIAL_BAR_STAFF_SHIFTS,
  INITIAL_BOOKINGS,
  INITIAL_SOCIAL_SESSIONS,
  INITIAL_LEADS,
  INITIAL_QUOTES,
  INITIAL_BUSINESS_CLIENTS,
  INITIAL_INVOICES,
  INITIAL_CREDIT_NOTES,
  INITIAL_PAYMENTS,
  INITIAL_EXPENSES,
  INITIAL_EMPLOYEES,
  INITIAL_SHIFTS,
  INITIAL_SWAP_REQUESTS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  INITIAL_PAYROLL,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS
} from '../data/seedData';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export interface UserProfile {
  name: string;
  role: Role;
  email: string;
  avatar: string;
  tier?: MembershipTier;
  memberId?: string;
  phone?: string;
}

export const DEMO_USERS: Record<Role, UserProfile> = {
  visitor: {
    name: 'Guest Visitor',
    role: 'visitor',
    email: 'guest@championsclub.in',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    tier: 'walk_in',
  },
  member: {
    name: 'Vikram Malhotra',
    role: 'member',
    email: 'vikram.malhotra@championsclub.in',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    tier: 'gold',
    memberId: 'mem_1',
  },
  front_desk: {
    name: 'Priya Sharma',
    role: 'front_desk',
    email: 'priya.desk@championsclub.in',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
  },
  bar_staff: {
    name: 'Rohan Das',
    role: 'bar_staff',
    email: 'rohan.bar@championsclub.in',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
  },
  shop_staff: {
    name: 'Ananya Sen',
    role: 'shop_staff',
    email: 'ananya.shop@championsclub.in',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80',
  },
  manager: {
    name: 'Arjun Rao',
    role: 'manager',
    email: 'arjun.manager@championsclub.in',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
  },
  owner: {
    name: 'Rajesh Singhania',
    role: 'owner',
    email: 'rajesh.owner@championsclub.in',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
  },
};

const STORAGE_KEY = 'champions_club_store_v1';

interface AppState {
  // Theme & User
  theme: 'dark' | 'light';
  currentRole: Role;
  currentUser: UserProfile;
  setRole: (role: Role) => void;
  toggleTheme: () => void;

  // Data
  members: Member[];
  courts: Court[];
  plans: Plan[];
  bookings: Booking[];
  socialSessions: SocialSession[];
  products: Product[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  stockMovements: StockMovement[];
  orders: Order[];
  wishlist: string[];
  menuItems: MenuItem[];
  tables: Table[];
  tabs: Tab[];
  barOrders: BarOrder[];
  barStaffShifts: BarStaffShift[];
  leads: Lead[];
  quotes: Quote[];
  businessClients: BusinessClient[];
  invoices: Invoice[];
  creditNotes: CreditNote[];
  payments: Payment[];
  expenses: Expense[];
  employees: Employee[];
  shifts: Shift[];
  swapRequests: ShiftSwapRequest[];
  attendance: StaffAttendance[];
  leaves: Leave[];
  payroll: Payroll[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  settings: ClubSettings;

  // UI state
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;

  selectedMemberId360: string | null;
  openMember360: (id: string) => void;
  closeMember360: () => void;

  // Actions
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Booking | null;
  cancelBooking: (id: string, reason?: string) => { success: boolean; refundAmount: number; lateCancelFee: number };
  rescheduleBooking: (id: string, newCourtId: string, newDate: string, newStartTime: string) => { success: boolean; error?: string };
  checkInBooking: (id: string) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  createCourtBlock: (courtId: string, date: string, startTime: string, endTime: string, type: 'maintenance' | 'coaching' | 'tournament', notes: string) => { success: boolean; error?: string };
  addRecurringBookings: (params: { courtId: string; startDate: string; weeksCount: number; startTime: string; memberId?: string; guestName: string; guestPhone: string; guestEmail?: string; tier: MembershipTier; sport: SportType; paymentMethod?: 'wallet' | 'upi' | 'card' | 'cash' | 'plan_included' | 'pay_at_desk' }) => { success: boolean; createdCount: number; error?: string };
  joinSocialSession: (sessionId: string, memberId: string, paymentMethod?: string) => { success: boolean; waitlisted?: boolean; message: string };
  leaveSocialSession: (sessionId: string, memberId: string) => { success: boolean; message: string };
  
  // CRM Engine Actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => Lead;
  updateLead: (id: string, data: Partial<Lead>) => void;
  updateLeadStatus: (id: string, status: Lead['status'], lostReason?: string) => void;
  addLeadActivity: (leadId: string, activity: Omit<LeadActivity, 'id' | 'timestamp' | 'authorName'>) => void;
  addLeadTask: (leadId: string, task: Omit<LeadTask, 'id' | 'completed'>) => void;
  toggleLeadTask: (leadId: string, taskId: string) => void;
  createQuote: (quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt'>) => Quote;
  updateQuoteStatus: (quoteId: string, status: Quote['status']) => void;
  convertLeadToMember: (leadId: string, registrationData: { tier: MembershipTier; paymentMethod: 'cash' | 'card' | 'upi'; billingCycle: 'monthly' | 'quarterly' | 'annual'; paymentAmount: number }) => { member: Member; invoice: Invoice } | null;
  convertLeadToBusinessClient: (leadId: string, clientData: { companyName: string; contactPerson: string; email: string; phone: string; gstNumber?: string; panNumber?: string; address?: string; creditTerms: 'net_15' | 'net_30' | 'net_60' | 'prepaid'; contractValue: number; packageType: string; allocatedPasses?: number; notes?: string }) => BusinessClient | null;
  addBusinessClient: (client: Omit<BusinessClient, 'id' | 'clientCode' | 'createdAt'>) => BusinessClient;
  updateBusinessClient: (id: string, data: Partial<BusinessClient>) => void;

  addMember: (member: Omit<Member, 'id' | 'memberNumber' | 'joinDate'>) => Member;
  registerMember: (
    memberData: Omit<Member, 'id' | 'memberNumber' | 'joinDate'>,
    paymentMethod: string,
    paymentAmount: number,
    billingCycle: 'monthly' | 'quarterly' | 'annual'
  ) => { member: Member; invoice: Invoice };
  updateMember: (id: string, data: Partial<Member>) => void;
  renewMember: (memberId: string, durationMonths: number, paymentMethod: 'cash' | 'card' | 'upi' | 'wallet') => void;
  upgradeMember: (memberId: string, newTier: MembershipTier, proratedAmount: number, paymentMethod: 'cash' | 'card' | 'upi' | 'wallet') => void;
  downgradeMember: (memberId: string, newTier: MembershipTier, proratedAdjustment?: number) => void;
  freezeMember: (memberId: string, reason?: string) => void;
  unfreezeMember: (memberId: string) => void;
  checkInMember: (memberId: string, courtName?: string) => { success: boolean; todayCount: number; maxAllowed: number; message: string };
  topupWallet: (memberId: string, amount: number, method: 'upi' | 'card' | 'cash') => void;
  sendMemberReminder: (memberId: string, channel: 'whatsapp' | 'sms' | 'email', customMessage?: string) => void;
  sendBulkExpiryReminders: (memberIds: string[], channel: 'whatsapp' | 'sms' | 'email') => void;
  runLifecycleRemindersCheck: () => { remindedCount: number; expiredCount: number };
  updatePlanEntitlements: (tier: MembershipTier, entitlements: Partial<PlanEntitlements>) => void;
  addMemberNote: (memberId: string, noteText: string) => void;

  // Bar & Cafeteria Suite Actions
  addTabOrder: (tabId: string, item: BarOrderItem) => void;
  addTabOrdersBatch: (tabId: string, items: BarOrderItem[], serverName?: string) => void;
  settleTab: (tabId: string, method: 'cash' | 'card' | 'upi' | 'wallet') => void;
  settleTabComplete: (
    tabId: string, 
    method: 'cash' | 'card' | 'upi' | 'wallet' | 'split', 
    tipAmount?: number,
    splitData?: any
  ) => { success: boolean; invoiceId?: string };
  openTab: (customerName: string, tier: MembershipTier, tableId?: string, memberId?: string, partySize?: number) => Tab;
  voidTabOrderItem: (tabId: string, itemIndex: number, reason: string, approvedBy?: string) => { success: boolean; error?: string };
  transferTabTable: (tabId: string, newTableId: string) => void;
  mergeTablesAction: (primaryTableId: string, tableIdsToMerge: string[]) => void;
  updateKdsTicketStatus: (orderId: string, status: BarOrder['status']) => void;
  
  addMenuItem: (item: Omit<MenuItem, 'id'>) => MenuItem;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  
  clockInBarStaff: (staffName: string, role: BarStaffShift['role'], shiftType: BarStaffShift['shiftType'], openingCash: number) => BarStaffShift;
  clockOutBarStaff: (shiftId: string, closingCash: number, handoverNotes: string) => void;

  recordSale: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => void;
  updateProductStock: (productId: string, qtyDelta: number, reason: string) => void;
  adjustProductStock: (productId: string, newQty: number, reason: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt'>) => PurchaseOrder;
  receivePurchaseOrder: (poId: string, receipts: { productId: string; receivedQty: number }[]) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'code'>) => Supplier;
  toggleWishlist: (productId: string) => void;

  // Finance & Ledger Actions
  createInvoice: (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>) => Invoice;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  recordInvoicePayment: (invoiceId: string, amount: number, method: Payment['method'], transactionRef?: string, purpose?: string) => Payment | null;
  issueCreditNote: (invoiceId: string, amount: number, reason: string) => CreditNote | null;
  sendInvoiceReminder: (invoiceId: string, channel: 'whatsapp' | 'email' | 'sms') => void;
  addExpense: (expenseData: Omit<Expense, 'id' | 'expenseNumber'>) => Expense;
  markExpensePaid: (expenseId: string, method: Expense['paymentMethod'], paidAt?: string) => void;
  deleteExpense: (id: string) => void;

  // HR & Workforce Actions
  addEmployee: (employeeData: Omit<Employee, 'id' | 'empId' | 'joinDate'>) => Employee;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addShift: (shiftData: Omit<Shift, 'id'>) => Shift;
  updateShift: (id: string, data: Partial<Shift>) => void;
  deleteShift: (id: string) => void;
  requestShiftSwap: (swapData: Omit<ShiftSwapRequest, 'id' | 'status' | 'createdAt'>) => ShiftSwapRequest;
  decideShiftSwap: (swapId: string, status: 'approved' | 'rejected', decisionNote?: string) => void;
  clockInAttendance: (employeeId: string, notes?: string) => StaffAttendance;
  clockOutAttendance: (attendanceId: string) => void;
  applyLeave: (leaveData: Omit<Leave, 'id' | 'status' | 'createdAt'>) => Leave;
  decideLeave: (leaveId: string, status: 'approved' | 'rejected', decisionComment?: string) => void;
  runPayrollMonth: (monthYear: string) => Payroll[];
  markPayrollPaid: (payrollId: string, paymentMethod?: 'bank_transfer' | 'cheque' | 'cash') => void;
  createCoachCourtBlock: (coachId: string, courtId: string, date: string, startTime: string, endTime: string, topic: string) => { success: boolean; bookingId?: string; error?: string };

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  
  logAudit: (action: string, entity: string, details: string) => void;
  setCurrentUser: (user: UserProfile) => void;
  updateUserProfile: (profileData: {
    name?: string;
    phone?: string;
    avatar?: string;
    dateOfBirth?: string;
    preferredSports?: SportType[];
    emergencyContact?: { name: string; phone: string; relation: string };
  }) => void;
  loginUser: (user: UserProfile) => void;
  syncMembers: () => Promise<void>;
  syncEmployees: () => Promise<void>;
  resetDemoData: () => void;
  updateSettings: (newSettings: Partial<ClubSettings>) => void;
  pullFromSupabase: () => Promise<boolean>;
}

const loadSavedState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse saved state:', e);
  }
  return null;
};

const saved = typeof window !== 'undefined' ? loadSavedState() : null;

export const useAppStore = create<AppState>((set, get) => ({
  theme: (saved?.theme as 'dark' | 'light') || 'dark',
  currentRole: (saved?.currentRole as Role) || 'visitor',
  currentUser: (saved?.currentUser as UserProfile) || DEMO_USERS.visitor,

  members: saved?.members || INITIAL_MEMBERS,
  courts: (saved?.courts && saved.courts.some((c: any) => c.id === 'court-1')) ? saved.courts : INITIAL_COURTS,
  plans: saved?.plans || INITIAL_PLANS,
  bookings: saved?.bookings || INITIAL_BOOKINGS,
  socialSessions: saved?.socialSessions || INITIAL_SOCIAL_SESSIONS,
  products: saved?.products || INITIAL_PRODUCTS,
  suppliers: saved?.suppliers || INITIAL_SUPPLIERS,
  purchaseOrders: saved?.purchaseOrders || INITIAL_PURCHASE_ORDERS,
  stockMovements: saved?.stockMovements || [],
  orders: saved?.orders || [],
  wishlist: saved?.wishlist || [],
  menuItems: saved?.menuItems || INITIAL_MENU_ITEMS,
  tables: saved?.tables || INITIAL_TABLES,
  tabs: saved?.tabs || INITIAL_TABS,
  barOrders: saved?.barOrders || INITIAL_BAR_ORDERS,
  barStaffShifts: saved?.barStaffShifts || INITIAL_BAR_STAFF_SHIFTS,
  leads: saved?.leads || INITIAL_LEADS,
  quotes: saved?.quotes || INITIAL_QUOTES,
  businessClients: saved?.businessClients || INITIAL_BUSINESS_CLIENTS,
  invoices: saved?.invoices || INITIAL_INVOICES,
  creditNotes: saved?.creditNotes || INITIAL_CREDIT_NOTES,
  payments: saved?.payments || INITIAL_PAYMENTS,
  expenses: saved?.expenses || INITIAL_EXPENSES,
  employees: saved?.employees || INITIAL_EMPLOYEES,
  shifts: saved?.shifts || INITIAL_SHIFTS,
  swapRequests: saved?.swapRequests || INITIAL_SWAP_REQUESTS,
  attendance: saved?.attendance || INITIAL_ATTENDANCE,
  leaves: saved?.leaves || INITIAL_LEAVES,
  payroll: saved?.payroll || INITIAL_PAYROLL,
  notifications: saved?.notifications || INITIAL_NOTIFICATIONS,
  auditLogs: saved?.auditLogs || INITIAL_AUDIT_LOGS,
  settings: saved?.settings || INITIAL_SETTINGS,

  toasts: [],
  selectedMemberId360: null,
  openMember360: (id: string) => set({ selectedMemberId360: id }),
  closeMember360: () => set({ selectedMemberId360: null }),

  setRole: (role: Role) => {
    const prev = get().currentUser;
    // If the currently authenticated user matches this role, preserve their identity
    const user = (prev && prev.role === role && prev.email && !prev.email.endsWith('@championsclub.demo'))
      ? prev
      : DEMO_USERS[role];
    set({ currentRole: role, currentUser: user });
    get().addToast({
      type: 'info',
      title: `Active Persona: ${user.name}`,
      message: `Active persona: ${role.replace('_', ' ').toUpperCase()}`,
    });
    get().logAudit('ROLE_SWITCH', 'User Persona', `Switched active role to ${role}`);
    persist(get());
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof document !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
    set({ theme: newTheme });
    persist(get());
  },

  addToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4500);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  pullFromSupabase: async () => {
    try {
      const { supabaseService } = await import('../lib/supabase');
      
      const members = await supabaseService.fetchRecords<Member>('members');
      const bookings = await supabaseService.fetchRecords<Booking>('bookings');
      const products = await supabaseService.fetchRecords<Product>('products');
      const orders = await supabaseService.fetchRecords<Order>('orders');
      const tabs = await supabaseService.fetchRecords<Tab>('tabs');
      const invoices = await supabaseService.fetchRecords<Invoice>('invoices');
      const payments = await supabaseService.fetchRecords<Payment>('payments');

      // Additional UI workflow tables
      const socialSessions = await supabaseService.fetchRecords<any>('social_sessions');
      const stockMovements = await supabaseService.fetchRecords<any>('stock_movements');
      const menuItems = await supabaseService.fetchRecords<any>('menu_items');
      const tables = await supabaseService.fetchRecords<any>('tables');
      const leads = await supabaseService.fetchRecords<any>('leads');
      const quotes = await supabaseService.fetchRecords<any>('quotes');
      const businessClients = await supabaseService.fetchRecords<any>('business_clients');
      const creditNotes = await supabaseService.fetchRecords<any>('credit_notes');
      const expenses = await supabaseService.fetchRecords<any>('expenses');
      const employees = await supabaseService.fetchRecords<any>('employees');
      const shifts = await supabaseService.fetchRecords<any>('shifts');
      const swapRequests = await supabaseService.fetchRecords<any>('swap_requests');
      const attendance = await supabaseService.fetchRecords<any>('attendance');
      const leaves = await supabaseService.fetchRecords<any>('leaves');
      const payroll = await supabaseService.fetchRecords<any>('payroll');
      const notifications = await supabaseService.fetchRecords<any>('notifications');
      const auditLogs = await supabaseService.fetchRecords<any>('audit_logs');
      const settings = await supabaseService.fetchRecords<any>('settings');

      const updates: any = {};
      if (members && members.length > 0) {
        const currentMembers = get().members;
        const dbIds = new Set(members.map((m: any) => m.id));
        const dbEmails = new Set(members.map((m: any) => m.email?.toLowerCase()).filter(Boolean));
        const remaining = currentMembers.filter(
          (m) => !dbIds.has(m.id) && (!m.email || !dbEmails.has(m.email.toLowerCase()))
        );
        updates.members = [...members, ...remaining];
      }
      if (bookings && bookings.length > 0) updates.bookings = bookings;
      if (products && products.length > 0) updates.products = products;
      if (orders && orders.length > 0) updates.orders = orders;
      if (tabs && tabs.length > 0) updates.tabs = tabs;
      if (invoices && invoices.length > 0) updates.invoices = invoices;
      if (payments && payments.length > 0) updates.payments = payments;

      if (socialSessions && socialSessions.length > 0) updates.socialSessions = socialSessions;
      if (stockMovements && stockMovements.length > 0) updates.stockMovements = stockMovements;
      if (menuItems && menuItems.length > 0) updates.menuItems = menuItems;
      if (tables && tables.length > 0) updates.tables = tables;
      if (leads && leads.length > 0) updates.leads = leads;
      if (quotes && quotes.length > 0) updates.quotes = quotes;
      if (businessClients && businessClients.length > 0) updates.businessClients = businessClients;
      if (creditNotes && creditNotes.length > 0) updates.creditNotes = creditNotes;
      if (expenses && expenses.length > 0) updates.expenses = expenses;
      if (employees && employees.length > 0) updates.employees = employees;
      if (shifts && shifts.length > 0) updates.shifts = shifts;
      if (swapRequests && swapRequests.length > 0) updates.swapRequests = swapRequests;
      if (attendance && attendance.length > 0) updates.attendance = attendance;
      if (leaves && leaves.length > 0) updates.leaves = leaves;
      if (payroll && payroll.length > 0) updates.payroll = payroll;
      if (notifications && notifications.length > 0) updates.notifications = notifications;
      if (auditLogs && auditLogs.length > 0) updates.auditLogs = auditLogs;
      if (settings && settings.length > 0) updates.settings = settings[0]; // settings is a singleton

      if (Object.keys(updates).length > 0) {
        set(updates);
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Supabase automatic pull deferred:', e);
      return false;
    }
  },

  addBooking: (bookingData) => {
    const { bookings, socialSessions, members, settings, courts, plans, currentRole } = get();

    // Authentication enforcement: Users cannot book without logging in or signing up
    const isStaff = ['owner', 'manager', 'front_desk', 'bar_staff', 'shop_staff'].includes(currentRole);
    if (!isStaff && currentRole === 'visitor') {
      get().addToast({
        type: 'error',
        title: 'Authentication Required',
        message: 'You cannot book without logging in or signing up. Please sign in or create an account.',
      });
      return null;
    }

    // 1. Session duration enforcement: standard 60 minutes
    const startTime = bookingData.startTime;
    const endTime = bookingData.endTime || calculateEndTime(startTime, 60);

    // 2. Validate Overlapping slots on the same court
    const slotCheck = validateSlotAvailability(
      bookingData.courtId,
      bookingData.date,
      startTime,
      endTime,
      bookings,
      socialSessions
    );

    if (!slotCheck.available) {
      const msg = slotCheck.conflictReason || 'Slot just taken, pick another';
      get().addToast({
        type: 'error',
        title: 'Booking Unavailable',
        message: msg,
      });
      return null;
    }

    // 3. Max 2 bookings per member per day rule
    if (bookingData.memberId && bookingData.bookingType !== 'maintenance' && bookingData.bookingType !== 'tournament') {
      const capCheck = validateMemberDailyCap(
        bookingData.memberId,
        bookingData.date,
        bookings,
        settings.dailyBookingCap || 2
      );

      if (!capCheck.allowed) {
        get().addToast({
          type: 'error',
          title: 'Daily Limit Reached',
          message: capCheck.message || 'Maximum 2 bookings per member per day allowed.',
        });
        return null;
      }
    }

    // 4. Validate member active status (auto-block benefits if expired past grace or frozen)
    const member = bookingData.memberId ? members.find((m) => m.id === bookingData.memberId) : undefined;
    if (member) {
      if (member.status === 'frozen') {
        get().addToast({
          type: 'error',
          title: 'Account Frozen',
          message: `${member.fullName}'s membership is currently frozen. Court booking benefits are paused.`,
        });
        return null;
      }

      const today = new Date();
      const expDate = new Date(member.expiryDate);
      const graceDays = settings.gracePeriodDays || 7;
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < -graceDays) {
        get().addToast({
          type: 'error',
          title: 'Membership Expired',
          message: `${member.fullName}'s membership expired beyond the ${graceDays}-day grace period. Benefits are blocked.`,
        });
        return null;
      }
    }

    // 5. Pricing calculation
    const court = courts.find((c) => c.id === bookingData.courtId) || courts[0];
    const plan = member ? plans.find((p) => p.tier === member.tier) : plans.find((p) => p.tier === bookingData.tier);
    const breakdown = bookingData.priceBreakdown || calculateBookingPrice({
      court,
      memberTier: bookingData.tier,
      date: bookingData.date,
      startTime,
      plan,
      settings,
      overrideFree: bookingData.paymentMethod === 'plan_included',
    });

    const finalPrice = bookingData.paymentMethod === 'plan_included' ? 0 : (bookingData.totalPrice ?? breakdown.totalAmount);

    // 6. Wallet payment check & deduction
    let updatedMembers = members;
    const newPayments: Payment[] = [];
    const newInvoices: Invoice[] = [];
    const id = `bkg_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    if (bookingData.paymentMethod === 'wallet' && member && finalPrice > 0) {
      if (member.walletBalance < finalPrice) {
        get().addToast({
          type: 'error',
          title: 'Insufficient Wallet Funds',
          message: `Wallet balance (₹${member.walletBalance}) is less than total due (₹${finalPrice}). Please top-up or choose another payment method.`,
        });
        return null;
      }

      updatedMembers = members.map((m) =>
        m.id === member.id ? { ...m, walletBalance: m.walletBalance - finalPrice } : m
      );

      const payId = `pay_${Date.now()}`;
      newPayments.push({
        id: payId,
        paymentNumber: `PAY-BKG-${Math.floor(1000 + Math.random() * 9000)}`,
        memberId: member.id,
        payerName: member.fullName,
        amount: finalPrice,
        method: 'wallet',
        status: 'success',
        transactionRef: `WLT-BKG-${id}`,
        timestamp: new Date().toISOString(),
        purpose: `Court Reservation: ${court.name} (${bookingData.date} ${startTime})`,
      });
    }

    // 7. Auto-post invoice line to ledger
    const invId = `inv_${Date.now()}`;
    const invoiceNumber = `INV-BKG-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = breakdown.subtotal;
    const gstAmount = breakdown.gstAmount;

    newInvoices.push({
      id: invId,
      invoiceNumber,
      memberId: bookingData.memberId,
      recipientName: bookingData.guestName,
      recipientEmail: bookingData.guestEmail || (member ? member.email : 'frontdesk@championsclub.in'),
      category: 'court_rental',
      items: [
        {
          description: `Court Booking: ${court.name} - ${bookingData.sport.toUpperCase()} (${bookingData.date} ${startTime}-${endTime}) [${(bookingData.channel || 'online').toUpperCase()}]`,
          quantity: 1,
          rate: subtotal,
          amount: subtotal,
        }
      ],
      subtotal,
      gstRate: 0.18,
      gstAmount,
      totalAmount: finalPrice,
      status: bookingData.isPaid ? 'paid' : 'unpaid',
      dueDate: bookingData.date,
      paidAt: bookingData.isPaid ? new Date().toISOString() : undefined,
      paymentMethod: (bookingData.paymentMethod || 'cash').toUpperCase(),
      createdAt: new Date().toISOString(),
    });

    const newBooking: Booking = {
      ...bookingData,
      id,
      endTime,
      totalPrice: finalPrice,
      discountApplied: breakdown.tierDiscount,
      priceBreakdown: breakdown,
      bookingType: bookingData.bookingType || 'regular',
      channel: bookingData.channel || 'online',
      qrCodeData: `CHAMPIONS-BKG-${id}-${bookingData.courtId}-${bookingData.date}-${startTime}`,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      bookings: [newBooking, ...state.bookings],
      members: updatedMembers,
      payments: [...newPayments, ...state.payments],
      invoices: [...newInvoices, ...state.invoices],
    }));

    get().addToast({
      type: 'success',
      title: 'Court Reserved Successfully!',
      message: `${newBooking.guestName} booked ${court.name} on ${newBooking.date} (${newBooking.startTime}-${newBooking.endTime}).`,
    });

    get().logAudit(
      'BOOKING_CREATED',
      `Booking #${id}`,
      `Booked ${court.name} on ${newBooking.date} (${newBooking.startTime}) via ${newBooking.channel || 'online'} for ₹${finalPrice}`
    );

    get().addNotification({
      title: 'New Court Booking',
      message: `${newBooking.guestName} booked ${court.name} on ${newBooking.date} at ${newBooking.startTime}`,
      type: 'booking',
      targetRole: 'front_desk',
      link: '/staff/bookings',
    });

    persist(get());
    return newBooking;
  },

  cancelBooking: (id: string, reason?: string) => {
    const booking = get().bookings.find((b) => b.id === id);
    if (!booking) return { success: false, refundAmount: 0, lateCancelFee: 0 };

    const { settings, members } = get();
    const cancelEvaluation = validateCancellation(booking, settings);
    const refundAmount = cancelEvaluation.refundAmount;
    const lateCancelFee = cancelEvaluation.lateCancelFee;

    let updatedMembers = members;
    const newPayments: Payment[] = [];

    // Refund to wallet if member is present and refundAmount > 0
    if (booking.memberId && refundAmount > 0 && booking.isPaid) {
      updatedMembers = members.map((m) =>
        m.id === booking.memberId ? { ...m, walletBalance: m.walletBalance + refundAmount } : m
      );

      newPayments.push({
        id: `pay_ref_${Date.now()}`,
        paymentNumber: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        memberId: booking.memberId,
        payerName: booking.guestName,
        amount: refundAmount,
        method: 'wallet',
        status: 'success',
        transactionRef: `REF-BKG-${id}`,
        timestamp: new Date().toISOString(),
        purpose: `Cancellation Refund: Booking #${id} (Court ${booking.courtId})`,
      });
    }

    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id
          ? {
              ...b,
              status: 'cancelled',
              cancelledAt: new Date().toISOString(),
              cancellationReason: reason || 'Customer requested cancellation',
              lateCancelFee,
              refundAmount,
            }
          : b
      ),
      members: updatedMembers,
      payments: [...newPayments, ...state.payments],
      notifications: [
        {
          id: `notif_free_${Date.now()}`,
          title: `Slot Freed on Court ${booking.courtId}`,
          message: `${booking.date} at ${booking.startTime} is now available. Waitlist notified.`,
          type: 'booking',
          targetRole: 'front_desk',
          timestamp: new Date().toISOString(),
          read: false,
          link: '/staff/bookings',
        },
        ...state.notifications,
      ],
    }));

    get().addToast({
      type: 'warning',
      title: 'Booking Cancelled',
      message: cancelEvaluation.eligibleForFreeCancel
        ? `Booking #${id} cancelled. 100% refund of ₹${refundAmount} credited to wallet.`
        : `Late cancellation: ₹${lateCancelFee} late fee applied. Balance ₹${refundAmount} refunded to wallet.`,
    });

    get().logAudit(
      'BOOKING_CANCELLED',
      `Booking #${id}`,
      `Cancelled: ${reason || 'User cancelled'}. Refunded: ₹${refundAmount}, Late Fee: ₹${lateCancelFee}`
    );

    persist(get());
    return { success: true, refundAmount, lateCancelFee };
  },

  rescheduleBooking: (id: string, newCourtId: string, newDate: string, newStartTime: string) => {
    const booking = get().bookings.find((b) => b.id === id);
    if (!booking) return { success: false, error: 'Booking not found' };

    const { bookings, socialSessions, settings, courts, plans, members } = get();
    const newEndTime = calculateEndTime(newStartTime, 60);

    const check = validateReschedule(
      booking,
      newCourtId,
      newDate,
      newStartTime,
      newEndTime,
      bookings,
      socialSessions,
      settings
    );

    if (!check.allowed) {
      get().addToast({
        type: 'error',
        title: 'Cannot Reschedule',
        message: check.reason || 'Requested slot is unavailable.',
      });
      return { success: false, error: check.reason };
    }

    const court = courts.find((c) => c.id === newCourtId) || courts[0];
    const member = booking.memberId ? members.find((m) => m.id === booking.memberId) : undefined;
    const plan = member ? plans.find((p) => p.tier === member.tier) : undefined;
    const newBreakdown = calculateBookingPrice({
      court,
      memberTier: booking.tier,
      date: newDate,
      startTime: newStartTime,
      plan,
      settings,
    });

    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id
          ? {
              ...b,
              courtId: newCourtId,
              date: newDate,
              startTime: newStartTime,
              endTime: newEndTime,
              sport: court.sport,
              totalPrice: newBreakdown.totalAmount,
              priceBreakdown: newBreakdown,
              notes: `${b.notes ? b.notes + ' | ' : ''}Rescheduled on ${new Date().toISOString().split('T')[0]} from ${b.date} ${b.startTime}`,
            }
          : b
      ),
    }));

    get().addToast({
      type: 'success',
      title: 'Booking Rescheduled',
      message: `Moved to ${court.name} on ${newDate} at ${newStartTime}.`,
    });

    get().logAudit(
      'BOOKING_RESCHEDULED',
      `Booking #${id}`,
      `Rescheduled from ${booking.date} ${booking.startTime} to ${newDate} ${newStartTime} on ${court.name}`
    );

    persist(get());
    return { success: true };
  },

  checkInBooking: (id: string) => {
    const booking = get().bookings.find((b) => b.id === id);
    if (!booking) return;

    if (booking.memberId) {
      get().checkInMember(booking.memberId, `Court ${booking.courtId}`);
    }

    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === id ? { ...b, status: 'checked_in' } : b)),
    }));

    get().addToast({
      type: 'success',
      title: 'Member Checked In',
      message: 'Court lights activated and attendance logged.',
    });
    get().logAudit('BOOKING_CHECKIN', `Booking #${id}`, 'Member checked in at the reception desk');
    persist(get());
  },

  updateBookingStatus: (id: string, status: BookingStatus) => {
    const booking = get().bookings.find((b) => b.id === id);
    if (!booking) return;

    if (status === 'checked_in' && booking.memberId) {
      get().checkInMember(booking.memberId, `Court ${booking.courtId}`);
    }

    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
    }));

    get().addToast({
      type: 'info',
      title: `Status Updated`,
      message: `Booking #${id} updated to ${status.replace('_', ' ').toUpperCase()}.`,
    });

    get().logAudit('BOOKING_STATUS_CHANGE', `Booking #${id}`, `Updated status to ${status}`);
    persist(get());
  },

  createCourtBlock: (courtId, date, startTime, endTime, type, notes) => {
    const { bookings, socialSessions, courts } = get();
    const court = courts.find((c) => c.id === courtId);
    if (!court) return { success: false, error: 'Court not found' };

    const check = validateSlotAvailability(courtId, date, startTime, endTime, bookings, socialSessions);
    if (!check.available) {
      get().addToast({
        type: 'error',
        title: 'Block Failed',
        message: check.conflictReason || 'Slot has an existing conflict.',
      });
      return { success: false, error: check.conflictReason };
    }

    const titlePrefix = type === 'maintenance' ? 'Court Maintenance Block' : type === 'coaching' ? 'Coaching Academy Clinic' : 'Tournament Reservation';

    const id = `blk_${Date.now()}`;
    const newBlock: Booking = {
      id,
      courtId,
      memberId: `system_${type}`,
      guestName: `${titlePrefix}`,
      guestPhone: 'Club Administration',
      tier: 'gold',
      date,
      startTime,
      endTime,
      sport: court.sport,
      bookingType: type,
      channel: 'front_desk',
      totalPrice: 0,
      discountApplied: 0,
      status: 'confirmed',
      isPaid: true,
      notes,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      bookings: [newBlock, ...state.bookings],
    }));

    get().addToast({
      type: 'success',
      title: `${titlePrefix} Active`,
      message: `Locked ${court.name} on ${date} from ${startTime} to ${endTime}.`,
    });

    get().logAudit(
      'COURT_BLOCK_CREATED',
      `Court #${courtId}`,
      `${type.toUpperCase()} block on ${date} (${startTime}-${endTime}): ${notes}`
    );

    persist(get());
    return { success: true };
  },

  addRecurringBookings: (params) => {
    const { bookings, socialSessions, members, settings, courts, plans } = get();
    const { courtId, startDate, weeksCount, startTime, memberId, guestName, guestPhone, guestEmail, tier, sport, paymentMethod } = params;
    const endTime = calculateEndTime(startTime, 60);

    const validation = validateRecurringBookings({
      courtId,
      startDate,
      weeksCount,
      startTime,
      endTime,
      memberId,
      existingBookings: bookings,
      socialSessions,
    });

    if (!validation.valid) {
      const conflictMsg = validation.conflicts.map((c) => `${c.date}: ${c.reason}`).join(' | ');
      get().addToast({
        type: 'error',
        title: 'Recurring Booking Conflicts',
        message: `Conflicts detected: ${conflictMsg}`,
      });
      return { success: false, createdCount: 0, error: conflictMsg };
    }

    const court = courts.find((c) => c.id === courtId) || courts[0];
    const member = memberId ? members.find((m) => m.id === memberId) : undefined;
    const plan = member ? plans.find((p) => p.tier === member.tier) : undefined;
    const recurringGroupId = `rec_${Date.now()}`;

    const newBookings: Booking[] = [];
    let totalAllWeeks = 0;

    validation.validDates.forEach((d) => {
      const breakdown = calculateBookingPrice({
        court,
        memberTier: tier,
        date: d,
        startTime,
        plan,
        settings,
        overrideFree: paymentMethod === 'plan_included',
      });
      const cost = paymentMethod === 'plan_included' ? 0 : breakdown.totalAmount;
      totalAllWeeks += cost;

      newBookings.push({
        id: `bkg_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
        courtId,
        memberId,
        guestName,
        guestPhone,
        guestEmail,
        tier,
        date: d,
        startTime,
        endTime,
        sport,
        bookingType: 'regular',
        channel: 'online',
        totalPrice: cost,
        discountApplied: breakdown.tierDiscount,
        priceBreakdown: breakdown,
        status: 'confirmed',
        isPaid: true,
        paymentMethod: paymentMethod || 'wallet',
        isRecurring: true,
        recurringGroupId,
        notes: `Recurring weekly series (Session on ${d})`,
        createdAt: new Date().toISOString(),
      });
    });

    let updatedMembers = members;
    if (paymentMethod === 'wallet' && member && totalAllWeeks > 0) {
      if (member.walletBalance < totalAllWeeks) {
        get().addToast({
          type: 'error',
          title: 'Insufficient Balance',
          message: `Wallet balance (₹${member.walletBalance}) is insufficient for ${weeksCount} weeks (₹${totalAllWeeks}).`,
        });
        return { success: false, createdCount: 0, error: 'Insufficient wallet balance' };
      }
      updatedMembers = members.map((m) =>
        m.id === member.id ? { ...m, walletBalance: m.walletBalance - totalAllWeeks } : m
      );
    }

    set((state) => ({
      bookings: [...newBookings, ...state.bookings],
      members: updatedMembers,
    }));

    get().addToast({
      type: 'success',
      title: 'Recurring Series Booked!',
      message: `Reserved ${newBookings.length} weekly sessions on ${court.name} at ${startTime}.`,
    });

    get().logAudit(
      'RECURRING_BOOKING_CREATED',
      `Series #${recurringGroupId}`,
      `Created ${newBookings.length} weekly slots on ${court.name} for ${guestName}`
    );

    persist(get());
    return { success: true, createdCount: newBookings.length };
  },

  joinSocialSession: (sessionId, memberId, paymentMethod = 'wallet') => {
    const session = get().socialSessions.find((s) => s.id === sessionId);
    if (!session) return { success: false, message: 'Session not found' };

    const member = get().members.find((m) => m.id === memberId);
    if (!member) return { success: false, message: 'Member not found' };

    if (session.currentParticipants.includes(memberId)) {
      return { success: false, message: 'Already joined this social play session.' };
    }

    const spots = getSocialSessionSpots(session);
    const fee = (member.tier === 'none' ? session.fee.walk_in : session.fee[member.tier]) || 0;

    let updatedMembers = get().members;
    if (fee > 0 && paymentMethod === 'wallet') {
      if (member.walletBalance < fee) {
        get().addToast({
          type: 'error',
          title: 'Insufficient Funds',
          message: `Wallet balance (₹${member.walletBalance}) is less than entry fee (₹${fee}).`,
        });
        return { success: false, message: 'Insufficient wallet balance' };
      }
      updatedMembers = get().members.map((m) =>
        m.id === member.id ? { ...m, walletBalance: m.walletBalance - fee } : m
      );
    }

    if (spots.isFull) {
      const waitlist = session.waitlist || [];
      if (waitlist.includes(memberId)) {
        return { success: false, message: 'You are already on the waitlist for this session.' };
      }

      set((state) => ({
        socialSessions: state.socialSessions.map((s) =>
          s.id === sessionId ? { ...s, waitlist: [...(s.waitlist || []), memberId] } : s
        ),
      }));

      get().addToast({
        type: 'info',
        title: 'Added to Waitlist',
        message: `Session is full. You are #${waitlist.length + 1} on the waitlist!`,
      });

      return { success: true, waitlisted: true, message: 'Added to waitlist' };
    }

    const participantDetail: SocialSessionParticipant = {
      memberId,
      name: member.fullName,
      tier: member.tier,
      phone: member.phone,
      joinedAt: new Date().toISOString(),
      paid: true,
      paymentMethod,
    };

    set((state) => ({
      socialSessions: state.socialSessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              currentParticipants: [...s.currentParticipants, memberId],
              participantDetails: [...(s.participantDetails || []), participantDetail],
            }
          : s
      ),
      members: updatedMembers,
    }));

    get().addToast({
      type: 'success',
      title: 'Joined Social Play!',
      message: `You're registered for ${session.title}. See you on the courts!`,
    });

    get().logAudit('SOCIAL_PLAY_JOIN', `Session #${sessionId}`, `${member.fullName} joined ${session.title}`);
    persist(get());
    return { success: true, message: 'Joined successfully' };
  },

  leaveSocialSession: (sessionId, memberId) => {
    const session = get().socialSessions.find((s) => s.id === sessionId);
    if (!session) return { success: false, message: 'Session not found' };

    const member = get().members.find((m) => m.id === memberId);
    const fee = member ? ((member.tier === 'none' ? session.fee.walk_in : session.fee[member.tier]) || 0) : 0;

    let updatedMembers = get().members;
    if (member && fee > 0) {
      updatedMembers = get().members.map((m) =>
        m.id === member.id ? { ...m, walletBalance: m.walletBalance + fee } : m
      );
    }

    const waitlist = session.waitlist || [];
    let promotedMemberId: string | undefined = undefined;
    let newWaitlist = [...waitlist];

    if (waitlist.length > 0) {
      promotedMemberId = waitlist[0];
      newWaitlist = waitlist.slice(1);
    }

    set((state) => ({
      socialSessions: state.socialSessions.map((s) => {
        if (s.id !== sessionId) return s;
        let participants = s.currentParticipants.filter((id) => id !== memberId);
        if (promotedMemberId) {
          participants.push(promotedMemberId);
        }
        return {
          ...s,
          currentParticipants: participants,
          waitlist: newWaitlist,
        };
      }),
      members: updatedMembers,
      notifications: promotedMemberId ? [
        {
          id: `notif_promo_${Date.now()}`,
          title: 'Waitlist Promoted!',
          message: `Member ${promotedMemberId} promoted into ${session.title} from waitlist.`,
          type: 'booking',
          targetRole: 'front_desk',
          timestamp: new Date().toISOString(),
          read: false,
          link: '/staff/bookings',
        },
        ...state.notifications
      ] : state.notifications,
    }));

    get().addToast({
      type: 'info',
      title: 'Left Social Session',
      message: fee > 0 ? `Withdrew from session. ₹${fee} refunded to your wallet.` : 'Withdrew from session.',
    });

    get().logAudit('SOCIAL_PLAY_LEAVE', `Session #${sessionId}`, `Member #${memberId} left. Waitlist promoted: ${promotedMemberId || 'none'}`);
    persist(get());
    return { success: true, message: 'Left session successfully' };
  },

  addLead: (leadData) => {
    const id = `lead_${Date.now()}`;
    const createdAt = new Date().toISOString();
    const referenceNumber = leadData.referenceNumber || `ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const initialActivity: LeadActivity = {
      id: `act_${Date.now()}`,
      type: 'status_change',
      content: `Lead captured via ${leadData.source.replace('_', ' ').toUpperCase()} (Ref: ${referenceNumber})`,
      authorName: get().currentUser.name || 'System Form',
      timestamp: createdAt,
    };

    const newLead: Lead = { 
      ...leadData, 
      id, 
      referenceNumber,
      createdAt,
      activities: leadData.activities ? [initialActivity, ...leadData.activities] : [initialActivity],
      tasks: leadData.tasks || [],
      quoteIds: leadData.quoteIds || [],
    };

    set((state) => ({ 
      leads: [newLead, ...state.leads],
      notifications: [
        {
          id: `notif_lead_${Date.now()}`,
          title: `New Lead: ${newLead.fullName}`,
          message: `${newLead.interest?.toUpperCase() || 'Membership'} enquiry (${newLead.sportInterest.join(', ')}) from ${newLead.source}. Ref: ${referenceNumber}`,
          type: 'lead',
          targetRole: 'all',
          timestamp: createdAt,
          read: false,
          link: '/staff/crm',
        },
        ...state.notifications
      ]
    }));

    get().addToast({
      type: 'success',
      title: 'Enquiry Registered',
      message: `Lead #${referenceNumber} logged for ${newLead.fullName}. Front Desk & Manager alerted.`,
    });

    get().logAudit('LEAD_CREATED', `Lead #${referenceNumber}`, `${newLead.fullName} (${newLead.source})`);
    persist(get());
    return newLead;
  },

  updateLead: (id, data) => {
    set((state) => ({
      leads: state.leads.map((l) => (l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l)),
    }));
    get().addToast({
      type: 'success',
      title: 'Lead Updated',
      message: 'Lead details updated successfully.',
    });
    persist(get());
  },

  updateLeadStatus: (id, status, lostReason) => {
    const lead = get().leads.find((l) => l.id === id);
    if (!lead) return;

    const nowIso = new Date().toISOString();
    const activityMsg = status === 'lost' 
      ? `Status changed to LOST. Reason: ${lostReason || 'Not specified'}` 
      : `Status changed from ${lead.status.toUpperCase()} to ${status.toUpperCase()}`;

    const newActivity: LeadActivity = {
      id: `act_${Date.now()}`,
      type: 'status_change',
      content: activityMsg,
      authorName: get().currentUser.name,
      timestamp: nowIso,
    };

    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === id
          ? {
              ...l,
              status,
              lostReason: status === 'lost' ? (lostReason || l.lostReason) : l.lostReason,
              updatedAt: nowIso,
              activities: [newActivity, ...(l.activities || [])],
            }
          : l
      ),
    }));

    get().addToast({
      type: status === 'won' ? 'success' : status === 'lost' ? 'warning' : 'info',
      title: `Lead #${lead.referenceNumber || lead.id}`,
      message: `Pipeline stage moved to ${status.replace('_', ' ').toUpperCase()}`,
    });

    get().logAudit('LEAD_STAGE_MOVED', `Lead #${lead.referenceNumber || lead.id}`, `Moved to ${status}`);
    persist(get());
  },

  addLeadActivity: (leadId, activityData) => {
    const lead = get().leads.find((l) => l.id === leadId);
    if (!lead) return;

    const newActivity: LeadActivity = {
      ...activityData,
      id: `act_${Date.now()}`,
      authorName: get().currentUser.name,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId
          ? {
              ...l,
              updatedAt: new Date().toISOString(),
              activities: [newActivity, ...(l.activities || [])],
            }
          : l
      ),
    }));

    get().addToast({
      type: 'info',
      title: 'Activity Logged',
      message: `${activityData.type.toUpperCase()} interaction saved to lead timeline.`,
    });

    persist(get());
  },

  addLeadTask: (leadId, taskData) => {
    const newTask: LeadTask = {
      ...taskData,
      id: `tsk_${Date.now()}`,
      completed: false,
    };

    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId
          ? {
              ...l,
              tasks: [...(l.tasks || []), newTask],
            }
          : l
      ),
    }));

    get().addToast({
      type: 'success',
      title: 'Follow-up Task Scheduled',
      message: `Task "${newTask.title}" added with due date ${newTask.dueDate}.`,
    });

    persist(get());
  },

  toggleLeadTask: (leadId, taskId) => {
    set((state) => ({
      leads: state.leads.map((l) => {
        if (l.id !== leadId) return l;
        const updatedTasks = (l.tasks || []).map((t) =>
          t.id === taskId
            ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined }
            : t
        );
        return { ...l, tasks: updatedTasks };
      }),
    }));
    persist(get());
  },

  createQuote: (quoteData) => {
    const id = `quo_${Date.now()}`;
    const quoteNumber = `QUO-2026-${Math.floor(100 + Math.random() * 900)}`;
    const createdAt = new Date().toISOString();

    const newQuote: Quote = {
      ...quoteData,
      id,
      quoteNumber,
      createdAt,
    };

    const newActivity: LeadActivity = {
      id: `act_${Date.now()}`,
      type: 'quote_created',
      content: `Generated Quotation #${quoteNumber} for ${formatINR(newQuote.totalAmount)} (Valid until ${newQuote.validUntil})`,
      authorName: get().currentUser.name,
      timestamp: createdAt,
    };

    set((state) => ({
      quotes: [newQuote, ...state.quotes],
      leads: state.leads.map((l) =>
        l.id === quoteData.leadId
          ? {
              ...l,
              status: l.status === 'new' || l.status === 'contacted' || l.status === 'trial_booked' ? 'quote_sent' : l.status,
              quoteIds: [...(l.quoteIds || []), id],
              activities: [newActivity, ...(l.activities || [])],
            }
          : l
      ),
    }));

    get().addToast({
      type: 'success',
      title: 'Quotation Generated',
      message: `Quote #${quoteNumber} for ${formatINR(newQuote.totalAmount)} created.`,
    });

    get().logAudit('QUOTE_CREATED', `Quote #${quoteNumber}`, `Created for ${newQuote.clientName} - ${formatINR(newQuote.totalAmount)}`);
    persist(get());
    return newQuote;
  },

  updateQuoteStatus: (quoteId, status) => {
    set((state) => ({
      quotes: state.quotes.map((q) => (q.id === quoteId ? { ...q, status } : q)),
    }));

    get().addToast({
      type: 'info',
      title: 'Quote Status Updated',
      message: `Quotation status updated to ${status.toUpperCase()}.`,
    });

    persist(get());
  },

  convertLeadToMember: (leadId, registrationData) => {
    const lead = get().leads.find((l) => l.id === leadId);
    if (!lead) return null;

    const { tier, paymentMethod, billingCycle, paymentAmount } = registrationData;
    const today = new Date();
    const expiry = new Date(today);
    if (billingCycle === 'annual') expiry.setFullYear(expiry.getFullYear() + 1);
    else if (billingCycle === 'quarterly') expiry.setMonth(expiry.getMonth() + 3);
    else expiry.setMonth(expiry.getMonth() + 1);

    const expiryDateStr = expiry.toISOString().split('T')[0];

    const newMemberData: Omit<Member, 'id' | 'memberNumber' | 'joinDate'> = {
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      tier,
      preferredSports: lead.sportInterest,
      status: 'active',
      expiryDate: expiryDateStr,
      walletBalance: 0,
      activeTabBalance: 0,
      emergencyContact: {
        name: 'Contact on Record',
        phone: lead.phone,
        relation: 'Self',
      },
      notes: `Converted from CRM Lead #${lead.referenceNumber || lead.id} (${lead.source}). Original notes: ${lead.notes}`,
    };

    const regResult = get().registerMember(newMemberData, paymentMethod, paymentAmount, billingCycle);

    // Update lead to Won and link member
    const nowIso = new Date().toISOString();
    const wonActivity: LeadActivity = {
      id: `act_${Date.now()}`,
      type: 'status_change',
      content: `Lead WON & Converted to Member #${regResult.member.memberNumber} (${tier.toUpperCase()})`,
      authorName: get().currentUser.name,
      timestamp: nowIso,
    };

    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: 'won',
              convertedMemberId: regResult.member.id,
              updatedAt: nowIso,
              activities: [wonActivity, ...(l.activities || [])],
            }
          : l
      ),
    }));

    get().addToast({
      type: 'success',
      title: 'Lead Converted to Club Member!',
      message: `${lead.fullName} enrolled as Member #${regResult.member.memberNumber}. Invoice posted to Finance.`,
    });

    get().logAudit(
      'LEAD_CONVERTED_MEMBER',
      `Lead #${lead.referenceNumber || lead.id}`,
      `Converted to Member #${regResult.member.memberNumber}`
    );

    persist(get());
    return regResult;
  },

  convertLeadToBusinessClient: (leadId, clientData) => {
    const lead = get().leads.find((l) => l.id === leadId);
    if (!lead) return null;

    const id = `biz_${Date.now()}`;
    const clientCode = `CORP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const createdAt = new Date().toISOString();

    const newBiz: BusinessClient = {
      ...clientData,
      id,
      clientCode,
      leadId,
      status: 'active',
      createdAt,
    };

    // Auto-generate Corporate Retainer Invoice in finance ledger
    const invId = `inv_corp_${Date.now()}`;
    const invoiceNumber = `INV-CORP-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = Math.round(clientData.contractValue / 1.18);
    const gstAmount = clientData.contractValue - subtotal;

    const corpInvoice: Invoice = {
      id: invId,
      invoiceNumber,
      recipientName: clientData.companyName,
      recipientEmail: clientData.email,
      recipientGst: clientData.gstNumber,
      category: 'membership',
      items: [
        {
          description: `${clientData.packageType} (Corporate SLA Agreement - ${clientData.creditTerms.toUpperCase()})`,
          quantity: 1,
          rate: subtotal,
          amount: subtotal,
        }
      ],
      subtotal,
      gstRate: 0.18,
      gstAmount,
      totalAmount: clientData.contractValue,
      status: 'unpaid',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt,
    };

    const nowIso = new Date().toISOString();
    const wonActivity: LeadActivity = {
      id: `act_${Date.now()}`,
      type: 'status_change',
      content: `Lead WON & Converted to Business Client #${clientCode} (${clientData.companyName}) with ${clientData.creditTerms.toUpperCase()} credit terms.`,
      authorName: get().currentUser.name,
      timestamp: nowIso,
    };

    set((state) => ({
      businessClients: [newBiz, ...state.businessClients],
      invoices: [corpInvoice, ...state.invoices],
      leads: state.leads.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: 'won',
              convertedBusinessClientId: id,
              updatedAt: nowIso,
              activities: [wonActivity, ...(l.activities || [])],
            }
          : l
      ),
    }));

    get().addToast({
      type: 'success',
      title: 'Corporate Account Established!',
      message: `${clientData.companyName} registered as Business Client #${clientCode}. SLA Invoice #${invoiceNumber} logged.`,
    });

    get().logAudit(
      'LEAD_CONVERTED_CORPORATE',
      `Lead #${lead.referenceNumber || lead.id}`,
      `Created Business Client #${clientCode} (${clientData.companyName})`
    );

    persist(get());
    return newBiz;
  },

  addBusinessClient: (clientData) => {
    const id = `biz_${Date.now()}`;
    const clientCode = `CORP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const createdAt = new Date().toISOString();

    const newBiz: BusinessClient = {
      ...clientData,
      id,
      clientCode,
      createdAt,
    };

    set((state) => ({ businessClients: [newBiz, ...state.businessClients] }));
    get().addToast({
      type: 'success',
      title: 'Business Client Added',
      message: `${newBiz.companyName} registered in company master.`,
    });

    persist(get());
    return newBiz;
  },

  updateBusinessClient: (id, data) => {
    set((state) => ({
      businessClients: state.businessClients.map((b) => (b.id === id ? { ...b, ...data } : b)),
    }));
    get().addToast({
      type: 'success',
      title: 'Corporate Details Updated',
      message: 'Company master records saved.',
    });
    persist(get());
  },

  addMember: (memberData) => {
    const index = get().members.length + 1;
    const id = `mem_${Date.now()}`;
    const memberNumber = `CC-2026-${(1000 + index).toString()}`;
    const joinDate = new Date().toISOString().split('T')[0];
    const newMember: Member = {
      ...memberData,
      id,
      memberNumber,
      joinDate,
    };

    set((state) => ({ members: [newMember, ...state.members] }));
    get().addToast({
      type: 'success',
      title: 'Member Enrolled',
      message: `Welcome ${newMember.fullName} (${newMember.memberNumber}) to Champions Club!`,
    });
    get().logAudit('MEMBER_ENROLLED', `Member #${id}`, `Enrolled ${newMember.fullName} in ${newMember.tier} tier`);
    persist(get());
    return newMember;
  },

  registerMember: (memberData, paymentMethod, paymentAmount, billingCycle) => {
    const index = get().members.length + 1;
    const id = `mem_${Date.now()}`;
    const memberNumber = `CC-2026-${(1000 + index).toString()}`;
    const joinDate = new Date().toISOString().split('T')[0];
    
    const newMember: Member = {
      ...memberData,
      id,
      memberNumber,
      joinDate,
      attendanceLog: [
        {
          id: `att_${Date.now()}`,
          timestamp: new Date().toISOString(),
          courtName: 'Reception Gate (Initial Enrollment)',
          checkedInBy: get().currentUser.name,
        }
      ],
      reminderLog: [
        {
          id: `rem_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'whatsapp',
          message: `Welcome to Champions Club! Your ${memberData.tier.toUpperCase()} Membership Pass is ${memberNumber}.`,
          sentBy: 'System Auto-Onboarding',
          status: 'delivered',
        }
      ],
    };

    // Auto-generate invoice
    const invId = `inv_${Date.now()}`;
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = Math.round(paymentAmount / 1.18);
    const gstAmount = paymentAmount - subtotal;

    const newInvoice: Invoice = {
      id: invId,
      invoiceNumber,
      memberId: id,
      recipientName: newMember.fullName,
      recipientEmail: newMember.email,
      category: 'membership',
      items: [
        {
          description: `${newMember.tier.toUpperCase()} Membership (${billingCycle.toUpperCase()}) Enrollment`,
          quantity: 1,
          rate: subtotal,
          amount: subtotal,
        }
      ],
      subtotal,
      gstRate: 0.18,
      gstAmount,
      totalAmount: paymentAmount,
      status: 'paid',
      dueDate: joinDate,
      paidAt: new Date().toISOString(),
      paymentMethod: paymentMethod.toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    // Auto-generate payment receipt
    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      paymentNumber: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceId: invId,
      memberId: id,
      payerName: newMember.fullName,
      amount: paymentAmount,
      method: (paymentMethod as any) || 'upi',
      status: 'success',
      transactionRef: `${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      purpose: `${newMember.tier.toUpperCase()} Membership Enrollment`,
    };

    set((state) => ({
      members: [newMember, ...state.members],
      invoices: [newInvoice, ...state.invoices],
      payments: [newPayment, ...state.payments],
    }));

    get().addToast({
      type: 'success',
      title: 'Member Registered & Invoiced',
      message: `Issued ${newMember.memberNumber} for ${newMember.fullName}. Invoice ${invoiceNumber} posted to Finance.`,
    });

    get().logAudit(
      'MEMBER_REGISTERED',
      `Member #${newMember.memberNumber}`,
      `Registered ${newMember.fullName} (${newMember.tier}) via ${paymentMethod}. Posted Invoice ${invoiceNumber} for ₹${paymentAmount}`
    );

    get().addNotification({
      title: 'New Member Registered',
      message: `${newMember.fullName} enrolled as ${newMember.tier.toUpperCase()} member (${newMember.memberNumber})`,
      type: 'membership',
      targetRole: 'front_desk',
      link: '/staff/members',
    });

    persist(get());
    return { member: newMember, invoice: newInvoice };
  },

  updateMember: (id, data) => {
    const current = get().currentUser;
    const isCurrentUser =
      (current.memberId && current.memberId === id) ||
      get().members.find((m) => m.id === id)?.email?.toLowerCase() === current.email?.toLowerCase();

    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, ...data } : m)),
      currentUser: isCurrentUser
        ? {
            ...current,
            name: data.fullName !== undefined ? data.fullName : current.name,
            avatar: data.avatar !== undefined ? data.avatar : current.avatar,
            phone: data.phone !== undefined ? data.phone : current.phone,
          }
        : current,
    }));
    get().logAudit('MEMBER_UPDATED', `Member #${id}`, 'Updated member profile data');
    persist(get());
  },

  renewMember: (memberId, durationMonths, paymentMethod) => {
    const member = get().members.find((m) => m.id === memberId);
    if (!member) return;

    const plan = get().plans.find((p) => p.tier === member.tier) || get().plans[0];
    const baseMonthly = plan.monthlyPrice;
    const baseCost = durationMonths === 12 ? plan.annualPrice : durationMonths === 3 ? plan.quarterlyPrice : baseMonthly * durationMonths;
    const totalWithGst = Math.round(baseCost * 1.18);

    // Calculate new expiry date
    const currentExpiry = new Date(member.expiryDate);
    const today = new Date();
    const startFrom = currentExpiry > today ? currentExpiry : today;
    startFrom.setMonth(startFrom.getMonth() + durationMonths);
    const newExpiryStr = startFrom.toISOString().split('T')[0];

    const invId = `inv_${Date.now()}`;
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const renewalInvoice: Invoice = {
      id: invId,
      invoiceNumber,
      memberId,
      recipientName: member.fullName,
      recipientEmail: member.email,
      category: 'membership',
      items: [
        {
          description: `${member.tier.toUpperCase()} Membership Renewal (${durationMonths} Months)`,
          quantity: 1,
          rate: baseCost,
          amount: baseCost,
        }
      ],
      subtotal: baseCost,
      gstRate: 0.18,
      gstAmount: totalWithGst - baseCost,
      totalAmount: totalWithGst,
      status: 'paid',
      dueDate: new Date().toISOString().split('T')[0],
      paidAt: new Date().toISOString(),
      paymentMethod: paymentMethod.toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    const renewalPayment: Payment = {
      id: `pay_${Date.now()}`,
      paymentNumber: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceId: invId,
      memberId,
      payerName: member.fullName,
      amount: totalWithGst,
      method: paymentMethod as any,
      status: 'success',
      transactionRef: `RNW-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      purpose: `${member.tier.toUpperCase()} Renewal for ${durationMonths} Months`,
    };

    const newReminderLog: MemberReminderLog = {
      id: `rem_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'whatsapp',
      message: `Your Champions Club ${member.tier.toUpperCase()} membership has been renewed until ${newExpiryStr}. Payment: ₹${totalWithGst}`,
      sentBy: get().currentUser.name,
      status: 'delivered',
    };

    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId
          ? {
              ...m,
              status: 'active',
              expiryDate: newExpiryStr,
              frozenDate: undefined,
              reminderLog: [newReminderLog, ...(m.reminderLog || [])],
            }
          : m
      ),
      invoices: [renewalInvoice, ...state.invoices],
      payments: [renewalPayment, ...state.payments],
    }));

    get().addToast({
      type: 'success',
      title: 'Membership Renewed',
      message: `${member.fullName} renewed until ${newExpiryStr}. Invoice #${invoiceNumber} logged.`,
    });

    get().logAudit(
      'MEMBER_RENEWED',
      `Member #${member.memberNumber}`,
      `Renewed for ${durationMonths} months until ${newExpiryStr} via ${paymentMethod}`
    );

    persist(get());
  },

  upgradeMember: (memberId, newTier, proratedAmount, paymentMethod) => {
    const member = get().members.find((m) => m.id === memberId);
    if (!member) return;

    const invId = `inv_${Date.now()}`;
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = Math.round(proratedAmount / 1.18);

    const upgradeInvoice: Invoice = {
      id: invId,
      invoiceNumber,
      memberId,
      recipientName: member.fullName,
      recipientEmail: member.email,
      category: 'membership',
      items: [
        {
          description: `Prorated Membership Upgrade: ${member.tier.toUpperCase()} to ${newTier.toUpperCase()}`,
          quantity: 1,
          rate: subtotal,
          amount: subtotal,
        }
      ],
      subtotal,
      gstRate: 0.18,
      gstAmount: proratedAmount - subtotal,
      totalAmount: proratedAmount,
      status: 'paid',
      dueDate: new Date().toISOString().split('T')[0],
      paidAt: new Date().toISOString(),
      paymentMethod: paymentMethod.toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    const upgradePayment: Payment = {
      id: `pay_${Date.now()}`,
      paymentNumber: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceId: invId,
      memberId,
      payerName: member.fullName,
      amount: proratedAmount,
      method: paymentMethod as any,
      status: 'success',
      transactionRef: `UPG-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      purpose: `Upgrade to ${newTier.toUpperCase()}`,
    };

    const newReminderLog: MemberReminderLog = {
      id: `rem_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'whatsapp',
      message: `Congratulations! Your membership has been upgraded to ${newTier.toUpperCase()}. Enjoy enhanced court, pro shop and bar perks!`,
      sentBy: get().currentUser.name,
      status: 'delivered',
    };

    const isCurrent =
      Boolean(get().currentUser.memberId && get().currentUser.memberId === memberId) ||
      Boolean(get().currentUser.email && member.email && get().currentUser.email.toLowerCase() === member.email.toLowerCase());

    set((state) => ({
      currentUser: isCurrent ? { ...state.currentUser, tier: newTier } : state.currentUser,
      members: state.members.map((m) =>
        m.id === memberId
          ? {
              ...m,
              tier: newTier,
              status: 'active',
              reminderLog: [newReminderLog, ...(m.reminderLog || [])],
            }
          : m
      ),
      invoices: [upgradeInvoice, ...state.invoices],
      payments: [upgradePayment, ...state.payments],
    }));

    // Sync to backend database
    fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: member.email,
        tier: newTier,
        plan: newTier === 'gold' ? 'Gold' : newTier === 'silver' ? 'Silver' : newTier === 'junior' ? 'Junior' : 'Walk-in',
      }),
    }).catch((err) => console.warn('Could not sync upgrade to backend profile:', err));

    get().addToast({
      type: 'success',
      title: `Upgraded to ${newTier.toUpperCase()}`,
      message: `${member.fullName} upgraded with invoice #${invoiceNumber}`,
    });

    get().logAudit(
      'MEMBER_UPGRADED',
      `Member #${member.memberNumber}`,
      `Upgraded from ${member.tier} to ${newTier}. Paid prorated ₹${proratedAmount}`
    );

    persist(get());
  },

  downgradeMember: (memberId, newTier, proratedAdjustment = 0) => {
    const member = get().members.find((m) => m.id === memberId);
    if (!member) return;

    const invId = `inv_${Date.now()}`;
    const invoiceNumber = `INV-ADJ-${Math.floor(1000 + Math.random() * 9000)}`;

    const adjustmentInvoice: Invoice = {
      id: invId,
      invoiceNumber,
      memberId,
      recipientName: member.fullName,
      recipientEmail: member.email,
      category: 'membership',
      items: [
        {
          description: `Membership Plan Adjustment: Downgraded from ${member.tier.toUpperCase()} to ${newTier.toUpperCase()}`,
          quantity: 1,
          rate: Math.round(proratedAdjustment / 1.18),
          amount: Math.round(proratedAdjustment / 1.18),
        }
      ],
      subtotal: Math.round(proratedAdjustment / 1.18),
      gstRate: 0.18,
      gstAmount: proratedAdjustment - Math.round(proratedAdjustment / 1.18),
      totalAmount: proratedAdjustment,
      status: 'paid',
      dueDate: new Date().toISOString().split('T')[0],
      paidAt: new Date().toISOString(),
      paymentMethod: 'LEDGER_ADJUSTMENT',
      createdAt: new Date().toISOString(),
    };

    const newReminderLog: MemberReminderLog = {
      id: `rem_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'whatsapp',
      message: `Your membership tier has been modified to ${newTier.toUpperCase()}. Future bookings and entitlements will follow the new tier rates.`,
      sentBy: get().currentUser.name,
      status: 'delivered',
    };

    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId
          ? {
              ...m,
              tier: newTier,
              reminderLog: [newReminderLog, ...(m.reminderLog || [])],
            }
          : m
      ),
      invoices: [adjustmentInvoice, ...state.invoices],
    }));

    get().addToast({
      type: 'info',
      title: `Plan Adjusted to ${newTier.toUpperCase()}`,
      message: `${member.fullName}'s plan modified. Adjustment Invoice #${invoiceNumber} logged.`,
    });

    get().logAudit(
      'MEMBER_DOWNGRADED',
      `Member #${member.memberNumber}`,
      `Downgraded from ${member.tier} to ${newTier} with adjustment invoice #${invoiceNumber}`
    );
    persist(get());
  },

  freezeMember: (memberId, reason) => {
    const member = get().members.find((m) => m.id === memberId);
    if (!member) return;

    const todayStr = new Date().toISOString().split('T')[0];
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId
          ? {
              ...m,
              status: 'frozen',
              frozenDate: todayStr,
              notes: `${m.notes ? m.notes + ' | ' : ''}Frozen on ${todayStr}: ${reason || 'Medical / Travel pause'}`,
            }
          : m
      ),
    }));

    get().addToast({
      type: 'warning',
      title: 'Membership Frozen',
      message: `${member.fullName}'s membership paused. Court booking & bar tab privileges on hold.`,
    });

    get().logAudit('MEMBER_FROZEN', `Member #${member.memberNumber}`, `Frozen: ${reason || 'Member requested'}`);
    persist(get());
  },

  unfreezeMember: (memberId) => {
    const member = get().members.find((m) => m.id === memberId);
    if (!member) return;

    const today = new Date();
    let daysFrozen = 14; // default demo fallback
    if (member.frozenDate) {
      const fDate = new Date(member.frozenDate);
      const diffMs = Math.abs(today.getTime() - fDate.getTime());
      daysFrozen = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    }

    // Extend expiry by days frozen
    const expiry = new Date(member.expiryDate);
    expiry.setDate(expiry.getDate() + daysFrozen);
    const newExpiry = expiry.toISOString().split('T')[0];

    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId
          ? {
              ...m,
              status: 'active',
              frozenDate: undefined,
              frozenDaysCount: (m.frozenDaysCount || 0) + daysFrozen,
              expiryDate: newExpiry,
              notes: `${m.notes ? m.notes + ' | ' : ''}Unfrozen on ${today.toISOString().split('T')[0]} (extended by ${daysFrozen} days)`,
            }
          : m
      ),
    }));

    get().addToast({
      type: 'success',
      title: 'Membership Resumed',
      message: `${member.fullName} is now active. Expiry extended by ${daysFrozen} days to ${newExpiry}.`,
    });

    get().logAudit(
      'MEMBER_UNFROZEN',
      `Member #${member.memberNumber}`,
      `Unfrozen after ${daysFrozen} days. New expiry: ${newExpiry}`
    );

    persist(get());
  },

  checkInMember: (memberId, courtName) => {
    const member = get().members.find((m) => m.id === memberId);
    if (!member) {
      return { success: false, todayCount: 0, maxAllowed: 2, message: 'Member not found.' };
    }

    // Check if expired past grace period
    const today = new Date();
    const expiry = new Date(member.expiryDate);
    const graceDays = get().settings.gracePeriodDays || 7;
    const diffDays = Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < -graceDays) {
      get().addToast({
        type: 'error',
        title: 'Check-in Blocked: Expired',
        message: `${member.fullName}'s membership expired on ${member.expiryDate} and is beyond the ${graceDays}-day grace period.`,
      });
      return { success: false, todayCount: 0, maxAllowed: 2, message: 'Membership expired beyond grace period. Benefits auto-blocked.' };
    }

    if (member.status === 'frozen' || member.status === 'suspended') {
      get().addToast({
        type: 'error',
        title: `Check-in Blocked (${member.status.toUpperCase()})`,
        message: `${member.fullName}'s account is currently ${member.status}.`,
      });
      return { success: false, todayCount: 0, maxAllowed: 2, message: `Account is currently ${member.status}.` };
    }

    const todayDateStr = today.toISOString().split('T')[0];
    const todayAttendances = (member.attendanceLog || []).filter(
      (a) => a.timestamp.startsWith(todayDateStr)
    );
    const currentTodayCount = todayAttendances.length;
    const maxAllowed = get().settings.dailyBookingCap || 2;

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      timestamp: new Date().toISOString(),
      courtName: courtName || 'Main Reception Gate',
      checkedInBy: get().currentUser.name,
    };

    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId
          ? {
              ...m,
              attendanceLog: [newRecord, ...(m.attendanceLog || [])],
            }
          : m
      ),
    }));

    const newCount = currentTodayCount + 1;

    get().addToast({
      type: 'success',
      title: 'Member Checked In',
      message: `${member.fullName} checked in (${newCount} of ${maxAllowed} used today).`,
    });

    get().logAudit(
      'MEMBER_CHECKIN',
      `Member #${member.memberNumber}`,
      `Checked in at ${newRecord.courtName} (${newCount}/${maxAllowed} today)`
    );

    persist(get());
    return {
      success: true,
      todayCount: newCount,
      maxAllowed,
      message: `Checked in successfully (${newCount} of ${maxAllowed} used today).`,
    };
  },

  topupWallet: (memberId, amount, method) => {
    const member = get().members.find((m) => m.id === memberId);
    if (!member) return;

    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      paymentNumber: `PAY-WLT-${Math.floor(1000 + Math.random() * 9000)}`,
      memberId,
      payerName: member.fullName,
      amount,
      method,
      status: 'success',
      transactionRef: `WLT-${method.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      purpose: 'Club Wallet Recharge',
    };

    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId
          ? { ...m, walletBalance: m.walletBalance + amount }
          : m
      ),
      payments: [newPayment, ...state.payments],
    }));

    get().addToast({
      type: 'success',
      title: 'Wallet Recharged',
      message: `Credited ₹${amount} to ${member.fullName}. Balance: ₹${member.walletBalance + amount}`,
    });

    get().logAudit(
      'WALLET_RECHARGE',
      `Member #${member.memberNumber}`,
      `Credited ₹${amount} via ${method}`
    );

    persist(get());
  },

  sendMemberReminder: (memberId, channel, customMessage) => {
    const member = get().members.find((m) => m.id === memberId);
    if (!member) return;

    const defaultMsg = `Dear ${member.fullName}, this is a reminder from Champions Club regarding your ${member.tier.toUpperCase()} membership (Pass #${member.memberNumber}), expiring on ${member.expiryDate}. Contact the Front Desk to renew!`;
    const message = customMessage || defaultMsg;

    const record: MemberReminderLog = {
      id: `rem_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: channel,
      message,
      sentBy: get().currentUser.name,
      status: 'delivered',
    };

    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId
          ? { ...m, reminderLog: [record, ...(m.reminderLog || [])] }
          : m
      ),
      notifications: [
        {
          id: `notif_${Date.now()}`,
          title: `Sent ${channel.toUpperCase()} Reminder`,
          message: `Sent to ${member.fullName} (${member.phone})`,
          type: 'membership',
          timestamp: new Date().toISOString(),
          read: false,
          link: '/staff/members',
        },
        ...state.notifications,
      ],
    }));

    get().addToast({
      type: 'info',
      title: `Simulated ${channel.toUpperCase()} Dispatched`,
      message: `Message sent to ${member.phone}`,
    });

    get().logAudit(
      'REMINDER_SENT',
      `Member #${member.memberNumber}`,
      `Dispatched ${channel} reminder`
    );

    persist(get());
  },

  sendBulkExpiryReminders: (memberIds, channel) => {
    memberIds.forEach((id) => {
      get().sendMemberReminder(id, channel);
    });

    get().addToast({
      type: 'success',
      title: 'Bulk Reminders Dispatched',
      message: `Sent ${channel.toUpperCase()} notifications to ${memberIds.length} members.`,
    });

    get().logAudit(
      'BULK_REMINDERS_SENT',
      'Membership Lifecycle',
      `Dispatched ${channel} notifications to ${memberIds.length} members`
    );
  },

  runLifecycleRemindersCheck: () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const graceDays = get().settings.gracePeriodDays || 7;
    let remindedCount = 0;
    let expiredCount = 0;

    const newNotifications: Notification[] = [];
    const updatedMembers = get().members.map((m) => {
      if (m.status === 'cancelled') return m;

      const expDate = new Date(m.expiryDate);
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      let currentStatus = m.status;
      let reminderLog = m.reminderLog || [];

      // Check automated reminders at 30, 7, and 1 days before expiry
      if ([30, 7, 1].includes(diffDays)) {
        const alreadyLoggedToday = reminderLog.some(
          (r) => r.timestamp.startsWith(todayStr) && r.message.includes(`${diffDays} day`)
        );

        if (!alreadyLoggedToday) {
          remindedCount++;
          const channel = diffDays === 1 ? 'sms' : diffDays === 7 ? 'whatsapp' : 'email';
          const msg = `Automated Expiry Alert: Dear ${m.fullName}, your Champions Club ${m.tier.toUpperCase()} membership expires in ${diffDays} day(s) on ${m.expiryDate}. Contact the Front Desk to renew!`;

          reminderLog = [
            {
              id: `rem_auto_${Date.now()}_${m.id}_${diffDays}`,
              timestamp: new Date().toISOString(),
              type: channel,
              message: msg,
              sentBy: 'System Lifecycle Daemon',
              status: 'delivered',
            },
            ...reminderLog,
          ];

          newNotifications.push({
            id: `notif_exp_${Date.now()}_${m.id}_${diffDays}`,
            title: `Membership Expiring (${diffDays}d): ${m.fullName}`,
            message: `${m.memberNumber} (${m.tier.toUpperCase()}) expires on ${m.expiryDate}. Auto-${channel.toUpperCase()} logged.`,
            type: 'membership',
            timestamp: new Date().toISOString(),
            read: false,
            link: '/staff/members',
          });
        }
      }

      // Check status transitions
      if (diffDays < 0) {
        if (currentStatus !== 'expired' && currentStatus !== 'frozen') {
          currentStatus = 'expired';
          expiredCount++;
        }
      } else if (diffDays <= 7 && currentStatus === 'active') {
        currentStatus = 'expiring';
      }

      return {
        ...m,
        status: currentStatus,
        reminderLog,
      };
    });

    if (remindedCount > 0 || expiredCount > 0 || newNotifications.length > 0) {
      set((state) => ({
        members: updatedMembers,
        notifications: [...newNotifications, ...state.notifications],
      }));
      persist(get());
    }

    return { remindedCount, expiredCount };
  },

  updatePlanEntitlements: (tier, entitlements) => {
    set((state) => ({
      plans: state.plans.map((p) =>
        p.tier === tier
          ? {
              ...p,
              entitlements: {
                ...p.entitlements,
                ...entitlements,
              },
            }
          : p
      ),
    }));

    get().addToast({
      type: 'success',
      title: 'Plan Entitlements Updated',
      message: `Saved changes to ${tier.toUpperCase()} entitlements matrix.`,
    });

    get().logAudit('PLAN_ENTITLEMENTS_UPDATED', `Tier: ${tier}`, 'Modified plan parameters');
    persist(get());
  },

  addMemberNote: (memberId, noteText) => {
    const today = new Date().toISOString().split('T')[0];
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId
          ? {
              ...m,
              notes: m.notes ? `${m.notes} | [${today} by ${get().currentUser.name}]: ${noteText}` : `[${today} by ${get().currentUser.name}]: ${noteText}`,
            }
          : m
      ),
    }));

    get().addToast({
      type: 'success',
      title: 'Staff Note Saved',
      message: 'Note logged into member profile.',
    });

    persist(get());
  },

  addTabOrder: (tabId, item) => {
    get().addTabOrdersBatch(tabId, [item]);
  },

  addTabOrdersBatch: (tabId, items, serverName) => {
    const tab = get().tabs.find((t) => t.id === tabId);
    if (!tab) return;

    const { menuItems, barOrders } = get();
    const isHappyHour = new Date().getHours() >= 17 && new Date().getHours() < 20; // 5 PM - 8 PM

    // Add unique IDs and timestamps
    const nowIso = new Date().toISOString();
    const formattedItems = items.map((i) => ({
      ...i,
      id: i.id || `oi_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      orderedAt: nowIso,
      status: 'ordered' as const,
    }));

    const combinedOrders = [...tab.orders, ...formattedItems];
    const totals = calculateTabTotals(combinedOrders, tab.tier, isHappyHour, tab.tipAmount || 0);

    // Create KDS ticket for kitchen / bar display
    const kdsId = `kds_${Date.now()}`;
    const kdsOrderNumber = `KDS-${Math.floor(1000 + Math.random() * 9000)}`;

    const kitchenItems = formattedItems.filter((i) => i.station === 'kitchen');
    const barItems = formattedItems.filter((i) => i.station === 'bar');

    const newKdsTickets: BarOrder[] = [];

    if (kitchenItems.length > 0) {
      newKdsTickets.push({
        id: `${kdsId}_kit`,
        orderNumber: `${kdsOrderNumber}-K`,
        tabId,
        tableId: tab.tableId,
        tableName: tab.tableName,
        serverName: serverName || tab.serverName || get().currentUser.name,
        station: 'kitchen',
        items: kitchenItems,
        status: 'ordered',
        timestamp: nowIso,
      });
    }

    if (barItems.length > 0) {
      newKdsTickets.push({
        id: `${kdsId}_bar`,
        orderNumber: `${kdsOrderNumber}-B`,
        tabId,
        tableId: tab.tableId,
        tableName: tab.tableName,
        serverName: serverName || tab.serverName || get().currentUser.name,
        station: 'bar',
        items: barItems,
        status: 'ordered',
        timestamp: nowIso,
      });
    }

    // Optional stock deduction on menu items
    const updatedMenuItems = menuItems.map((m) => {
      const matchOrder = formattedItems.find((it) => it.menuItemId === m.id);
      if (matchOrder && m.stockDeduction && m.availableStock !== undefined) {
        return { ...m, availableStock: Math.max(0, m.availableStock - matchOrder.quantity) };
      }
      return m;
    });

    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId
          ? {
              ...t,
              orders: combinedOrders,
              subtotal: totals.subtotal,
              discountAmount: totals.discountAmount,
              happyHourDiscount: totals.happyHourDiscount,
              gstAmount: totals.gstAmount,
              totalAmount: totals.totalAmount,
            }
          : t
      ),
      barOrders: [...newKdsTickets, ...state.barOrders],
      menuItems: updatedMenuItems,
    }));

    get().addToast({
      type: 'success',
      title: 'Order Sent to Stations',
      message: `${formattedItems.length} item(s) dispatched to Kitchen & Bar KDS screens for ${tab.tableName}.`,
    });

    get().logAudit(
      'BAR_ORDER_DISPATCHED',
      `Tab #${tab.tabNumber || tabId}`,
      `Dispatched ${formattedItems.length} item(s) for ${tab.customerName} (${tab.tableName})`
    );

    persist(get());
  },

  updateKdsTicketStatus: (orderId, status) => {
    const nowIso = new Date().toISOString();
    set((state) => ({
      barOrders: state.barOrders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              readyAt: status === 'ready' ? nowIso : o.readyAt,
              servedAt: status === 'served' ? nowIso : o.servedAt,
            }
          : o
      ),
    }));

    get().addToast({
      type: status === 'ready' ? 'success' : 'info',
      title: `Ticket #${orderId.split('_')[0]} ${status.toUpperCase()}`,
      message: `Status updated on live KDS station.`,
    });

    persist(get());
  },

  voidTabOrderItem: (tabId, itemIndex, reason, approvedBy) => {
    const tab = get().tabs.find((t) => t.id === tabId);
    if (!tab) return { success: false, error: 'Tab not found' };

    const targetItem = tab.orders[itemIndex];
    if (!targetItem) return { success: false, error: 'Item not found in tab' };

    const updatedOrders = tab.orders.map((o, idx) =>
      idx === itemIndex
        ? {
            ...o,
            status: 'voided' as const,
            voidReason: reason || 'Manager authorized cancellation',
            voidApprovedBy: approvedBy || get().currentUser.name,
          }
        : o
    );

    const totals = calculateTabTotals(updatedOrders, tab.tier, false, tab.tipAmount || 0);

    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId
          ? {
              ...t,
              orders: updatedOrders,
              subtotal: totals.subtotal,
              discountAmount: totals.discountAmount,
              happyHourDiscount: totals.happyHourDiscount,
              gstAmount: totals.gstAmount,
              totalAmount: totals.totalAmount,
            }
          : t
      ),
    }));

    get().addToast({
      type: 'warning',
      title: 'Item Voided with Approval',
      message: `Voided ${targetItem.name} (x${targetItem.quantity}). Bill updated.`,
    });

    get().logAudit(
      'BAR_ITEM_VOIDED',
      `Tab #${tab.tabNumber || tabId}`,
      `Voided ${targetItem.name} (₹${targetItem.price * targetItem.quantity}). Reason: ${reason} (Approved by ${approvedBy || get().currentUser.name})`
    );

    persist(get());
    return { success: true };
  },

  transferTabTable: (tabId, newTableId) => {
    const tab = get().tabs.find((t) => t.id === tabId);
    const newTable = get().tables.find((tbl) => tbl.id === newTableId);
    if (!tab || !newTable) return;

    const oldTableId = tab.tableId;

    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId
          ? {
              ...t,
              tableId: newTableId,
              tableName: newTable.name,
            }
          : t
      ),
      tables: state.tables.map((tbl) => {
        if (tbl.id === oldTableId) {
          return { ...tbl, status: 'available', activeTabId: undefined };
        }
        if (tbl.id === newTableId) {
          return { ...tbl, status: 'occupied', activeTabId: tabId };
        }
        return tbl;
      }),
    }));

    get().addToast({
      type: 'success',
      title: 'Table Transferred',
      message: `${tab.customerName}'s tab moved from ${tab.tableName} to ${newTable.name}.`,
    });

    get().logAudit(
      'TAB_TABLE_TRANSFER',
      `Tab #${tab.tabNumber || tabId}`,
      `Moved from ${tab.tableName} to ${newTable.name}`
    );

    persist(get());
  },

  mergeTablesAction: (primaryTableId, tableIdsToMerge) => {
    const { tables } = get();
    const updatedTables = mergeTables(primaryTableId, tableIdsToMerge, tables);

    set({ tables: updatedTables });

    get().addToast({
      type: 'success',
      title: 'Tables Merged Successfully',
      message: `Combined tables to accommodate large group banquet.`,
    });

    get().logAudit('TABLES_MERGED', `Primary #${primaryTableId}`, `Merged with [${tableIdsToMerge.join(', ')}]`);
    persist(get());
  },

  settleTab: (tabId, method) => {
    get().settleTabComplete(tabId, method);
  },

  settleTabComplete: (tabId, method, tipAmount = 0, splitData) => {
    const tab = get().tabs.find((t) => t.id === tabId);
    if (!tab) return { success: false };

    const { members } = get();
    const finalBill = tab.totalAmount + tipAmount;
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];

    // Handle Member Wallet Deduction
    let updatedMembers = members;
    const newPayments: Payment[] = [];

    if (method === 'wallet' && tab.memberId && finalBill > 0) {
      const member = members.find((m) => m.id === tab.memberId);
      if (member) {
        if (member.walletBalance < finalBill) {
          get().addToast({
            type: 'error',
            title: 'Insufficient Wallet Balance',
            message: `Member wallet has ₹${member.walletBalance}, required ₹${Math.round(finalBill)}.`,
          });
          return { success: false };
        }

        updatedMembers = members.map((m) =>
          m.id === tab.memberId ? { ...m, walletBalance: m.walletBalance - finalBill } : m
        );

        newPayments.push({
          id: `pay_bar_${Date.now()}`,
          paymentNumber: `PAY-BAR-${Math.floor(1000 + Math.random() * 9000)}`,
          memberId: member.id,
          payerName: member.fullName,
          amount: finalBill,
          method: 'wallet',
          status: 'success',
          transactionRef: `WLT-BAR-${tabId}`,
          timestamp: nowIso,
          purpose: `Bar & Cafe Tab #${tab.tabNumber || tabId} (${tab.tableName})`,
        });
      }
    } else if (method !== 'wallet' && finalBill > 0) {
      newPayments.push({
        id: `pay_bar_${Date.now()}`,
        paymentNumber: `PAY-BAR-${Math.floor(1000 + Math.random() * 9000)}`,
        memberId: tab.memberId,
        payerName: tab.customerName,
        amount: finalBill,
        method: method as any,
        status: 'success',
        transactionRef: `${method.toUpperCase()}-BAR-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: nowIso,
        purpose: `Bar & Cafe Tab #${tab.tabNumber || tabId} (${tab.tableName})`,
      });
    }

    // Auto-post Tax Invoice to Finance Ledger
    const invId = `inv_bar_${Date.now()}`;
    const invoiceNumber = `INV-BAR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice: Invoice = {
      id: invId,
      invoiceNumber,
      memberId: tab.memberId,
      recipientName: tab.customerName,
      recipientEmail: tab.customerPhone ? `${tab.customerName.toLowerCase().replace(/\s+/g, '')}@example.com` : 'bar@championsclub.in',
      category: 'bar_cafe',
      items: tab.orders.filter((o) => o.status !== 'voided').map((o) => ({
        description: `${o.name} (x${o.quantity}) ${o.guestSeat ? `[${o.guestSeat}]` : ''}`,
        quantity: o.quantity,
        rate: o.price,
        amount: o.price * o.quantity,
      })),
      subtotal: tab.subtotal,
      gstRate: 0.05,
      gstAmount: tab.gstAmount,
      totalAmount: finalBill,
      status: 'paid',
      dueDate: todayStr,
      paidAt: nowIso,
      paymentMethod: method.toUpperCase(),
      createdAt: nowIso,
    };

    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId
          ? {
              ...t,
              status: 'settled',
              closedAt: nowIso,
              settledVia: method,
              tipAmount,
              splitDetails: splitData,
            }
          : t
      ),
      tables: state.tables.map((tbl) =>
        tbl.activeTabId === tabId ? { ...tbl, status: 'available', activeTabId: undefined, mergedWithTableIds: undefined } : tbl
      ),
      members: updatedMembers,
      payments: [...newPayments, ...state.payments],
      invoices: [newInvoice, ...state.invoices],
    }));

    get().addToast({
      type: 'success',
      title: 'Tab Settled & Invoice Posted',
      message: `Settled ${tab.tableName} for ₹${Math.round(finalBill)} via ${method.toUpperCase()}. Invoice #${invoiceNumber} recorded.`,
    });

    get().logAudit(
      'TAB_SETTLED',
      `Tab #${tab.tabNumber || tabId}`,
      `Settled ₹${Math.round(finalBill)} via ${method}. Posted Invoice #${invoiceNumber}`
    );

    persist(get());
    return { success: true, invoiceId: invId };
  },

  openTab: (customerName, tier, tableId, memberId, partySize = 2) => {
    const id = `tab_${Date.now()}`;
    const tabNumber = `TAB-2026-${Math.floor(100 + Math.random() * 900)}`;
    const openedAt = new Date().toISOString();
    const table = tableId ? get().tables.find((t) => t.id === tableId) : undefined;
    const tabLimit = tier === 'gold' ? 25000 : tier === 'silver' ? 10000 : tier === 'junior' ? 2000 : 0;

    const newTab: Tab = {
      id,
      tabNumber,
      memberId,
      customerName,
      tier,
      tableId,
      tableName: table?.name || 'Walk-in Bar Counter',
      partySize,
      orders: [],
      subtotal: 0,
      discountAmount: 0,
      gstAmount: 0,
      totalAmount: 0,
      tabLimit,
      status: 'open',
      openedAt,
      serverName: table?.assignedServerName || get().currentUser.name,
    };

    set((state) => ({
      tabs: [newTab, ...state.tabs],
      tables: tableId
        ? state.tables.map((t) => (t.id === tableId ? { ...t, status: 'occupied', activeTabId: id, partySize } : t))
        : state.tables,
    }));

    get().addToast({
      type: 'success',
      title: `Tab #${tabNumber} Opened`,
      message: `Open for ${customerName} at ${newTab.tableName} (Limit: ₹${tabLimit})`,
    });

    get().logAudit('TAB_OPENED', `Tab #${tabNumber}`, `Opened for ${customerName} (${newTab.tableName})`);
    persist(get());
    return newTab;
  },

  addMenuItem: (itemData) => {
    const id = `menu_${Date.now()}`;
    const newItem: MenuItem = {
      ...itemData,
      id,
    };

    set((state) => ({ menuItems: [newItem, ...state.menuItems] }));
    get().addToast({
      type: 'success',
      title: 'Menu Item Added',
      message: `${newItem.name} added to ${newItem.category.toUpperCase()}.`,
    });
    get().logAudit('MENU_ITEM_ADDED', `Item #${id}`, `Created ${newItem.name} - ₹${newItem.price}`);
    persist(get());
    return newItem;
  },

  updateMenuItem: (id, itemData) => {
    set((state) => ({
      menuItems: state.menuItems.map((m) => (m.id === id ? { ...m, ...itemData } : m)),
    }));
    get().addToast({
      type: 'success',
      title: 'Menu Item Updated',
      message: 'Item details saved.',
    });
    get().logAudit('MENU_ITEM_UPDATED', `Item #${id}`, 'Updated menu item');
    persist(get());
  },

  deleteMenuItem: (id) => {
    const item = get().menuItems.find((m) => m.id === id);
    set((state) => ({
      menuItems: state.menuItems.filter((m) => m.id !== id),
    }));
    get().addToast({
      type: 'info',
      title: 'Menu Item Removed',
      message: `${item?.name || 'Item'} removed from menu.`,
    });
    get().logAudit('MENU_ITEM_DELETED', `Item #${id}`, `Deleted ${item?.name}`);
    persist(get());
  },

  clockInBarStaff: (staffName, role, shiftType, openingCash) => {
    const id = `shift_${Date.now()}`;
    const newShift: BarStaffShift = {
      id,
      staffId: `emp_${Date.now()}`,
      staffName,
      role,
      shiftType,
      clockIn: new Date().toISOString(),
      assignedTables: [],
      salesTotal: 0,
      ordersCount: 0,
      cashOpening: openingCash,
      status: 'active',
    };

    set((state) => ({ barStaffShifts: [newShift, ...state.barStaffShifts] }));
    get().addToast({
      type: 'success',
      title: 'Shift Started',
      message: `${staffName} clocked in for ${shiftType.toUpperCase()} shift with ₹${openingCash} opening cash.`,
    });
    get().logAudit('STAFF_SHIFT_START', `Shift #${id}`, `${staffName} (${role}) started ${shiftType} shift`);
    persist(get());
    return newShift;
  },

  clockOutBarStaff: (shiftId, closingCash, handoverNotes) => {
    const shift = get().barStaffShifts.find((s) => s.id === shiftId);
    if (!shift) return;

    const expected = shift.cashOpening + shift.salesTotal;
    const variance = closingCash - expected;

    set((state) => ({
      barStaffShifts: state.barStaffShifts.map((s) =>
        s.id === shiftId
          ? {
              ...s,
              clockOut: new Date().toISOString(),
              cashClosing: closingCash,
              cashVariance: variance,
              handoverNotes,
              status: 'completed',
            }
          : s
      ),
    }));

    get().addToast({
      type: 'info',
      title: 'Shift Closed & Handover Logged',
      message: `${shift.staffName} clocked out. Cash variance: ${variance >= 0 ? `+₹${variance}` : `-₹${Math.abs(variance)}`}`,
    });

    get().logAudit(
      'STAFF_SHIFT_END',
      `Shift #${shiftId}`,
      `${shift.staffName} closed shift. Closing cash: ₹${closingCash}, Variance: ₹${variance}`
    );

    persist(get());
  },

  recordSale: (orderData) => {
    const { products, members } = get();

    // 1. Validate real-time single-source inventory availability
    const stockValidation = validateStockAvailability(
      orderData.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      products
    );

    if (!stockValidation.available) {
      const errorMsg = stockValidation.errors
        .map((e) => `${e.productName}: Requested ${e.requested}, Available ${e.available}`)
        .join(' | ');

      get().addToast({
        type: 'error',
        title: 'Stock Unavailable',
        message: `Cannot fulfill order: ${errorMsg}`,
      });
      return null;
    }

    const id = `ord_${Date.now()}`;
    const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = new Date().toISOString();
    const orderType = orderData.type || 'pos_counter';
    const isOnline = orderType === 'online_pickup' || orderType === 'online_delivery';
    const status: OrderStatus = orderData.status || (isOnline ? 'placed' : 'completed');

    // 2. Member wallet or tab payment handling
    const member = orderData.memberId ? members.find((m) => m.id === orderData.memberId) : undefined;
    let updatedMembers = members;
    const newPayments: Payment[] = [];

    if (orderData.paymentMethod === 'wallet' && member && orderData.totalAmount > 0) {
      if (member.walletBalance < orderData.totalAmount) {
        get().addToast({
          type: 'error',
          title: 'Insufficient Wallet Balance',
          message: `Member balance (₹${member.walletBalance}) is less than order total (₹${orderData.totalAmount}).`,
        });
        return null;
      }

      updatedMembers = members.map((m) =>
        m.id === member.id ? { ...m, walletBalance: m.walletBalance - orderData.totalAmount } : m
      );

      newPayments.push({
        id: `pay_${Date.now()}`,
        paymentNumber: `PAY-SHP-${Math.floor(1000 + Math.random() * 9000)}`,
        memberId: member.id,
        payerName: member.fullName,
        amount: orderData.totalAmount,
        method: 'wallet',
        status: 'success',
        transactionRef: `WLT-SHP-${id}`,
        timestamp: createdAt,
        purpose: `Pro Shop Order #${orderNumber}`,
      });
    } else if (orderData.paymentMethod === 'member_tab' && member && orderData.totalAmount > 0) {
      updatedMembers = members.map((m) =>
        m.id === member.id ? { ...m, activeTabBalance: m.activeTabBalance + orderData.totalAmount } : m
      );
    } else if (orderData.isPaid && orderData.totalAmount > 0) {
      newPayments.push({
        id: `pay_${Date.now()}`,
        paymentNumber: `PAY-SHP-${Math.floor(1000 + Math.random() * 9000)}`,
        memberId: member?.id,
        payerName: orderData.customerName,
        amount: orderData.totalAmount,
        method: orderData.paymentMethod as any,
        status: 'success',
        transactionRef: `${orderData.paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: createdAt,
        purpose: `Pro Shop Order #${orderNumber}`,
      });
    }

    // 3. Single Inventory stock operation:
    // If online order placed -> reserve stock. If counter POS or immediate completion -> commit physical deduction.
    let updatedProducts = products;
    let newMovements: StockMovement[] = [];

    if (isOnline && status !== 'completed') {
      updatedProducts = reserveStock(
        orderData.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        products
      );
    } else {
      const commitRes = commitStockDeduction(
        orderData.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        products,
        false,
        orderNumber,
        get().currentUser.name
      );
      updatedProducts = commitRes.updatedProducts;
      newMovements = commitRes.movements;
    }

    // 4. Auto-post invoice to finance ledger
    const invId = `inv_${Date.now()}`;
    const invoiceNumber = `INV-SHP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice: Invoice = {
      id: invId,
      invoiceNumber,
      memberId: orderData.memberId,
      recipientName: orderData.customerName,
      recipientEmail: orderData.customerEmail || (member ? member.email : 'shop@championsclub.in'),
      category: 'pro_shop',
      items: orderData.items.map((item) => ({
        description: `${item.productName} (x${item.quantity}) ${item.variantInfo ? `[${item.variantInfo}]` : ''}`,
        quantity: item.quantity,
        rate: item.unitPrice,
        amount: item.finalPrice,
      })),
      subtotal: orderData.subtotal,
      gstRate: 0.18,
      gstAmount: orderData.gstAmount,
      totalAmount: orderData.totalAmount,
      status: orderData.isPaid ? 'paid' : 'unpaid',
      dueDate: new Date().toISOString().split('T')[0],
      paidAt: orderData.isPaid ? createdAt : undefined,
      paymentMethod: orderData.paymentMethod.toUpperCase(),
      createdAt,
    };

    const newOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      type: orderType,
      status,
      createdAt,
      updatedAt: createdAt,
      trackingEvents: [
        {
          status,
          timestamp: createdAt,
          title: isOnline ? 'Order Placed Online' : 'Counter POS Sale Completed',
          notes: isOnline 
            ? `Order received for ${orderType === 'online_pickup' ? 'Club Counter Pickup' : 'Home Delivery'}. Stock reserved.`
            : `Settled via ${orderData.paymentMethod.toUpperCase()}. Receipt issued.`,
        },
      ],
    };

    set((state) => ({
      orders: [newOrder, ...state.orders],
      products: updatedProducts,
      stockMovements: [...newMovements, ...state.stockMovements],
      members: updatedMembers,
      invoices: [newInvoice, ...state.invoices],
      payments: [...newPayments, ...state.payments],
    }));

    get().addToast({
      type: 'success',
      title: isOnline ? 'Order Placed Successfully!' : 'POS Sale Completed',
      message: `Order #${orderNumber} for ₹${Math.round(newOrder.totalAmount)} recorded. Invoice #${invoiceNumber} posted.`,
    });

    get().logAudit(
      'SHOP_ORDER_CREATED',
      `Order #${orderNumber}`,
      `${orderData.customerName} (${orderType}) for ₹${Math.round(newOrder.totalAmount)} via ${orderData.paymentMethod}`
    );

    get().addNotification({
      title: isOnline ? 'New Online Pro Shop Order' : 'Pro Shop Counter Sale',
      message: `${orderData.customerName} placed order #${orderNumber} (${orderData.items.length} items)`,
      type: 'inventory',
      targetRole: 'shop_staff',
      link: '/staff/shop',
    });

    persist(get());
    return newOrder;
  },

  updateOrderStatus: (orderId, newStatus, notes) => {
    const order = get().orders.find((o) => o.id === orderId);
    if (!order) return;

    const { products, members } = get();
    const oldStatus = order.status;
    let updatedProducts = products;
    let newMovements: StockMovement[] = [];
    let updatedMembers = members;
    const newPayments: Payment[] = [];

    // State transition stock handling:
    if (newStatus === 'completed' && oldStatus !== 'completed') {
      // Finalize deduction from reserved stock
      const commitRes = commitStockDeduction(
        order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        products,
        true, // fromReserved
        order.orderNumber,
        get().currentUser.name
      );
      updatedProducts = commitRes.updatedProducts;
      newMovements = commitRes.movements;
    } else if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
      // Release reserved stock back to available
      updatedProducts = releaseReservedStock(
        order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        products
      );

      // Refund to wallet if member was charged
      if (order.memberId && order.isPaid && order.totalAmount > 0) {
        updatedMembers = members.map((m) =>
          m.id === order.memberId ? { ...m, walletBalance: m.walletBalance + order.totalAmount } : m
        );

        newPayments.push({
          id: `pay_ref_${Date.now()}`,
          paymentNumber: `REF-SHP-${Math.floor(1000 + Math.random() * 9000)}`,
          memberId: order.memberId,
          payerName: order.customerName,
          amount: order.totalAmount,
          method: 'wallet',
          status: 'success',
          transactionRef: `REF-${order.orderNumber}`,
          timestamp: new Date().toISOString(),
          purpose: `Order #${order.orderNumber} Cancellation Refund`,
        });
      }
    } else if (newStatus === 'returned') {
      // Return: restock items and refund
      order.items.forEach((item) => {
        const restockRes = restockProduct(
          item.productId,
          item.quantity,
          updatedProducts,
          `Customer Return Order #${order.orderNumber}`,
          get().currentUser.name,
          order.orderNumber
        );
        updatedProducts = restockRes.updatedProducts;
        newMovements.push(restockRes.movement);
      });

      if (order.memberId && order.totalAmount > 0) {
        updatedMembers = members.map((m) =>
          m.id === order.memberId ? { ...m, walletBalance: m.walletBalance + order.totalAmount } : m
        );
      }
    }

    const now = new Date().toISOString();
    const eventTitle = 
      newStatus === 'confirmed' ? 'Order Confirmed by Pro Shop' :
      newStatus === 'packed' ? 'Order Packed & Quality Checked' :
      newStatus === 'ready_for_pickup' ? 'Ready for Club Counter Pickup' :
      newStatus === 'out_for_delivery' ? 'Out for Dispatch / Delivery' :
      newStatus === 'completed' ? 'Order Fulfilled & Handed Over' :
      newStatus === 'cancelled' ? 'Order Cancelled & Stock Released' : 'Order Returned & Refunded';

    const newEvent: OrderTrackingEvent = {
      status: newStatus,
      timestamp: now,
      title: eventTitle,
      notes: notes || `Status updated to ${newStatus.replace(/_/g, ' ').toUpperCase()}`,
    };

    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: newStatus,
              updatedAt: now,
              trackingEvents: [newEvent, ...(o.trackingEvents || [])],
            }
          : o
      ),
      products: updatedProducts,
      stockMovements: [...newMovements, ...state.stockMovements],
      members: updatedMembers,
      payments: [...newPayments, ...state.payments],
    }));

    get().addToast({
      type: 'info',
      title: `Order #${order.orderNumber} ${newStatus.toUpperCase()}`,
      message: eventTitle,
    });

    get().logAudit(
      'SHOP_ORDER_STATUS',
      `Order #${order.orderNumber}`,
      `Transitioned from ${oldStatus} to ${newStatus}`
    );

    persist(get());
  },

  updateProductStock: (productId, qtyDelta, reason) => {
    const { products } = get();
    const res = restockProduct(
      productId,
      qtyDelta,
      products,
      reason,
      get().currentUser.name
    );

    set((state) => ({
      products: res.updatedProducts,
      stockMovements: [res.movement, ...state.stockMovements],
    }));

    get().addToast({
      type: 'success',
      title: 'Stock Updated',
      message: `${res.movement.productName}: ${qtyDelta > 0 ? `+${qtyDelta}` : qtyDelta} units.`,
    });

    get().logAudit('STOCK_UPDATED', `Product #${productId}`, `${qtyDelta > 0 ? '+' : ''}${qtyDelta}: ${reason}`);
    persist(get());
  },

  adjustProductStock: (productId, newQty, reason) => {
    const { products } = get();
    const res = adjustStock(
      productId,
      newQty,
      products,
      reason,
      get().currentUser.name
    );

    set((state) => ({
      products: res.updatedProducts,
      stockMovements: [res.movement, ...state.stockMovements],
    }));

    get().addToast({
      type: 'warning',
      title: 'Inventory Count Adjusted',
      message: `${res.movement.productName} adjusted to ${newQty} units.`,
    });

    get().logAudit('STOCK_ADJUSTMENT', `Product #${productId}`, `Set to ${newQty}. Reason: ${reason}`);
    persist(get());
  },

  addProduct: (productData) => {
    const id = `prod_${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id,
      reservedQty: 0,
    };

    set((state) => ({
      products: [newProduct, ...state.products],
    }));

    get().addToast({
      type: 'success',
      title: 'Product Added to Catalog',
      message: `${newProduct.name} (${newProduct.sku}) created successfully.`,
    });

    get().logAudit('PRODUCT_CREATED', `Product #${newProduct.sku}`, `Created ${newProduct.name} - ${formatINR(newProduct.price)}`);
    persist(get());
    return newProduct;
  },

  updateProduct: (id, productData) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...productData } : p)),
    }));

    get().addToast({
      type: 'success',
      title: 'Product Details Updated',
      message: 'Catalog changes saved successfully.',
    });

    get().logAudit('PRODUCT_UPDATED', `Product #${id}`, 'Updated pricing, specs or variants');
    persist(get());
  },

  deleteProduct: (id) => {
    const prod = get().products.find((p) => p.id === id);
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));

    get().addToast({
      type: 'info',
      title: 'Product Removed',
      message: `${prod?.name || 'Item'} archived from catalog.`,
    });

    get().logAudit('PRODUCT_DELETED', `Product #${id}`, `Deleted ${prod?.name}`);
    persist(get());
  },

  createPurchaseOrder: (poData) => {
    const id = `po_${Date.now()}`;
    const poNumber = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;
    const createdAt = new Date().toISOString();

    const newPO: PurchaseOrder = {
      ...poData,
      id,
      poNumber,
      createdAt,
    };

    set((state) => ({
      purchaseOrders: [newPO, ...state.purchaseOrders],
    }));

    get().addToast({
      type: 'success',
      title: 'Purchase Order Created',
      message: `${poNumber} sent to ${newPO.supplierName} (₹${formatINR(newPO.totalAmount)}).`,
    });

    get().logAudit('PO_CREATED', `PO #${poNumber}`, `Supplier: ${newPO.supplierName} - ${newPO.items.length} line items`);
    persist(get());
    return newPO;
  },

  receivePurchaseOrder: (poId, receipts) => {
    const po = get().purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    const { products } = get();
    const res = receivePurchaseOrderStock(
      po,
      receipts,
      products,
      get().currentUser.name
    );

    set((state) => ({
      products: res.updatedProducts,
      stockMovements: [...res.movements, ...state.stockMovements],
      purchaseOrders: state.purchaseOrders.map((p) => (p.id === poId ? res.updatedPo : p)),
    }));

    get().addToast({
      type: 'success',
      title: 'PO Stock Received',
      message: `Updated inventory with delivered items from PO #${po.poNumber}.`,
    });

    get().logAudit(
      'PO_RECEIVED',
      `PO #${po.poNumber}`,
      `Received ${receipts.reduce((acc, r) => acc + r.receivedQty, 0)} units into stock`
    );
    persist(get());
  },

  addSupplier: (supplierData) => {
    const id = `sup_${Date.now()}`;
    const code = `SUP-${supplierData.name.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

    const newSupplier: Supplier = {
      ...supplierData,
      id,
      code,
    };

    set((state) => ({
      suppliers: [newSupplier, ...state.suppliers],
    }));

    get().addToast({
      type: 'success',
      title: 'Supplier Added',
      message: `${newSupplier.name} registered as equipment vendor.`,
    });

    get().logAudit('SUPPLIER_ADDED', `Supplier #${newSupplier.code}`, newSupplier.name);
    persist(get());
    return newSupplier;
  },

  toggleWishlist: (productId) => {
    const current = get().wishlist;
    const exists = current.includes(productId);
    const updated = exists ? current.filter((id) => id !== productId) : [...current, productId];

    set({ wishlist: updated });
    get().addToast({
      type: 'info',
      title: exists ? 'Removed from Wishlist' : 'Saved to Wishlist',
      message: exists ? 'Item removed from your saved gear.' : 'Item saved for later.',
    });
    persist(get());
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
    persist(get());
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
    persist(get());
  },

  addNotification: (notif) => {
    const id = `notif_${Date.now()}`;
    const timestamp = new Date().toISOString();
    set((state) => ({
      notifications: [{ ...notif, id, timestamp, read: false }, ...state.notifications],
    }));
    persist(get());
  },

  logAudit: (action, entity, details) => {
    const user = get().currentUser;
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      actorName: user.name,
      actorRole: user.role,
      action,
      entity,
      details,
      ipAddress: '192.168.1.100 (Internal)',
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      auditLogs: [log, ...state.auditLogs.slice(0, 150)], // keep recent 150
    }));
    persist(get());
  },

  createInvoice: (invoiceData) => {
    const id = `inv_${Date.now()}`;
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = new Date().toISOString();
    
    // Auto-calculate subtotal and gst if items provided
    let subtotal = invoiceData.subtotal;
    let gstAmount = invoiceData.gstAmount;
    let totalAmount = invoiceData.totalAmount;
    const gstRate = invoiceData.gstRate !== undefined ? invoiceData.gstRate : 0.18;

    if (invoiceData.items && invoiceData.items.length > 0) {
      subtotal = invoiceData.items.reduce((acc, it) => acc + (it.amount || it.rate * it.quantity), 0);
      gstAmount = Math.round(subtotal * gstRate);
      totalAmount = subtotal + gstAmount;
    }

    const newInvoice: Invoice = {
      ...invoiceData,
      id,
      invoiceNumber,
      subtotal,
      gstRate,
      gstAmount,
      totalAmount,
      balanceAmount: invoiceData.status === 'paid' ? 0 : totalAmount,
      paidAmount: invoiceData.status === 'paid' ? totalAmount : (invoiceData.paidAmount || 0),
      createdAt,
    };

    set((state) => ({
      invoices: [newInvoice, ...state.invoices],
    }));

    get().addToast({
      type: 'success',
      title: 'Tax Invoice Created',
      message: `Invoice #${invoiceNumber} for ${formatINR(totalAmount)} generated successfully.`,
    });

    get().logAudit('INVOICE_CREATED', `Invoice #${invoiceNumber}`, `Created for ${newInvoice.recipientName} - ${formatINR(totalAmount)}`);
    persist(get());
    return newInvoice;
  },

  updateInvoiceStatus: (id, status) => {
    const nowIso = new Date().toISOString();
    set((state) => ({
      invoices: state.invoices.map((inv) => {
        if (inv.id !== id) return inv;
        return {
          ...inv,
          status,
          paidAt: status === 'paid' ? (inv.paidAt || nowIso) : inv.paidAt,
          balanceAmount: status === 'paid' ? 0 : inv.balanceAmount,
          paidAmount: status === 'paid' ? inv.totalAmount : inv.paidAmount,
        };
      }),
    }));

    get().addToast({
      type: 'info',
      title: 'Invoice Status Updated',
      message: `Invoice status changed to ${status.toUpperCase().replace('_', ' ')}.`,
    });

    persist(get());
  },

  recordInvoicePayment: (invoiceId, amount, method, transactionRef, purpose) => {
    const inv = get().invoices.find((i) => i.id === invoiceId);
    if (!inv) return null;

    const nowIso = new Date().toISOString();
    const payId = `pay_${Date.now()}`;
    const paymentNumber = `PAY-${Math.floor(1000 + Math.random() * 9000)}`;
    const txRef = transactionRef || `${method.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPayment: Payment = {
      id: payId,
      paymentNumber,
      invoiceId: inv.id,
      memberId: inv.memberId,
      payerName: inv.recipientName,
      amount,
      method,
      status: 'success',
      transactionRef: txRef,
      timestamp: nowIso,
      purpose: purpose || `Payment towards ${inv.invoiceNumber} (${inv.category.replace('_', ' ')})`,
      stream: inv.stream,
    };

    const prevPaid = inv.paidAmount || 0;
    const newPaid = prevPaid + amount;
    const newBalance = Math.max(0, inv.totalAmount - newPaid);
    const newStatus: InvoiceStatus = newBalance <= 0 ? 'paid' : 'partially_paid';

    set((state) => ({
      payments: [newPayment, ...state.payments],
      invoices: state.invoices.map((i) =>
        i.id === invoiceId
          ? {
              ...i,
              paidAmount: newPaid,
              balanceAmount: newBalance,
              status: newStatus,
              paidAt: newStatus === 'paid' ? nowIso : i.paidAt,
              paymentMethod: method.toUpperCase(),
            }
          : i
      ),
    }));

    get().addToast({
      type: 'success',
      title: 'Payment Recorded',
      message: `${formatINR(amount)} received via ${method.toUpperCase()} for Invoice #${inv.invoiceNumber}.`,
    });

    get().logAudit(
      'INVOICE_PAYMENT_RECORDED',
      `Invoice #${inv.invoiceNumber}`,
      `Received ${formatINR(amount)} via ${method.toUpperCase()} (Ref: ${txRef})`
    );

    persist(get());
    return newPayment;
  },

  issueCreditNote: (invoiceId, amount, reason) => {
    const inv = get().invoices.find((i) => i.id === invoiceId);
    if (!inv) return null;

    const nowIso = new Date().toISOString();
    const crnId = `crn_${Date.now()}`;
    const creditNoteNumber = `CRN-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newCreditNote: CreditNote = {
      id: crnId,
      creditNoteNumber,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      recipientName: inv.recipientName,
      amount,
      reason,
      issuedAt: nowIso,
      issuedBy: get().currentUser.name,
    };

    const prevCredit = inv.creditNoteAmount || 0;
    const newCredit = prevCredit + amount;
    const adjustedTotal = Math.max(0, inv.totalAmount - amount);
    const newBalance = Math.max(0, (inv.balanceAmount || inv.totalAmount) - amount);

    set((state) => ({
      creditNotes: [newCreditNote, ...state.creditNotes],
      invoices: state.invoices.map((i) =>
        i.id === invoiceId
          ? {
              ...i,
              creditNoteAmount: newCredit,
              totalAmount: adjustedTotal,
              balanceAmount: newBalance,
              status: newBalance <= 0 ? 'paid' : i.status,
            }
          : i
      ),
    }));

    get().addToast({
      type: 'warning',
      title: 'Credit Note Issued',
      message: `Credit note #${creditNoteNumber} for ${formatINR(amount)} issued against ${inv.invoiceNumber}.`,
    });

    get().logAudit(
      'CREDIT_NOTE_ISSUED',
      `Invoice #${inv.invoiceNumber}`,
      `Issued ${creditNoteNumber} for ${formatINR(amount)} (${reason})`
    );

    persist(get());
    return newCreditNote;
  },

  sendInvoiceReminder: (invoiceId, channel) => {
    const inv = get().invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    const nowIso = new Date().toISOString();
    const reminderLog = {
      id: `rem_${Date.now()}`,
      sentAt: nowIso,
      channel,
      sentBy: get().currentUser.name,
      recipient: channel === 'email' ? inv.recipientEmail : (inv.recipientPhone || inv.recipientEmail),
    };

    set((state) => ({
      invoices: state.invoices.map((i) =>
        i.id === invoiceId
          ? {
              ...i,
              reminders: [reminderLog, ...(i.reminders || [])],
            }
          : i
      ),
    }));

    get().addToast({
      type: 'info',
      title: `Payment Reminder Sent (${channel.toUpperCase()})`,
      message: `Reminder for ${inv.invoiceNumber} (${formatINR(inv.balanceAmount || inv.totalAmount)}) dispatched to ${inv.recipientName}.`,
    });

    get().logAudit(
      'INVOICE_REMINDER_SENT',
      `Invoice #${inv.invoiceNumber}`,
      `Dispatched reminder via ${channel.toUpperCase()} to ${inv.recipientName}`
    );

    persist(get());
  },

  addExpense: (expenseData) => {
    const id = `exp_${Date.now()}`;
    const expenseNumber = `EXP-${Math.floor(100 + Math.random() * 900)}`;

    const newExpense: Expense = {
      ...expenseData,
      id,
      expenseNumber,
      status: expenseData.status || (expenseData.paidAt ? 'paid' : 'pending'),
    };

    set((state) => ({
      expenses: [newExpense, ...state.expenses],
    }));

    get().addToast({
      type: 'success',
      title: 'Operating Expense Logged',
      message: `${newExpense.title} (${formatINR(newExpense.amount)}) recorded in payables.`,
    });

    get().logAudit('EXPENSE_LOGGED', `Expense #${expenseNumber}`, `Logged ${formatINR(newExpense.amount)} under ${newExpense.category} to ${newExpense.vendor}`);
    persist(get());
    return newExpense;
  },

  markExpensePaid: (expenseId, method, paidAt) => {
    const nowIso = paidAt || new Date().toISOString();
    const exp = get().expenses.find((e) => e.id === expenseId);
    if (!exp) return;

    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === expenseId
          ? {
              ...e,
              status: 'paid',
              paidAt: nowIso,
              paymentMethod: method,
            }
          : e
      ),
    }));

    get().addToast({
      type: 'success',
      title: 'Vendor Bill Marked Paid',
      message: `${exp.title} (${formatINR(exp.amount)}) marked as paid via ${method.toUpperCase().replace('_', ' ')}.`,
    });

    get().logAudit('EXPENSE_PAID', `Expense #${exp.expenseNumber}`, `Paid ${formatINR(exp.amount)} via ${method}`);
    persist(get());
  },

  deleteExpense: (id) => {
    const exp = get().expenses.find((e) => e.id === id);
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }));

    if (exp) {
      get().addToast({
        type: 'info',
        title: 'Expense Removed',
        message: `Expense #${exp.expenseNumber} removed from ledger.`,
      });
      get().logAudit('EXPENSE_DELETED', `Expense #${exp.expenseNumber}`, `Removed from accounts`);
    }

    persist(get());
  },

  // --- HR & WORKFORCE ACTIONS ---
  addEmployee: (employeeData) => {
    const index = get().employees.length + 1;
    const id = `emp_${Date.now()}`;
    const empId = `CC-EMP-${index.toString().padStart(2, '0')}`;
    const joinDate = new Date().toISOString().split('T')[0];

    const newEmp: Employee = {
      ...employeeData,
      id,
      empId,
      joinDate,
      documents: employeeData.documents || [],
      status: 'active',
    };

    set((state) => ({ employees: [newEmp, ...state.employees] }));
    get().addToast({
      type: 'success',
      title: 'Employee Profile Created',
      message: `${newEmp.name} enrolled in ${newEmp.department} (${newEmp.empId}).`,
    });
    get().logAudit('EMPLOYEE_CREATED', `Employee #${empId}`, `Enrolled ${newEmp.name} as ${newEmp.role}`);
    persist(get());
    return newEmp;
  },

  updateEmployee: (id, data) => {
    set((state) => ({
      employees: state.employees.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }));
    get().addToast({
      type: 'success',
      title: 'Employee Details Saved',
      message: 'Staff profile updated.',
    });
    persist(get());
  },

  deleteEmployee: (id) => {
    const emp = get().employees.find((e) => e.id === id);
    set((state) => ({
      employees: state.employees.filter((e) => e.id !== id),
    }));
    if (emp) {
      get().addToast({
        type: 'info',
        title: 'Employee Terminated / Removed',
        message: `${emp.name} removed from active roster.`,
      });
      get().logAudit('EMPLOYEE_REMOVED', `Employee #${emp.empId}`, `Removed ${emp.name}`);
    }
    persist(get());
  },

  addShift: (shiftData) => {
    const id = `sh_${Date.now()}`;
    const newShift: Shift = { ...shiftData, id };

    set((state) => ({ shifts: [newShift, ...state.shifts] }));
    get().addToast({
      type: 'success',
      title: 'Duty Shift Assigned',
      message: `${newShift.employeeName} scheduled for ${newShift.date} (${newShift.startTime}-${newShift.endTime}).`,
    });
    persist(get());
    return newShift;
  },

  updateShift: (id, data) => {
    set((state) => ({
      shifts: state.shifts.map((s) => (s.id === id ? { ...s, ...data } : s)),
    }));
    get().addToast({ type: 'info', title: 'Shift Updated', message: 'Roster updated successfully.' });
    persist(get());
  },

  deleteShift: (id) => {
    set((state) => ({
      shifts: state.shifts.filter((s) => s.id !== id),
    }));
    get().addToast({ type: 'info', title: 'Shift Cancelled', message: 'Shift removed from roster.' });
    persist(get());
  },

  requestShiftSwap: (swapData) => {
    const id = `swap_${Date.now()}`;
    const newSwap: ShiftSwapRequest = {
      ...swapData,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      swapRequests: [newSwap, ...state.swapRequests],
    }));

    get().addToast({
      type: 'info',
      title: 'Shift Swap Requested',
      message: `Swap request submitted to ${newSwap.targetEmployeeName}. Pending manager approval.`,
    });

    get().addNotification({
      title: 'Shift Swap Request',
      message: `${newSwap.requestingEmployeeName} requested to swap shift with ${newSwap.targetEmployeeName}.`,
      type: 'system',
      targetRole: 'manager',
    });

    persist(get());
    return newSwap;
  },

  decideShiftSwap: (swapId, status, decisionNote) => {
    const swap = get().swapRequests.find((s) => s.id === swapId);
    if (!swap) return;

    set((state) => ({
      swapRequests: state.swapRequests.map((s) =>
        s.id === swapId ? { ...s, status, decisionNote } : s
      ),
      shifts: status === 'approved' 
        ? state.shifts.map((sh) =>
            sh.id === swap.shiftId
              ? {
                  ...sh,
                  employeeId: swap.targetEmployeeId,
                  employeeName: swap.targetEmployeeName,
                  status: 'swapped',
                }
              : sh
          )
        : state.shifts,
    }));

    get().addToast({
      type: status === 'approved' ? 'success' : 'warning',
      title: `Shift Swap ${status.toUpperCase()}`,
      message: `Shift swap decision recorded.`,
    });

    persist(get());
  },

  clockInAttendance: (employeeId, notes) => {
    const emp = get().employees.find((e) => e.id === employeeId);
    const nowIso = new Date().toISOString();
    const todayStr = new Date().toISOString().split('T')[0];
    const id = `att_${Date.now()}`;

    const newAtt: StaffAttendance = {
      id,
      employeeId,
      employeeName: emp?.name || 'Staff Member',
      date: todayStr,
      clockIn: nowIso,
      status: 'on_time',
      notes,
    };

    set((state) => ({
      attendance: [newAtt, ...state.attendance],
    }));

    get().addToast({
      type: 'success',
      title: 'Clock-In Recorded',
      message: `${newAtt.employeeName} clocked in for duty at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
    });

    get().logAudit('STAFF_CLOCK_IN', `Employee #${emp?.empId}`, `${newAtt.employeeName} clocked in`);
    persist(get());
    return newAtt;
  },

  clockOutAttendance: (attendanceId) => {
    const nowIso = new Date().toISOString();
    set((state) => ({
      attendance: state.attendance.map((a) => {
        if (a.id !== attendanceId) return a;
        const inTime = new Date(a.clockIn).getTime();
        const durationHours = Math.round(((Date.now() - inTime) / (1000 * 60 * 60)) * 10) / 10;
        return {
          ...a,
          clockOut: nowIso,
          durationHours,
        };
      }),
    }));

    get().addToast({
      type: 'info',
      title: 'Clock-Out Recorded',
      message: 'Shift duty completed.',
    });
    persist(get());
  },

  applyLeave: (leaveData) => {
    const id = `lv_${Date.now()}`;
    const createdAt = new Date().toISOString();

    const newLeave: Leave = {
      ...leaveData,
      id,
      status: 'pending',
      createdAt,
    };

    set((state) => ({
      leaves: [newLeave, ...state.leaves],
    }));

    get().addToast({
      type: 'info',
      title: 'Leave Application Dispatched',
      message: `${newLeave.type.toUpperCase()} leave request submitted for ${newLeave.daysCount} day(s).`,
    });

    // Notify Manager / Owner
    get().addNotification({
      title: `New Leave Request: ${newLeave.employeeName}`,
      message: `${newLeave.employeeName} requested ${newLeave.daysCount} day(s) ${newLeave.type} leave (${newLeave.startDate} to ${newLeave.endDate}).`,
      type: 'system',
      targetRole: 'manager',
    });

    get().logAudit('LEAVE_REQUESTED', `Employee ${newLeave.employeeName}`, `Applied for ${newLeave.daysCount} days ${newLeave.type} leave`);
    persist(get());
    return newLeave;
  },

  decideLeave: (leaveId, status, decisionComment) => {
    const leave = get().leaves.find((l) => l.id === leaveId);
    if (!leave) return;

    const nowIso = new Date().toISOString();

    set((state) => ({
      leaves: state.leaves.map((l) =>
        l.id === leaveId
          ? {
              ...l,
              status,
              approvedBy: get().currentUser.name,
              decisionComment,
              decidedAt: nowIso,
            }
          : l
      ),
      // Update employee leave balance if approved and not unpaid
      employees: status === 'approved' && leave.type !== 'unpaid'
        ? state.employees.map((e) => {
            if (e.id !== leave.employeeId) return e;
            const bal = e.leaveBalances || { casual: 12, sick: 10, annual: 15, emergency: 5, usedCasual: 0, usedSick: 0, usedAnnual: 0, usedEmergency: 0 };
            return {
              ...e,
              leaveBalances: {
                ...bal,
                usedCasual: leave.type === 'casual' ? bal.usedCasual + leave.daysCount : bal.usedCasual,
                usedSick: leave.type === 'sick' ? bal.usedSick + leave.daysCount : bal.usedSick,
                usedAnnual: leave.type === 'annual' ? bal.usedAnnual + leave.daysCount : bal.usedAnnual,
                usedEmergency: leave.type === 'emergency' ? bal.usedEmergency + leave.daysCount : bal.usedEmergency,
              },
            };
          })
        : state.employees,
    }));

    get().addToast({
      type: status === 'approved' ? 'success' : 'warning',
      title: `Leave Request ${status.toUpperCase()}`,
      message: `${leave.employeeName}'s leave application has been ${status}.`,
    });

    // Notify employee
    get().addNotification({
      title: `Leave Application ${status.toUpperCase()}`,
      message: `Your ${leave.type} leave request for ${leave.startDate} was ${status} by ${get().currentUser.name}.`,
      type: 'system',
    });

    get().logAudit('LEAVE_DECISION', `Leave #${leave.id}`, `${status.toUpperCase()} for ${leave.employeeName}`);
    persist(get());
  },

  runPayrollMonth: (monthYear) => {
    const activeEmps = get().employees.filter((e) => e.status !== 'terminated');
    const existingRun = get().payroll.filter((p) => p.monthYear === monthYear);

    if (existingRun.length > 0) {
      get().addToast({
        type: 'info',
        title: 'Payroll Already Run',
        message: `Payroll for ${monthYear} is already generated (${existingRun.length} records).`,
      });
      return existingRun;
    }

    const appLeaves = get().leaves.filter((l) => l.status === 'approved');
    const newPayrollList: Payroll[] = activeEmps.map((emp) => {
      const calc = calculateEmployeePayroll(emp, monthYear, appLeaves);
      return {
        ...calc,
        id: `pr_${Date.now()}_${emp.id}`,
      };
    });

    set((state) => ({
      payroll: [...newPayrollList, ...state.payroll],
    }));

    get().addToast({
      type: 'success',
      title: `Payroll Calculated (${monthYear})`,
      message: `Generated payslips for ${newPayrollList.length} staff members. Ready for approval & disbursement.`,
    });

    get().logAudit('PAYROLL_RUN', `Month ${monthYear}`, `Generated monthly salary run for ${newPayrollList.length} employees`);
    persist(get());
    return newPayrollList;
  },

  markPayrollPaid: (payrollId, paymentMethod = 'bank_transfer') => {
    const pr = get().payroll.find((p) => p.id === payrollId);
    if (!pr) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Auto-post salary expense to Finance Ledger
    const exp = get().addExpense({
      title: `Staff Salary Payout (${pr.employeeName} - ${pr.monthYear})`,
      vendor: `${pr.employeeName} (${pr.bankAccount || 'Bank Transfer'})`,
      category: 'staff_salaries',
      amount: pr.netPay,
      inputGstAmount: 0,
      gstRate: 0,
      date: todayStr,
      dueDate: todayStr,
      status: 'paid',
      paidAt: new Date().toISOString(),
      paymentMethod: paymentMethod === 'cheque' ? 'cheque' : 'bank_transfer',
      approvedBy: get().currentUser.name,
      notes: `Automated HR Payroll posting for ${pr.monthYear}. Gross: ${formatINR(pr.grossEarnings)}, Deductions: ${formatINR(pr.totalDeductions)}`,
    });

    set((state) => ({
      payroll: state.payroll.map((p) =>
        p.id === payrollId
          ? {
              ...p,
              status: 'paid',
              paidOn: todayStr,
              paymentMethod,
              expenseIdPosted: exp.id,
            }
          : p
      ),
    }));

    get().addToast({
      type: 'success',
      title: 'Salary Disbursed & Expense Posted',
      message: `Net salary ${formatINR(pr.netPay)} transferred to ${pr.employeeName}. Expense #${exp.expenseNumber} logged in Finance.`,
    });

    get().logAudit('PAYROLL_DISBURSED', `Employee ${pr.employeeName}`, `Disbursed ${formatINR(pr.netPay)} net salary`);
    persist(get());
  },

  createCoachCourtBlock: (coachId, courtId, date, startTime, endTime, topic) => {
    const coach = get().employees.find((e) => e.id === coachId);
    if (!coach) return { success: false, error: 'Coach profile not found.' };

    const court = get().courts.find((c) => c.id === courtId);
    if (!court) return { success: false, error: 'Court not found.' };

    const booking = get().addBooking({
      courtId,
      guestName: `Coaching Clinic: ${coach.name} (${topic})`,
      guestPhone: coach.phone,
      guestEmail: coach.email,
      tier: 'gold',
      date,
      startTime,
      endTime,
      sport: court.sport,
      bookingType: 'coaching',
      channel: 'front_desk',
      totalPrice: coach.coachingProfile?.hourlyRate || 2000,
      discountApplied: 0,
      status: 'confirmed',
      notes: `Official coaching clinic by Coach ${coach.name}. Subject: ${topic}`,
      isPaid: true,
      paymentMethod: 'cash',
    });

    if (!booking) return { success: false, error: 'Court slot unavailable or blocked.' };

    // Also add shift for coach
    get().addShift({
      employeeId: coach.id,
      employeeName: coach.name,
      role: `Coaching: ${topic}`,
      department: 'Sports & Coaching',
      date,
      startTime,
      endTime,
      station: court.name,
      status: 'scheduled',
    });

    get().addToast({
      type: 'success',
      title: 'Coaching Clinic Reserved',
      message: `Reserved ${court.name} for Coach ${coach.name} on ${date} (${startTime}-${endTime}).`,
    });

    return { success: true, bookingId: booking.id };
  },

  resetDemoData: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    set({
      members: INITIAL_MEMBERS,
      courts: INITIAL_COURTS,
      plans: INITIAL_PLANS,
      bookings: INITIAL_BOOKINGS,
      socialSessions: INITIAL_SOCIAL_SESSIONS,
      products: INITIAL_PRODUCTS,
      stockMovements: [],
      orders: [],
      menuItems: INITIAL_MENU_ITEMS,
      tables: INITIAL_TABLES,
      tabs: INITIAL_TABS,
      leads: INITIAL_LEADS,
      quotes: INITIAL_QUOTES,
      businessClients: INITIAL_BUSINESS_CLIENTS,
      invoices: INITIAL_INVOICES,
      creditNotes: INITIAL_CREDIT_NOTES,
      payments: INITIAL_PAYMENTS,
      expenses: INITIAL_EXPENSES,
      employees: INITIAL_EMPLOYEES,
      shifts: INITIAL_SHIFTS,
      swapRequests: INITIAL_SWAP_REQUESTS,
      attendance: INITIAL_ATTENDANCE,
      leaves: INITIAL_LEAVES,
      payroll: INITIAL_PAYROLL,
      notifications: INITIAL_NOTIFICATIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
      settings: INITIAL_SETTINGS,
    });
    get().addToast({
      type: 'info',
      title: 'Demo Data Reset',
      message: 'All club databases restored to initial pristine state.',
    });
    get().logAudit('RESET_DEMO_DATA', 'Database', 'Reverted database to factory seed data');
  },

  setCurrentUser: (user) => {
    set({ currentUser: user });
    persist(get());
  },

  updateUserProfile: (profileData) => {
    const current = get().currentUser;
    const updatedUser: UserProfile = {
      ...current,
      name: profileData.name !== undefined ? profileData.name : current.name,
      avatar: profileData.avatar !== undefined ? profileData.avatar : current.avatar,
      phone: profileData.phone !== undefined ? profileData.phone : current.phone,
    };

    const updatedMembers = get().members.map((m) => {
      const isCurrent =
        (current.memberId && m.id === current.memberId) ||
        (current.email && m.email?.toLowerCase() === current.email.toLowerCase());

      if (isCurrent) {
        return {
          ...m,
          fullName: profileData.name !== undefined ? profileData.name : m.fullName,
          phone: profileData.phone !== undefined ? profileData.phone : m.phone,
          avatar: profileData.avatar !== undefined ? profileData.avatar : m.avatar,
          dateOfBirth: profileData.dateOfBirth !== undefined ? profileData.dateOfBirth : m.dateOfBirth,
          preferredSports: profileData.preferredSports !== undefined ? profileData.preferredSports : m.preferredSports,
          emergencyContact: profileData.emergencyContact !== undefined ? profileData.emergencyContact : m.emergencyContact,
        };
      }
      return m;
    });

    const updatedEmployees = get().employees.map((e) => {
      if (e.email?.toLowerCase() === current.email?.toLowerCase()) {
        return {
          ...e,
          name: profileData.name !== undefined ? profileData.name : e.name,
          phone: profileData.phone !== undefined ? profileData.phone : e.phone,
        };
      }
      return e;
    });

    set({
      currentUser: updatedUser,
      members: updatedMembers,
      employees: updatedEmployees,
    });

    get().logAudit(
      'PROFILE_UPDATED',
      `User ${current.email}`,
      `Updated user profile details: ${profileData.name || current.name}`
    );
    persist(get());
  },

  loginUser: (user) => {
    set({ currentRole: user.role, currentUser: user });
    get().addToast({
      type: 'success',
      title: `Welcome, ${user.name}!`,
      message: `Signed in as ${user.role.replace('_', ' ').toUpperCase()}`,
    });
    get().logAudit('USER_LOGIN', 'Authentication', `User ${user.email} (${user.name}) logged in as ${user.role}`);
    persist(get());
  },

  syncMembers: async () => {
    try {
      const res = await fetch('/api/members');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.members) && data.members.length > 0) {
          const currentMembers = get().members;
          const dbIds = new Set(data.members.map((m: any) => m.id));
          const dbEmails = new Set(data.members.map((m: any) => m.email?.toLowerCase()).filter(Boolean));
          
          const remaining = currentMembers.filter(
            (m) => !dbIds.has(m.id) && (!m.email || !dbEmails.has(m.email.toLowerCase()))
          );
          
          const syncedMembers = [...data.members, ...remaining];
          const current = get().currentUser;
          const matchingMember = syncedMembers.find(
            (m: any) =>
              (current.memberId && m.id === current.memberId) ||
              (current.email && m.email && current.email.toLowerCase() === m.email.toLowerCase())
          );

          set({
            members: syncedMembers,
            currentUser: (matchingMember && current.role === 'member')
              ? { ...current, tier: matchingMember.tier || 'walk_in' }
              : current,
          });
          persist(get());
          console.log(`✅ [Zustand] Synced ${data.members.length} members from Supabase database`);
        }
      }
    } catch (err) {
      console.warn('Could not sync members from backend:', err);
    }
  },

  syncEmployees: async () => {
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.employees) && data.employees.length > 0) {
          const currentEmployees = get().employees;
          const dbIds = new Set(data.employees.map((e: any) => e.id));
          const dbEmails = new Set(data.employees.map((e: any) => e.email?.toLowerCase()).filter(Boolean));

          const remaining = currentEmployees.filter(
            (e) => !dbIds.has(e.id) && (!e.email || !dbEmails.has(e.email.toLowerCase()))
          );

          set({ employees: [...data.employees, ...remaining] });
          persist(get());
          console.log(`✅ [Zustand] Synced ${data.employees.length} employees from Supabase database`);
        }
      }
    } catch (err) {
      console.warn('Could not sync employees from backend:', err);
    }
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
    get().addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Club parameters updated successfully.',
    });
    get().logAudit('SETTINGS_UPDATED', 'Club Settings', 'Updated club operational configuration');
    persist(get());
  },
}));

function persist(state: AppState) {
  try {
    const toSave = {
      theme: state.theme,
      currentRole: state.currentRole,
      currentUser: state.currentUser,
      members: state.members,
      courts: state.courts,
      plans: state.plans,
      bookings: state.bookings,
      socialSessions: state.socialSessions,
      products: state.products,
      stockMovements: state.stockMovements,
      orders: state.orders,
      menuItems: state.menuItems,
      tables: state.tables,
      tabs: state.tabs,
      leads: state.leads,
      quotes: state.quotes,
      businessClients: state.businessClients,
      invoices: state.invoices,
      creditNotes: state.creditNotes,
      payments: state.payments,
      expenses: state.expenses,
      employees: state.employees,
      shifts: state.shifts,
      swapRequests: state.swapRequests,
      attendance: state.attendance,
      leaves: state.leaves,
      payroll: state.payroll,
      notifications: state.notifications,
      auditLogs: state.auditLogs,
      settings: state.settings,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));

    // Asynchronously update Supabase in the background
    import('../lib/supabase').then(({ supabaseService }) => {
      supabaseService.upsertRecords('members', state.members);
      supabaseService.upsertRecords('bookings', state.bookings);
      supabaseService.upsertRecords('products', state.products);
      supabaseService.upsertRecords('orders', state.orders);
      supabaseService.upsertRecords('tabs', state.tabs);
      supabaseService.upsertRecords('invoices', state.invoices);
      supabaseService.upsertRecords('payments', state.payments);

      // Additional UI workflows and logs
      supabaseService.upsertRecords('social_sessions', state.socialSessions);
      supabaseService.upsertRecords('stock_movements', state.stockMovements);
      supabaseService.upsertRecords('menu_items', state.menuItems);
      supabaseService.upsertRecords('tables', state.tables);
      supabaseService.upsertRecords('leads', state.leads);
      supabaseService.upsertRecords('quotes', state.quotes);
      supabaseService.upsertRecords('business_clients', state.businessClients);
      supabaseService.upsertRecords('credit_notes', state.creditNotes);
      supabaseService.upsertRecords('expenses', state.expenses);
      supabaseService.upsertRecords('employees', state.employees);
      supabaseService.upsertRecords('shifts', state.shifts);
      supabaseService.upsertRecords('swap_requests', state.swapRequests);
      supabaseService.upsertRecords('attendance', state.attendance);
      supabaseService.upsertRecords('leaves', state.leaves);
      supabaseService.upsertRecords('payroll', state.payroll);
      supabaseService.upsertRecords('notifications', state.notifications);
      supabaseService.upsertRecords('audit_logs', state.auditLogs);
      supabaseService.upsertRecords('settings', [state.settings]); // singleton array
    }).catch(err => {
      console.warn('Supabase sync deferred:', err);
    });

  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        useAppStore.setState(parsed);
      } catch (e) {
        console.error('Failed to sync state across browser tabs:', e);
      }
    }
  });

  // Automatically sync members from Supabase database on client startup
  setTimeout(() => {
    useAppStore.getState().syncMembers();
  }, 250);
}
