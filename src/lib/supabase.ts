import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/src/types/database';
import { Env } from '@/src/config/env';

if (!Env.supabaseUrl || !Env.supabasePublishableKey) {
  console.warn('Supabase environment is not configured yet.');
}

export const supabase = createClient<Database>(
  Env.supabaseUrl || 'https://invalid.supabase.co',
  Env.supabasePublishableKey || 'missing-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  },
);
