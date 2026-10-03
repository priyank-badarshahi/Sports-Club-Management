import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase, createAuthClient, isSupabaseConfigured } from './supabase';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabaseConfigured: isSupabaseConfigured,
  });
});

// Signup Endpoint: Registers user with Supabase Auth and stores profile/member data in database
app.post('/api/auth/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      fullName,
      email,
      phone,
      password,
      dateOfBirth,
      dob,
      preferredSport,
      sport,
      plan,
      tier,
    } = req.body;

    const resolvedName = (fullName || name || '').trim();
    const resolvedEmail = (email || '').trim().toLowerCase();
    const resolvedPhone = (phone || '').trim();
    const resolvedPassword = password;
    const resolvedDob = dateOfBirth || dob || '2000-01-15';
    const resolvedSport = preferredSport || sport || 'Tennis';
    const rawPlan = String(plan || tier || 'Silver').toLowerCase();
    const resolvedPlan = rawPlan === 'gold' ? 'Gold' : rawPlan === 'junior' ? 'Junior' : 'Silver';

    // Validate inputs
    if (!resolvedName || !resolvedEmail || !resolvedPhone || !resolvedPassword) {
      res.status(400).json({
        success: false,
        error: 'Name, email, phone, and password are required fields.',
      });
      return;
    }

    const cleanEmail = resolvedEmail;
    const cleanPhone = resolvedPhone;
    const todayStr = new Date().toISOString().split('T')[0];
    const expiryDateObj = new Date();
    expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 1);
    const expiryStr = expiryDateObj.toISOString().split('T')[0];

    const discountRate = resolvedPlan === 'Gold' ? 0.20 : resolvedPlan === 'Junior' ? 0.15 : 0.10;
    const initialSpent = resolvedPlan === 'Gold' ? 45000 : resolvedPlan === 'Silver' ? 28000 : 22000;

    // If Supabase is configured with valid credentials
    if (isSupabaseConfigured) {
      let userId: string | undefined;

      // 1. Create user in Supabase Auth (prefer admin.createUser to auto-confirm & bypass rate limits)
      try {
        const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
          email: cleanEmail,
          password: String(password),
          email_confirm: true,
          user_metadata: {
            name: resolvedName,
            phone: cleanPhone,
            dateOfBirth: resolvedDob,
            preferredSport: resolvedSport,
            role: 'member',
          },
        });

        if (adminError) {
          // If already exists or error, handle cleanly
          console.error('❌ Supabase Auth admin.createUser error:', adminError);
          res.status(400).json({
            success: false,
            error: adminError.message || 'Error creating auth account.',
          });
          return;
        }

        if (adminData?.user) {
          userId = adminData.user.id;
        }
      } catch (authException: any) {
        console.error('❌ Supabase Auth Exception:', authException);
        res.status(400).json({
          success: false,
          error: authException?.message || 'Authentication service error.',
        });
        return;
      }

      if (!userId) {
        res.status(500).json({
          success: false,
          error: 'Failed to obtain user identity from Supabase Auth.',
        });
        return;
      }

      // 2. Generate unique Member ID by finding the highest existing MXXX across members & profiles
      const { data: existingMembers } = await supabase
        .from('members')
        .select('member_id');

      const { data: existingProfiles } = await supabase
        .from('profiles')
        .select('member_id');

      let maxNum = 0;
      const allIds = [
        ...(existingMembers || []).map((m: any) => m.member_id),
        ...(existingProfiles || []).map((p: any) => p.member_id),
      ];

      for (const mid of allIds) {
        if (mid) {
          const match = String(mid).match(/M(\d+)/i);
          if (match) {
            const val = parseInt(match[1], 10);
            if (val > maxNum) maxNum = val;
          }
        }
      }

      const nextNum = maxNum + 1;
      const memberId = `M${String(nextNum).padStart(3, '0')}`;

      // 3. Upsert into 'profiles' table (satisfies foreign key constraint for members)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: resolvedName,
          email: cleanEmail,
          role: 'member',
          phone: cleanPhone,
          member_id: memberId,
          membership_plan: resolvedPlan,
        });

      if (profileError) {
        console.error('❌ Supabase profiles table upsert error:', profileError);
        res.status(500).json({
          success: false,
          error: `Could not save member profile: ${profileError.message}`,
        });
        return;
      }

      // 4. Insert into 'members' table
      const memberPayload = {
        member_id: memberId,
        user_id: userId,
        name: resolvedName,
        email: cleanEmail,
        phone: cleanPhone,
        date_of_birth: resolvedDob,
        plan: resolvedPlan,
        start_date: todayStr,
        expiry_date: expiryStr,
        status: 'active',
        discount_rate: discountRate,
        total_bookings: 0,
        total_spent: initialSpent,
      };

      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .insert(memberPayload)
        .select()
        .single();

      if (memberError) {
        console.error('❌ Supabase members table insert error:', memberError);
        res.status(500).json({
          success: false,
          error: `Could not save member record: ${memberError.message}`,
        });
        return;
      }

      console.log(`✅ [Supabase] User registered successfully: ${cleanEmail} (${memberId})`);

      res.status(201).json({
        success: true,
        message: 'Account registered and saved in Supabase database!',
        user: {
          id: userId,
          name: resolvedName,
          email: cleanEmail,
          phone: cleanPhone,
          role: 'member',
          memberId,
          membershipPlan: resolvedPlan,
        },
        member: memberData,
      });
      return;
    }

    // Fallback mode if Supabase keys are not yet provided in .env
    const fallbackMemberId = `M${String(Math.floor(Math.random() * 900) + 100)}`;
    console.log(`ℹ️ [Mock Mode] User signup recorded locally: ${cleanEmail}`);

    res.status(201).json({
      success: true,
      notice: 'Supabase credentials not configured in .env yet. Mock member profile generated.',
      user: {
        id: `usr_${Date.now()}`,
        name: resolvedName,
        email: cleanEmail,
        phone: cleanPhone,
        role: 'member',
        memberId: fallbackMemberId,
        membershipPlan: resolvedPlan,
      },
      member: {
        id: `mem_${Date.now()}`,
        memberId: fallbackMemberId,
        name: resolvedName,
        email: cleanEmail,
        phone: cleanPhone,
        plan: resolvedPlan,
        dateOfBirth: resolvedDob,
        startDate: todayStr,
        expiryDate: expiryStr,
        status: 'active',
        discountRate,
        totalBookings: 0,
        totalSpent: initialSpent,
      },
    });

  } catch (err: any) {
    console.error('❌ Server error during signup:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Internal server error processing signup.',
    });
  }
});

