import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ENV } from '@/config/env';
import { SecureStoreAdapter } from './storage';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase 환경변수가 설정되지 않았습니다. EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY 확인.',
    );
  }
  if (!client) {
    client = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
      auth: {
        storage: SecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
