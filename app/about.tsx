import { ExternalLink } from 'lucide-react-native';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-surface-secondary"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-xl pt-lawmake-md">
        <Text className="text-lawmake-large text-neutral-900">lawmake</Text>
        <Text className="mt-lawmake-xs text-lawmake-callout text-neutral-500">
          국회 의정활동을 쉽고 투명하게
        </Text>
      </View>

      <View className="mt-lawmake-md gap-lawmake-sm px-lawmake-lg">
        <Card>
          <Text className="text-lawmake-headline text-neutral-900">서비스 소개</Text>
          <Text className="mt-lawmake-sm text-lawmake-body leading-6 text-neutral-600">
            lawmake는 대한민국 국회의 의정활동을 시민들이 쉽게 확인할 수 있도록 만든
            서비스입니다. 국회의원의 출석률, 법안 발의, 표결 참여 등 다양한 의정활동
            데이터를 한눈에 볼 수 있습니다.
          </Text>
        </Card>

        <Card>
          <Text className="text-lawmake-headline text-neutral-900">주요 기능</Text>
          <View className="mt-lawmake-sm gap-lawmake-sm">
            {[
              '300명 국회의원 프로필 및 활동 현황',
              '법안 발의, 심사 경과, AI 요약',
              '본회의 표결 결과 및 정당별 분석',
              '17개 상임위원회 현황',
              '국회 본회의/위원회 일정',
              '의원 비교 분석',
              '입법 과정 가이드 및 용어 사전',
            ].map((feature, i) => (
              <View key={i} className="flex-row gap-lawmake-sm">
                <Text className="text-lawmake-body text-primary">·</Text>
                <Text className="flex-1 text-lawmake-body text-neutral-600">{feature}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text className="text-lawmake-headline text-neutral-900">데이터 출처</Text>
          <Text className="mt-lawmake-sm text-lawmake-body leading-6 text-neutral-600">
            국회 열린국회정보, 의안정보시스템 등 공공데이터를 활용하여 서비스를
            제공합니다. 데이터는 주기적으로 업데이트됩니다.
          </Text>
        </Card>

        <Pressable
          className="flex-row items-center justify-center gap-lawmake-sm rounded-lawmake-lg bg-surface-primary px-lawmake-lg py-lawmake-md active:bg-neutral-50"
          onPress={() => Linking.openURL('https://lawmake.kr')}
        >
          <Text className="text-lawmake-body font-medium text-primary">웹 버전 방문하기</Text>
          <ExternalLink size={14} color="#2563EB" />
        </Pressable>

        <View className="mt-lawmake-md items-center">
          <Text className="text-lawmake-caption text-neutral-400">v1.1.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}