// Staff verification map requiring valid password for each staff account
export const DEMO_STAFF_MAP: Record<string, { role: string; name: string; password?: string; memberId?: string; phone?: string }> = {
  'priyank@gmail.com': { role: 'front_desk', name: 'Priyank Patel', password: 'priyank', memberId: 'FD001', phone: '+91 98765 22222' },
  'jack@gmail.com': { role: 'owner', name: 'Jack Jackson', password: 'jackson', memberId: 'ADM001', phone: '+91 98765 00001' },
  'owner@championsclub.demo': { role: 'owner', name: 'Vikramaditya Singhania', password: 'password', memberId: 'ADM001' },
  'rajesh.owner@championsclub.in': { role: 'owner', name: 'Rajesh Singhania', password: 'password', memberId: 'ADM001' },
  'frontdesk@championsclub.demo': { role: 'front_desk', name: 'Ananya Sharma', password: 'password', memberId: 'FD002' },
  'priya.desk@championsclub.in': { role: 'front_desk', name: 'Priya Sharma', password: 'password', memberId: 'FD003' },
  'shop@championsclub.demo': { role: 'shop_staff', name: 'Karan Mehra', password: 'password', memberId: 'SH001' },
  'ananya.shop@championsclub.in': { role: 'shop_staff', name: 'Ananya Sen', password: 'password', memberId: 'SH002' },
  'bar@championsclub.demo': { role: 'bar_staff', name: 'Chef Amit Roy', password: 'password', memberId: 'BR001' },
  'rohan.bar@championsclub.in': { role: 'bar_staff', name: 'Rohan Das', password: 'password', memberId: 'BR002' },
  'manager@championsclub.demo': { role: 'manager', name: 'Sanjay Verma', password: 'password', memberId: 'MGR001' },
  'arjun.manager@championsclub.in': { role: 'manager', name: 'Arjun Rao', password: 'password', memberId: 'MGR002' },
};

