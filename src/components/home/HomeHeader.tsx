import { Text, View } from 'react-native';

/**
 * 홈 화면 상단 헤더 (iOS Large Title 패턴).
 *
 * 변경 (PR2):
 * - 폰트: text-2xl → text-lawmake-large (28pt, iOS HIG)
 * - 부제: text-sm/neutral-400 → text-lawmake-callout/neutral-500
 * - 패딩: px-5 → px-lawmake-lg, pb-5 → pb-lawmake-xl, pt-2 → pt-lawmake-md
 */
export function HomeHeader() {
  return (
    <View className="bg-surface-primary px-lawmake-lg pb-lawmake-xl pt-lawmake-md">
      <Text className="text-lawmake-large text-neutral-900">제22대 국회</Text>
      <Text className="mt-lawmake-xs text-lawmake-callout text-neutral-500">
        국회 의정활동 한눈에 보기
      </Text>
    </View>
  );
}
