function read(value: string | undefined) {
  return value?.trim() ?? '';
}

export const Env = {
  appEnv: read(process.env.EXPO_PUBLIC_APP_ENV) || 'development',
  supabaseUrl: read(process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabasePublishableKey: read(process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
} as const;

export function hasSupabaseConfig() {
  return Boolean(Env.supabaseUrl && Env.supabasePublishableKey);
}
