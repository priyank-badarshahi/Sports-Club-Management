import { createClient } from '@supabase/supabase-js';
import { Member, Booking, Product, Order, Tab, Invoice, Payment, AuditLog, SportType, MembershipTier, BookingStatus } from '../types';

const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://gddhfywnqrltmnlmtyak.supabase.co';
const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_UFblFtW6JURAXiqHdNUIOA_9a1Xswm6';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Maps Supabase PostgreSQL booking row to TypeScript Booking model.
 */
export function formatBookingForClient(row: any): Booking {
  // 1. Determine courtId matching frontend courts ('court-1' to 'court-6')
  let courtId = 'court-1';
  if (row.courtId && typeof row.courtId === 'string' && row.courtId.startsWith('court-')) {
    courtId = row.courtId;
  } else if (row.court_id && typeof row.court_id === 'string' && row.court_id.startsWith('court-')) {
    courtId = row.court_id;
  } else if (row.court_name) {
    const numMatch = String(row.court_name).match(/Arena\s*#(\d+)/i) || String(row.court_name).match(/Court\s*#?(\d+)/i);
    if (numMatch) {
      const cNum = parseInt(numMatch[1], 10);
      courtId = `court-${((cNum - 1) % 6) + 1}`;
    }
  } else if (row.court_id) {
    courtId = row.court_id;
  }

  // 2. Sport mapping to the 6 club sports
  const sportRaw = String(row.sport || '').toLowerCase();
  let sport: SportType = 'badminton';
  if (sportRaw.includes('cricket') || sportRaw.includes('tennis')) {
    sport = 'box_cricket';
  } else if (sportRaw.includes('padel') || sportRaw.includes('volleyball')) {
    sport = 'volleyball';
  } else if (sportRaw.includes('table') || sportRaw.includes('pickleball')) {
    sport = 'table_tennis';
  } else if (sportRaw.includes('kho')) {
    sport = 'kho_kho';
  } else if (sportRaw.includes('hockey')) {
    sport = 'hockey';
  } else if (sportRaw.includes('badminton')) {
    sport = 'badminton';
  }

  // 3. Time formatting (ensure HH:mm)
  let startTime = row.start_time || row.startTime || '07:00';
  if (typeof startTime === 'string' && startTime.length > 5) startTime = startTime.slice(0, 5);
  let endTime = row.end_time || row.endTime || '08:00';
  if (typeof endTime === 'string' && endTime.length > 5) endTime = endTime.slice(0, 5);

  // 4. Membership Tier
  const tierRaw = String(row.membership_tier || row.tier || 'silver').toLowerCase();
  const tier: MembershipTier =
    tierRaw === 'gold' ? 'gold' :
    tierRaw === 'junior' ? 'junior' :
    tierRaw === 'walk_in' ? 'walk_in' : 'silver';

  // 5. Booking code & id
  const code = row.booking_code || (row.id && String(row.id).startsWith('BKG-') ? row.id : `BKG-SCG-${row.id ? String(row.id).slice(0, 8) : Math.floor(10000 + Math.random() * 90000)}`);
  const id = code;

  // 6. Payment status & method
  const isPaid = row.payment_status === 'paid' || row.isPaid === true;
  const pmRaw = String(row.payment_method || row.paymentMethod || 'card').toLowerCase();
  const paymentMethod = (['wallet', 'upi', 'card', 'cash', 'tab', 'plan_included', 'pay_at_desk'].includes(pmRaw) ? pmRaw : 'card') as any;

  // 7. Status
  const statusRaw = String(row.status || 'confirmed').toLowerCase();
  const status: BookingStatus = (['confirmed', 'cancelled', 'completed', 'checked_in', 'no_show'].includes(statusRaw) ? statusRaw : 'confirmed') as any;

  return {
    id,
    courtId,
    memberId: row.member_id || row.memberId || undefined,
    guestName: row.customer_name || row.guestName || 'Member',
    guestPhone: row.customer_phone || row.guestPhone || '',
    guestEmail: row.customer_email || row.guestEmail || '',
    tier,
    date: row.booking_date || row.date || new Date().toISOString().split('T')[0],
    startTime,
    endTime,
    sport,
    bookingType: row.is_social_play ? 'social_play' : (row.bookingType || 'regular'),
    channel: row.channel || 'online',
    totalPrice: Number(row.amount ?? row.totalPrice ?? 0),
    discountApplied: Number(row.discount_applied ?? row.discountApplied ?? 0),
    status,
    isPaid,
    paymentMethod,
    qrCodeData: `SCG-PASS-${id}`,
    notes: row.notes || (row.court_name ? `Court: ${row.court_name}` : `Booking ${id}`),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

/**
 * Maps frontend Booking model to Supabase PostgreSQL database columns.
 */
export function formatBookingForDatabase(b: any) {
  let dbSport = 'Badminton';
  const sportLower = String(b.sport || '').toLowerCase();
  if (sportLower.includes('cricket') || sportLower.includes('tennis')) dbSport = 'Tennis';
  else if (sportLower.includes('volleyball') || sportLower.includes('padel') || sportLower.includes('kho')) dbSport = 'Padel';
  else if (sportLower.includes('table') || sportLower.includes('hockey')) dbSport = 'Pickleball';
  else if (sportLower.includes('badminton')) dbSport = 'Badminton';

  let courtName = 'Sports Club Gujarat Arena #1 - Tennis Zone';
  if (b.courtId) {
    const num = parseInt(String(b.courtId).replace(/\D/g, '') || '1', 10);
    courtName = `Sports Club Gujarat Arena #${num} - ${dbSport} Zone`;
  }

  const startTime = b.startTime ? (b.startTime.length === 5 ? b.startTime + ':00' : b.startTime) : '07:00:00';
  const endTime = b.endTime ? (b.endTime.length === 5 ? b.endTime + ':00' : b.endTime) : '08:00:00';

  const tier = b.tier ? (b.tier.charAt(0).toUpperCase() + b.tier.slice(1).toLowerCase()) : 'Silver';
  const paymentMethod = b.paymentMethod ? (b.paymentMethod.charAt(0).toUpperCase() + b.paymentMethod.slice(1).toLowerCase()) : 'Card';
  const bookingCode = b.id && String(b.id).startsWith('BKG-') ? b.id : `BKG-SCG-${Math.floor(10000 + Math.random() * 90000)}`;

  const item: any = {
    booking_code: bookingCode,
    court_name: courtName,
    sport: dbSport,
    booking_date: b.date || new Date().toISOString().split('T')[0],
    start_time: startTime,
    end_time: endTime,
    member_id: b.memberId || 'M001',
    customer_name: b.guestName || 'Member',
    customer_phone: b.guestPhone || '',
    customer_email: b.guestEmail || '',
    membership_tier: tier,
    amount: Number(b.totalPrice || 0),
    discount_applied: Number(b.discountApplied || 0),
    status: b.status || 'confirmed',
    payment_status: b.isPaid ? 'paid' : 'pending',
    payment_method: paymentMethod,
    is_social_play: b.bookingType === 'social_play',
  };

  if (b.court_id && b.court_id.length === 36) {
    item.court_id = b.court_id;
  }
  if (b.dbId) {
    item.id = b.dbId;
  }

  return item;
}

/**
 * Robust Supabase persistence helpers.
 * Fully typed with error-safety (falls back to local memory if Supabase tables are not yet fully provisioned).
 */

const TABLE_COLUMNS: Record<string, string[]> = {
  members: [
    'id', 'member_id', 'user_id', 'name', 'email', 'phone', 'avatar_url', 
    'date_of_birth', 'plan', 'start_date', 'expiry_date', 'status', 
    'discount_rate', 'total_bookings', 'total_spent', 'emergency_contact'
  ],
  bookings: [
    'id', 'booking_code', 'court_id', 'court_name', 'sport', 'booking_date', 
    'start_time', 'end_time', 'member_id', 'customer_name', 'customer_phone', 
    'customer_email', 'membership_tier', 'amount', 'discount_applied', 
    'status', 'payment_status', 'payment_method', 'is_social_play', 
    'social_slots_available', 'social_slots_total', 'registered_players'
  ],
  products: [
    'id', 'name', 'sku', 'brand', 'category', 'price', 'costPrice', 'stockQty', 
    'reservedQty', 'reorderLevel', 'isServiceItem', 'image', 'serviceOptions', 
    'sizeVariants', 'stringTensionRange', 'stock', 'min_stock', 'member_price', 'description'
  ],
  orders: [
    'id', 'orderNumber', 'memberId', 'customerName', 'items', 'totalAmount', 
    'discountAmount', 'gstAmount', 'isPaid', 'paymentMethod', 'status', 
    'trackingEvents', 'createdAt', 'updatedAt', 'serviceConfig'
  ],
  tabs: [
    'id', 'tabNumber', 'memberId', 'customerName', 'tier', 'tableId', 'tableName', 
    'partySize', 'orders', 'subtotal', 'discountAmount', 'happyHourDiscount', 
    'gstAmount', 'totalAmount', 'tipAmount', 'tabLimit', 'status', 'openedAt', 
    'closedAt', 'settledVia', 'serverName', 'splitDetails'
  ],
  invoices: [
    'id', 'invoiceNumber', 'memberId', 'recipientName', 'recipientEmail', 'recipientPhone', 
    'recipientGst', 'category', 'items', 'subtotal', 'gstRate', 'gstAmount', 
    'totalAmount', 'paidAmount', 'balanceAmount', 'creditNoteAmount', 'status', 
    'dueDate', 'paidAt', 'paymentMethod', 'createdAt', 'stream', 'reminders'
  ],
  payments: [
    'id', 'paymentNumber', 'invoiceId', 'memberId', 'payerName', 'amount', 'method', 
    'status', 'transactionRef', 'timestamp', 'purpose', 'stream'
  ],
  social_sessions: [
    'id', 'title', 'sport', 'courtIds', 'date', 'startTime', 'endTime', 'maxParticipants', 
    'currentParticipants', 'participantDetails', 'waitlist', 'organizer', 'level', 'fee'
  ],
  stock_movements: [
    'id', 'productId', 'productName', 'change', 'type', 'notes', 'performedBy', 
    'timestamp', 'referenceId'
  ],
  menu_items: [
    'id', 'name', 'description', 'price', 'happyHourPrice', 'category', 'station', 
    'isAvailable', 'image', 'tags'
  ],
  tables: [
    'id', 'name', 'capacity', 'status', 'activeTabId', 'assignedServerName', 'mergedWithTableIds'
  ],
  credit_notes: [
    'id', 'creditNoteNumber', 'invoiceId', 'invoiceNumber', 'recipientName', 'amount', 
    'reason', 'issuedAt', 'issuedBy'
  ],
  leads: [
    'id', 'referenceNumber', 'fullName', 'phone', 'email', 'companyName', 'interest', 
    'sportInterest', 'interestedTier', 'source', 'status', 'assignedStaffName', 
    'estimatedValue', 'notes', 'followUpDate', 'createdAt', 'updatedAt', 'lostReason', 
    'activities', 'tasks', 'quoteIds', 'convertedMemberId'
  ],
  quotes: [
    'id', 'quoteNumber', 'leadId', 'clientName', 'clientEmail', 'items', 'subtotal', 
    'gstAmount', 'totalAmount', 'status', 'validUntil', 'createdAt', 'notes'
  ],
  business_clients: [
    'id', 'companyName', 'clientCode', 'contactPerson', 'email', 'phone', 'gstNumber', 
    'panNumber', 'address', 'creditTerms', 'contractValue', 'packageType', 
    'allocatedPasses', 'passesUsed', 'status', 'leadId', 'createdAt', 'notes'
  ],
  expenses: [
    'id', 'expenseNumber', 'title', 'vendor', 'category', 'amount', 'inputGstAmount', 
    'gstRate', 'date', 'dueDate', 'status', 'paidAt', 'paymentMethod', 'approvedBy', 'notes'
  ],
  employees: [
    'id', 'empId', 'name', 'role', 'department', 'email', 'phone', 'status', 
    'salaryDetails', 'coachingProfile', 'bankAccount', 'leaveBalances', 'joinDate', 'documents'
  ],
  shifts: [
    'id', 'employeeId', 'employeeName', 'role', 'department', 'date', 'startTime', 
    'endTime', 'station', 'status'
  ],
  swap_requests: [
    'id', 'shiftId', 'requestingEmployeeId', 'requestingEmployeeName', 'targetEmployeeId', 
    'targetEmployeeName', 'status', 'decisionNote', 'createdAt'
  ],
  attendance: [
    'id', 'employeeId', 'employeeName', 'date', 'clockIn', 'clockOut', 'status', 
    'durationHours', 'notes'
  ],
  leaves: [
    'id', 'employeeId', 'employeeName', 'type', 'startDate', 'endDate', 'daysCount', 
    'reason', 'status', 'approvedBy', 'decisionComment', 'decidedAt', 'createdAt'
  ],
  payroll: [
    'id', 'employeeId', 'employeeName', 'monthYear', 'baseSalary', 'variableBonus', 
    'deductionsUnpaidLeaves', 'deductionsTaxPpf', 'grossEarnings', 'totalDeductions', 
    'netPay', 'status', 'paidOn', 'paymentMethod', 'expenseIdPosted'
  ],
  notifications: [
    'id', 'title', 'message', 'type', 'targetRole', 'timestamp', 'read', 'link'
  ],
  audit_logs: [
    'id', 'timestamp', 'actorId', 'actorName', 'actorRole', 'action', 'entity', 'details', 'ipAddress'
  ],
  settings: [
    'id', 'dailyBookingCap', 'bookingCancellationWindowHours', 'defaultGstPercent', 
    'gracePeriodDays', 'happyHourDiscountPct', 'happyHourStart', 'happyHourEnd', 
    'stripeEnabled', 'upiEnabled', 'walletAutoRefundEnabled', 'clubEmail', 'clubPhone'
  ]
};

export const supabaseService = {
  /**
   * Sync an entire slice of data to a Supabase table.
   * Performs an upsert operation.
   */
  async upsertRecords(tableName: string, records: any[]): Promise<boolean> {
    if (!records || records.length === 0) return true;
    try {
      // Map custom front-end shapes to DB shapes, strip extra frontend-only properties
      const cleanRecords = records.map(r => {
        let item = { ...r };
        
        // Special mapping for members table to match Supabase database schema
        if (tableName === 'members') {
          const tierRaw = String(r.tier || 'Silver');
          const plan = tierRaw.charAt(0).toUpperCase() + tierRaw.slice(1).toLowerCase();
          item = {
            member_id: r.id?.startsWith('M') || r.id?.startsWith('ADM') ? r.id : (r.memberNumber?.split('-').pop() || 'M001'),
            name: r.fullName || r.name || 'Member',
            email: r.email || '',
            phone: r.phone || '',
            avatar_url: r.avatar || null,
            date_of_birth: r.dateOfBirth || '2000-01-01',
            plan: plan,
            start_date: r.joinDate || new Date().toISOString().split('T')[0],
            expiry_date: r.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: r.status || 'active',
            discount_rate: r.tier === 'gold' ? 0.20 : r.tier === 'junior' ? 0.15 : 0.10,
            total_spent: r.walletBalance ? r.walletBalance * 10 : 25000,
            emergency_contact: r.emergencyContact ? (typeof r.emergencyContact === 'string' ? r.emergencyContact : JSON.stringify(r.emergencyContact)) : null,
          };
          if (r.dbId) item.id = r.dbId;
        }

        // Special mapping for bookings table to match Supabase database schema
        if (tableName === 'bookings') {
          item = formatBookingForDatabase(r);
        }

        // Remove columns not in whitelist for this table to prevent 42703 (column does not exist) errors
        const allowedColumns = TABLE_COLUMNS[tableName];
        if (allowedColumns) {
          for (const key of Object.keys(item)) {
            if (!allowedColumns.includes(key)) {
              delete item[key];
            }
          }
        }

        // Ensure complex arrays/objects are saved as JSON strings in Supabase
        for (const key of Object.keys(item)) {
          if (item[key] && typeof item[key] === 'object') {
            item[key] = JSON.stringify(item[key]);
          }
        }
        return item;
      });

      const conflictCol = tableName === 'members' ? 'member_id' : tableName === 'bookings' ? 'booking_code' : 'id';
      const { error } = await supabase.from(tableName).upsert(cleanRecords, { onConflict: conflictCol });
      if (error) {
        console.warn(`Supabase upsert failed on table "${tableName}":`, error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn(`Supabase error for table "${tableName}":`, err);
      return false;
    }
  },

  /**
   * Fetch all records for a table.
   */
  async fetchRecords<T>(tableName: string): Promise<T[] | null> {
    try {
      // For members, first try our Express backend endpoint which provides mapped data
      if (tableName === 'members') {
        try {
          const res = await fetch('/api/members');
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.members) && json.members.length > 0) {
              return json.members as T[];
            }
          }
        } catch {
          // If backend fetch fails, proceed with Supabase client query
        }
      }

      // For bookings, first try our Express backend endpoint which provides mapped data
      if (tableName === 'bookings') {
        try {
          const res = await fetch('/api/bookings');
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.bookings) && json.bookings.length > 0) {
              return json.bookings as T[];
            }
          }
        } catch {
          // If backend fetch fails, proceed with Supabase client query
        }
      }

      let query = supabase.from(tableName).select('*');
      if (tableName === 'bookings') {
        query = query.order('booking_date', { ascending: false });
      }

      const { data, error } = await query;
      if (error) {
        console.warn(`Supabase fetch failed on table "${tableName}":`, error.message);
        return null;
      }
      
      // Parse JSON strings back to objects & format domain entities
      const parsedData = (data || []).map((row: any) => {
        // Special mapping if fetching directly from Supabase members table
        if (tableName === 'members' && row.name && !row.fullName) {
          const tierRaw = String(row.plan || 'Silver').toLowerCase();
          const tier = tierRaw === 'gold' ? 'gold' : tierRaw === 'junior' ? 'junior' : 'silver';
          let emergencyContact = { name: 'Emergency Contact', phone: row.phone || '', relation: 'Family' };
          if (typeof row.emergency_contact === 'string') {
            try { emergencyContact = JSON.parse(row.emergency_contact); } catch (e) {}
          } else if (typeof row.emergency_contact === 'object' && row.emergency_contact !== null) {
            emergencyContact = row.emergency_contact;
          }

          return {
            id: row.member_id || row.id,
            dbId: row.id,
            memberNumber: `CC-2026-${row.member_id || 'M001'}`,
            fullName: row.name || 'Member',
            dateOfBirth: row.date_of_birth || '2000-01-01',
            email: row.email || '',
            phone: row.phone || '',
            avatar: row.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
            tier,
            status: row.status || 'active',
            joinDate: row.start_date || row.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            expiryDate: row.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            walletBalance: typeof row.total_spent === 'number' ? Math.round(row.total_spent / 10) : 2500,
            activeTabBalance: 0,
            emergencyContact,
            preferredSports: ['box_cricket', 'badminton'],
            attendanceLog: [],
            reminderLog: [],
            notes: `Database record for member ID ${row.member_id}`,
          };
        }

        // Special mapping if fetching directly from Supabase bookings table
        if (tableName === 'bookings' && (row.booking_code || row.customer_name || row.booking_date || row.court_id)) {
          return formatBookingForClient(row);
        }

        const item = { ...row };
        for (const key of Object.keys(item)) {
          if (typeof item[key] === 'string') {
            const val = item[key].trim();
            if ((val.startsWith('{') && val.endsWith('}')) || (val.startsWith('[') && val.endsWith(']'))) {
              try {
                item[key] = JSON.parse(val);
              } catch (e) {
                // Not JSON, keep as-is
              }
            }
          }
        }
        return item;
      });

      return parsedData as T[];
    } catch (err) {
      console.warn(`Supabase network error on fetch table "${tableName}":`, err);
      return null;
    }
  },

  /**
   * Delete a record by ID.
   */
  async deleteRecord(tableName: string, id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) {
        console.warn(`Supabase delete failed on table "${tableName}" for ID "${id}":`, error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn(`Supabase error during delete on table "${tableName}":`, err);
      return false;
    }
  },

  /**
   * Generate exact SQL query block to let user provision the tables easily in Supabase SQL Editor.
   */
  getSQLSchemaScript(): string {
    return `-- Run this in your Supabase SQL Editor to provision all Champions Club tables:

-- 1. Enable UUID extension if required
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE members table
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  avatar TEXT,
  tier TEXT DEFAULT 'walk_in',
  status TEXT DEFAULT 'active',
  "expiryDate" TEXT,
  "walletBalance" NUMERIC DEFAULT 0,
  "activeTabBalance" NUMERIC DEFAULT 0,
  "emergencyContact" JSONB,
  notes TEXT,
  "joinDate" TEXT,
  "memberNumber" TEXT,
  "attendanceLog" JSONB DEFAULT '[]'::jsonb,
  "reminderLog" JSONB DEFAULT '[]'::jsonb
);

-- 3. CREATE bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  "courtId" TEXT NOT NULL,
  "memberId" TEXT,
  "guestName" TEXT,
  "guestPhone" TEXT,
  "guestEmail" TEXT,
  tier TEXT,
  date TEXT NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  sport TEXT,
  "bookingType" TEXT,
  channel TEXT,
  "totalPrice" NUMERIC DEFAULT 0,
  "discountApplied" NUMERIC DEFAULT 0,
  "priceBreakdown" JSONB,
  status TEXT DEFAULT 'confirmed',
  "isPaid" BOOLEAN DEFAULT false,
  "paymentMethod" TEXT,
  notes TEXT,
  "createdAt" TEXT,
  "cancelledAt" TEXT,
  "cancellationReason" TEXT,
  "lateCancelFee" NUMERIC,
  "refundAmount" NUMERIC,
  "qrCodeData" TEXT,
  "isRecurring" BOOLEAN DEFAULT false,
  "recurringGroupId" TEXT
);

-- 4. CREATE products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  brand TEXT,
  category TEXT,
  price NUMERIC DEFAULT 0,
  "costPrice" NUMERIC DEFAULT 0,
  "stockQty" INTEGER DEFAULT 0,
  "reservedQty" INTEGER DEFAULT 0,
  "reorderLevel" INTEGER DEFAULT 5,
  "isServiceItem" BOOLEAN DEFAULT false,
  image TEXT,
  "serviceOptions" JSONB,
  "sizeVariants" JSONB,
  "stringTensionRange" TEXT
);

-- 5. CREATE orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  "orderNumber" TEXT UNIQUE NOT NULL,
  "memberId" TEXT,
  "customerName" TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  "totalAmount" NUMERIC DEFAULT 0,
  "discountAmount" NUMERIC DEFAULT 0,
  "gstAmount" NUMERIC DEFAULT 0,
  "isPaid" BOOLEAN DEFAULT false,
  "paymentMethod" TEXT,
  status TEXT DEFAULT 'placed',
  "trackingEvents" JSONB DEFAULT '[]'::jsonb,
  "createdAt" TEXT,
  "updatedAt" TEXT,
  "serviceConfig" JSONB
);

-- 6. CREATE tabs table
CREATE TABLE IF NOT EXISTS tabs (
  id TEXT PRIMARY KEY,
  "tabNumber" TEXT UNIQUE NOT NULL,
  "memberId" TEXT,
  "customerName" TEXT NOT NULL,
  tier TEXT,
  "tableId" TEXT,
  "tableName" TEXT,
  "partySize" INTEGER DEFAULT 2,
  orders JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC DEFAULT 0,
  "discountAmount" NUMERIC DEFAULT 0,
  "happyHourDiscount" NUMERIC DEFAULT 0,
  "gstAmount" NUMERIC DEFAULT 0,
  "totalAmount" NUMERIC DEFAULT 0,
  "tipAmount" NUMERIC DEFAULT 0,
  "tabLimit" NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'open',
  "openedAt" TEXT,
  "closedAt" TEXT,
  "settledVia" TEXT,
  "serverName" TEXT,
  "splitDetails" JSONB
);

-- 7. CREATE invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  "invoiceNumber" TEXT UNIQUE NOT NULL,
  "memberId" TEXT,
  "recipientName" TEXT NOT NULL,
  "recipientEmail" TEXT,
  "recipientPhone" TEXT,
  "recipientGst" TEXT,
  category TEXT DEFAULT 'court_rental',
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC DEFAULT 0,
  "gstRate" NUMERIC DEFAULT 0.18,
  "gstAmount" NUMERIC DEFAULT 0,
  "totalAmount" NUMERIC DEFAULT 0,
  "paidAmount" NUMERIC DEFAULT 0,
  "balanceAmount" NUMERIC DEFAULT 0,
  "creditNoteAmount" NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'unpaid',
  "dueDate" TEXT,
  "paidAt" TEXT,
  "paymentMethod" TEXT,
  "createdAt" TEXT,
  stream TEXT,
  reminders JSONB DEFAULT '[]'::jsonb
);

-- 8. CREATE payments table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  "paymentNumber" TEXT UNIQUE NOT NULL,
  "invoiceId" TEXT,
  "memberId" TEXT,
  "payerName" TEXT,
  amount NUMERIC DEFAULT 0,
  method TEXT,
  status TEXT DEFAULT 'success',
  "transactionRef" TEXT,
  timestamp TEXT,
  purpose TEXT,
  stream TEXT
);

-- 9. Enable Row Level Security (RLS) policies for anonymous public access in demo mode:
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON members FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON members FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON members FOR DELETE USING (true);

-- Repeat RLS for other tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON bookings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON bookings FOR DELETE USING (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON products FOR DELETE USING (true);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON orders FOR DELETE USING (true);

ALTER TABLE tabs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON tabs FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON tabs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON tabs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON tabs FOR DELETE USING (true);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON invoices FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON invoices FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON invoices FOR DELETE USING (true);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON payments FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON payments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON payments FOR DELETE USING (true);
`;
  }
};
