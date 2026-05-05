import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { PressableCard } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { formatDate } from '@/lib/format';
import type { Vote } from '@/types';

interface Props {
  votes: Vote[] | undefined;
}

/**
 * 홈 화면 부결된 표결 섹션 (TOP 5).
 */
export function RejectedVotesSection({ votes }: Props) {
  const router = useRouter();
  if (!votes || votes.length === 0) return null;

  return (
    <View className="mt-5 px-5">
      <SectionHeader title="부결된 표결" />
      <View className="mt-3 gap-2">
        {votes.slice(0, 5).map((vote) => (
          <PressableCard key={vote.id} onPress={() => router.push(`/votes/${vote.id}`)}>
            <View className="flex-row items-start justify-between">
              <Text className="flex-1 text-sm font-semibold text-neutral-800" numberOfLines={2}>
                {vote.billName}
              </Text>
              <Badge label="부결" color="#DC2626" textColor="#FFFFFF" className="ml-2" />
            </View>
            <View className="mt-1 flex-row gap-3">
              <Text className="text-xs text-green-600">찬성 {vote.yesCount}</Text>
              <Text className="text-xs text-red-600">반대 {vote.noCount}</Text>
              <Text className="text-xs text-neutral-400">기권 {vote.abstainCount}</Text>
            </View>
            <Text className="mt-0.5 text-xs text-neutral-400">{formatDate(vote.procDate)}</Text>
          </PressableCard>
        ))}
      </View>
    </View>
  );
}
