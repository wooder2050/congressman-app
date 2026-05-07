import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Section } from '@/components/ui/Section';
import { StatusBadge, type StatusTone } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/format';
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
  votes: Vote[];
}

/**
 * 홈 화면 최근 표결 섹션 (최대 5건).
 *
 * 변경 (PR4):
 * - Section 컴포넌트 + StatusBadge + 토큰화
 * - 찬반 카운트는 inline (구분선 없이 spacing)
 */
export function RecentVotesSection({ votes }: Props) {
  const router = useRouter();
  if (votes.length === 0) return null;

  const items = votes.slice(0, 5);

  return (
    <View className="mt-lawmake-sm bg-surface-primary px-lawmake-lg pt-lawmake-lg">
      <Section title="최근 표결" onMore={() => router.push('/(tabs)/votes')}>
        <View>
          {items.map((vote, i) => {
            const result = VOTE_RESULT_TONE[vote.resultCode] ?? VOTE_RESULT_TONE.other;
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
