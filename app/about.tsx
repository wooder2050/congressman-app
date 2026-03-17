import { useRouter } from 'expo-router';
import { ExternalLink } from 'lucide-react-native';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      <View className="bg-white px-5 pb-4 pt-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-sm text-primary">뒤로</Text>
        </Pressable>
        <Text className="mt-4 text-2xl font-bold text-neutral-900">lawmake</Text>
        <Text className="mt-1 text-sm text-neutral-500">
          국회 의정활동을 쉽고 투명하게
        </Text>
      </View>

      <View className="mt-3 gap-3 px-5">
        <Card>
          <Text className="text-sm font-bold text-neutral-900">서비스 소개</Text>
          <Text className="mt-2 text-sm leading-5 text-neutral-600">
            lawmake는 대한민국 국회의 의정활동을 시민들이 쉽게 확인할 수 있도록 만든
            서비스입니다. 국회의원의 출석률, 법안 발의, 표결 참여 등 다양한 의정활동
            데이터를 한눈에 볼 수 있습니다.
          </Text>
        </Card>

        <Card>
          <Text className="text-sm font-bold text-neutral-900">주요 기능</Text>
          <View className="mt-2 gap-2">
            {[
              '300명 국회의원 프로필 및 활동 현황',
              '법안 발의, 심사 경과, AI 요약',
              '본회의 표결 결과 및 정당별 분석',
              '17개 상임위원회 현황',
              '국회 본회의/위원회 일정',
              '의원 비교 분석',
              '입법 과정 가이드 및 용어 사전',
            ].map((feature, i) => (
              <View key={i} className="flex-row gap-2">
                <Text className="text-xs text-primary">-</Text>
                <Text className="flex-1 text-sm text-neutral-600">{feature}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text className="text-sm font-bold text-neutral-900">데이터 출처</Text>
          <Text className="mt-2 text-sm leading-5 text-neutral-600">
            국회 열린국회정보, 의안정보시스템 등 공공데이터를 활용하여 서비스를
            제공합니다. 데이터는 주기적으로 업데이트됩니다.
          </Text>
        </Card>

        <Pressable
          className="flex-row items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5"
          onPress={() => Linking.openURL('https://lawmake.kr')}
        >
          <Text className="text-sm font-medium text-primary">웹 버전 방문하기</Text>
          <ExternalLink size={14} color="#2563EB" />
        </Pressable>

        <View className="mt-4 items-center">
          <Text className="text-xs text-neutral-300">v1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}
