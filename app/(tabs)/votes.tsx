import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getVotes, getVoteSummary } from '@/api/votes';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PressableCard } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusBadge, type StatusTone } from '@/components/ui/StatusBadge';
import { useLawmakeInfiniteQuery, useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { formatDate } from '@/lib/format';
import type { Vote } from '@/types';

const CURRENT_TERM = 22;
const PAGE_SIZE = 20;

const RESULT_FILTERS = [
  { id: '', label: '전체' },
  { id: 'passed', label: '원안가결' },
  { id: 'amended', label: '수정가결' },
  { id: 'rejected', label: '부결' },
  { id: 'discarded', label: '폐기' },
];

const VOTE_RESULT_TONE: Record<string, { label: string; tone: StatusTone }> = {
  passed: { label: '원안가결', tone: 'success' },
  amended: { label: '수정가결', tone: 'info' },
  rejected: { label: '부결', tone: 'error' },
  discarded: { label: '폐기', tone: 'neutral' },
  other: { label: '기타', tone: 'neutral' },
};

export default function VotesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [resultCode, setResultCode] = useState('');

  const { data: summary } = useLawmakeQuery(getVoteSummary, [CURRENT_TERM]);

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLawmakeInfiniteQuery(
    getVotes,
    ({ pageParam }) => [
      {
        termId: CURRENT_TERM,
        resultCode: resultCode || undefined,
        search: search.trim() || undefined,
        page: pageParam,
        limit: PAGE_SIZE,
      },
    ] as const,
    {
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        const loaded = allPages.reduce((sum, p) => sum + p.votes.length, 0);
        return loaded < lastPage.total ? allPages.length + 1 : undefined;
      },
    },
  );

  const votes = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.votes) ?? [];
    const seen = new Set<string>();
    return all.filter((v) => {
      if (seen.has(v.id)) return false;
      seen.add(v.id);
      return true;
    });
  }, [data]);

  const renderVote = useCallback(
    ({ item }: { item: Vote }) => {
      const result = VOTE_RESULT_TONE[item.resultCode] ?? VOTE_RESULT_TONE.other;
      const total = item.yesCount + item.noCount + item.abstainCount;
      const yesPercent = total > 0 ? (item.yesCount / total) * 100 : 0;
      const noPercent = total > 0 ? (item.noCount / total) * 100 : 0;
      const abstainPercent = total > 0 ? (item.abstainCount / total) * 100 : 0;

      return (
        <PressableCard
          className="mx-lawmake-lg mb-lawmake-sm"
          onPress={() => router.push(`/votes/${item.id}`)}
        >
          <View className="flex-row items-start justify-between gap-lawmake-sm">
            <Text
              className="flex-1 text-lawmake-callout font-semibold text-neutral-900"
              numberOfLines={2}
            >
              {item.billName}
            </Text>
            <StatusBadge label={result.label} tone={result.tone} />
          </View>

          {/* Vote Bar */}
          <View className="mt-lawmake-md h-2 flex-row overflow-hidden rounded-full bg-neutral-100">
            <View className="h-full bg-success" style={{ width: `${yesPercent}%` }} />
            <View className="h-full bg-error" style={{ width: `${noPercent}%` }} />
            <View className="h-full bg-neutral-300" style={{ width: `${abstainPercent}%` }} />
          </View>

          <View className="mt-lawmake-sm flex-row justify-between">
            <View className="flex-row gap-lawmake-md">
              <Text className="text-lawmake-footnote font-medium text-success-dark">
                찬성 {item.yesCount}
              </Text>
              <Text className="text-lawmake-footnote font-medium text-error-dark">
                반대 {item.noCount}
              </Text>
              <Text className="text-lawmake-footnote text-neutral-500">
                기권 {item.abstainCount}
              </Text>
            </View>
            <Text className="text-lawmake-caption text-neutral-400">
              {formatDate(item.procDate)}
            </Text>
          </View>
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
        <Text className="text-lawmake-large text-neutral-900">표결</Text>
      </View>

      {/* Search */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-md">
        <SearchInput
          placeholder="법안명으로 검색"
          value={search}
          onChangeText={(t) => setSearch(t)}
          onClear={() => setSearch('')}
        />
      </View>

      {/* Result Filters */}
      <View className="bg-surface-primary pb-lawmake-md">
        <FlatList
          data={RESULT_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: 8,
          }}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              selected={resultCode === item.id}
              onPress={() => setResultCode(item.id)}
            />
          )}
        />
      </View>

      {/* Summary */}
      {summary && (
        <View className="border-t border-neutral-100 bg-surface-secondary px-lawmake-lg py-lawmake-sm">
          <Text className="text-lawmake-footnote text-neutral-500">
            전체 {summary.total} · 가결 {summary.passed} · 수정 {summary.amended} · 부결{' '}
            {summary.rejected}
          </Text>
        </View>
      )}

      {/* Vote List */}
      <FlatList
        data={votes}
        keyExtractor={(item) => item.id}
        renderItem={renderVote}
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
          <EmptyState title="표결이 없습니다" description="검색 조건을 변경해보세요" />
        }
      />
    </View>
  );
}
