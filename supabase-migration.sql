-- =========================================================================
-- CHAMPIONS CLUB - COMPREHENSIVE SUPABASE SQL SCHEMA MIGRATION SCRIPT
-- Generated: 2026-10-03
-- Target Backend: Supabase PostgreSQL (Project ID: sjmmxfprhhmxmdlcogzz)
-- Includes: All 18 application tables mapped to all front-end workflows
-- =========================================================================

-- 1. EXTENSIONS SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DROP TABLES IF EXIST (Ordered cleanly to handle reference constraints)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS payroll;
DROP TABLE IF EXISTS leaves;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS swap_requests;
DROP TABLE IF EXISTS shifts;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS credit_notes;
DROP TABLE IF EXISTS business_clients;
DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS tabs;
DROP TABLE IF EXISTS tables;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS social_sessions;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS settings;

-- -------------------------------------------------------------------------
-- TABLE: settings
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  "dailyBookingCap" INTEGER DEFAULT 2,
  "bookingCancellationWindowHours" INTEGER DEFAULT 4,
  "defaultGstPercent" NUMERIC DEFAULT 18,
  "gracePeriodDays" INTEGER DEFAULT 7,
  "happyHourDiscountPct" NUMERIC DEFAULT 20,
  "happyHourStart" TEXT DEFAULT '17:00',
  "happyHourEnd" TEXT DEFAULT '20:00',
  "stripeEnabled" BOOLEAN DEFAULT true,
  "upiEnabled" BOOLEAN DEFAULT true,
  "walletAutoRefundEnabled" BOOLEAN DEFAULT true,
  "clubEmail" TEXT DEFAULT 'info@championsclub.in',
  "clubPhone" TEXT DEFAULT '+91 98765 43210'
);

-- -------------------------------------------------------------------------
-- TABLE: members
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  avatar TEXT,
  tier TEXT DEFAULT 'walk_in', -- 'gold' | 'silver' | 'junior' | 'walk_in'
  status TEXT DEFAULT 'active', -- 'active' | 'expiring' | 'expired' | 'frozen' | 'cancelled'
  "expiryDate" TEXT,
  "walletBalance" NUMERIC DEFAULT 0,
  "activeTabBalance" NUMERIC DEFAULT 0,
  "emergencyContact" JSONB DEFAULT '{"name": "", "phone": "", "relation": ""}'::jsonb,
  notes TEXT,
  "joinDate" TEXT,
  "memberNumber" TEXT,
  "attendanceLog" JSONB DEFAULT '[]'::jsonb,
  "reminderLog" JSONB DEFAULT '[]'::jsonb
);

-- -------------------------------------------------------------------------
-- TABLE: bookings
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  "courtId" TEXT NOT NULL,
  "memberId" TEXT REFERENCES members(id) ON DELETE SET NULL,
  "guestName" TEXT,
  "guestPhone" TEXT,
  "guestEmail" TEXT,
  tier TEXT,
  date TEXT NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  sport TEXT, -- 'tennis' | 'padel' | 'badminton' | 'cricket'
  "bookingType" TEXT DEFAULT 'regular', -- 'regular' | 'maintenance' | 'coaching' | 'tournament'
  channel TEXT DEFAULT 'online', -- 'online' | 'front_desk'
  "totalPrice" NUMERIC DEFAULT 0,
  "discountApplied" NUMERIC DEFAULT 0,
  "priceBreakdown" JSONB,
  status TEXT DEFAULT 'confirmed', -- 'confirmed' | 'checked_in' | 'no_show' | 'cancelled'
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

-- -------------------------------------------------------------------------
-- TABLE: social_sessions
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  sport TEXT NOT NULL,
  "courtIds" JSONB DEFAULT '[]'::jsonb,
  date TEXT NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "maxParticipants" INTEGER DEFAULT 12,
  "currentParticipants" JSONB DEFAULT '[]'::jsonb,
  "participantDetails" JSONB DEFAULT '[]'::jsonb,
  waitlist JSONB DEFAULT '[]'::jsonb,
  organizer TEXT,
  level TEXT,
  fee JSONB
);

-- -------------------------------------------------------------------------
-- TABLE: products
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  brand TEXT,
  category TEXT, -- 'racquets' | 'balls' | 'apparel' | 'strings' | 'grips' | 'footwear' | 'accessories' | 'services'
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

