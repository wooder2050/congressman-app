import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { PressableCard } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { VOTE_RESULT_MAP } from '@/constants/maps';
import type { Vote } from '@/types';

interface Props {
  votes: Vote[] | undefined;
}

/**
 * 홈 화면 접전 표결 섹션 (TOP 5).
 * 찬반 비율을 막대로 표시.
 */
export function CloseVotesSection({ votes }: Props) {
  const router = useRouter();
  if (!votes || votes.length === 0) return null;

  return (
    <View className="mt-5 px-5">
      <SectionHeader title="접전 표결" />
      <View className="mt-3 gap-2">
        {votes.slice(0, 5).map((vote) => {
          const result = VOTE_RESULT_MAP[vote.resultCode];
          const total = vote.yesCount + vote.noCount + vote.abstainCount;
          const yesPct = total > 0 ? (vote.yesCount / total) * 100 : 0;
          const noPct = total > 0 ? (vote.noCount / total) * 100 : 0;
          return (
            <PressableCard key={vote.id} onPress={() => router.push(`/votes/${vote.id}`)}>
              <View className="flex-row items-start justify-between">
                <Text
                  className="flex-1 text-sm font-semibold text-neutral-800"
                  numberOfLines={2}
                >
                  {vote.billName}
                </Text>
                <Badge
                  label={result.label}
                  color={result.color}
                  textColor={result.textColor}
                  className="ml-2"
                />
              </View>
              {/* Vote bar */}
              <View className="mt-2 h-2 flex-row overflow-hidden rounded-full">
                <View className="h-full bg-green-500" style={{ width: `${yesPct}%` }} />
                <View className="h-full bg-red-500" style={{ width: `${noPct}%` }} />
                <View className="h-full flex-1 bg-neutral-200" />
              </View>
              <View className="mt-1 flex-row gap-3">
                <Text className="text-xs text-green-600">찬성 {vote.yesCount}</Text>
                <Text className="text-xs text-red-600">반대 {vote.noCount}</Text>
                <Text className="text-xs text-neutral-400">기권 {vote.abstainCount}</Text>
              </View>
            </PressableCard>
          );
        })}
      </View>
    </View>
  );
}
