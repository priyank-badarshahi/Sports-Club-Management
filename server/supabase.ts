import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const rawUrl = process.env.SUPABASE_URL || '';
// Remove trailing slashes and /rest/v1 if inadvertently included
const supabaseUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const serviceKey = (
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ''
).trim();

const anonKey = (
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  serviceKey
).trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  serviceKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('your-project') &&
  !serviceKey.includes('your-')
);

if (!isSupabaseConfigured) {
  console.log('------------------------------------------------------------------');
  console.log('ℹ️  Supabase credentials not yet provided in .env');
  console.log('   Add SUPABASE_URL and SUPABASE_ANON_KEY / SUPABASE_SECRET_KEY to .env to sync live to DB.');
  console.log('------------------------------------------------------------------');
} else {
  console.log(`📡 Supabase configured with URL: ${supabaseUrl}`);
}

// Admin client for backend database operations and user provisioning (bypasses RLS)
export const supabase = createClient<any>(
  supabaseUrl || 'https://placeholder.supabase.co',
  serviceKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Fresh isolated client for authenticating user credentials without polluting server session
export const createAuthClient = () => createClient<any>(
  supabaseUrl || 'https://placeholder.supabase.co',
  anonKey || serviceKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