-- -------------------------------------------------------------------------
-- TABLE: stock_movements
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  "productId" TEXT REFERENCES products(id) ON DELETE CASCADE,
  "productName" TEXT,
  change INTEGER NOT NULL,
  type TEXT, -- 'sale' | 'restock' | 'adjustment' | 'po_receipt'
  notes TEXT,
  "performedBy" TEXT,
  timestamp TEXT,
  "referenceId" TEXT
);

-- -------------------------------------------------------------------------
-- TABLE: orders
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  "orderNumber" TEXT UNIQUE NOT NULL,
  "memberId" TEXT REFERENCES members(id) ON DELETE SET NULL,
  "customerName" TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  "totalAmount" NUMERIC DEFAULT 0,
  "discountAmount" NUMERIC DEFAULT 0,
  "gstAmount" NUMERIC DEFAULT 0,
  "isPaid" BOOLEAN DEFAULT false,
  "paymentMethod" TEXT,
  status TEXT DEFAULT 'placed', -- 'placed' | 'confirmed' | 'packed' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'cancelled' | 'returned'
  "trackingEvents" JSONB DEFAULT '[]'::jsonb,
  "createdAt" TEXT,
  "updatedAt" TEXT,
  "serviceConfig" JSONB
);

-- -------------------------------------------------------------------------
-- TABLE: menu_items
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  "happyHourPrice" NUMERIC,
  category TEXT NOT NULL, -- 'beverages' | 'protein_shakes' | 'bar_craft' | 'snacks' | 'mains'
  station TEXT, -- 'kitchen' | 'bar'
  "isAvailable" BOOLEAN DEFAULT true,
  image TEXT,
  tags JSONB DEFAULT '[]'::jsonb
);

-- -------------------------------------------------------------------------
-- TABLE: tables
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tables (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER DEFAULT 4,
  status TEXT DEFAULT 'available', -- 'available' | 'occupied' | 'reserved'
  "activeTabId" TEXT,
  "assignedServerName" TEXT,
  "mergedWithTableIds" JSONB
);

-- -------------------------------------------------------------------------
-- TABLE: tabs
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tabs (
  id TEXT PRIMARY KEY,
  "tabNumber" TEXT UNIQUE NOT NULL,
  "memberId" TEXT REFERENCES members(id) ON DELETE SET NULL,
  "customerName" TEXT NOT NULL,
  tier TEXT,
  "tableId" TEXT REFERENCES tables(id) ON DELETE SET NULL,
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
  status TEXT DEFAULT 'open', -- 'open' | 'bill_requested' | 'settled'
  "openedAt" TEXT,
  "closedAt" TEXT,
  "settledVia" TEXT,
  "serverName" TEXT,
  "splitDetails" JSONB
);

-- -------------------------------------------------------------------------
-- TABLE: invoices
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  "invoiceNumber" TEXT UNIQUE NOT NULL,
  "memberId" TEXT REFERENCES members(id) ON DELETE SET NULL,
  "recipientName" TEXT NOT NULL,
  "recipientEmail" TEXT,
  "recipientPhone" TEXT,
  "recipientGst" TEXT,
  category TEXT DEFAULT 'court_rental', -- 'court_rental' | 'pro_shop' | 'bar_cafe' | 'membership' | 'corporate_sla'
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC DEFAULT 0,
  "gstRate" NUMERIC DEFAULT 0.18,
  "gstAmount" NUMERIC DEFAULT 0,
  "totalAmount" NUMERIC DEFAULT 0,
  "paidAmount" NUMERIC DEFAULT 0,
  "balanceAmount" NUMERIC DEFAULT 0,
  "creditNoteAmount" NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'unpaid', -- 'paid' | 'unpaid' | 'partially_paid' | 'overdue' | 'voided' | 'refunded'
  "dueDate" TEXT,
  "paidAt" TEXT,
  "paymentMethod" TEXT,
  "createdAt" TEXT,
  stream TEXT,
  reminders JSONB DEFAULT '[]'::jsonb
);

-- -------------------------------------------------------------------------
-- TABLE: payments
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  "paymentNumber" TEXT UNIQUE NOT NULL,
  "invoiceId" TEXT REFERENCES invoices(id) ON DELETE SET NULL,
  "memberId" TEXT REFERENCES members(id) ON DELETE SET NULL,
  "payerName" TEXT,
  amount NUMERIC DEFAULT 0,
  method TEXT, -- 'cash' | 'card' | 'upi' | 'wallet' | 'ledger_adjustment'
  status TEXT DEFAULT 'success', -- 'success' | 'failed' | 'pending' | 'reversed'
  "transactionRef" TEXT,
  timestamp TEXT,
  purpose TEXT,
  stream TEXT
);

