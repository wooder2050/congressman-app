import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Section } from '@/components/ui/Section';
import { StatusBadge, type StatusTone } from '@/components/ui/StatusBadge';
import { tapLight } from '@/lib/haptics';
import type { Vote } from '@/types';

const VOTE_RESULT_TONE: Record<string, { label: string; tone: StatusTone }> = {
  passed: { label: '원안가결', tone: 'success' },
  amended: { label: '수정가결', tone: 'info' },
  rejected: { label: '부결', tone: 'error' },
  discarded: { label: '폐기', tone: 'neutral' },
  other: { label: '기타', tone: 'neutral' },
};

interface Props {
  votes: Vote[] | undefined;
}

/**
 * 홈 화면 접전 표결 섹션 (TOP 5). 찬반 비율을 막대로 시각화.
 *
 * 변경 (PR4):
 * - Section + StatusBadge + 토큰화
 */
export function CloseVotesSection({ votes }: Props) {
  const router = useRouter();
  if (!votes || votes.length === 0) return null;

  const items = votes.slice(0, 5);

  return (
    <View className="mt-lawmake-sm bg-surface-primary px-lawmake-lg pt-lawmake-lg">
      <Section title="접전 표결">
        <View>
          {items.map((vote, i) => {
            const result = VOTE_RESULT_TONE[vote.resultCode] ?? VOTE_RESULT_TONE.other;
            const total = vote.yesCount + vote.noCount + vote.abstainCount;
            const yesPct = total > 0 ? (vote.yesCount / total) * 100 : 0;
            const noPct = total > 0 ? (vote.noCount / total) * 100 : 0;
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
                  <StatusBadge label={result.label} tone={result.tone} />
                </View>
                {/* Vote bar */}
                <View className="mt-lawmake-sm h-2 flex-row overflow-hidden rounded-full bg-neutral-100">
                  <View className="h-full bg-success" style={{ width: `${yesPct}%` }} />
                  <View className="h-full bg-error" style={{ width: `${noPct}%` }} />
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
              </Pressable>
            );
          })}
        </View>
      </Section>
    </View>
  );
}
