import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { LogIn } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getSupabase } from '@/lib/supabase/client';

const REDIRECT_URL = 'lawmake://auth/callback';

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: REDIRECT_URL,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data.url) {
        throw error ?? new Error('OAuth URL을 받지 못했습니다.');
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URL);

      if (result.type === 'success' && result.url) {
        // URL fragment(#)를 query string(?)로 변환 — expo-router가 fragment를 무시하므로
        // Supabase implicit flow는 lawmake://auth/callback#access_token=... 형태로 응답함
        const callbackPath =
          '/auth/callback' + result.url.replace(REDIRECT_URL, '').replace(/^#/, '?');
        router.replace(callbackPath as never);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.';
      Alert.alert('로그인 실패', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-surface-primary"
      contentContainerStyle={{
        flexGrow: 1,
        padding: 24,
        paddingTop: insets.top + 40,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <View className="flex-1 justify-center">
        <View className="items-center">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-light">
            <LogIn size={28} color="#2563EB" />
          </View>
          <Text className="mt-lawmake-md text-lawmake-title1 font-bold text-neutral-900">로그인</Text>
          <Text className="mt-lawmake-sm text-center text-lawmake-footnote leading-5 text-neutral-500">
            로그인하면 관심 의원·법안을 즐겨찾기하고{'\n'}
            내 지역구 활동을 한눈에 볼 수 있어요.
          </Text>
        </View>

        <View className="mt-lawmake-xl gap-lawmake-sm">
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            className="flex-row items-center justify-center gap-lawmake-sm rounded-lawmake-lg border border-neutral-200 bg-surface-primary px-lawmake-md py-lawmake-md active:bg-neutral-50"
          >
            <Text className="text-lawmake-headline">🔍</Text>
            <Text className="text-lawmake-footnote font-semibold text-neutral-900">
              {isLoading ? '진행 중…' : 'Google로 계속하기'}
            </Text>
          </Pressable>
        </View>

        <Text className="mt-lawmake-xl text-center text-lawmake-caption leading-4 text-neutral-400">
          로그인하면 lawmake의{' '}
          <Text className="underline">개인정보처리방침</Text>에 동의하는 것으로
          간주됩니다.
        </Text>
      </View>
    </ScrollView>
  );
}