-- -------------------------------------------------------------------------
-- TABLE: credit_notes
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credit_notes (
  id TEXT PRIMARY KEY,
  "creditNoteNumber" TEXT UNIQUE NOT NULL,
  "invoiceId" TEXT REFERENCES invoices(id) ON DELETE SET NULL,
  "invoiceNumber" TEXT,
  "recipientName" TEXT,
  amount NUMERIC DEFAULT 0,
  reason TEXT,
  "issuedAt" TEXT,
  "issuedBy" TEXT
);

-- -------------------------------------------------------------------------
-- TABLE: leads
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  "referenceNumber" TEXT UNIQUE NOT NULL,
  "fullName" TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  "companyName" TEXT,
  interest TEXT, -- 'membership' | 'coaching' | 'trial' | 'corporate'
  "sportInterest" JSONB DEFAULT '[]'::jsonb,
  "interestedTier" TEXT,
  source TEXT, -- 'website_contact' | 'instagram' | 'referral' | 'phone' | 'corporate'
  status TEXT DEFAULT 'new', -- 'new' | 'contacted' | 'trial_booked' | 'quote_sent' | 'won' | 'lost'
  "assignedStaffName" TEXT,
  "estimatedValue" NUMERIC DEFAULT 0,
  notes TEXT,
  "followUpDate" TEXT,
  "createdAt" TEXT,
  "updatedAt" TEXT,
  "lostReason" TEXT,
  activities JSONB DEFAULT '[]'::jsonb,
  tasks JSONB DEFAULT '[]'::jsonb,
  "quoteIds" JSONB DEFAULT '[]'::jsonb,
  "convertedMemberId" TEXT
);

-- -------------------------------------------------------------------------
-- TABLE: quotes
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  "quoteNumber" TEXT UNIQUE NOT NULL,
  "leadId" TEXT REFERENCES leads(id) ON DELETE SET NULL,
  "clientName" TEXT NOT NULL,
  "clientEmail" TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC DEFAULT 0,
  "gstAmount" NUMERIC DEFAULT 0,
  "totalAmount" NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft', -- 'draft' | 'sent' | 'accepted' | 'declined' | 'expired'
  "validUntil" TEXT,
  "createdAt" TEXT,
  "notes" TEXT
);

-- -------------------------------------------------------------------------
-- TABLE: business_clients
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_clients (
  id TEXT PRIMARY KEY,
  "companyName" TEXT NOT NULL,
  "clientCode" TEXT UNIQUE NOT NULL,
  "contactPerson" TEXT,
  email TEXT,
  phone TEXT,
  "gstNumber" TEXT,
  "panNumber" TEXT,
  address TEXT,
  "creditTerms" TEXT DEFAULT 'net_30', -- 'net_15' | 'net_30' | 'net_60' | 'prepaid'
  "contractValue" NUMERIC DEFAULT 0,
  "packageType" TEXT,
  "allocatedPasses" INTEGER DEFAULT 0,
  "passesUsed" INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active' | 'suspended' | 'expired'
  "leadId" TEXT REFERENCES leads(id) ON DELETE SET NULL,
  "createdAt" TEXT,
  notes TEXT
);

-- -------------------------------------------------------------------------
-- TABLE: expenses
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  "expenseNumber" TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  vendor TEXT,
  category TEXT NOT NULL, -- 'utilities' | 'court_maintenance' | 'pro_shop_stock' | 'f_and_b_supplies' | 'staff_salaries' | 'marketing' | 'rent_tax'
  amount NUMERIC DEFAULT 0,
  "inputGstAmount" NUMERIC DEFAULT 0,
  "gstRate" NUMERIC DEFAULT 0,
  date TEXT NOT NULL,
  "dueDate" TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'paid'
  "paidAt" TEXT,
  "paymentMethod" TEXT,
  "approvedBy" TEXT,
  notes TEXT
);

-- -------------------------------------------------------------------------
-- TABLE: employees
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  "empId" TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL, -- 'Management' | 'Front Desk' | 'Sports & Coaching' | 'F&B Service' | 'Kitchen' | 'Facilities'
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active', -- 'active' | 'leave' | 'terminated'
  "salaryDetails" JSONB,
  "coachingProfile" JSONB,
  "bankAccount" TEXT,
  "leaveBalances" JSONB,
  "joinDate" TEXT,
  documents JSONB DEFAULT '[]'::jsonb
);

