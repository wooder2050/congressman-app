import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Section } from '@/components/ui/Section';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/format';
import { tapLight } from '@/lib/haptics';
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

  const items = votes.slice(0, 5);

  return (
    <View className="mt-lawmake-sm bg-surface-primary px-lawmake-lg pt-lawmake-lg">
      <Section title="부결된 표결">
        <View>
          {items.map((vote, i) => {
            const isLast = i === items.length - 1;
            return (
              <Pressable
                key={vote.id}
                onPress={() => {
                  tapLight();
                  router.push(`/votes/${vote.id}`);
                }}
                className={`py-lawmake-md active:bg-neutral-50 ${
                  isLast ? '' : 'border-b border-neutral-100'
                }`}
              >
                <View className="flex-row items-start justify-between gap-lawmake-sm">
                  <Text
                    className="flex-1 text-lawmake-callout font-semibold text-neutral-900"
                    numberOfLines={2}
                  >
                    {vote.billName}
                  </Text>
                  <StatusBadge label="부결" tone="error" />
                </View>
                <View className="mt-lawmake-sm flex-row gap-lawmake-md">
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
              </Pressable>
            );
          })}
        </View>
      </Section>
    </View>
  );
}
