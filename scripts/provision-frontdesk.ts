import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gddhfywnqrltmnlmtyak.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('🚀 Provisioning dummy front desk staff priyank@gmail.com...');

  // 1. Check existing users
  const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('❌ Error listing users:', listErr.message);
  }

  let staffUser = usersData?.users.find((u) => u.email?.toLowerCase() === 'priyank@gmail.com');

  if (!staffUser) {
    console.log('👤 Creating priyank@gmail.com in Supabase Auth...');
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: 'priyank@gmail.com',
      password: 'priyank',
      email_confirm: true,
      user_metadata: {
        name: 'Priyank Patel',
        role: 'front_desk',
        phone: '+91 98765 22222',
      },
    });

    if (createErr) {
      console.error('❌ Error creating user:', createErr.message);
      process.exit(1);
    }
    staffUser = created.user;
    console.log('✅ Created user in Auth:', staffUser.id);
  } else {
    console.log('ℹ️ User priyank@gmail.com already exists. Updating password to "priyank"...');
    const { error: updateErr } = await supabase.auth.admin.updateUserById(staffUser.id, {
      password: 'priyank',
      email_confirm: true,
      user_metadata: {
        name: 'Priyank Patel',
        role: 'front_desk',
        phone: '+91 98765 22222',
      },
    });
    if (updateErr) {
      console.error('❌ Error updating password:', updateErr.message);
    } else {
      console.log('✅ Password updated to "priyank"');
    }
  }

  const userId = staffUser.id;

  // 2. Upsert into profiles table with role: 'front_desk'
  console.log('💾 Upserting into public.profiles for priyank@gmail.com...');
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      name: 'Priyank Patel',
      email: 'priyank@gmail.com',
      role: 'frontdesk',
      phone: '+91 98765 22222',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
      member_id: 'FD001',
      membership_plan: 'Gold',
    });

  if (profileErr) {
    console.error('❌ Error in profiles upsert:', profileErr.message);
  } else {
    console.log('✅ Profile upserted with role: front_desk');
  }

  // 3. Verify by querying
  const { data: verifiedProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  console.log('📊 Verified profile:', verifiedProfile);
  console.log('\n🎉 Front desk staff priyank@gmail.com / priyank ready!');
}

main().catch(console.error);
