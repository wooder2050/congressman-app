import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { getSupabase } from '@/lib/supabase/client';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
    code?: string;
    error?: string;
    error_description?: string;
  }>();

  useEffect(() => {
    const exchange = async () => {
      const supabase = getSupabase();

      try {
        if (params.error) {
          console.warn('[Auth] OAuth error:', params.error, params.error_description);
          router.replace('/sign-in' as never);
          return;
        }

        // implicit flow (access_token + refresh_token in URL fragment)
        if (params.access_token && params.refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
          if (error) throw error;
          router.replace('/' as never);
          return;
        }

        // pkce flow (code in URL)
        if (params.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(params.code);
          if (error) throw error;
          router.replace('/' as never);
          return;
        }

        // 토큰도 코드도 없으면 sign-in으로
        router.replace('/sign-in' as never);
      } catch (err) {
        console.warn('[Auth] callback failed:', err);
        router.replace('/sign-in' as never);
      }
    };

    exchange();
  }, [params, router]);

  return (
    <View className="flex-1 items-center justify-center bg-surface-primary">
      <ActivityIndicator size="large" color="#2563EB" />
      <Text className="mt-lawmake-sm text-lawmake-footnote text-neutral-500">로그인 처리 중…</Text>
    </View>
  );
}
