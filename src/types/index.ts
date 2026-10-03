export type Role = 
  | 'visitor' 
  | 'member' 
  | 'front_desk' 
  | 'bar_staff' 
  | 'shop_staff' 
  | 'manager' 
  | 'owner';

export type MembershipTier = 'gold' | 'silver' | 'junior' | 'walk_in' | 'none';

export type SportType = 'tennis' | 'padel' | 'badminton' | 'cricket';

export type CourtStatus = 'available' | 'booked' | 'social_play' | 'maintenance';

export type MemberStatus = 'active' | 'expiring' | 'expired' | 'suspended' | 'cancelled' | 'frozen';

export interface PlanEntitlements {
  courtDiscountPercent: number; // e.g. 50% or 100% off-peak
  shopDiscountPercent: number; // 20% for Gold, 10% for Silver, 5% for Junior, 0% for Walk-in
  barDiscountPercent: number; // 15% for Gold, 10% for Silver, 5% (non-alcoholic) for Junior, 0%
  bookingWindowDays: number; // 14 for Gold, 7 for Silver, 5 for Junior, 1 for Walk-in
  freeBookingsPerMonth: number;
  socialPlayAccess: 'all_inclusive' | 'discounted' | 'restricted' | 'full_price';
  guestPassesPerMonth: number;
  peakHourAccess: boolean; // Junior has restricted peak hours
  coachingDiscountPercent: number;
  gracePeriodDays?: number; // Days after expiry before benefits auto-block
}

export interface Plan {
  id: string;
  tier: MembershipTier;
  name: string;
  tagline: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  annualPrice: number;
  gstRate: number; // 0.18
  entitlements: PlanEntitlements;
  features: string[];
  popular?: boolean;
}

export interface AttendanceRecord {
  id: string;
  timestamp: string;
  courtName?: string;
  checkedInBy: string;
  notes?: string;
}

export interface MemberReminderLog {
  id: string;
  timestamp: string;
  type: 'whatsapp' | 'sms' | 'email';
  message: string;
  sentBy: string;
  status: 'sent' | 'delivered';
}

