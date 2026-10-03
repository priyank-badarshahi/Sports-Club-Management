import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gddhfywnqrltmnlmtyak.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_KEY / SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log('🚀 Checking Supabase connection to:', SUPABASE_URL);

  // 1. Check existing Auth users
  const { data: usersData, error: usersErr } = await supabase.auth.admin.listUsers();
  if (usersErr) {
    console.error('❌ Error listing auth users:', usersErr.message);
  } else {
    console.log(`📋 Found ${usersData.users.length} users in Supabase Auth:`);
    usersData.users.forEach((u) => {
      console.log(`  - ${u.email} (id: ${u.id})`);
    });
  }

  // 2. Ensure admin jack@gmail.com exists
  let adminUser = usersData?.users.find((u) => u.email?.toLowerCase() === 'jack@gmail.com');

  if (!adminUser) {
    console.log('👤 Creating admin account for jack@gmail.com...');
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: 'jack@gmail.com',
      password: 'jackson',
      email_confirm: true,
      user_metadata: {
        name: 'Jack Jackson',
        role: 'owner',
        phone: '+91 98765 00001',
      },
    });

    if (createErr) {
      console.error('❌ Failed to create admin user in Auth:', createErr.message);
      process.exit(1);
    }
    adminUser = created.user;
    console.log('✅ Admin user created in Supabase Auth:', adminUser.id);
  } else {
    console.log('ℹ️ Admin user jack@gmail.com already exists in Auth. Updating password to "jackson"...');
    const { error: updateErr } = await supabase.auth.admin.updateUserById(adminUser.id, {
      password: 'jackson',
      email_confirm: true,
      user_metadata: {
        name: 'Jack Jackson',
        role: 'owner',
        phone: '+91 98765 00001',
      },
    });
    if (updateErr) {
      console.error('❌ Failed to update admin password:', updateErr.message);
    } else {
      console.log('✅ Admin password updated to "jackson"');
    }
  }

  const userId = adminUser.id;

  // 3. Upsert into public.profiles
  console.log('💾 Upserting profile for Jack Jackson...');
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      name: 'Jack Jackson',
      email: 'jack@gmail.com',
      role: 'owner',
      phone: '+91 98765 00001',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      member_id: 'ADM001',
      membership_plan: 'Gold',
    });

  if (profileErr) {
    console.error('❌ Error upserting into profiles:', profileErr.message);
  } else {
    console.log('✅ Profile upserted in profiles table');
  }

  // 4. Check if member already exists in public.members
  console.log('💾 Ensuring record in public.members for Jack Jackson...');
  const { data: existingMember } = await supabase
    .from('members')
    .select('id')
    .or(`email.eq.jack@gmail.com,member_id.eq.ADM001`)
    .maybeSingle();

  if (existingMember) {
    const { error: memberUpdateErr } = await supabase
      .from('members')
      .update({
        user_id: userId,
        name: 'Jack Jackson',
        email: 'jack@gmail.com',
        phone: '+91 98765 00001',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
        date_of_birth: '1985-05-20',
        plan: 'Gold',
        start_date: '2025-01-01',
        expiry_date: '2027-12-31',
        status: 'active',
        discount_rate: 0.20,
        total_bookings: 12,
        total_spent: 150000,
        emergency_contact: '{"name":"Sarah Jackson","phone":"+91 98765 00002","relation":"Spouse"}',
      })
      .eq('id', existingMember.id);

    if (memberUpdateErr) {
      console.error('❌ Error updating members table:', memberUpdateErr.message);
    } else {
      console.log('✅ Member updated in members table');
    }
  } else {
    const { error: memberInsertErr } = await supabase
      .from('members')
      .insert({
        member_id: 'ADM001',
        user_id: userId,
        name: 'Jack Jackson',
        email: 'jack@gmail.com',
        phone: '+91 98765 00001',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
        date_of_birth: '1985-05-20',
        plan: 'Gold',
        start_date: '2025-01-01',
        expiry_date: '2027-12-31',
        status: 'active',
        discount_rate: 0.20,
        total_bookings: 12,
        total_spent: 150000,
        emergency_contact: '{"name":"Sarah Jackson","phone":"+91 98765 00002","relation":"Spouse"}',
      });

    if (memberInsertErr) {
      console.error('❌ Error inserting into members table:', memberInsertErr.message);
    } else {
      console.log('✅ Member inserted into members table');
    }
  }

  // 5. Query and list profiles and members to verify
  const { data: allProfiles } = await supabase.from('profiles').select('*');
  console.log('\n📊 Profiles table content:', allProfiles);

  const { data: allMembers } = await supabase.from('members').select('*');
  console.log('\n📊 Members table content:', allMembers);

  console.log('\n🎉 Provisioning complete! jack@gmail.com / jackson is ready.');
}

main().catch(console.error);