// Login Endpoint: Authenticates user credentials via Supabase Auth and fetches profile from DB
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Please provide both email/member ID and password.',
      });
      return;
    }

    const cleanIdentifier = String(email).trim().toLowerCase();

    if (isSupabaseConfigured) {
      let targetEmail = cleanIdentifier;

      // If the user provided a Member ID (e.g. M001), look up their email in the 'members' table
      if (cleanIdentifier.startsWith('m') && !cleanIdentifier.includes('@')) {
        const { data: memberByCode } = await supabase
          .from('members')
          .select('email')
          .ilike('member_id', cleanIdentifier)
          .maybeSingle();

        if (memberByCode?.email) {
          targetEmail = memberByCode.email;
        }
      }

      // 1. Authenticate credentials with an isolated auth client (prevents polluting backend server session)
      const authClient = createAuthClient();
      const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
        email: targetEmail,
        password: String(password),
      });

      if (!authError && authData.user) {
        const userId = authData.user.id;

        // 2. Query user profile from database 'profiles' table using admin client
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        // 3. Query member details from 'members' table using admin client
        const { data: member } = await supabase
          .from('members')
          .select('*')
          .or(`user_id.eq.${userId},email.eq.${targetEmail}`)
          .maybeSingle();

        const rawRole = String(profile?.role || authData.user.user_metadata?.role || 'member').toLowerCase();
        const role =
          rawRole === 'owner' ? 'owner' :
          rawRole.includes('front') ? 'front_desk' :
          rawRole.includes('bar') ? 'bar_staff' :
          rawRole.includes('shop') ? 'shop_staff' :
          rawRole.includes('manager') ? 'manager' :
          'member';

        const name = profile?.name || member?.name || authData.user.user_metadata?.name || targetEmail.split('@')[0];
        const memberId = role === 'member' ? (profile?.member_id || member?.member_id || 'M001') : (profile?.member_id || 'STF001');
        const membershipPlan = role === 'member' ? (profile?.membership_plan || member?.plan || 'Silver') : undefined;
        const phone = profile?.phone || member?.phone || '';

        console.log(`✅ [Supabase Auth] User authenticated successfully: ${targetEmail} (${role})`);

        res.json({
          success: true,
          message: 'Login successful',
          user: {
            id: userId,
            name,
            email: targetEmail,
            role,
            memberId,
            membershipPlan,
            phone,
          },
          session: authData.session,
        });
        return;
      }

      if (DEMO_STAFF_MAP[cleanIdentifier]) {
        const staff = DEMO_STAFF_MAP[cleanIdentifier];
        if (staff.password && String(password) !== staff.password) {
          console.warn(`⚠️ [Staff Login] Incorrect password entered for staff: ${cleanIdentifier}`);
          res.status(401).json({
            success: false,
            error: 'Invalid password. Please verify your staff credentials.',
          });
          return;
        }

        console.log(`ℹ️ [Staff Login] Authenticated staff role: ${staff.role} (${staff.name})`);
        res.json({
          success: true,
          message: 'Staff login verified',
          user: {
            id: `usr_${staff.role}`,
            name: staff.name,
            email: cleanIdentifier,
            role: staff.role,
            memberId: staff.memberId || 'STF001',
            membershipPlan: undefined,
            phone: staff.phone || '+91 98765 22222',
          },
        });
        return;
      }

      console.warn(`⚠️ [Supabase Auth] Failed login for ${targetEmail}:`, authError?.message);
      res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please verify your email/member ID and password.',
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: 'Database authentication is not configured in .env',
    });
  } catch (err: any) {
    console.error('❌ Server error during login:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Internal server error processing login.',
    });
  }
});