export interface Member {
  id: string;
  memberNumber: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  email: string;
  phone: string;
  address?: string;
  avatar: string;
  tier: MembershipTier;
  status: MemberStatus;
  joinDate: string;
  expiryDate: string;
  frozenDate?: string;
  frozenDaysCount?: number;
  walletBalance: number;
  activeTabBalance: number;
  guestPassesUsed?: number;
  guardian?: {
    name: string;
    phone: string;
    relation: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  preferredSports: SportType[];
  notes?: string;
  attendanceLog?: AttendanceRecord[];
  reminderLog?: MemberReminderLog[];
}

export interface Court {
  id: string;
  name: string;
  sport: SportType;
  courtNumber: number;
  surface: string; // e.g. 'Clay', 'Synthetic Turf', 'Teakwood Wooden', 'Panoramic Glass'
  isIndoor: boolean;
  hasFloodlights: boolean;
  image: string;
  status: CourtStatus;
  hourlyRate: {
    walk_in: number;
    junior: number;
    silver: number;
    gold: number;
  };
  description: string;
  maintenanceNote?: string;
}

export type BookingStatus = 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';
export type BookingType = 'regular' | 'social' | 'maintenance' | 'coaching' | 'tournament' | 'trial';
export type BookingChannel = 'online' | 'front_desk' | 'phone_whatsapp' | 'trial';

export interface BookingPriceBreakdown {
  baseRate: number;
  isPeak: boolean;
  peakMultiplier: number;
  subtotal: number;
  tierDiscount: number;
  courtDiscountPercent: number;
  freeHourApplied: boolean;
  netAmount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
}

export interface Booking {
  id: string;
  courtId: string;
  memberId?: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  tier: MembershipTier;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  sport: SportType;
  bookingType?: BookingType;
  channel?: BookingChannel;
  totalPrice: number;
  discountApplied: number;
  priceBreakdown?: BookingPriceBreakdown;
  status: BookingStatus;
  isPaid: boolean;
  paymentMethod?: 'wallet' | 'upi' | 'card' | 'cash' | 'tab' | 'plan_included' | 'pay_at_desk';
  guests?: { name: string; phone?: string }[];
  isRecurring?: boolean;
  recurringGroupId?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  lateCancelFee?: number;
  refundAmount?: number;
  qrCodeData?: string;
  notes?: string;
  createdAt: string;
}

export interface SocialSessionParticipant {
  memberId: string;
  name: string;
  tier: MembershipTier;
  phone?: string;
  joinedAt: string;
  paid: boolean;
  paymentMethod?: string;
}

export interface SocialSession {
  id: string;
  title: string;
  sport: SportType;
  courtIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  currentParticipants: string[]; // memberIds
  participantDetails?: SocialSessionParticipant[];
  waitlist?: string[]; // memberIds on waitlist
  organizer: string;
  level: 'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced';
  fee: {
    gold: number;
    silver: number;
    junior: number;
    walk_in: number;
  };
}

export type ProductCategory = 
  | 'rackets' 
  | 'racquets' 
  | 'balls' 
  | 'shoes' 
  | 'footwear' 
  | 'accessories' 
  | 'apparel' 
  | 'strings' 
  | 'bags' 
  | 'grips' 
  | 'services';

export interface ProductVariant {
  id: string;
  sku?: string;
  size?: string; // e.g. "Grip 2 (4 1/4)", "UK 9", "M", "L"
  color?: string;
  weight?: string; // e.g. "300g", "84g"
  stockQty: number;
  priceDelta?: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  sport: SportType | 'general';
  brand: string;
  price: number; // MRP
  costPrice: number;
  gstPercent?: number; // e.g. 18 or 12
  stockQty: number; // Physical stock count
  reservedQty?: number; // Stock reserved for active/unfulfilled online orders
  reorderLevel: number;
  image: string; // Primary image
  images?: string[]; // Array of Unsplash gallery images
  description: string;
  variants?: ProductVariant[];
  supplierId?: string;
  supplierName?: string;
  isServiceItem?: boolean; // e.g. Re-stringing Service
  serviceOptions?: {
    tensionMin?: number;
    tensionMax?: number;
    defaultTension?: number;
    expressCharge?: number;
  };
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  categories: ProductCategory[];
  leadTimeDays: number;
  address: string;
  paymentTerms: string;
  rating?: number;
  notes?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  change: number; // +ve or -ve
  type: 'sale' | 'restock' | 'adjustment' | 'return' | 'po_receipt';
  notes: string;
  performedBy: string;
  timestamp: string;
  referenceId?: string; // e.g. Order ID or PO ID
}

export type PurchaseOrderStatus = 'draft' | 'ordered' | 'partially_received' | 'received' | 'cancelled';

export interface PurchaseOrderItem {
  productId: string;
  sku: string;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDeliveryDate: string;
  receivedDate?: string;
  notes?: string;
  createdAt: string;
}

export type OrderStatus = 
  | 'placed' 
  | 'confirmed' 
  | 'packed' 
  | 'ready_for_pickup' 
  | 'out_for_delivery' 
  | 'completed' 
  | 'cancelled' 
  | 'returned' 
  | 'refunded';

export type OrderType = 'pos_counter' | 'online_pickup' | 'online_delivery';

export interface OrderTrackingEvent {
  status: OrderStatus;
  timestamp: string;
  title: string;
  notes: string;
}

export interface OrderItem {
  productId: string;
  sku?: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  discountPercent: number;
  finalPrice: number;
  variantInfo?: string;
  serviceDetails?: {
    tensionLbs?: number;
    mainString?: string;
    crossString?: string;
    express?: boolean;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  type?: OrderType;
  memberId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  tier: MembershipTier;
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  deliveryFee?: number;
  gstAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'upi' | 'card' | 'wallet' | 'member_tab' | 'pay_at_club' | 'split';
  splitPayments?: { method: 'cash' | 'upi' | 'card' | 'wallet'; amount: number }[];
  isPaid: boolean;
  paidAt?: string;
  status: OrderStatus;
  deliveryAddress?: {
    street: string;
    apartment?: string;
    city: string;
    postalCode: string;
    deliveryNotes?: string;
  };
  deliverySlot?: string;
  pickupSlot?: string;
  createdAt: string;
  updatedAt?: string;
  trackingEvents?: OrderTrackingEvent[];
  cancellationReason?: string;
  refundAmount?: number;
  notes?: string;
}

export type MenuItemCategory = 
  | 'beverages' 
  | 'protein_shakes' 
  | 'healthy_bites' 
  | 'main_plates' 
  | 'bar_craft' 
  | 'snacks' 
  | 'desserts';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuItemCategory;
  price: number;
  happyHourPrice?: number;
  gstPercent: number; // 5% for food, 18% for alcoholic/craft bar
  station: 'kitchen' | 'bar';
  isVegetarian: boolean;
  isAlcoholic: boolean;
  calories?: number;
  description: string;
  image: string;
  isAvailable: boolean;
  stockDeduction?: boolean;
  availableStock?: number;
  modifiers?: { name: string; price: number }[];
}

export type TableStatus = 'available' | 'free' | 'occupied' | 'bill_requested' | 'reserved';

export interface Table {
  id: string;
  name: string;
  capacity: number;
  partySize?: number;
  status: TableStatus;
  activeTabId?: string;
  mergedWithTableIds?: string[];
  assignedServerId?: string;
  assignedServerName?: string;
  section?: 'lounge' | 'high_top' | 'terrace' | 'booth' | 'bar_counter' | 'counter';
}

export interface BarOrderItem {
  id?: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  guestSeat?: string; // e.g. "Seat 1", "Vikram", "Guest 4" (optimized for 20-person groups)
  station: 'kitchen' | 'bar';
  status?: 'ordered' | 'preparing' | 'ready' | 'served' | 'voided';
  voidReason?: string;
  voidApprovedBy?: string;
  modifiers?: string[];
  notes?: string;
  orderedAt?: string;
}

export interface BarOrder {
  id: string;
  orderNumber?: string;
  tabId: string;
  tableId?: string;
  tableName?: string;
  serverName?: string;
  items: BarOrderItem[];
  station?: 'kitchen' | 'bar' | 'all';
  status: 'ordered' | 'preparing' | 'ready' | 'served';
  timestamp: string;
  readyAt?: string;
  servedAt?: string;
}

export interface TabSplitShare {
  guestName: string;
  amount: number;
  isPaid: boolean;
  paymentMethod?: string;
  itemsSummary?: string;
}

export interface Tab {
  id: string;
  tabNumber?: string;
  memberId?: string;
  customerName: string;
  customerPhone?: string;
  tier: MembershipTier;
  tableId?: string;
  tableName?: string;
  partySize?: number;
  orders: BarOrderItem[];
  subtotal: number;
  discountAmount: number;
  happyHourDiscount?: number;
  gstAmount: number;
  tipAmount?: number;
  totalAmount: number;
  tabLimit?: number;
  status: 'open' | 'bill_requested' | 'closed' | 'settled';
  openedAt: string;
  closedAt?: string;
  settledVia?: 'cash' | 'card' | 'upi' | 'wallet' | 'split';
  splitDetails?: {
    type: 'equal' | 'by_item';
    sharesCount?: number;
    shares?: TabSplitShare[];
  };
  serverId?: string;
  serverName?: string;
}

export interface BarStaffShift {
  id: string;
  staffId: string;
  staffName: string;
  role: 'bartender' | 'barista' | 'server' | 'head_chef' | 'manager';
  shiftType: 'morning' | 'evening' | 'night';
  clockIn: string;
  clockOut?: string;
  assignedTables: string[];
  salesTotal: number;
  ordersCount: number;
  cashOpening: number;
  cashClosing?: number;
  cashVariance?: number;
  handoverNotes?: string;
  status: 'active' | 'completed';
}

export interface ZReport {
  id: string;
  date: string;
  generatedAt: string;
  generatedBy: string;
  totalRevenue: number;
  totalOrders: number;
  totalCovers: number;
  averageBill: number;
  totalDiscounts: number;
  totalGst: number;
  totalTips: number;
  revenueByPaymentMethod: { [method: string]: number };
  topItems: { name: string; quantity: number; revenue: number }[];
  voidsTotal: number;
  voidsCount: number;
  openTabsOutstanding: number;
  staffSales: { staffName: string; sales: number; orders: number }[];
  cashReconciliation: { opening: number; cashSales: number; expected: number; actual: number; variance: number };
}

export type LeadSource = 
  | 'website_contact' 
  | 'website_trial' 
  | 'walk_in' 
  | 'phone' 
  | 'social' 
  | 'instagram'
  | 'referral' 
  | 'corporate';

export type LeadInterest = 
  | 'membership' 
  | 'trial' 
  | 'corporate' 
  | 'coaching' 
  | 'other';

export type LeadStatus = 
  | 'new' 
  | 'contacted' 
  | 'trial_booked' 
  | 'quote_sent' 
  | 'negotiation' 
  | 'won' 
  | 'converted' 
  | 'lost';

export interface LeadActivity {
  id: string;
  type: 'note' | 'call' | 'email' | 'whatsapp' | 'status_change' | 'quote_created' | 'reminder';
  content: string;
  authorName: string;
  timestamp: string;
}

export interface LeadTask {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  assignedTo?: string;
}

export interface BusinessClient {
  id: string;
  clientCode: string; // e.g. "CORP-2026-001"
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber?: string;
  panNumber?: string;
  address?: string;
  creditTerms: 'net_15' | 'net_30' | 'net_60' | 'prepaid';
  contractValue: number;
  packageType: string;
  status: 'active' | 'pending' | 'expired';
  leadId?: string;
  allocatedPasses?: number;
  notes?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  referenceNumber?: string; // e.g. "ENQ-2026-4421"
  fullName: string;
  phone: string;
  email: string;
  companyName?: string;
  interest?: LeadInterest;
  sportInterest: SportType[];
  interestedTier: MembershipTier;
  source: LeadSource;
  status: LeadStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  estimatedValue?: number;
  notes: string;
  lostReason?: string;
  followUpDate?: string;
  tasks?: LeadTask[];
  activities?: LeadActivity[];
  quoteIds?: string[];
  convertedMemberId?: string;
  convertedBusinessClientId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface QuoteItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitRate: number;
  total: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  leadId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  companyName?: string;
  packageType?: 'membership_gold' | 'membership_silver' | 'membership_platinum' | 'membership_junior' | 'corporate_wellness' | 'tournament_package' | 'custom';
  tierProposed: MembershipTier;
  tenureMonths: number;
  items?: QuoteItem[];
  baseAmount: number;
  discountType?: 'percentage' | 'fixed';
  discountPercent?: number;
  discountAmount: number;
  gstAmount: number;
  totalAmount: number;
  validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  sentVia?: 'email' | 'whatsapp' | 'manual';
  notes?: string;
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'unpaid' | 'void';

export interface InvoiceReminderLog {
  id: string;
  sentAt: string;
  channel: 'whatsapp' | 'email' | 'sms';
  sentBy: string;
  recipient: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  memberId?: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  recipientGst?: string;
  recipientAddress?: string;
  category: 'membership' | 'court_rental' | 'pro_shop' | 'bar_cafe' | 'coaching_clinic';
  stream?: 'courts' | 'shop' | 'bar_cafe' | 'membership' | 'coaching';
  sourceReference?: string; // e.g. "BKG-101", "ORD-102", "TAB-101", "CORP-001"
  items: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  subtotal: number;
  gstRate: number; // 0.05 or 0.18
  gstAmount: number;
  totalAmount: number;
  paidAmount?: number;
  balanceAmount?: number;
  creditNoteAmount?: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  staffName?: string;
  notes?: string;
  reminders?: InvoiceReminderLog[];
  createdAt: string;
}

export interface CreditNote {
  id: string;
  creditNoteNumber: string; // e.g. "CRN-2026-001"
  invoiceId: string;
  invoiceNumber: string;
  recipientName: string;
  amount: number;
  reason: string;
  issuedAt: string;
  issuedBy: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId?: string;
  memberId?: string;
  payerName: string;
  amount: number;
  method: 'upi' | 'card' | 'cash' | 'netbanking' | 'wallet';
  status: 'success' | 'pending' | 'failed';
  transactionRef: string;
  timestamp: string;
  purpose: string;
  stream?: 'courts' | 'shop' | 'bar_cafe' | 'membership' | 'coaching';
}

export interface Expense {
  id: string;
  expenseNumber: string;
  category: 'court_maintenance' | 'utilities_power' | 'staff_salaries' | 'shop_inventory' | 'bar_stock' | 'marketing' | 'licenses' | 'rent_lease';
  title: string;
  vendor: string;
  amount: number;
  inputGstAmount?: number; // Input Tax Credit (ITC)
  gstRate?: number; // 0.18 or 0.05 or 0
  date: string;
  dueDate?: string;
  status?: 'paid' | 'pending' | 'overdue';
  paymentMethod: 'bank_transfer' | 'upi' | 'corporate_card' | 'cheque';
  paidAt?: string;
  approvedBy: string;
  receiptUrl?: string;
  isRecurring?: boolean;
  recurringInterval?: 'monthly' | 'quarterly' | 'annual';
  notes?: string;
}

export interface UnifiedLedgerEntry {
  id: string;
  timestamp: string;
  transactionRef: string;
  stream: 'courts' | 'shop' | 'bar_cafe' | 'membership' | 'coaching';
  type: 'income' | 'refund';
  description: string;
  customerName: string;
  memberId?: string;
  grossAmount: number;
  gstAmount: number;
  netAmount: number;
  paymentMethod: string;
  staffName: string;
  sourceType: 'booking' | 'shop_order' | 'bar_tab' | 'membership' | 'invoice';
  sourceId: string;
}

export type EmployeeRole = 
  | 'head_coach' 
  | 'coach' 
  | 'front_desk' 
  | 'bar_staff'
  | 'shop_staff'
  | 'barista' 
  | 'bartender' 
  | 'chef' 
  | 'line_cook' 
  | 'groundskeeper' 
  | 'maintenance' 
  | 'shop_lead' 
  | 'manager';

export type EmployeeDepartment = 
  | 'Sports & Coaching' 
  | 'Front Office' 
  | 'Food & Beverage' 
  | 'Kitchen' 
  | 'Facilities & Grounds' 
  | 'Pro Shop & Retail' 
  | 'Management';

export interface EmployeeSalaryStructure {
  baseSalary: number;
  hraAllowance: number;
  transportAllowance: number;
  specialAllowance: number;
  hourlyCoachingRate?: number;
  pfEligible: boolean;
  taxDeductionPercent: number;
  bankAccount: string;
  ifscCode: string;
  panNumber?: string;
}

export interface EmployeeDocument {
  id: string;
  name: string;
  type: 'aadhaar' | 'pan' | 'contract' | 'certification' | 'medical';
  url?: string;
  uploadedAt: string;
}

export interface EmployeeShiftPreference {
  preferredShift: 'morning' | 'evening' | 'flexible' | 'night';
  maxWeeklyHours: number;
  preferredOffDays: string[]; // e.g. ['Monday', 'Tuesday']
}

export interface EmployeeLeaveBalances {
  casual: number; // total allocated per year
  sick: number;
  annual: number;
  emergency: number;
  usedCasual: number;
  usedSick: number;
  usedAnnual: number;
  usedEmergency: number;
}

export interface EmployeeCoachingProfile {
  sports: SportType[];
  hourlyRate: number;
  certification: string;
  experienceYears: number;
  bio: string;
  rating: number;
  availableSlots: string[]; // e.g. ["06:00-10:00", "16:00-20:00"]
}

export interface Employee {
  id: string;
  empId: string;
  name: string;
  role: EmployeeRole;
  department: EmployeeDepartment;
  phone: string;
  email: string;
  avatar: string;
  monthlySalary: number;
  salaryStructure: EmployeeSalaryStructure;
  documents: EmployeeDocument[];
  shiftPreference: EmployeeShiftPreference;
  leaveBalances: EmployeeLeaveBalances;
  coachingProfile?: EmployeeCoachingProfile;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  status: 'active' | 'on_leave' | 'terminated';
  joinDate: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  department?: EmployeeDepartment;
  date: string; // YYYY-MM-DD
  startTime: string; // "06:00"
  endTime: string; // "14:00"
  station?: string; // "Court 1-4", "Espresso Bar", "Main Kitchen", "Front Gate"
  status: 'scheduled' | 'completed' | 'absent' | 'swapped';
  conflictWarning?: string;
  swapRequestId?: string;
}

export interface ShiftSwapRequest {
  id: string;
  shiftId: string;
  requestingEmployeeId: string;
  requestingEmployeeName: string;
  targetEmployeeId: string;
  targetEmployeeName: string;
  targetShiftId?: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  createdAt: string;
  decisionNote?: string;
}

export interface StaffAttendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // ISO or "06:02"
  clockOut?: string; // ISO or "14:05"
  durationHours?: number;
  status: 'on_time' | 'late' | 'early_departure' | 'absent' | 'overtime';
  notes?: string;
}

export interface Leave {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'casual' | 'sick' | 'annual' | 'emergency' | 'unpaid';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  decisionComment?: string;
  createdAt: string;
  decidedAt?: string;
}

export interface Payroll {
  id: string;
  monthYear: string; // "September 2026" or "October 2026"
  employeeId: string;
  employeeName: string;
  role?: string;
  department?: string;
  baseSalary: number;
  hraAllowance: number;
  specialAllowance: number;
  overtimeHours: number;
  overtimeBonus: number;
  unpaidLeaveDays: number;
  unpaidLeaveDeduction: number;
  pfDeduction: number;
  taxDeduction: number;
  totalDeductions: number;
  grossEarnings: number;
  netPay: number;
  status: 'paid' | 'pending' | 'processing';
  paidOn?: string;
  paymentMethod?: 'bank_transfer' | 'cheque' | 'cash';
  bankAccount?: string;
  expenseIdPosted?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'membership' | 'tab' | 'inventory' | 'lead' | 'system';
  targetRole?: Role | 'all';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface AuditLog {
  id: string;
  actorName: string;
  actorRole: Role;
  action: string;
  entity: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface ClubSettings {
  clubName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  operatingHours: {
    weekdays: string;
    weekends: string;
  };
  currencySymbol: string;
  defaultGstPercent: number;
  allowGuestBookings: boolean;
  bookingCancellationWindowHours: number;
  socialPlayNotification: boolean;
  gracePeriodDays: number;
  dailyBookingCap: number;
}