-- -------------------------------------------------------------------------
-- TABLE: shifts
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shifts (
  id TEXT PRIMARY KEY,
  "employeeId" TEXT REFERENCES employees(id) ON DELETE CASCADE,
  "employeeName" TEXT,
  role TEXT,
  department TEXT,
  date TEXT NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  station TEXT,
  status TEXT DEFAULT 'scheduled' -- 'scheduled' | 'clocked_in' | 'completed' | 'no_show' | 'swapped'
);

-- -------------------------------------------------------------------------
-- TABLE: swap_requests
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS swap_requests (
  id TEXT PRIMARY KEY,
  "shiftId" TEXT REFERENCES shifts(id) ON DELETE CASCADE,
  "requestingEmployeeId" TEXT REFERENCES employees(id) ON DELETE CASCADE,
  "requestingEmployeeName" TEXT,
  "targetEmployeeId" TEXT REFERENCES employees(id) ON DELETE CASCADE,
  "targetEmployeeName" TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  "decisionNote" TEXT,
  "createdAt" TEXT
);

-- -------------------------------------------------------------------------
-- TABLE: attendance
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  "employeeId" TEXT REFERENCES employees(id) ON DELETE CASCADE,
  "employeeName" TEXT,
  date TEXT NOT NULL,
  "clockIn" TEXT NOT NULL,
  "clockOut" TEXT,
  status TEXT DEFAULT 'on_time', -- 'on_time' | 'late' | 'excused' | 'absent'
  "durationHours" NUMERIC,
  notes TEXT
);

-- -------------------------------------------------------------------------
-- TABLE: leaves
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leaves (
  id TEXT PRIMARY KEY,
  "employeeId" TEXT REFERENCES employees(id) ON DELETE CASCADE,
  "employeeName" TEXT,
  type TEXT NOT NULL, -- 'casual' | 'sick' | 'annual' | 'unpaid' | 'emergency'
  "startDate" TEXT NOT NULL,
  "endDate" TEXT NOT NULL,
  "daysCount" INTEGER NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  "approvedBy" TEXT,
  "decisionComment" TEXT,
  "decidedAt" TEXT,
  "createdAt" TEXT
);

-- -------------------------------------------------------------------------
-- TABLE: payroll
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payroll (
  id TEXT PRIMARY KEY,
  "employeeId" TEXT REFERENCES employees(id) ON DELETE CASCADE,
  "employeeName" TEXT,
  "monthYear" TEXT NOT NULL, -- 'MM-YYYY'
  "baseSalary" NUMERIC DEFAULT 0,
  "variableBonus" NUMERIC DEFAULT 0,
  "deductionsUnpaidLeaves" NUMERIC DEFAULT 0,
  "deductionsTaxPpf" NUMERIC DEFAULT 0,
  "grossEarnings" NUMERIC DEFAULT 0,
  "totalDeductions" NUMERIC DEFAULT 0,
  "netPay" NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'calculated', -- 'calculated' | 'approved' | 'paid'
  "paidOn" TEXT,
  "paymentMethod" TEXT,
  "expenseIdPosted" TEXT
);

-- -------------------------------------------------------------------------
-- TABLE: notifications
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system', -- 'system' | 'booking' | 'payment' | 'lead'
  "targetRole" TEXT DEFAULT 'all', -- 'all' | 'front_desk' | 'manager' | 'owner' | 'bar_staff'
  timestamp TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  link TEXT
);

-- -------------------------------------------------------------------------
-- TABLE: audit_logs
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  "actorId" TEXT,
  "actorName" TEXT,
  "actorRole" TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  details TEXT,
  "ipAddress" TEXT
);


-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR ALL 25 TABLES
-- Enables public read/write permission schemas inside demo context
-- =========================================================================

DO $$
DECLARE
  tab RECORD;
BEGIN
  FOR tab IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tab.table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Allow select %I" ON %I;', tab.table_name, tab.table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Allow insert %I" ON %I;', tab.table_name, tab.table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Allow update %I" ON %I;', tab.table_name, tab.table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Allow delete %I" ON %I;', tab.table_name, tab.table_name);
    
    EXECUTE format('CREATE POLICY "Allow select %I" ON %I FOR SELECT USING (true);', tab.table_name, tab.table_name);
    EXECUTE format('CREATE POLICY "Allow insert %I" ON %I FOR INSERT WITH CHECK (true);', tab.table_name, tab.table_name);
    EXECUTE format('CREATE POLICY "Allow update %I" ON %I FOR UPDATE USING (true);', tab.table_name, tab.table_name);
    EXECUTE format('CREATE POLICY "Allow delete %I" ON %I FOR DELETE USING (true);', tab.table_name, tab.table_name);
  END LOOP;
END $$;
