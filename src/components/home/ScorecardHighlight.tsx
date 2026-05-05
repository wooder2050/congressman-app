import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { MemberPhoto } from '@/components/MemberPhoto';
import { Card, PressableCard } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SCORECARD_GRADE_MAP } from '@/constants/maps';
import type { ScorecardRankingResponse } from '@/types';

interface Props {
  data: ScorecardRankingResponse | undefined;
}

/**
 * 홈 화면 의정활동 성적표 섹션 (TOP 5 + 하위 5).
 * v1.1까지의 디자인 그대로 — 카드 안의 카드 안티패턴 포함 (PR3에서 정리 예정).
 */
export function ScorecardHighlight({ data }: Props) {
  const router = useRouter();
  if (!data?.rankings || data.rankings.length === 0) return null;

  return (
    <View className="mt-5 px-5">
      <SectionHeader
        title="의정활동 성적표"
        onMore={() => router.push('/scorecard-ranking')}
      />
      <View className="mt-3 gap-2">
        <Card>
          <Text className="mb-2 text-xs font-semibold text-primary">TOP 5</Text>
          {data.rankings.slice(0, 5).map((m, i) => {
            const grade = SCORECARD_GRADE_MAP[m.grade];
            return (
              <PressableCard
                key={m.memberId}
                className="mb-1.5 flex-row items-center gap-2 border-0 p-2"
                style={{ elevation: 0 }}
                onPress={() => router.push(`/members/${m.memberId}/scorecard`)}
              >
                <Text className="w-5 text-center text-xs font-bold text-primary">{i + 1}</Text>
                <MemberPhoto uri={m.photoUrl} size={32} partyColor={m.party.color} />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-neutral-800">{m.name}</Text>
                </View>
                <View
                  className="h-6 w-6 items-center justify-center rounded-full"
                  style={{ backgroundColor: grade.bgColor }}
                >
                  <Text className="text-[10px] font-bold" style={{ color: grade.color }}>
                    {m.grade}
                  </Text>
                </View>
                <Text className="w-10 text-right text-xs font-bold text-neutral-600">
                  {m.totalScore.toFixed(1)}
                </Text>
              </PressableCard>
            );
          })}
        </Card>

        <Card>
          <Text className="mb-2 text-xs font-semibold text-red-500">하위 5</Text>
          {data.rankings
            .slice(-5)
            .reverse()
            .map((m, i) => {
              const grade = SCORECARD_GRADE_MAP[m.grade];
              return (
                <PressableCard
                  key={m.memberId}
                  className="mb-1.5 flex-row items-center gap-2 border-0 p-2"
                  style={{ elevation: 0 }}
                  onPress={() => router.push(`/members/${m.memberId}/scorecard`)}
                >
                  <Text className="w-5 text-center text-xs font-bold text-red-500">
                    {data.rankings.length - i}
                  </Text>
                  <MemberPhoto uri={m.photoUrl} size={32} partyColor={m.party.color} />
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-neutral-800">{m.name}</Text>
                  </View>
                  <View
                    className="h-6 w-6 items-center justify-center rounded-full"
                    style={{ backgroundColor: grade.bgColor }}
                  >
                    <Text className="text-[10px] font-bold" style={{ color: grade.color }}>
                      {m.grade}
                    </Text>
                  </View>
                  <Text className="w-10 text-right text-xs font-bold text-neutral-600">
                    {m.totalScore.toFixed(1)}
                  </Text>
                </PressableCard>
              );
            })}
        </Card>
      </View>
    </View>
  );
}
