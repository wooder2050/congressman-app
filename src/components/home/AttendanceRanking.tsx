import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { MemberPhoto } from '@/components/MemberPhoto';
import { Card, PressableCard } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { formatPercent } from '@/lib/format';
import type { AttendanceRanking as AttendanceRankingType } from '@/types';

interface Props {
  data: AttendanceRankingType | undefined;
}

/**
 * 홈 화면 출석률 랭킹 섹션 (TOP 5 + 하위 5).
 * v1.1까지의 디자인 그대로 — 카드 안의 카드 안티패턴 포함 (PR3에서 정리 예정).
 */
export function AttendanceRankingSection({ data }: Props) {
  const router = useRouter();
  if (!data) return null;

  return (
    <View className="mt-5 px-5">
      <SectionHeader title="출석률 랭킹" />
      <View className="mt-3 gap-2">
        <Card>
          <Text className="mb-2 text-xs font-semibold text-green-600">출석률 TOP 5</Text>
          {data.top.slice(0, 5).map((m, i) => (
            <PressableCard
              key={m.memberId}
              className="mb-1.5 flex-row items-center gap-2 border-0 p-2"
              style={{ elevation: 0 }}
              onPress={() => router.push(`/members/${m.memberId}`)}
            >
              <Text className="w-5 text-center text-xs font-bold text-green-600">{i + 1}</Text>
              <MemberPhoto uri={m.photoUrl} size={32} partyColor={m.party.color} />
              <View className="flex-1">
                <Text className="text-sm font-medium text-neutral-800">{m.name}</Text>
              </View>
              <Text className="text-sm font-bold text-green-600">
                {formatPercent(m.rate)}
              </Text>
            </PressableCard>
          ))}
        </Card>

        <Card>
          <Text className="mb-2 text-xs font-semibold text-red-500">출석률 하위 5</Text>
          {data.bottom.slice(0, 5).map((m, i) => (
            <PressableCard
              key={m.memberId}
              className="mb-1.5 flex-row items-center gap-2 border-0 p-2"
              style={{ elevation: 0 }}
              onPress={() => router.push(`/members/${m.memberId}`)}
            >
              <Text className="w-5 text-center text-xs font-bold text-red-500">{i + 1}</Text>
              <MemberPhoto uri={m.photoUrl} size={32} partyColor={m.party.color} />
              <View className="flex-1">
                <Text className="text-sm font-medium text-neutral-800">{m.name}</Text>
              </View>
              <Text className="text-sm font-bold text-red-500">
                {formatPercent(m.rate)}
              </Text>
            </PressableCard>
          ))}
        </Card>
      </View>
    </View>
  );
}
