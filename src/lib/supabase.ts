import { createClient } from '@supabase/supabase-js';
import { Member, Booking, Product, Order, Tab, Invoice, Payment, AuditLog } from '../types';

const SUPABASE_PROJECT_ID = 'sjmmxfprhhmxmdlcogzz';
const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_ANON_KEY = 'sb_publishable_ypX07-xcXDqYEVZyQvMy8g_0qmq-1V-';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Robust Supabase persistence helpers.
 * Fully typed with error-safety (falls back to local memory if Supabase tables are not yet fully provisioned).
 */

const TABLE_COLUMNS: Record<string, string[]> = {
  members: [
    'id', 'fullName', 'phone', 'email', 'avatar', 'tier', 'status', 'expiryDate', 
    'walletBalance', 'activeTabBalance', 'emergencyContact', 'notes', 'joinDate', 
    'memberNumber', 'attendanceLog', 'reminderLog', 'dateOfBirth', 'gender', 
    'preferredSports', 'guardian', 'frozenDate', 'frozenDaysCount', 'guestPassesUsed'
  ],
  bookings: [
    'id', 'courtId', 'memberId', 'guestName', 'guestPhone', 'guestEmail', 'tier', 
    'date', 'startTime', 'endTime', 'sport', 'bookingType', 'channel', 'totalPrice', 
    'discountApplied', 'priceBreakdown', 'status', 'isPaid', 'paymentMethod', 'notes', 
    'createdAt', 'cancelledAt', 'cancellationReason', 'lateCancelFee', 'refundAmount', 
    'qrCodeData', 'isRecurring', 'recurringGroupId'
  ],
  products: [
    'id', 'name', 'sku', 'brand', 'category', 'price', 'costPrice', 'stockQty', 
    'reservedQty', 'reorderLevel', 'isServiceItem', 'image', 'serviceOptions', 
    'sizeVariants', 'stringTensionRange'
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
        const item = { ...r };
        
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

      const { error } = await supabase.from(tableName).upsert(cleanRecords);
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
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) {
        console.warn(`Supabase fetch failed on table "${tableName}":`, error.message);
        return null;
      }
      
      // Parse JSON strings back to objects
      const parsedData = (data || []).map((row: any) => {
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
