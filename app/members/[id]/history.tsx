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
      className="flex-1 bg-surface-secondary"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      {/* Header */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-md pt-lawmake-md">
        <Text className="text-lawmake-title2 font-bold text-neutral-900">역대 활동 비교</Text>
      </View>

      <View className="mt-lawmake-sm gap-lawmake-sm px-lawmake-lg">
        {data.map((term) => (
          <Card key={term.termId}>
            <Text className="text-lawmake-callout font-bold text-neutral-900">{term.termName}</Text>

            <View className="mt-lawmake-sm gap-lawmake-sm">
              {/* Attendance */}
              <View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-lawmake-caption text-neutral-500">출석률</Text>
                  <Text className="text-lawmake-footnote font-semibold text-primary">
                    {formatPercent(term.attendanceRate)}
                  </Text>
                </View>
                <View className="mt-lawmake-xs h-2 overflow-hidden rounded-full bg-neutral-100">
                  <View
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${term.attendanceRate}%` }}
                  />
                </View>
              </View>

              {/* Bills Proposed */}
              <View className="flex-row items-center justify-between pt-lawmake-xs">
                <Text className="text-lawmake-caption text-neutral-500">발의 법안</Text>
                <Text className="text-lawmake-footnote font-semibold text-neutral-800">
                  {term.billsProposed}건
                </Text>
              </View>

              {/* Bills Passed */}
              <View className="flex-row items-center justify-between">
                <Text className="text-lawmake-caption text-neutral-500">가결 법안</Text>
                <Text className="text-lawmake-footnote font-semibold text-success">
                  {term.billsPassed}건
                </Text>
              </View>

              {/* Pass Rate */}
              {term.billsProposed > 0 && (
                <View className="flex-row items-center justify-between">
                  <Text className="text-lawmake-caption text-neutral-500">가결률</Text>
                  <Text className="text-lawmake-footnote font-semibold text-neutral-600">
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
