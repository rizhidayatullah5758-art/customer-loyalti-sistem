function read(value: string | undefined) {
  return value?.trim() ?? '';
}

const DEFAULT_SUPABASE_URL = 'https://lscwmlxsvmakhnzknvrr.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xP2C7pPrFpjzbo4WS-C2sw_pYi5hHph';

export const Env = {
  appEnv: read(process.env.EXPO_PUBLIC_APP_ENV) || 'production',
  supabaseUrl: read(process.env.EXPO_PUBLIC_SUPABASE_URL) || DEFAULT_SUPABASE_URL,
  supabasePublishableKey:
    read(process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY) || DEFAULT_SUPABASE_PUBLISHABLE_KEY,
} as const;

export function hasSupabaseConfig() {
  return Boolean(Env.supabaseUrl && Env.supabasePublishableKey);
}