// Helper to map DB row to frontend Member interface
function formatMemberForClient(m: any) {
  const tierRaw = String(m.plan || 'Silver').toLowerCase();
  const tier = tierRaw === 'gold' ? 'gold' : tierRaw === 'junior' ? 'junior' : 'silver';
  let emergencyContact = { name: 'Emergency Contact', phone: m.phone || '', relation: 'Family' };
  if (typeof m.emergency_contact === 'string') {
    try {
      emergencyContact = JSON.parse(m.emergency_contact);
    } catch (e) {}
  } else if (typeof m.emergency_contact === 'object' && m.emergency_contact !== null) {
    emergencyContact = m.emergency_contact;
  }

  return {
    id: m.member_id || m.id,
    dbId: m.id,
    memberNumber: `CC-2026-${m.member_id || 'M001'}`,
    fullName: m.name || 'Club Member',
    dateOfBirth: m.date_of_birth || '2000-01-01',
    email: m.email || '',
    phone: m.phone || '',
    avatar: m.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    tier,
    status: m.status || 'active',
    joinDate: m.start_date || m.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    expiryDate: m.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    walletBalance: typeof m.total_spent === 'number' ? Math.round(m.total_spent / 10) : 2500,
    activeTabBalance: 0,
    emergencyContact,
    preferredSports: ['tennis'],
    attendanceLog: [],
    reminderLog: [],
    notes: `Database record for member ID ${m.member_id}`,
  };
}

