import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getVotes, getVoteSummary } from '@/api/votes';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { PressableCard } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { SearchInput } from '@/components/ui/SearchInput';
import { VOTE_RESULT_MAP } from '@/constants/maps';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
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

export default function VotesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [resultCode, setResultCode] = useState('');
  const [page, setPage] = useState(1);

  const { data: summary } = useLawmakeQuery(getVoteSummary, [CURRENT_TERM]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useLawmakeQuery(getVotes, [
    {
      termId: CURRENT_TERM,
      resultCode: resultCode || undefined,
      search: search.trim() || undefined,
      page,
      limit: PAGE_SIZE,
    },
  ]);

  const renderVote = useCallback(
    ({ item }: { item: Vote }) => {
      const result = VOTE_RESULT_MAP[item.resultCode];
      const total = item.yesCount + item.noCount + item.abstainCount;
      const yesPercent = total > 0 ? (item.yesCount / total) * 100 : 0;

      return (
        <PressableCard
          className="mx-5 mb-2"
          onPress={() => router.push(`/votes/${item.id}`)}
        >
          <View className="flex-row items-start justify-between">
            <Text
              className="flex-1 text-sm font-semibold text-neutral-800"
              numberOfLines={2}
            >
              {item.billName}
            </Text>
            <Badge
              label={result.label}
              color={result.color}
              textColor={result.textColor}
              className="ml-2"
            />
          </View>

          {/* Vote Bar */}
          <View className="mt-2.5 h-2 flex-row overflow-hidden rounded-full bg-neutral-100">
            <View
              className="rounded-l-full bg-green-500"
              style={{ width: `${yesPercent}%` }}
            />
            <View
              className="bg-red-500"
              style={{
                width: `${total > 0 ? (item.noCount / total) * 100 : 0}%`,
              }}
            />
            <View
              className="rounded-r-full bg-neutral-300"
              style={{
                width: `${total > 0 ? (item.abstainCount / total) * 100 : 0}%`,
              }}
            />
          </View>

          <View className="mt-1.5 flex-row justify-between">
            <View className="flex-row gap-3">
              <Text className="text-xs text-green-600">찬성 {item.yesCount}</Text>
              <Text className="text-xs text-red-600">반대 {item.noCount}</Text>
              <Text className="text-xs text-neutral-400">기권 {item.abstainCount}</Text>
            </View>
            <Text className="text-xs text-neutral-400">
              {formatDate(item.procDate)}
            </Text>
          </View>
        </PressableCard>
      );
    },
    [router]
  );

  if (isLoading && page === 1) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Summary */}
      {summary && (
        <View className="flex-row bg-white px-5 pb-2 pt-1">
          <Text className="text-xs text-neutral-400">
            전체 {summary.total} | 가결 {summary.passed} | 수정 {summary.amended} | 부결{' '}
            {summary.rejected}
          </Text>
        </View>
      )}

      {/* Search */}
      <View className="bg-white px-5 pb-3">
        <SearchInput
          placeholder="법안명으로 검색"
          value={search}
          onChangeText={(t) => {
            setSearch(t);
            setPage(1);
          }}
          onClear={() => {
            setSearch('');
            setPage(1);
          }}
        />
      </View>

      {/* Result Filters */}
      <View className="bg-white px-5 pb-3">
        <FlatList
          data={RESULT_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 6 }}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              selected={resultCode === item.id}
              onPress={() => {
                setResultCode(item.id);
                setPage(1);
              }}
            />
          )}
        />
      </View>

      {/* Vote List */}
      <FlatList
        data={data?.votes ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderVote}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 16 }}
        onEndReached={() => {
          if (data && data.votes.length < data.total) {
            setPage((p) => p + 1);
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <EmptyState
            title="표결이 없습니다"
            description="검색 조건을 변경해보세요"
          />
        }
      />
    </View>
  );
}
