import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { MemberPhoto } from '@/components/MemberPhoto';
import { Section } from '@/components/ui/Section';
import { formatPercent } from '@/lib/format';
import { tapLight } from '@/lib/haptics';
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

  const onPress = (memberId: string) => {
    tapLight();
    router.push(`/members/${memberId}`);
  };

  return (
    <View className="mt-lawmake-sm bg-surface-primary px-lawmake-lg pt-lawmake-lg">
      <Section title="출석률 랭킹">
        <View>
          <RankGroup
            label="출석률 TOP 3"
            labelTone="success"
            members={data.top.slice(0, 3)}
            onPress={onPress}
          />
          <RankGroup
            label="출석률 하위 3"
            labelTone="error"
            members={data.bottom.slice(0, 3)}
            onPress={onPress}
          />
        </View>
      </Section>
    </View>
  );
}

interface RankGroupProps {
  label: string;
  labelTone: 'success' | 'error';
  members: AttendanceRankingType['top'];
  onPress: (memberId: string) => void;
}

function RankGroup({ label, labelTone, members, onPress }: RankGroupProps) {
  const labelClass = labelTone === 'success' ? 'text-success' : 'text-error';

  return (
    <View>
      <Text className={`pb-lawmake-sm pt-lawmake-md text-lawmake-subhead font-semibold ${labelClass}`}>
        {label}
      </Text>
      {members.map((m, i) => {
        const isLast = i === members.length - 1;
        return (
          <Pressable
            key={m.memberId}
            onPress={() => onPress(m.memberId)}
            className={`flex-row items-center gap-lawmake-md py-lawmake-md active:bg-neutral-50 ${
              isLast ? '' : 'border-b border-neutral-100'
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
    </View>
  );
}
