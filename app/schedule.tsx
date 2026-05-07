import { useRouter } from 'expo-router';
import { CalendarDays } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getSchedules } from '@/api/schedules';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { formatDate } from '@/lib/format';
import type { Schedule } from '@/types';
import { Linking } from 'react-native';

const CURRENT_TERM = 22;

const TYPE_FILTERS = [
  { id: '', label: '전체' },
  { id: 'plenary', label: '본회의' },
  { id: 'committee', label: '위원회' },
];

export default function ScheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useLawmakeQuery(getSchedules, [
    { termId: CURRENT_TERM, type: type || undefined, page, limit: 30 },
  ]);

  const renderSchedule = useCallback(
    ({ item }: { item: Schedule }) => (
      <Card className="mx-lawmake-lg mb-lawmake-sm">
        <View className="flex-row items-start gap-lawmake-sm">
          <View className="h-10 w-10 items-center justify-center rounded-lawmake-md bg-primary-light">
            <CalendarDays size={18} color="#2563EB" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-lawmake-xs">
              <Badge
                label={item.type === 'plenary' ? '본회의' : '위원회'}
                color={item.type === 'plenary' ? '#111111' : '#E5E5E5'}
                textColor={item.type === 'plenary' ? '#FFFFFF' : '#595959'}
              />
              {item.committeeName && item.type === 'committee' && (
                <Text className="text-lawmake-caption text-neutral-400">
                  {item.committeeName}
                </Text>
              )}
            </View>
            <Text className="mt-lawmake-xs text-lawmake-footnote font-semibold text-neutral-800">
              {item.title || item.committeeName}
            </Text>
            <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">
              {formatDate(item.meetingDate)} {item.meetingTime}
            </Text>
            {item.agenda && (
              <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-500" numberOfLines={2}>
                {item.agenda}
              </Text>
            )}
            {item.linkUrl && (
              <Pressable
                className="mt-lawmake-xs"
                onPress={() => Linking.openURL(item.linkUrl)}
              >
                <Text className="text-lawmake-caption text-primary">상세보기</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Card>
    ),
    []
  );

  if (isLoading && page === 1) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <View className="flex-1 bg-surface-secondary">
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-sm pt-lawmake-md">
        <Text className="text-lawmake-title2 font-bold text-neutral-900">국회 일정</Text>
      </View>

      {/* Type Filter */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-sm">
        <FlatList
          data={TYPE_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 6 }}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              selected={type === item.id}
              onPress={() => {
                setType(item.id);
                setPage(1);
              }}
            />
          )}
        />
      </View>

      <FlatList
        data={data?.schedules ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderSchedule}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 16 }}
        ListEmptyComponent={
          <EmptyState title="예정된 일정이 없습니다" icon={CalendarDays} />
        }
      />
    </View>
  );
}
