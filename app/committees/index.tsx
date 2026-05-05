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
      className="flex-1 bg-surface-secondary"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-md pt-lawmake-md">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-lawmake-footnote text-primary">뒤로</Text>
        </Pressable>
        <Text className="mt-lawmake-sm text-lawmake-title2 font-bold text-neutral-900">상임위원회</Text>
        <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">
          제22대 국회 {data?.length ?? 0}개 위원회
        </Text>
      </View>

      <View className="mt-lawmake-sm gap-lawmake-sm px-lawmake-lg">
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
            <Text className="text-lawmake-subhead font-bold text-neutral-900">{committee.name}</Text>

            <View className="mt-lawmake-sm flex-row gap-lawmake-md">
              <View>
                <Text className="text-lawmake-caption text-neutral-400">법안 수</Text>
                <Text className="text-lawmake-footnote font-semibold text-neutral-800">
                  {committee.billTotal}
                </Text>
              </View>
              <View>
                <Text className="text-lawmake-caption text-neutral-400">가결률</Text>
                <Text className="text-lawmake-footnote font-semibold text-success">
                  {formatPercent(committee.passRate)}
                </Text>
              </View>
              <View>
                <Text className="text-lawmake-caption text-neutral-400">위원 수</Text>
                <Text className="text-lawmake-footnote font-semibold text-neutral-800">
                  {committee.memberCount}명
                </Text>
              </View>
            </View>

            {committee.chair && (
              <View className="mt-lawmake-sm flex-row items-center gap-lawmake-sm border-t border-neutral-100 pt-lawmake-sm">
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
                <Text className="text-lawmake-caption text-neutral-500">
                  위원장 {committee.chair.name} ({committee.chair.partyName})
                </Text>
              </View>
            )}

            {committee.nextSchedule && (
              <View className="mt-lawmake-sm rounded-lawmake-md bg-primary-light px-lawmake-sm py-lawmake-xs">
                <Text className="text-lawmake-caption text-primary">
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
