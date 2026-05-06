import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { MemberPhoto } from '@/components/MemberPhoto';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { formatPercent } from '@/lib/format';
import type { AttendanceRanking as AttendanceRankingType } from '@/types';

interface Props {
  data: AttendanceRankingType | undefined;
}

/**
 * 홈 화면 출석률 랭킹 섹션 (TOP 5 + 하위 5).
 *
 * 변경 (PR3):
 * - 카드 안의 카드 안티패턴 제거 (Card > Card > Pressable → Card > Pressable row)
 * - 타이포/간격 토큰화
 */
export function AttendanceRankingSection({ data }: Props) {
  const router = useRouter();
  if (!data) return null;

  return (
    <View className="mt-lawmake-xl px-lawmake-lg">
      <Section title="출석률 랭킹">
        <View className="gap-lawmake-md">
          <RankCard
            label="출석률 TOP 5"
            labelTone="success"
            members={data.top.slice(0, 5)}
            onPress={(memberId) => router.push(`/members/${memberId}`)}
          />
          <RankCard
            label="출석률 하위 5"
            labelTone="error"
            members={data.bottom.slice(0, 5)}
            onPress={(memberId) => router.push(`/members/${memberId}`)}
          />
        </View>
      </Section>
    </View>
  );
}

interface RankCardProps {
  label: string;
  labelTone: 'success' | 'error';
  members: AttendanceRankingType['top'];
  onPress: (memberId: string) => void;
}

function RankCard({ label, labelTone, members, onPress }: RankCardProps) {
  const labelClass = labelTone === 'success' ? 'text-success' : 'text-error';

  return (
    <Card className="p-0">
      <Text className={`px-lawmake-lg pb-lawmake-sm pt-lawmake-md text-lawmake-subhead font-semibold ${labelClass}`}>
        {label}
      </Text>
      {members.map((m, i) => {
        const isLast = i === members.length - 1;
        return (
          <Pressable
            key={m.memberId}
            onPress={() => onPress(m.memberId)}
            className={`flex-row items-center gap-lawmake-md px-lawmake-lg py-lawmake-md active:bg-neutral-50 ${
              !isLast ? 'border-b border-neutral-100' : ''
            }`}
          >
            <Text
              className={`w-8 text-center text-lawmake-callout font-bold ${labelClass}`}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {i + 1}
            </Text>
            <MemberPhoto uri={m.photoUrl} size={36} partyColor={m.party.color} />
            <Text className="flex-1 text-lawmake-body text-neutral-900" numberOfLines={1}>
              {m.name}
            </Text>
            <Text className={`text-lawmake-callout font-semibold ${labelClass}`}>
              {formatPercent(m.rate)}
            </Text>
          </Pressable>
        );
      })}
    </Card>
  );
}
