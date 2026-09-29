import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';

import type { Database } from '@/src/types/database';
import { Env } from '@/src/config/env';

export const supabase = createClient<Database>(
  Env.supabaseUrl,
  Env.supabasePublishableKey,
  {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
      lock: processLock,
    },
  },
);
