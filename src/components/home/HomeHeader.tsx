import { useRouter } from 'expo-router';
import { LogIn, Search, User } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth-context';
import { tapLight } from '@/lib/haptics';

/**
 * 홈 헤더: 검색 input(전역 검색) + 로그인/유저 버튼.
 *
 * - 검색 input은 readOnly처럼 동작하고 탭 시 /search 페이지로 이동
 * - 비로그인: "로그인" 텍스트 버튼
 * - 로그인: 유저 아이콘 (탭 시 더보기)
 */
export function HomeHeader() {
  const router = useRouter();
  const { session } = useAuth();
  const isLoggedIn = !!session;

  return (
    <View className="bg-surface-primary px-lawmake-lg pb-lawmake-md pt-lawmake-sm">
      <View className="flex-row items-center gap-lawmake-sm">
        {/* Search input (presses navigate to global search) */}
        <Pressable
          onPress={() => {
            tapLight();
            router.push('/search' as never);
          }}
          className="flex-1 flex-row items-center gap-lawmake-sm rounded-lawmake-lg bg-neutral-100 px-lawmake-md py-lawmake-sm active:bg-neutral-200"
        >
          <Search size={18} color="#A3A3A3" strokeWidth={2} />
          <Text className="text-lawmake-callout text-neutral-400">
            의원, 법안, 표결 검색
          </Text>
        </Pressable>

        {/* Login / user */}
        {isLoggedIn ? (
          <Pressable
            onPress={() => {
              tapLight();
              router.push('/(tabs)/more' as never);
            }}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full bg-primary-light active:opacity-80"
          >
            <User size={20} color="#2563EB" strokeWidth={1.75} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => {
              tapLight();
              router.push('/sign-in' as never);
            }}
            hitSlop={8}
            className="flex-row items-center gap-1 rounded-full px-lawmake-sm py-lawmake-xs active:opacity-60"
          >
            <LogIn size={16} color="#2563EB" strokeWidth={2} />
            <Text className="text-lawmake-subhead font-semibold text-primary">
              로그인
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