// Fetch all registered members from Supabase
app.get('/api/members', async (req: Request, res: Response) => {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const formattedMembers = (data || []).map(formatMemberForClient);
      res.json({ success: true, members: formattedMembers, rawMembers: data });
      return;
    }

    res.json({ success: true, members: [], notice: 'Supabase not configured' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create/Insert a member directly into Supabase members table (used by admin registration modal)
app.post('/api/members', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      name,
      email,
      phone,
      tier,
      plan,
      dateOfBirth,
      startDate,
      expiryDate,
      emergencyContact,
      avatar,
    } = req.body;

    const resolvedName = (fullName || name || '').trim();
    const resolvedEmail = (email || '').trim().toLowerCase();
    const resolvedPhone = (phone || '').trim();
    const rawPlan = String(plan || tier || 'Silver').toLowerCase();
    const resolvedPlan = rawPlan === 'gold' ? 'Gold' : rawPlan === 'junior' ? 'Junior' : 'Silver';

    if (!resolvedName || !resolvedEmail) {
      res.status(400).json({ success: false, error: 'Name and email are required.' });
      return;
    }

    if (isSupabaseConfigured) {
      // Find max member_id
      const { data: existingMembers } = await supabase.from('members').select('member_id');
      let maxNum = 0;
      for (const m of existingMembers || []) {
        if (m.member_id) {
          const match = String(m.member_id).match(/M(\d+)/i);
          if (match) {
            const val = parseInt(match[1], 10);
            if (val > maxNum) maxNum = val;
          }
        }
      }
      const memberId = `M${String(maxNum + 1).padStart(3, '0')}`;
      const todayStr = startDate || new Date().toISOString().split('T')[0];
      const expiryStr = expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const memberPayload = {
        member_id: memberId,
        name: resolvedName,
        email: resolvedEmail,
        phone: resolvedPhone,
        avatar_url: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
        date_of_birth: dateOfBirth || '2000-01-01',
        plan: resolvedPlan,
        start_date: todayStr,
        expiry_date: expiryStr,
        status: 'active',
        discount_rate: resolvedPlan === 'Gold' ? 0.20 : resolvedPlan === 'Junior' ? 0.15 : 0.10,
        total_bookings: 0,
        total_spent: resolvedPlan === 'Gold' ? 45000 : 28000,
        emergency_contact: emergencyContact ? (typeof emergencyContact === 'string' ? emergencyContact : JSON.stringify(emergencyContact)) : null,
      };

      const { data: inserted, error: insertError } = await supabase
        .from('members')
        .insert(memberPayload)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Supabase members insert error:', insertError);
        res.status(500).json({ success: false, error: insertError.message });
        return;
      }

      console.log(`✅ [Supabase] New member created in database: ${resolvedEmail} (${memberId})`);
      res.status(201).json({
        success: true,
        member: formatMemberForClient(inserted),
        rawMember: inserted,
      });
      return;
    }

    res.status(500).json({ success: false, error: 'Database not configured' });
  } catch (err: any) {
    console.error('❌ Error creating member:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper to format DB employee record for client HR page
function formatEmployeeForClient(emp: any, profile?: any): any {
  const roleRaw = String(emp.role || profile?.role || 'front_desk').toLowerCase();
  let role = 'front_desk';
  if (roleRaw.includes('bar')) role = 'bar_staff';
  else if (roleRaw.includes('shop')) role = 'shop_staff';
  else if (roleRaw.includes('manager')) role = 'manager';
  else if (roleRaw.includes('coach')) role = 'coach';
  else role = 'front_desk';

  let department = 'Front Office';
  if (role === 'bar_staff') department = 'Food & Beverage';
  else if (role === 'shop_staff') department = 'Pro Shop & Retail';
  else if (role === 'manager') department = 'Management';
  else if (role === 'coach') department = 'Sports & Coaching';

  const monthlySalary = emp.hourly_wage ? emp.hourly_wage * 160 : 38000;
  const codePrefix = role === 'front_desk' ? 'FD' : role === 'bar_staff' ? 'BR' : role === 'shop_staff' ? 'SH' : 'MGR';
  const empId = profile?.member_id || `${codePrefix}${Math.floor(100 + Math.random() * 900)}`;

  return {
    id: emp.id || profile?.id || `emp_${Date.now()}`,
    empId,
    name: emp.name || profile?.name || 'Staff Member',
    role,
    department,
    phone: emp.phone || profile?.phone || '+91 98765 00000',
    email: emp.email || profile?.email || '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    monthlySalary,
    salaryStructure: {
      baseSalary: monthlySalary,
      hraAllowance: Math.round(monthlySalary * 0.2),
      transportAllowance: 3000,
      specialAllowance: Math.round(monthlySalary * 0.1),
      pfEligible: true,
      taxDeductionPercent: 5,
      bankAccount: 'HDFC-502000' + Math.floor(1000 + Math.random() * 9000),
      ifscCode: 'HDFC0000428',
    },
    documents: [],
    shiftPreference: { preferredShift: 'morning', maxWeeklyHours: 44, preferredOffDays: ['Sunday'] },
    leaveBalances: { casual: 12, sick: 10, annual: 15, emergency: 5, usedCasual: 0, usedSick: 0, usedAnnual: 0, usedEmergency: 0 },
    emergencyContact: { name: 'Emergency Family', relation: 'Family', phone: emp.phone || profile?.phone || '+91 98765 00000' },
    status: emp.status || 'active',
    joinDate: emp.created_at ? emp.created_at.split('T')[0] : '2026-01-15',
  };
}

// Fetch all staff employees from Supabase database
app.get('/api/employees', async (req: Request, res: Response) => {
  try {
    if (isSupabaseConfigured) {
      // 1. Fetch from Supabase employees table
      const { data: dbEmployees, error: empErr } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Fetch non-member staff from profiles table
      const { data: staffProfiles, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'member');

      const employeesMap = new Map<string, any>();

      // Populate from employees table
      (dbEmployees || []).forEach((emp: any) => {
        const formatted = formatEmployeeForClient(emp);
        if (emp.email) employeesMap.set(emp.email.toLowerCase(), formatted);
        else employeesMap.set(emp.id, formatted);
      });

      // Populate from profiles table
      (staffProfiles || []).forEach((prof: any) => {
        const email = prof.email?.toLowerCase();
        if (email && !employeesMap.has(email)) {
          employeesMap.set(email, formatEmployeeForClient({
            id: prof.id,
            name: prof.name,
            role: prof.role === 'frontdesk' ? 'Front Desk' : prof.role === 'bar' ? 'Bar Staff' : prof.role === 'shop' ? 'Shop Staff' : 'Manager',
            department: prof.role === 'frontdesk' ? 'Front Desk' : prof.role === 'bar' ? 'Cafeteria & Bar' : prof.role === 'shop' ? 'Sports Shop' : 'Operations & Maintenance',
            phone: prof.phone,
            email: prof.email,
            status: 'active',
            hourly_wage: 235,
          }, prof));
        }
      });

      // Populate from active DEMO_STAFF_MAP
      Object.entries(DEMO_STAFF_MAP).forEach(([email, staff]) => {
        const lowerEmail = email.toLowerCase();
        if (!employeesMap.has(lowerEmail)) {
          employeesMap.set(lowerEmail, {
            id: `usr_${staff.role}_${lowerEmail.replace(/[^a-z0-9]/g, '')}`,
            empId: staff.memberId || 'STF100',
            name: staff.name,
            role: staff.role as any,
            department: staff.role === 'front_desk' ? 'Front Office' : staff.role === 'bar_staff' ? 'Food & Beverage' : staff.role === 'shop_staff' ? 'Pro Shop & Retail' : 'Management',
            phone: staff.phone || '+91 98765 22222',
            email: lowerEmail,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
            monthlySalary: 38000,
            salaryStructure: {
              baseSalary: 38000,
              hraAllowance: 7600,
              transportAllowance: 3000,
              specialAllowance: 3800,
              pfEligible: true,
              taxDeductionPercent: 5,
              bankAccount: 'HDFC-502000' + Math.floor(1000 + Math.random() * 9000),
              ifscCode: 'HDFC0000428',
            },
            documents: [],
            shiftPreference: { preferredShift: 'morning', maxWeeklyHours: 44, preferredOffDays: ['Sunday'] },
            leaveBalances: { casual: 12, sick: 10, annual: 15, emergency: 5, usedCasual: 0, usedSick: 0, usedAnnual: 0, usedEmergency: 0 },
            emergencyContact: { name: 'Emergency Family', relation: 'Family', phone: staff.phone || '+91 98765 22222' },
            status: 'active',
            joinDate: '2026-01-15',
          });
        }
      });

      const employeesList = Array.from(employeesMap.values());
      res.json({
        success: true,
        employees: employeesList,
        count: employeesList.length,
      });
      return;
    }

    res.json({ success: true, employees: [] });
  } catch (err: any) {
    console.error('❌ Error fetching employees:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create/Enroll a Staff Member: creates user in Supabase Auth, profiles table, employees table, and DEMO_STAFF_MAP
app.post('/api/employees', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone, department, monthlySalary } = req.body;

    const resolvedName = (name || '').trim();
    const resolvedEmail = (email || '').trim().toLowerCase();
    const resolvedPhone = (phone || '').trim();
    const resolvedPassword = password;
    const rawRole = String(role || 'front_desk').toLowerCase();

    // Standardize role to one of the 4 supported staff roles
    let standardRole = 'front_desk';
    let dbRoleEnum = 'frontdesk';
    if (rawRole.includes('bar')) {
      standardRole = 'bar_staff';
      dbRoleEnum = 'bar';
    } else if (rawRole.includes('shop')) {
      standardRole = 'shop_staff';
      dbRoleEnum = 'shop';
    } else if (rawRole.includes('manager')) {
      standardRole = 'manager';
      dbRoleEnum = 'manager';
    } else {
      standardRole = 'front_desk';
      dbRoleEnum = 'frontdesk';
    }

    if (!resolvedName || !resolvedEmail || !resolvedPassword) {
      res.status(400).json({
        success: false,
        error: 'Staff name, email, and password are required fields.',
      });
      return;
    }

    if (String(resolvedPassword).length < 6) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.',
      });
      return;
    }

    let userId: string | undefined;

    if (isSupabaseConfigured) {
      // 1. Create or update user in Supabase Auth
      try {
        const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
          email: resolvedEmail,
          password: String(resolvedPassword),
          email_confirm: true,
          user_metadata: {
            name: resolvedName,
            phone: resolvedPhone,
            role: standardRole,
          },
        });

        if (adminError) {
          if (adminError.message?.toLowerCase().includes('already')) {
            const { data: usersData } = await supabase.auth.admin.listUsers();
            const existing = usersData?.users.find((u) => u.email?.toLowerCase() === resolvedEmail);
            if (existing) {
              await supabase.auth.admin.updateUserById(existing.id, {
                password: String(resolvedPassword),
                user_metadata: { name: resolvedName, phone: resolvedPhone, role: standardRole },
              });
              userId = existing.id;
            }
          } else {
            console.error('❌ Supabase Auth create staff error:', adminError);
            res.status(400).json({ success: false, error: adminError.message });
            return;
          }
        } else if (adminData?.user) {
          userId = adminData.user.id;
        }
      } catch (authEx: any) {
        console.error('❌ Supabase Auth staff exception:', authEx);
      }

      // Generate staff code based on role
      const prefix = standardRole === 'front_desk' ? 'FD' : standardRole === 'bar_staff' ? 'BR' : standardRole === 'shop_staff' ? 'SH' : 'MGR';
      const staffCode = `${prefix}${Math.floor(100 + Math.random() * 900)}`;

      // 2. Upsert into public.profiles table
      if (userId) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            name: resolvedName,
            email: resolvedEmail,
            role: dbRoleEnum,
            phone: resolvedPhone,
            member_id: staffCode,
            membership_plan: 'Gold',
          });

        if (profileError) {
          console.warn('⚠️ Supabase staff profile upsert warning:', profileError.message);
        }

        // 3. Upsert into public.employees table in Supabase
        try {
          const empRoleEnum = standardRole === 'front_desk' ? 'Front Desk'
                            : standardRole === 'bar_staff' ? 'Bar Staff'
                            : standardRole === 'shop_staff' ? 'Shop Staff'
                            : 'Manager';
          const empDeptEnum = standardRole === 'front_desk' ? 'Front Desk'
                            : standardRole === 'bar_staff' ? 'Cafeteria & Bar'
                            : standardRole === 'shop_staff' ? 'Sports Shop'
                            : 'Operations & Maintenance';

          const initials = resolvedName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';
          const wage = Math.round((monthlySalary || 38000) / 160);

          await supabase.from('employees').upsert({
            id: userId,
            name: resolvedName,
            role: empRoleEnum,
            department: empDeptEnum,
            phone: resolvedPhone,
            email: resolvedEmail,
            shift: 'Morning (06:00 - 14:00)',
            status: 'active',
            avatar_initials: initials,
            hourly_wage: wage,
          });
          console.log(`✅ [Supabase employees table] Saved employee ${resolvedName} (${empRoleEnum})`);
        } catch (dbEmpErr) {
          console.warn('⚠️ Supabase employees table sync note:', dbEmpErr);
        }
      }
    }

    // Always update DEMO_STAFF_MAP in-memory so staff can immediately log in
    const staffCode = `STF${Math.floor(100 + Math.random() * 900)}`;
    DEMO_STAFF_MAP[resolvedEmail] = {
      role: standardRole,
      name: resolvedName,
      password: String(resolvedPassword),
      memberId: staffCode,
      phone: resolvedPhone,
    };

    console.log(`✅ [Staff Created] Enrolled staff: ${resolvedEmail} (${standardRole})`);

    res.status(201).json({
      success: true,
      message: `Staff member enrolled successfully as ${standardRole.replace('_', ' ').toUpperCase()}`,
      staff: {
        id: userId || `usr_${Date.now()}`,
        name: resolvedName,
        email: resolvedEmail,
        role: standardRole,
        phone: resolvedPhone,
        department: department || (standardRole === 'front_desk' ? 'Front Office' : standardRole === 'bar_staff' ? 'Food & Beverage' : standardRole === 'shop_staff' ? 'Pro Shop & Retail' : 'Management'),
        monthlySalary: monthlySalary || 35000,
        memberId: staffCode,
      },
    });
  } catch (err: any) {
    console.error('❌ Error creating employee:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Sports Club Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Supabase connection status: ${isSupabaseConfigured ? '🟢 Connected' : '🟡 Awaiting credentials in .env'}`);
});
