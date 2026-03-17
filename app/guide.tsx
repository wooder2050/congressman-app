import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';

const PROCESS_STEPS = [
  {
    step: 1,
    title: '법안 발의',
    description:
      '국회의원 10인 이상의 찬성으로 법률안을 발의하거나, 정부가 법률안을 제출합니다.',
    details: [
      '의원 발의: 국회의원 10인 이상의 찬성 필요',
      '정부 제출: 국무회의 심의 후 대통령 재가를 거쳐 제출',
      '위원회 제출: 소관 위원회에서 직접 제안 가능',
    ],
  },
  {
    step: 2,
    title: '위원회 심사',
    description:
      '소관 상임위원회에서 법안을 검토하고, 전문위원 검토보고, 대체토론, 소위원회 심사, 축조심사를 거칩니다.',
    details: [
      '전문위원 검토보고: 법안의 문제점과 개선사항 분석',
      '대체토론: 법안의 취지와 내용에 대한 전반적 토론',
      '소위원회 심사: 세부 내용 검토 및 수정안 마련',
      '축조심사: 조문별 심사',
    ],
  },
  {
    step: 3,
    title: '본회의 심의/의결',
    description:
      '법제사법위원회의 체계·자구 심사를 거친 후, 본회의에서 최종 의결합니다.',
    details: [
      '법사위 심사: 법체계와 자구(용어) 통일성 검토',
      '본회의 상정: 의장이 본회의에 부의',
      '표결: 재적의원 과반수 출석, 출석의원 과반수 찬성으로 의결',
    ],
  },
  {
    step: 4,
    title: '공포/시행',
    description:
      '국회를 통과한 법률안은 정부에 이송되어 대통령이 공포하면 법률로 확정됩니다.',
    details: [
      '정부 이송: 의결 후 정부에 이송',
      '대통령 공포: 이송된 후 15일 이내 공포',
      '거부권 행사: 대통령은 재의를 요구할 수 있음',
      '시행: 공포 후 20일 경과 시 효력 발생 (별도 시행일 지정 가능)',
    ],
  },
];

const BILL_TYPES = [
  {
    type: '일부개정',
    description: '기존 법률의 일부 조항을 수정하는 방식. 가장 흔한 개정 형태입니다.',
  },
  {
    type: '전부개정',
    description: '법률의 전체 내용을 새로 작성하는 방식. 법률 체계를 전면 개편할 때 사용합니다.',
  },
  {
    type: '제정',
    description: '새로운 법률을 처음 만드는 것. 새로운 사회 현상이나 제도에 대응할 때 사용합니다.',
  },
  {
    type: '폐지',
    description: '기존 법률을 없애는 것. 불필요하거나 다른 법률에 통합될 때 사용합니다.',
  },
];

export default function GuideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      <View className="bg-white px-5 pb-3 pt-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-sm text-primary">뒤로</Text>
        </Pressable>
        <Text className="mt-2 text-lg font-bold text-neutral-900">입법 가이드</Text>
        <Text className="mt-0.5 text-xs text-neutral-400">
          국회 입법 과정을 쉽게 알아보세요
        </Text>
      </View>

      {/* Process Steps */}
      <View className="mt-3 px-5">
        <Text className="mb-2 text-base font-bold text-neutral-900">
          법률안 처리 과정
        </Text>
        <View className="gap-3">
          {PROCESS_STEPS.map((step, i) => (
            <Card key={step.step}>
              <View className="flex-row items-center gap-3">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Text className="text-sm font-bold text-white">{step.step}</Text>
                </View>
                <Text className="text-base font-bold text-neutral-900">
                  {step.title}
                </Text>
              </View>
              <Text className="mt-2 text-sm leading-5 text-neutral-600">
                {step.description}
              </Text>
              <View className="mt-2 gap-1">
                {step.details.map((d, j) => (
                  <View key={j} className="flex-row gap-2">
                    <Text className="text-xs text-neutral-400">-</Text>
                    <Text className="flex-1 text-xs leading-4 text-neutral-500">
                      {d}
                    </Text>
                  </View>
                ))}
              </View>
              {i < PROCESS_STEPS.length - 1 && (
                <View className="mt-3 items-center">
                  <View className="h-4 w-0.5 bg-neutral-200" />
                </View>
              )}
            </Card>
          ))}
        </View>
      </View>

      {/* Bill Types */}
      <View className="mt-5 px-5">
        <Text className="mb-2 text-base font-bold text-neutral-900">법안 유형</Text>
        <View className="gap-2">
          {BILL_TYPES.map((bt) => (
            <Card key={bt.type}>
              <Text className="text-sm font-bold text-neutral-800">{bt.type}</Text>
              <Text className="mt-1 text-xs leading-4 text-neutral-500">
                {bt.description}
              </Text>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
