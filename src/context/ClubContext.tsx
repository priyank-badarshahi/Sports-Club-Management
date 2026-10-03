import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  UserProfile,
  UserRole,
  Member,
  Court,
  Booking,
  Product,
  CartItem,
  ShopOrder,
  BarItem,
  BarTable,
  BarOrder,
  CRMLead,
  Employee,
  LeaveRequest,
  ShiftSwapRequest,
  Transaction,
  NotificationItem,
  MembershipTier,
  LeadStage,
  InventoryDeduction,
} from '../types';
import {
  DEMO_USERS,
  INITIAL_MEMBERS,
  INITIAL_COURTS,
  INITIAL_BOOKINGS,
  INITIAL_PRODUCTS,
  INITIAL_BAR_ITEMS,
  INITIAL_TABLES,
  INITIAL_LEADS,
  INITIAL_EMPLOYEES,
  INITIAL_LEAVES,
  INITIAL_SHIFT_SWAPS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

export type AppView =
  | 'public_home'
  | 'public_about'
  | 'public_memberships'
  | 'public_courts'
  | 'public_shop'
  | 'public_bar'
  | 'public_social'
  | 'public_contact'
  | 'public_login'
  | 'public_signup'
  | 'admin_dashboard'
  | 'admin_members'
  | 'admin_courts'
  | 'admin_bookings'
  | 'admin_shop'
  | 'admin_bar'
  | 'admin_crm'
  | 'admin_employees'
  | 'admin_accounting'
  | 'admin_reports'
  | 'member_portal';

export const GUEST_USER: UserProfile = {
  id: 'guest_visitor',
  name: 'Guest Visitor',
  email: 'visitor@champions.club',
  role: 'guest',
};

interface ClubContextType {
  // Navigation & Auth
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  currentUser: UserProfile;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  login: (email: string, password?: string, role?: UserRole) => { success: boolean; error?: string };
  signup: (data: { name: string; email: string; phone: string; password?: string; preferredSport?: string; dateOfBirth?: string }) => { success: boolean; error?: string };
  logout: () => void;
  authIntent: { view: AppView; extraData?: any; message?: string } | null;
  setAuthIntent: (intent: { view: AppView; extraData?: any; message?: string } | null) => void;
  authMessage: string | null;
  setAuthMessage: (msg: string | null) => void;
  requireAuth: (targetView: AppView, extraData?: any, message?: string) => boolean;

  // Members
  members: Member[];
  addMember: (data: Omit<Member, 'id' | 'memberId' | 'totalBookings' | 'totalSpent' | 'discountRate' | 'status'> & { initialPaymentMethod?: string }) => Member;
  renewMember: (memberId: string, durationYears?: number) => void;
  updateMember: (memberId: string, updates: Partial<Member>) => void;
  getMemberByEmailOrId: (identifier: string) => Member | undefined;

  // Courts & Bookings
  courts: Court[];
  updateCourt: (courtId: string, updates: Partial<Court>) => void;
  bookings: Booking[];
  addBooking: (bookingInput: {
    courtId: string;
    sport: Court['sport'];
    date: string;
    startTime: string;
    endTime: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    memberId?: string;
    paymentMethod: 'UPI' | 'Card' | 'Cash' | 'Online';
  }) => { success: boolean; booking?: Booking; error?: string };
  cancelBooking: (bookingId: string) => void;
  joinSocialPlay: (bookingId: string, playerName: string) => boolean;

  // Sports Shop & Inventory
  products: Product[];
  cart: CartItem[];
  shopOrders: ShopOrder[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkoutCart: (details: {
    customerName: string;
    memberId?: string;
    deliveryType: 'pickup' | 'delivery';
    address?: string;
    paymentMethod: 'UPI' | 'Card' | 'Cash' | 'Online';
  }) => { success: boolean; orderId?: string; error?: string };
  restockProduct: (productId: string, amount: number) => void;
  syncInventoryReduction: (
    deductions: InventoryDeduction[],
    source: 'shop' | 'bar'
  ) => { success: boolean; updatedCount: number };

  // Bar & Cafeteria
  barItems: BarItem[];
  barTables: BarTable[];
  barOrders: BarOrder[];
  addBarOrderItem: (tableId: number, item: BarItem, quantity: number) => void;
  settleBarTab: (tableId: number, paymentMethod: 'UPI' | 'Card' | 'Cash') => { success: boolean; totalSettled: number };
  openBarTabForCustomer: (tableId: number, customerName: string, memberId?: string) => void;
  closeBarTable: (tableId: number) => void;

  // CRM
  leads: CRMLead[];
  addLead: (leadInput: Omit<CRMLead, 'id' | 'stage' | 'createdAt'>) => CRMLead;
  updateLeadStage: (leadId: string, stage: LeadStage) => void;
  convertLeadToMember: (leadId: string, plan: MembershipTier, paymentMethod?: 'UPI' | 'Card' | 'Cash' | 'Online') => Member;

  // Employees & HR
  employees: Employee[];
  leaves: LeaveRequest[];
  submitLeave: (leaveInput: Omit<LeaveRequest, 'id' | 'status' | 'submittedAt'>) => void;
  updateLeaveStatus: (leaveId: string, status: 'approved' | 'rejected', reviewerName?: string) => void;
  shiftSwaps: ShiftSwapRequest[];
  submitShiftSwap: (swapInput: Omit<ShiftSwapRequest, 'id' | 'status' | 'submittedAt'>) => void;
  updateShiftSwapStatus: (swapId: string, status: 'approved' | 'rejected', reviewerName?: string) => void;

  // Accounting & Transactions
  transactions: Transaction[];

  // Notifications & Global Search
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationsCount: number;

  // Global search helper
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

/**
 * Custom hook to monitor inventory levels and trigger a notification
 * when any product falls below or reaches its 'minimum stock' threshold,
 * making it accessible via the Notification Center.
 */
export const useInventoryMonitor = (
  products: Product[],
  onLowStock: (product: Product) => void
) => {
  // Track products that have already triggered an alert to avoid redundant notifications
  const alertedIdsRef = useRef<Set<string>>(
    new Set<string>(products.filter((p) => p.stock <= p.minStock).map((p) => p.id))
  );

  useEffect(() => {
    products.forEach((prod) => {
      const isLowStock = prod.stock <= prod.minStock;

      if (isLowStock) {
        if (!alertedIdsRef.current.has(prod.id)) {
          alertedIdsRef.current.add(prod.id);
          onLowStock(prod);
        }
      } else {
        // When product is replenished above minStock threshold, reset flag
        if (alertedIdsRef.current.has(prod.id)) {
          alertedIdsRef.current.delete(prod.id);
        }
      }
    });
  }, [products, onLowStock]);
};

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('public_home');
  const [currentUser, setCurrentUser] = useState<UserProfile>(GUEST_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authIntent, setAuthIntent] = useState<{ view: AppView; extraData?: any; message?: string } | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Entities
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [courts, setCourts] = useState<Court[]>(INITIAL_COURTS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shopOrders, setShopOrders] = useState<ShopOrder[]>([]);
  const [barItems] = useState<BarItem[]>(INITIAL_BAR_ITEMS);
  const [barTables, setBarTables] = useState<BarTable[]>(INITIAL_TABLES);
  const [barOrders, setBarOrders] = useState<BarOrder[]>([]);
  const [leads, setLeads] = useState<CRMLead[]>(INITIAL_LEADS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [shiftSwaps, setShiftSwaps] = useState<ShiftSwapRequest[]>(INITIAL_SHIFT_SWAPS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState('');

  // Switch role helper
  const switchRole = (role: UserRole) => {
    if (role === 'guest') {
      logout();
      return;
    }
    const user = DEMO_USERS[role];
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setAuthMessage(null);
      if (role === 'member') {
        setCurrentView('member_portal');
      } else if (role === 'shop') {
        setCurrentView('admin_shop');
      } else if (role === 'bar') {
        setCurrentView('admin_bar');
      } else if (role === 'frontdesk') {
        setCurrentView('admin_bookings');
      } else if (role === 'manager') {
        setCurrentView('admin_employees');
      } else {
        setCurrentView('admin_dashboard');
      }
    }
  };

  const login = (email: string, password?: string, role?: UserRole): { success: boolean; error?: string } => {
    let targetUser: UserProfile | undefined;
    if (role && DEMO_USERS[role]) {
      targetUser = DEMO_USERS[role];
    } else {
      const cleanEmail = email.trim().toLowerCase();
      // Check if demo user
      const matchedDemo = Object.values(DEMO_USERS).find(
        (u) => u.email.toLowerCase() === cleanEmail || u.role.toLowerCase() === cleanEmail
      );
      if (matchedDemo) {
        targetUser = matchedDemo;
      } else {
        // Check existing members
        const matchedMember = members.find(
          (m) => m.email.toLowerCase() === cleanEmail || m.memberId.toLowerCase() === cleanEmail
        );
        if (matchedMember) {
          targetUser = {
            id: matchedMember.id,
            name: matchedMember.name,
            email: matchedMember.email,
            role: 'member',
            memberId: matchedMember.memberId,
            membershipPlan: matchedMember.plan,
            phone: matchedMember.phone,
          };
        } else {
          // Default to member profile for non-staff logins
          targetUser = {
            id: `usr_${Date.now()}`,
            name: email.split('@')[0] ? email.split('@')[0].replace(/[\._]/g, ' ') : 'Club Member',
            email: cleanEmail,
            role: 'member',
            memberId: 'M001',
            membershipPlan: 'Gold',
          };
        }
      }
    }

    setCurrentUser(targetUser);
    setIsAuthenticated(true);
    setAuthMessage(null);

    // If an action was interrupted (e.g. court booking or checkout), restore that destination!
    if (authIntent) {
      const returnView = authIntent.view;
      setCurrentView(returnView);
      return { success: true };
    }

    // Role-based default destination
    if (targetUser.role === 'member') {
      setCurrentView('member_portal');
    } else if (targetUser.role === 'owner') {
      setCurrentView('admin_dashboard');
    } else if (targetUser.role === 'frontdesk') {
      setCurrentView('admin_bookings');
    } else if (targetUser.role === 'shop') {
      setCurrentView('admin_shop');
    } else if (targetUser.role === 'bar') {
      setCurrentView('admin_bar');
    } else if (targetUser.role === 'manager') {
      setCurrentView('admin_employees');
    } else {
      setCurrentView('public_home');
    }

    return { success: true };
  };

  const signup = (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    preferredSport?: string;
    dateOfBirth?: string;
  }): { success: boolean; error?: string } => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const newMember = addMember({
      name: data.name,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth || '1998-05-15',
      plan: 'Silver',
      startDate: todayStr,
      expiryDate: nextYear.toISOString().split('T')[0],
      initialPaymentMethod: 'Online',
    });

    const userProfile: UserProfile = {
      id: newMember.id,
      name: newMember.name,
      email: newMember.email,
      role: 'member',
      memberId: newMember.memberId,
      membershipPlan: newMember.plan,
      phone: newMember.phone,
    };

    setCurrentUser(userProfile);
    setIsAuthenticated(true);
    setAuthMessage(null);

    if (authIntent) {
      setCurrentView(authIntent.view);
      return { success: true };
    }

    setCurrentView('member_portal');
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(GUEST_USER);
    setAuthIntent(null);
    setAuthMessage(null);
    setCurrentView('public_home');
  };

  const requireAuth = (targetView: AppView, extraData?: any, message?: string): boolean => {
    if (isAuthenticated && currentUser.role !== 'guest') {
      return true;
    }
    const defaultMsg = message || 'Please login or create an account to continue.';
    setAuthIntent({ view: targetView, extraData, message: defaultMsg });
    setAuthMessage(defaultMsg);
    setCurrentView('public_login');
    return false;
  };

  const notify = (title: string, message: string, type: NotificationItem['type'], linkAction?: string) => {
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
      linkAction,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Monitor inventory levels and trigger a notification when any product falls below minimum stock
  const handleLowStockAlert = useCallback((product: Product) => {
    notify(
      'Low Stock Alert',
      `${product.name} (SKU: ${product.sku}) has reached ${product.stock} units (minimum threshold: ${product.minStock}).`,
      'stock',
      'admin_shop'
    );
  }, []);

  useInventoryMonitor(products, handleLowStockAlert);

  // Helper to find member
  const getMemberByEmailOrId = (identifier: string): Member | undefined => {
    const clean = identifier.trim().toLowerCase();
    return members.find(
      (m) =>
        m.memberId.toLowerCase() === clean ||
        m.email.toLowerCase() === clean ||
        m.name.toLowerCase() === clean
    );
  };

  // Members Management
  const addMember = (
    data: Omit<Member, 'id' | 'memberId' | 'totalBookings' | 'totalSpent' | 'discountRate' | 'status'> & { initialPaymentMethod?: string }
  ): Member => {
    const nextNum = members.length + 1;
    const memberId = `M${String(nextNum).padStart(3, '0')}`;
    const discountRate = data.plan === 'Gold' ? 0.20 : data.plan === 'Junior' ? 0.15 : 0.10;
    const membershipPrice = data.plan === 'Gold' ? 45000 : data.plan === 'Silver' ? 28000 : 22000;

    const newMember: Member = {
      ...data,
      id: `mem_${Date.now()}`,
      memberId,
      status: 'active',
      discountRate,
      totalBookings: 0,
      totalSpent: membershipPrice,
    };

    setMembers((prev) => [newMember, ...prev]);

    // Record Transaction
    const todayStr = new Date().toISOString().split('T')[0];
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      txCode: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newMember.name,
      memberId: newMember.memberId,
      source: 'Memberships',
      amount: membershipPrice,
      paymentMethod: (data.initialPaymentMethod as any) || 'Online',
      status: 'Paid',
      date: `${todayStr} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      description: `New ${newMember.plan} Membership Registration`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    notify(
      'New Member Enrolled',
      `${newMember.name} joined as a ${newMember.plan} Member (${newMember.memberId}).`,
      'membership',
      'admin_members'
    );

    return newMember;
  };

  const renewMember = (memberId: string, durationYears = 1) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.memberId === memberId) {
          const currentExpiry = new Date(m.expiryDate);
          const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
          baseDate.setFullYear(baseDate.getFullYear() + durationYears);
          const newExpiryStr = baseDate.toISOString().split('T')[0];
          const renewalCost = m.plan === 'Gold' ? 45000 : m.plan === 'Silver' ? 28000 : 22000;

          // Transaction
          const todayStr = new Date().toISOString().split('T')[0];
          const newTx: Transaction = {
            id: `tx_${Date.now()}`,
            txCode: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
            customerName: m.name,
            memberId: m.memberId,
            source: 'Memberships',
            amount: renewalCost,
            paymentMethod: 'UPI',
            status: 'Paid',
            date: `${todayStr} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            description: `${m.plan} Membership Renewal (+${durationYears} Year)`,
          };
          setTransactions((t) => [newTx, ...t]);

          return {
            ...m,
            expiryDate: newExpiryStr,
            status: 'active',
            totalSpent: m.totalSpent + renewalCost,
          };
        }
        return m;
      })
    );

    notify('Membership Renewed', `Member ${memberId} extended membership by ${durationYears} year.`, 'membership');
  };

  const updateMember = (memberId: string, updates: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) => (m.memberId === memberId ? { ...m, ...updates } : m))
    );
  };

  // Courts
  const updateCourt = (courtId: string, updates: Partial<Court>) => {
    setCourts((prev) =>
      prev.map((c) => (c.id === courtId ? { ...c, ...updates } : c))
    );
  };

  // Booking system with strict rules:
  // 1. Never double book
  // 2. Max 2 bookings per member per day
  // 3. Discount based on tier
  const addBooking = ({
    courtId,
    sport,
    date,
    startTime,
    endTime,
    customerName,
    customerPhone,
    customerEmail,
    memberId,
    paymentMethod,
  }: {
    courtId: string;
    sport: Court['sport'];
    date: string;
    startTime: string;
    endTime: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    memberId?: string;
    paymentMethod: 'UPI' | 'Card' | 'Cash' | 'Online';
  }): { success: boolean; booking?: Booking; error?: string } => {
    const court = courts.find((c) => c.id === courtId);
    if (!court) {
      return { success: false, error: 'Court not found.' };
    }

    if (court.status === 'maintenance') {
      return { success: false, error: 'This court is currently undergoing maintenance.' };
    }

    // Double booking check:
    // Slot collision check: If on same date and same court, does the interval overlap?
    const hasCollision = bookings.some((b) => {
      if (b.courtId !== courtId || b.date !== date || b.status === 'cancelled') {
        return false;
      }
      // Overlap: b.startTime < endTime && b.endTime > startTime
      return b.startTime < endTime && b.endTime > startTime;
    });

    if (hasCollision) {
      return {
        success: false,
        error: `Slot collision: Court ${court.number} is already booked between ${startTime} and ${endTime} on this date. Double booking is strictly prevented.`,
      };
    }

    // Check member limits: max 2 bookings per member per day
    let matchedMember: Member | undefined;
    if (memberId) {
      matchedMember = members.find((m) => m.memberId === memberId);
    } else {
      matchedMember = getMemberByEmailOrId(customerName);
    }

    if (matchedMember) {
      const memberBookingsToday = bookings.filter(
        (b) => b.memberId === matchedMember!.memberId && b.date === date && b.status !== 'cancelled'
      );
      if (memberBookingsToday.length >= 2) {
        return {
          success: false,
          error: `Booking limit reached: Member ${matchedMember.name} already has ${memberBookingsToday.length} bookings on ${date}. Club policy permits a maximum of 2 bookings per member per day.`,
        };
      }
    }

    // Calculate pricing and discounts
    const baseRate = court.hourlyRate;
    let discountPct = 0;
    let tier: MembershipTier | 'Guest' = 'Guest';

    if (matchedMember) {
      tier = matchedMember.plan;
      discountPct = matchedMember.discountRate; // e.g. 0.20 for Gold
    }

    const discountAmount = Math.round(baseRate * discountPct);
    const finalAmount = baseRate - discountAmount;

    const newBooking: Booking = {
      id: `bkg_${Date.now()}`,
      bookingCode: `CC-BK-${Math.floor(1000 + Math.random() * 9000)}`,
      courtId,
      courtName: court.name,
      sport,
      date,
      startTime,
      endTime,
      memberId: matchedMember?.memberId,
      customerName: matchedMember ? matchedMember.name : customerName,
      customerPhone: customerPhone || matchedMember?.phone,
      customerEmail: customerEmail || matchedMember?.email,
      membershipTier: tier,
      amount: finalAmount,
      discountApplied: discountAmount,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod,
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Update member booking count if member
    if (matchedMember) {
      setMembers((prev) =>
        prev.map((m) =>
          m.memberId === matchedMember!.memberId
            ? { ...m, totalBookings: m.totalBookings + 1, totalSpent: m.totalSpent + finalAmount }
            : m
        )
      );
    }

    // Add transaction
    const todayStr = new Date().toISOString().split('T')[0];
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      txCode: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newBooking.customerName,
      memberId: newBooking.memberId,
      source: 'Courts',
      amount: finalAmount,
      paymentMethod,
      status: 'Paid',
      date: `${todayStr} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      description: `${court.name} (${startTime} - ${endTime})`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    notify(
      'Court Booking Confirmed',
      `${court.name} reserved for ${newBooking.customerName} on ${date} at ${startTime}.`,
      'booking',
      'admin_bookings'
    );

    return { success: true, booking: newBooking };
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
    notify('Booking Cancelled', `Booking ${bookingId} has been marked as cancelled.`, 'booking');
  };

  const joinSocialPlay = (bookingId: string, playerName: string): boolean => {
    let succeeded = false;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId && (b.socialSlotsAvailable ?? 0) > 0) {
          succeeded = true;
          const updatedPlayers = [...(b.registeredPlayers || []), playerName];
          return {
            ...b,
            socialSlotsAvailable: (b.socialSlotsAvailable ?? 1) - 1,
            registeredPlayers: updatedPlayers,
          };
        }
        return b;
      })
    );

    if (succeeded) {
      notify('Social Play Registered', `${playerName} joined the Friday Social Play session.`, 'booking');
    }
    return succeeded;
  };

  // Sports Shop & Inventory
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const restockProduct = (productId: string, amount: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock + amount } : p))
    );
    notify('Inventory Restocked', `Product stock replenished (+${amount} units).`, 'stock', 'admin_shop');
  };

  // Unified inventory synchronization function
  // Ensures every shop purchase or bar sale automatically triggers an update to the shared products stock levels.
  const syncInventoryReduction = (
    deductions: InventoryDeduction[],
    source: 'shop' | 'bar'
  ): { success: boolean; updatedCount: number } => {
    let affectedCount = 0;

    setProducts((prev) => {
      let changed = false;
      const nextProducts = prev.map((prod) => {
        // Find matching deduction for this product
        const match = deductions.find((d) => {
          if (d.productId && d.productId === prod.id) return true;
          if (d.sku && d.sku.toLowerCase() === prod.sku.toLowerCase()) return true;
          if (d.itemName) {
            const cleanD = d.itemName.toLowerCase().trim();
            const cleanP = prod.name.toLowerCase().trim();
            return cleanP === cleanD || cleanP.includes(cleanD) || cleanD.includes(cleanP);
          }
          return false;
        });

        if (match && match.quantity > 0) {
          changed = true;
          affectedCount += match.quantity;
          const newStock = Math.max(0, prod.stock - match.quantity);
          if (newStock <= prod.minStock) {
            notify(
              'Low Stock Alert',
              `${prod.name} has dropped to ${newStock} units left in unified inventory! (${source.toUpperCase()} sale)`,
              'stock',
              'admin_shop'
            );
          }
          return { ...prod, stock: newStock };
        }

        return prod;
      });

      return changed ? nextProducts : prev;
    });

    return { success: true, updatedCount: affectedCount };
  };

  // Checkout reduces stock! (Crucial business requirement)
  const checkoutCart = ({
    customerName,
    memberId,
    deliveryType,
    address,
    paymentMethod,
  }: {
    customerName: string;
    memberId?: string;
    deliveryType: 'pickup' | 'delivery';
    address?: string;
    paymentMethod: 'UPI' | 'Card' | 'Cash' | 'Online';
  }): { success: boolean; orderId?: string; error?: string } => {
    if (cart.length === 0) {
      return { success: false, error: 'Your cart is empty.' };
    }

    // Verify stock availability
    for (const item of cart) {
      const liveProduct = products.find((p) => p.id === item.product.id);
      if (!liveProduct || liveProduct.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${item.product.name}. Available: ${liveProduct?.stock || 0}`,
        };
      }
    }

    // Check member discount
    const member = memberId ? members.find((m) => m.memberId === memberId) : getMemberByEmailOrId(customerName);
    const memberDiscountRate = member ? member.discountRate : 0;

    let subtotal = 0;
    cart.forEach((item) => {
      subtotal += item.product.price * item.quantity;
    });

    const discount = Math.round(subtotal * memberDiscountRate);
    const total = subtotal - discount;

    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: ShopOrder = {
      id: `ord_${Date.now()}`,
      orderNumber,
      customerName: member ? member.name : customerName,
      memberId: member?.memberId,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      subtotal,
      discount,
      total,
      deliveryType,
      address,
      paymentMethod,
      paymentStatus: 'paid',
      status: 'ready',
      createdAt: new Date().toISOString(),
    };

    // CRITICAL: Reduce inventory using unified synchronization function
    syncInventoryReduction(
      cart.map((c) => ({
        productId: c.product.id,
        sku: c.product.sku,
        itemName: c.product.name,
        quantity: c.quantity,
      })),
      'shop'
    );

    setShopOrders((prev) => [newOrder, ...prev]);

    // Record Transaction
    const todayStr = new Date().toISOString().split('T')[0];
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      txCode: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newOrder.customerName,
      memberId: newOrder.memberId,
      source: 'Shop',
      amount: total,
      paymentMethod,
      status: 'Paid',
      date: `${todayStr} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      description: `Sports Shop Purchase (${cart.length} items - ${orderNumber})`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    clearCart();

    notify('Shop Order Placed', `Order ${orderNumber} confirmed for ${newOrder.customerName} (₹${total.toLocaleString('en-IN')}).`, 'stock');

    return { success: true, orderId: orderNumber };
  };

  // Bar & Cafeteria POS
  const openBarTabForCustomer = (tableId: number, customerName: string, memberId?: string) => {
    let member = memberId ? members.find((m) => m.memberId === memberId) : getMemberByEmailOrId(customerName);

    setBarTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'occupied',
              currentCustomer: member ? member.name : customerName,
              memberId: member?.memberId,
              membershipTier: member?.plan,
            }
          : t
      )
    );

    notify('Table Opened', `Table ${tableId} opened for ${customerName} ${member ? `(${member.plan} Member)` : ''}.`, 'bar', 'admin_bar');
  };

  const addBarOrderItem = (tableId: number, item: BarItem, quantity: number) => {
    // CRITICAL: Trigger unified inventory synchronization for bar item sale
    syncInventoryReduction(
      [{ itemName: item.name, quantity }],
      'bar'
    );

    setBarTables((prev) =>
      prev.map((table) => {
        if (table.id === tableId) {
          const itemCost = item.price * quantity;
          const member = table.memberId ? members.find((m) => m.memberId === table.memberId) : undefined;
          const discountPct = member ? member.discountRate : 0;
          const netCost = Math.round(itemCost * (1 - discountPct));
          return {
            ...table,
            status: 'occupied',
            tabTotal: table.tabTotal + netCost,
          };
        }
        return table;
      })
    );

    notify('Kitchen Order Sent', `Sent ${quantity}x ${item.name} to kitchen for Table ${tableId} (stock updated in shared inventory).`, 'bar', 'admin_bar');
  };

  const settleBarTab = (
    tableId: number,
    paymentMethod: 'UPI' | 'Card' | 'Cash'
  ): { success: boolean; totalSettled: number } => {
    const table = barTables.find((t) => t.id === tableId);
    if (!table || table.tabTotal <= 0) {
      return { success: false, totalSettled: 0 };
    }

    const settledAmount = table.tabTotal;
    const customer = table.currentCustomer || `Table ${tableId} Guest`;
    const memberId = table.memberId;

    // Reset table
    setBarTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'available',
              currentCustomer: undefined,
              memberId: undefined,
              membershipTier: undefined,
              activeOrderId: undefined,
              tabTotal: 0,
            }
          : t
      )
    );

    // Record Transaction
    const todayStr = new Date().toISOString().split('T')[0];
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      txCode: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customer,
      memberId,
      source: 'Bar',
      amount: settledAmount,
      paymentMethod,
      status: 'Paid',
      date: `${todayStr} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      description: `Cafeteria Bill Settled (Table ${tableId})`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    notify('Bar Tab Settled', `Table ${tableId} tab settled: ₹${settledAmount.toLocaleString('en-IN')} via ${paymentMethod}.`, 'bar', 'admin_bar');

    return { success: true, totalSettled: settledAmount };
  };

  const closeBarTable = (tableId: number) => {
    setBarTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'available',
              currentCustomer: undefined,
              memberId: undefined,
              membershipTier: undefined,
              activeOrderId: undefined,
              tabTotal: 0,
            }
          : t
      )
    );
  };

  // CRM
  const addLead = (leadInput: Omit<CRMLead, 'id' | 'stage' | 'createdAt'>): CRMLead => {
    const newLead: CRMLead = {
      ...leadInput,
      id: `lead_${Date.now()}`,
      stage: 'new',
      createdAt: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);
    notify('New Website Enquiry', `${newLead.name} submitted an enquiry for ${newLead.interestedIn}.`, 'crm', 'admin_crm');
    return newLead;
  };

  const updateLeadStage = (leadId: string, stage: LeadStage) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage } : l))
    );
  };

  const convertLeadToMember = (
    leadId: string,
    plan: MembershipTier,
    paymentMethod: 'UPI' | 'Card' | 'Cash' | 'Online' = 'Online'
  ): Member => {
    const lead = leads.find((l) => l.id === leadId);
    const today = new Date();
    const expiry = new Date();
    expiry.setFullYear(today.getFullYear() + 1);

    const newMember = addMember({
      name: lead ? lead.name : 'New Member',
      email: lead ? lead.email : 'member@example.com',
      phone: lead ? lead.phone : '+91 99999 00000',
      dateOfBirth: '1995-01-01',
      plan,
      startDate: today.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      initialPaymentMethod: paymentMethod,
    });

    if (lead) {
      updateLeadStage(leadId, 'converted');
    }

    notify('Lead Converted!', `${newMember.name} has been successfully converted into an active ${plan} Member!`, 'crm', 'admin_members');

    return newMember;
  };

  // Leaves
  const submitLeave = (leaveInput: Omit<LeaveRequest, 'id' | 'status' | 'submittedAt'>) => {
    const newLeave: LeaveRequest = {
      ...leaveInput,
      id: `leave_${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setLeaves((prev) => [newLeave, ...prev]);
    notify('New Leave Request', `${newLeave.employeeName} submitted a ${newLeave.leaveType} request. Manager approval required.`, 'leave', 'admin_employees');
  };

  const updateLeaveStatus = (leaveId: string, status: 'approved' | 'rejected', reviewerName = 'Club Manager') => {
    let targetLeave: LeaveRequest | undefined;
    setLeaves((prev) =>
      prev.map((l) => {
        if (l.id === leaveId) {
          targetLeave = { ...l, status, reviewedBy: reviewerName };
          return targetLeave;
        }
        return l;
      })
    );

    // If approved, update employee status to on_leave if applicable
    if (status === 'approved' && targetLeave) {
      const today = new Date().toISOString().split('T')[0];
      if (targetLeave.startDate <= today && targetLeave.endDate >= today) {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === targetLeave!.employeeId || emp.name === targetLeave!.employeeName
              ? { ...emp, status: 'on_leave' }
              : emp
          )
        );
      }
    }

    notify(
      `Leave Request ${status === 'approved' ? 'Approved' : 'Declined'}`,
      `Leave request for ${targetLeave?.employeeName || 'Staff'} has been marked as ${status} by ${reviewerName}.`,
      'leave',
      'admin_employees'
    );
  };

  // Shift Swaps
  const submitShiftSwap = (swapInput: Omit<ShiftSwapRequest, 'id' | 'status' | 'submittedAt'>) => {
    const newSwap: ShiftSwapRequest = {
      ...swapInput,
      id: `swap_${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setShiftSwaps((prev) => [newSwap, ...prev]);
    notify(
      'New Shift Swap Request',
      `${newSwap.requesterName} requested to swap shift with ${newSwap.targetEmployeeName} on ${newSwap.swapDate}. Manager approval required.`,
      'shift',
      'admin_employees'
    );
  };

  const updateShiftSwapStatus = (swapId: string, status: 'approved' | 'rejected', reviewerName = 'Club Manager') => {
    let affectedSwap: ShiftSwapRequest | undefined;

    setShiftSwaps((prev) =>
      prev.map((s) => {
        if (s.id === swapId) {
          affectedSwap = { ...s, status, reviewedBy: reviewerName };
          return affectedSwap;
        }
        return s;
      })
    );

    // If approved, dynamically swap the shifts between the two employees on the club roster!
    if (status === 'approved' && affectedSwap) {
      setEmployees((prev) =>
        prev.map((emp) => {
          if (emp.id === affectedSwap!.requesterId || emp.name === affectedSwap!.requesterName) {
            return { ...emp, shift: affectedSwap!.targetEmployeeShift };
          }
          if (emp.id === affectedSwap!.targetEmployeeId || emp.name === affectedSwap!.targetEmployeeName) {
            return { ...emp, shift: affectedSwap!.requesterShift };
          }
          return emp;
        })
      );

      notify(
        'Shift Swap Approved',
        `Shift swap approved between ${affectedSwap.requesterName} and ${affectedSwap.targetEmployeeName} for ${affectedSwap.swapDate}. Roster updated.`,
        'shift',
        'admin_employees'
      );
    } else if (status === 'rejected' && affectedSwap) {
      notify(
        'Shift Swap Declined',
        `Shift swap request between ${affectedSwap.requesterName} and ${affectedSwap.targetEmployeeName} was declined by ${reviewerName}.`,
        'shift',
        'admin_employees'
      );
    }
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <ClubContext.Provider
      value={{
        currentView,
        setCurrentView,
        currentUser,
        isAuthenticated,
        switchRole,
        login,
        signup,
        logout,
        authIntent,
        setAuthIntent,
        authMessage,
        setAuthMessage,
        requireAuth,
        members,
        addMember,
        renewMember,
        updateMember,
        getMemberByEmailOrId,
        courts,
        updateCourt,
        bookings,
        addBooking,
        cancelBooking,
        joinSocialPlay,
        products,
        cart,
        shopOrders,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        checkoutCart,
        restockProduct,
        syncInventoryReduction,
        barItems,
        barTables,
        barOrders,
        addBarOrderItem,
        settleBarTab,
        openBarTabForCustomer,
        closeBarTable,
        leads,
        addLead,
        updateLeadStage,
        convertLeadToMember,
        employees,
        leaves,
        submitLeave,
        updateLeaveStatus,
        shiftSwaps,
        submitShiftSwap,
        updateShiftSwapStatus,
        transactions,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationsCount,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
};
