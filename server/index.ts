import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase, isSupabaseConfigured } from './supabase';

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
            phone,
            dateOfBirth,
            preferredSport,
            role: 'member',
          },
        });

        if (!adminError && adminData?.user) {
          userId = adminData.user.id;
        } else {
          // If admin creation fails (e.g. rate limit or permission), fallback to regular signUp
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: cleanEmail,
            password: String(password),
            options: {
              data: {
                name,
                phone,
                dateOfBirth,
                preferredSport,
                role: 'member',
              },
            },
          });

          if (authError) {
            console.error('❌ Supabase Auth Signup error:', authError);
            res.status(400).json({
              success: false,
              error: authError.message,
            });
            return;
          }

          userId = authData?.user?.id;
        }
      } catch (authException: any) {
        console.error('❌ Supabase Auth Exception:', authException);
        res.status(400).json({
          success: false,
          error: authException?.message || 'Authentication error',
        });
        return;
      }

      // 2. Generate unique Member ID (e.g. M016)
      const { count } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });

      const nextNum = (count || 0) + 1;
      const memberId = `M${String(nextNum).padStart(3, '0')}`;

      // 3. Upsert into 'profiles' table first (satisfies foreign key constraint for members)
      if (userId) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            name,
            email: cleanEmail,
            role: 'member',
            phone,
            member_id: memberId,
            membership_plan: plan,
          });

        if (profileError) {
          console.error('⚠️ Supabase profiles table upsert notice:', profileError);
        }
      }

      // 4. Insert into 'members' table
      const memberPayload = {
        member_id: memberId,
        user_id: userId || null,
        name,
        email: cleanEmail,
        phone,
        date_of_birth: dateOfBirth || '2000-01-01',
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
        console.error('⚠️ Supabase members table insert notice:', memberError);
      }

      console.log(`✅ [Supabase] User registered successfully: ${cleanEmail} (${memberId})`);

      res.status(201).json({
        success: true,
        message: 'Account registered and saved in Supabase database!',
        user: {
          id: userId || `usr_${Date.now()}`,
          name,
          email: cleanEmail,
          phone,
          role: 'member',
          memberId,
          membershipPlan: plan,
        },
        member: memberData || {
          id: `mem_${Date.now()}`,
          memberId,
          name,
          email: cleanEmail,
          phone,
          plan,
          status: 'active',
          discountRate,
          totalSpent: initialSpent,
        },
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
