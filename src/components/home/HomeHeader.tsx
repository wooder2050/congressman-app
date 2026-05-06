import { Text, View } from 'react-native';

/**
 * 홈 화면 상단 헤더 (iOS Large Title 패턴).
 * 탭 화면이라 시스템 헤더는 끄고 화면 안에서 large title을 직접 표시.
 */
export function HomeHeader() {
  return (
    <View className="bg-surface-primary px-lawmake-lg pb-lawmake-md pt-lawmake-sm">
      <Text className="text-lawmake-large text-neutral-900">홈</Text>
      <Text className="mt-lawmake-xs text-lawmake-callout text-neutral-500">
        제22대 국회 의정활동 한눈에 보기
      </Text>
    </View>
  );
}
