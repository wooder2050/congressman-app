import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { PressableCard } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/format';
import type { Vote } from '@/types';

interface Props {
  votes: Vote[] | undefined;
}

/**
 * 홈 화면 부결된 표결 섹션 (TOP 5).
 *
 * 변경 (PR4):
 * - Section + StatusBadge error tone + 토큰화
 */
export function RejectedVotesSection({ votes }: Props) {
  const router = useRouter();
  if (!votes || votes.length === 0) return null;

  return (
    <View className="mt-lawmake-xl px-lawmake-lg">
      <Section title="부결된 표결">
        <View className="gap-lawmake-sm">
          {votes.slice(0, 5).map((vote) => (
            <PressableCard key={vote.id} onPress={() => router.push(`/votes/${vote.id}`)}>
              <View className="flex-row items-start justify-between gap-lawmake-sm">
                <Text
                  className="flex-1 text-lawmake-callout font-semibold text-neutral-900"
                  numberOfLines={2}
                >
                  {vote.billName}
                </Text>
                <StatusBadge label="부결" tone="error" />
              </View>
              <View className="mt-lawmake-md flex-row gap-lawmake-md">
                <Text className="text-lawmake-footnote font-medium text-success-dark">
                  찬성 {vote.yesCount}
                </Text>
                <Text className="text-lawmake-footnote font-medium text-error-dark">
                  반대 {vote.noCount}
                </Text>
                <Text className="text-lawmake-footnote text-neutral-500">
                  기권 {vote.abstainCount}
                </Text>
              </View>
              <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">
                {formatDate(vote.procDate)}
              </Text>
            </PressableCard>
          ))}
        </View>
      </Section>
    </View>
  );
}
