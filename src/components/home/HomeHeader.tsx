import { Text, View } from 'react-native';

/**
 * 홈 화면 상단 헤더.
 * v1.1까지 사용된 디자인 그대로 유지 (PR1 refactor: 디자인 변경 없음).
 */
export function HomeHeader() {
  return (
    <View className="bg-white px-5 pb-5 pt-2">
      <Text className="text-2xl font-bold text-neutral-900">제22대 국회</Text>
      <Text className="mt-1 text-sm text-neutral-400">국회 의정활동 한눈에 보기</Text>
    </View>
  );
}
