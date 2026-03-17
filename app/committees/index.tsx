import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCommitteeStats } from '@/api/committees';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PressableCard } from '@/components/ui/Card';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { formatDate, formatPercent } from '@/lib/format';

const CURRENT_TERM = 22;

export default function CommitteesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, isLoading, error, refetch } = useLawmakeQuery(getCommitteeStats, [
    CURRENT_TERM,
  ]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      <View className="bg-white px-5 pb-3 pt-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-sm text-primary">뒤로</Text>
        </Pressable>
        <Text className="mt-2 text-lg font-bold text-neutral-900">상임위원회</Text>
        <Text className="mt-0.5 text-xs text-neutral-400">
          제22대 국회 {data?.length ?? 0}개 위원회
        </Text>
      </View>

      <View className="mt-3 gap-2 px-5">
        {data?.map((committee) => (
          <PressableCard
            key={committee.name}
            onPress={() =>
              router.push({
                pathname: '/committees/[name]',
                params: { name: committee.name },
              })
            }
          >
            <Text className="text-sm font-bold text-neutral-900">{committee.name}</Text>

            <View className="mt-2 flex-row gap-4">
              <View>
                <Text className="text-xs text-neutral-400">법안 수</Text>
                <Text className="text-sm font-semibold text-neutral-800">
                  {committee.billTotal}
                </Text>
              </View>
              <View>
                <Text className="text-xs text-neutral-400">가결률</Text>
                <Text className="text-sm font-semibold text-green-600">
                  {formatPercent(committee.passRate)}
                </Text>
              </View>
              <View>
                <Text className="text-xs text-neutral-400">위원 수</Text>
                <Text className="text-sm font-semibold text-neutral-800">
                  {committee.memberCount}명
                </Text>
              </View>
            </View>

            {committee.chair && (
              <View className="mt-2 flex-row items-center gap-2 border-t border-neutral-100 pt-2">
                <View
                  className="h-7 w-7 overflow-hidden rounded-full bg-neutral-100"
                  style={{ borderWidth: 1, borderColor: committee.chair.partyColor }}
                >
                  <Image
                    source={{ uri: committee.chair.photoUrl }}
                    style={{ width: 25, height: 25 }}
                    contentFit="cover"
                  />
                </View>
                <Text className="text-xs text-neutral-500">
                  위원장 {committee.chair.name} ({committee.chair.partyName})
                </Text>
              </View>
            )}

            {committee.nextSchedule && (
              <View className="mt-2 rounded-lg bg-primary-light px-2.5 py-1.5">
                <Text className="text-[11px] text-primary">
                  다음 회의: {formatDate(committee.nextSchedule.meetingDate)}{' '}
                  {committee.nextSchedule.meetingTime}
                </Text>
              </View>
            )}
          </PressableCard>
        ))}
      </View>
    </ScrollView>
  );
}
