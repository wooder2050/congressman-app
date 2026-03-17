import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getMemberHistory } from '@/api/members';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { formatPercent } from '@/lib/format';

export default function MemberHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, isLoading, error, refetch } = useLawmakeQuery(getMemberHistory, [id]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!data || data.length === 0) return <EmptyState title="역대 활동 데이터가 없습니다" />;

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      {/* Back button */}
      <View className="bg-white px-5 pb-3 pt-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-sm text-primary">뒤로</Text>
        </Pressable>
        <Text className="mt-2 text-lg font-bold text-neutral-900">역대 활동 비교</Text>
      </View>

      <View className="mt-3 gap-3 px-5">
        {data.map((term) => (
          <Card key={term.termId}>
            <Text className="text-base font-bold text-neutral-900">{term.termName}</Text>

            <View className="mt-3 gap-2">
              {/* Attendance */}
              <View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-neutral-500">출석률</Text>
                  <Text className="text-sm font-semibold text-primary">
                    {formatPercent(term.attendanceRate)}
                  </Text>
                </View>
                <View className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                  <View
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${term.attendanceRate}%` }}
                  />
                </View>
              </View>

              {/* Bills Proposed */}
              <View className="flex-row items-center justify-between pt-1">
                <Text className="text-xs text-neutral-500">발의 법안</Text>
                <Text className="text-sm font-semibold text-neutral-800">
                  {term.billsProposed}건
                </Text>
              </View>

              {/* Bills Passed */}
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-neutral-500">가결 법안</Text>
                <Text className="text-sm font-semibold text-green-600">
                  {term.billsPassed}건
                </Text>
              </View>

              {/* Pass Rate */}
              {term.billsProposed > 0 && (
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-neutral-500">가결률</Text>
                  <Text className="text-sm font-semibold text-neutral-600">
                    {formatPercent((term.billsPassed / term.billsProposed) * 100)}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
