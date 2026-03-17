import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getBills, getBillSummary } from '@/api/bills';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { PressableCard } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { SearchInput } from '@/components/ui/SearchInput';
import { BILL_STATUS_MAP } from '@/constants/maps';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
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

export default function BillsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data: summary } = useLawmakeQuery(getBillSummary, [CURRENT_TERM]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useLawmakeQuery(getBills, [
    {
      termId: CURRENT_TERM,
      status: status || undefined,
      search: search.trim() || undefined,
      page,
      limit: PAGE_SIZE,
    },
  ]);

  const renderBill = useCallback(
    ({ item }: { item: Bill }) => {
      const statusInfo = BILL_STATUS_MAP[item.status];
      return (
        <PressableCard
          className="mx-5 mb-2"
          onPress={() => router.push(`/bills/${item.id}`)}
        >
          <View className="flex-row items-start justify-between">
            <Text
              className="flex-1 text-sm font-semibold text-neutral-800"
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Badge
              label={statusInfo.label}
              color={statusInfo.color}
              textColor={statusInfo.textColor}
              className="ml-2"
            />
          </View>
          <Text className="mt-1.5 text-xs text-neutral-400">
            {item.proposerName}
            {item.coProposerCount > 0 ? ` 외 ${item.coProposerCount}인` : ''} |{' '}
            {formatDate(item.proposedDate)}
          </Text>
          {item.simpleSummary && (
            <Text
              className="mt-1.5 text-xs leading-4 text-neutral-500"
              numberOfLines={2}
            >
              {item.simpleSummary}
            </Text>
          )}
          {item.topic && (
            <View className="mt-2">
              <Badge label={item.topic} />
            </View>
          )}
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
            전체 {summary.total} | 가결 {summary.passed} | 계류 {summary.pending} | 폐기{' '}
            {summary.discarded}
          </Text>
        </View>
      )}

      {/* Search */}
      <View className="bg-white px-5 pb-3">
        <SearchInput
          placeholder="법안명 검색"
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

      {/* Status Filters */}
      <View className="bg-white px-5 pb-3">
        <FlatList
          data={STATUS_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 6 }}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              selected={status === item.id}
              onPress={() => {
                setStatus(item.id);
                setPage(1);
              }}
            />
          )}
        />
      </View>

      {/* Bill List */}
      <FlatList
        data={data?.bills ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderBill}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 16 }}
        onEndReached={() => {
          if (data && data.bills.length < data.total) {
            setPage((p) => p + 1);
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <EmptyState
            title="법안이 없습니다"
            description="검색 조건을 변경해보세요"
          />
        }
      />
    </View>
  );
}
