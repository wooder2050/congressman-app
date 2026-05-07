import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getBills, getBillSummary } from '@/api/bills';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { PressableCard } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusBadge, type StatusTone } from '@/components/ui/StatusBadge';
import { useLawmakeInfiniteQuery, useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { formatDate } from '@/lib/format';
import type { Bill } from '@/types';

const CURRENT_TERM = 22;
const PAGE_SIZE = 20;

const STATUS_FILTERS = [
  { id: '', label: '전체' },
  { id: 'pending', label: '계류' },
  { id: 'passed', label: '가결' },
  { id: 'committee', label: '위원회' },
  { id: 'discarded', label: '폐기' },
];

const BILL_STATUS_TONE: Record<Bill['status'], { label: string; tone: StatusTone }> = {
  passed: { label: '가결', tone: 'success' },
  pending: { label: '계류', tone: 'neutral' },
  discarded: { label: '폐기', tone: 'error' },
  committee: { label: '위원회', tone: 'info' },
};

export default function BillsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data: summary } = useLawmakeQuery(getBillSummary, [CURRENT_TERM]);

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLawmakeInfiniteQuery(
    getBills,
    ({ pageParam }) => [
      {
        termId: CURRENT_TERM,
        status: status || undefined,
        search: search.trim() || undefined,
        page: pageParam,
        limit: PAGE_SIZE,
      },
    ] as const,
    {
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        const loaded = allPages.reduce((sum, p) => sum + p.bills.length, 0);
        return loaded < lastPage.total ? allPages.length + 1 : undefined;
      },
    },
  );

  const bills = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.bills) ?? [];
    const seen = new Set<string>();
    return all.filter((b) => {
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });
  }, [data]);

  const renderBill = useCallback(
    ({ item }: { item: Bill }) => {
      const statusInfo = BILL_STATUS_TONE[item.status] ?? BILL_STATUS_TONE.pending;
      return (
        <PressableCard
          className="mx-lawmake-lg mb-lawmake-sm"
          onPress={() => router.push(`/bills/${item.id}`)}
        >
          <View className="flex-row items-start justify-between gap-lawmake-sm">
            <Text
              className="flex-1 text-lawmake-callout font-semibold leading-snug text-neutral-900"
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <View className="shrink-0 pt-0.5">
              <StatusBadge label={statusInfo.label} tone={statusInfo.tone} />
            </View>
          </View>
          <Text className="mt-lawmake-sm text-lawmake-footnote text-neutral-500">
            {item.proposerName}
            {item.coProposerCount > 0 ? ` 외 ${item.coProposerCount}인` : ''} ·{' '}
            {formatDate(item.proposedDate)}
          </Text>
          {item.simpleSummary && (
            <Text
              className="mt-lawmake-sm text-lawmake-footnote text-neutral-600"
              numberOfLines={2}
            >
              {item.simpleSummary}
            </Text>
          )}
          {item.topic && (
            <View className="mt-lawmake-sm">
              <Badge label={item.topic} />
            </View>
          )}
        </PressableCard>
      );
    },
    [router],
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <View className="flex-1 bg-surface-secondary" style={{ paddingTop: insets.top }}>
      {/* Large Title */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-sm pt-lawmake-sm">
        <Text className="text-lawmake-large text-neutral-900">법안</Text>
      </View>

      {/* Search */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-md">
        <SearchInput
          placeholder="법안명 검색"
          value={search}
          onChangeText={(t) => setSearch(t)}
          onClear={() => setSearch('')}
        />
      </View>

      {/* Status Filters */}
      <View className="bg-surface-primary pb-lawmake-md">
        <FlatList
          data={STATUS_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingLeft: 16,
            paddingRight: 24,
            gap: 8,
          }}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              selected={status === item.id}
              onPress={() => setStatus(item.id)}
            />
          )}
        />
      </View>

      {/* Summary */}
      {summary && (
        <View className="border-t border-neutral-100 bg-surface-secondary px-lawmake-lg py-lawmake-sm">
          <Text className="text-lawmake-footnote text-neutral-500">
            전체 {summary.total} · 가결 {summary.passed} · 계류 {summary.pending} · 폐기{' '}
            {summary.discarded}
          </Text>
        </View>
      )}

      {/* Bill List */}
      <FlatList
        data={bills}
        keyExtractor={(item) => item.id}
        renderItem={renderBill}
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: insets.bottom + 16,
        }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color="#2563EB" style={{ paddingVertical: 16 }} />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState title="법안이 없습니다" description="검색 조건을 변경해보세요" />
        }
      />
    </View>
  );
}
