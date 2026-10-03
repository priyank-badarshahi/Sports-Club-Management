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
      email,
      phone,
      password,
      dateOfBirth,
      preferredSport,
      plan = 'Silver',
    } = req.body;

    // Validate inputs
    if (!name || !email || !phone || !password) {
      res.status(400).json({
        success: false,
        error: 'Name, email, phone, and password are required fields.',
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const todayStr = new Date().toISOString().split('T')[0];
    const expiryDateObj = new Date();
    expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 1);
    const expiryStr = expiryDateObj.toISOString().split('T')[0];

    const discountRate = plan === 'Gold' ? 0.20 : plan === 'Junior' ? 0.15 : 0.10;
    const initialSpent = plan === 'Gold' ? 45000 : plan === 'Silver' ? 28000 : 22000;

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
            name,
            phone: cleanPhone,
            dateOfBirth: dateOfBirth || '2000-01-15',
            preferredSport: preferredSport || 'Tennis',
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
          name,
          email: cleanEmail,
          role: 'member',
          phone: cleanPhone,
          member_id: memberId,
          membership_plan: plan,
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
        name,
        email: cleanEmail,
        phone: cleanPhone,
        date_of_birth: dateOfBirth || '2000-01-15',
        plan,
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
          name,
          email: cleanEmail,
          phone: cleanPhone,
          role: 'member',
          memberId,
          membershipPlan: plan,
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
        name,
        email: cleanEmail,
        phone,
        role: 'member',
        memberId: fallbackMemberId,
        membershipPlan: plan,
      },
      member: {
        id: `mem_${Date.now()}`,
        memberId: fallbackMemberId,
        name,
        email: cleanEmail,
        phone,
        plan,
        dateOfBirth: dateOfBirth || '2000-01-01',
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

        const role = profile?.role || authData.user.user_metadata?.role || 'member';
        const name = profile?.name || member?.name || authData.user.user_metadata?.name || targetEmail.split('@')[0];
        const memberId = profile?.member_id || member?.member_id || 'M001';
        const membershipPlan = profile?.membership_plan || member?.plan || 'Silver';
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

      // If standard Supabase login failed, check staff demo fallback accounts for admin evaluation
      const DEMO_STAFF_MAP: Record<string, { role: string; name: string }> = {
        'owner@championsclub.demo': { role: 'owner', name: 'Vikramaditya Singhania' },
        'frontdesk@championsclub.demo': { role: 'frontdesk', name: 'Ananya Sharma' },
        'shop@championsclub.demo': { role: 'shop', name: 'Karan Mehra' },
        'bar@championsclub.demo': { role: 'bar', name: 'Chef Amit Roy' },
        'manager@championsclub.demo': { role: 'manager', name: 'Sanjay Verma' },
      };

      if (DEMO_STAFF_MAP[cleanIdentifier]) {
        const staff = DEMO_STAFF_MAP[cleanIdentifier];
        console.log(`ℹ️ [Staff Login] Logged in as demo role: ${staff.role}`);
        res.json({
          success: true,
          message: 'Staff login verified',
          user: {
            id: `usr_${staff.role}`,
            name: staff.name,
            email: cleanIdentifier,
            role: staff.role,
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

// Fetch all registered members from Supabase
app.get('/api/members', async (req: Request, res: Response) => {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json({ success: true, members: data });
      return;
    }

    res.json({ success: true, members: [], notice: 'Supabase not configured' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Sports Club Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Supabase connection status: ${isSupabaseConfigured ? '🟢 Connected' : '🟡 Awaiting credentials in .env'}`);
});
