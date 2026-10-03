export type UserRole = 'owner' | 'frontdesk' | 'member' | 'shop' | 'bar' | 'manager' | 'guest';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  memberId?: string;
  membershipPlan?: MembershipTier;
}

export type MembershipTier = 'Gold' | 'Silver' | 'Junior';
export type MembershipStatus = 'active' | 'expiring_soon' | 'expired';

export interface Member {
  id: string;
  memberId: string; // e.g. M001
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  dateOfBirth: string;
  plan: MembershipTier;
  startDate: string;
  expiryDate: string;
  status: MembershipStatus;
  discountRate: number; // e.g. 0.20 for 20%
  totalBookings: number;
  totalSpent: number;
  emergencyContact?: string;
}

export type SportType = 'Tennis' | 'Padel' | 'Badminton' | 'Pickleball';
export type CourtStatus = 'available' | 'maintenance' | 'inactive';

export interface Court {
  id: string;
  number: number;
  name: string;
  sport: SportType;
  surface: string;
  hourlyRate: number; // Standard walk-in rate
  status: CourtStatus;
  capacity: number;
  isIndoor: boolean;
}

export type BookingStatus = 'confirmed' | 'completed' | 'cancelled' | 'social_play';

export interface Booking {
  id: string;
  bookingCode: string;
  courtId: string;
  courtName: string;
  sport: SportType;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "18:00"
  endTime: string; // e.g. "19:00"
  memberId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  membershipTier?: MembershipTier | 'Guest';
  amount: number;
  discountApplied: number;
  status: BookingStatus;
  paymentStatus: 'paid' | 'pending';
  paymentMethod: 'UPI' | 'Card' | 'Cash' | 'Online';
  isSocialPlay?: boolean;
  socialSlotsAvailable?: number;
  socialSlotsTotal?: number;
  registeredPlayers?: string[];
  createdAt: string;
}

export type ProductCategory = 'Rackets' | 'Balls' | 'Shoes' | 'Accessories' | 'Apparel' | 'Cafeteria & Bar';

export interface InventoryDeduction {
  productId?: string;
  sku?: string;
  itemName?: string;
  quantity: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  price: number;
  memberPrice?: number;
  stock: number;
  minStock: number;
  description: string;
  rating: number;
  features: string[];
  imageType: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShopOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  memberId?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  deliveryType: 'pickup' | 'delivery';
  address?: string;
  paymentMethod: 'UPI' | 'Card' | 'Cash' | 'Online';
  paymentStatus: 'paid' | 'pending';
  status: 'processing' | 'ready' | 'completed';
  createdAt: string;
}

export type BarCategory = 'Food' | 'Drinks' | 'Snacks' | 'Desserts';

export interface BarItem {
  id: string;
  name: string;
  category: BarCategory;
  price: number;
  description: string;
  isAvailable: boolean;
  prepTimeMinutes: number;
  calories?: number;
}

export interface BarTable {
  id: number;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentCustomer?: string;
  memberId?: string;
  membershipTier?: MembershipTier;
  activeOrderId?: string;
  tabTotal: number;
}

export interface BarOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface BarOrder {
  id: string;
  orderNumber: string;
  tableId: number;
  customerName: string;
  memberId?: string;
  membershipTier?: MembershipTier;
  items: BarOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'active' | 'sent_to_kitchen' | 'ready' | 'settled';
  paymentMethod?: 'UPI' | 'Card' | 'Cash';
  createdAt: string;
}

export type LeadStage = 'new' | 'contacted' | 'interested' | 'quote_sent' | 'follow_up' | 'converted';

export interface CRMLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  interestedIn: 'Gold Membership' | 'Silver Membership' | 'Junior Membership' | 'Court Booking' | 'Trial Session' | 'Shop' | 'General Enquiry';
  source: 'Website' | 'Walk-in' | 'Referral' | 'Phone';
  stage: LeadStage;
  notes: string;
  estimatedValue: number;
  createdAt: string;
  lastContactDate?: string;
}

export type DepartmentType = 'Front Desk' | 'Sports Shop' | 'Cafeteria & Bar' | 'Operations & Maintenance';

export interface Employee {
  id: string;
  name: string;
  role: 'Front Desk' | 'Shop Staff' | 'Bar Staff' | 'Manager' | 'Court Coach';
  department: DepartmentType;
  phone: string;
  email: string;
  shift: string; // e.g. "8 AM – 4 PM"
  status: 'active' | 'on_leave';
  avatarInitials: string;
  hourlyWage: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  leaveType: 'Vacation' | 'Sick Leave' | 'Personal';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy?: string;
}

export interface ShiftSwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterShift: string;
  targetEmployeeId: string;
  targetEmployeeName: string;
  targetEmployeeShift: string;
  swapDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy?: string;
}

export interface Transaction {
  id: string;
  txCode: string;
  customerName: string;
  memberId?: string;
  source: 'Courts' | 'Shop' | 'Bar' | 'Memberships';
  amount: number;
  paymentMethod: 'UPI' | 'Card' | 'Cash' | 'Online';
  status: 'Paid' | 'Pending' | 'Refunded';
  date: string;
  description: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'membership' | 'stock' | 'crm' | 'bar' | 'leave' | 'shift';
  timestamp: string;
  read: boolean;
  linkAction?: string;
}
