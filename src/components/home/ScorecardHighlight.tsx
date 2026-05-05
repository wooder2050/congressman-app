import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { MemberPhoto } from '@/components/MemberPhoto';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { SCORECARD_GRADE_MAP } from '@/constants/maps';
import type { ScorecardRankingResponse } from '@/types';

interface Props {
  data: ScorecardRankingResponse | undefined;
}

/**
 * 홈 화면 의정활동 성적표 섹션 (TOP 5 + 하위 5).
 *
 * 변경 (PR3):
 * - 카드 안의 카드 안티패턴 제거 (Card > Card > Pressable → Card > Pressable row)
 * - rank 색상이 의미를 명확히 (primary=top, error=bottom)
 * - 타이포/간격 토큰화
 */
export function ScorecardHighlight({ data }: Props) {
  const router = useRouter();
  if (!data?.rankings || data.rankings.length === 0) return null;

  const top5 = data.rankings.slice(0, 5);
  const bottom5 = data.rankings.slice(-5).reverse();
  const total = data.rankings.length;

  return (
    <View className="mt-lawmake-xl px-lawmake-lg">
      <Section
        title="의정활동 성적표"
        onMore={() => router.push('/scorecard-ranking')}
      >
        <View className="gap-lawmake-md">
          <RankCard
            label="TOP 5"
            labelTone="primary"
            members={top5}
            getRank={(_, i) => i + 1}
            onPress={(memberId) => router.push(`/members/${memberId}/scorecard`)}
          />
          <RankCard
            label="하위 5"
            labelTone="error"
            members={bottom5}
            getRank={(_, i) => total - i}
            onPress={(memberId) => router.push(`/members/${memberId}/scorecard`)}
          />
        </View>
      </Section>
    </View>
  );
}

interface RankCardProps {
  label: string;
  labelTone: 'primary' | 'error';
  members: ScorecardRankingResponse['rankings'];
  getRank: (m: ScorecardRankingResponse['rankings'][number], i: number) => number;
  onPress: (memberId: string) => void;
}

function RankCard({ label, labelTone, members, getRank, onPress }: RankCardProps) {
  const labelClass = labelTone === 'primary' ? 'text-primary' : 'text-error';
  const rankClass = labelTone === 'primary' ? 'text-primary' : 'text-error';

  return (
    <Card className="p-0">
      <Text className={`px-lawmake-lg pb-lawmake-sm pt-lawmake-md text-lawmake-subhead font-semibold ${labelClass}`}>
        {label}
      </Text>
      {members.map((m, i) => {
        const grade = SCORECARD_GRADE_MAP[m.grade];
        const isLast = i === members.length - 1;
        return (
          <Pressable
            key={m.memberId}
            onPress={() => onPress(m.memberId)}
            className={`flex-row items-center gap-lawmake-md px-lawmake-lg py-lawmake-md active:bg-neutral-50 ${
              !isLast ? 'border-b border-neutral-100' : ''
            }`}
          >
            <Text className={`w-6 text-center text-lawmake-callout font-bold ${rankClass}`}>
              {getRank(m, i)}
            </Text>
            <MemberPhoto uri={m.photoUrl} size={36} partyColor={m.party.color} />
            <Text className="flex-1 text-lawmake-body text-neutral-900" numberOfLines={1}>
              {m.name}
            </Text>
            <View
              className="h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: grade.bgColor }}
            >
              <Text className="text-lawmake-caption font-bold" style={{ color: grade.color }}>
                {m.grade}
              </Text>
            </View>
            <Text className="w-12 text-right text-lawmake-callout font-semibold text-neutral-700">
              {m.totalScore.toFixed(1)}
            </Text>
          </Pressable>
        );
      })}
    </Card>
  );
}
