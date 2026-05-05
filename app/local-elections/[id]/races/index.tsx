import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight, Search } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLocalElectionRaces } from '@/api/local-elections';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, PressableCard } from '@/components/ui/Card';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import type { LocalElectionType } from '@/types';

const TYPE_LABELS: Record<LocalElectionType, string> = {
  governor: '광역단체장',
  mayor: '기초단체장',
  superintendent: '교육감',
  'metro-council': '광역의원',
  'local-council': '기초의원',
};

const TYPE_FILTERS: { id: LocalElectionType | 'all'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'governor', label: '광역단체장' },
  { id: 'mayor', label: '기초단체장' },
  { id: 'superintendent', label: '교육감' },
  { id: 'metro-council', label: '광역의원' },
  { id: 'local-council', label: '기초의원' },
];

export default function LocalElectionRaceListScreen() {
  const { id, type: initialType, sido: initialSido } = useLocalSearchParams<{
    id: string;
    type?: LocalElectionType;
    sido?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [typeFilter, setTypeFilter] = useState<LocalElectionType | 'all'>(initialType ?? 'all');
  const [search, setSearch] = useState('');

  const params = {
    id,
    type: typeFilter === 'all' ? undefined : typeFilter,
    sido: initialSido,
    q: search.trim() || undefined,
    limit: 50,
  };

  const { data, isLoading, error, refetch } = useLawmakeQuery(getLocalElectionRaces, [params]);

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Search + filters */}
      <View className="bg-white px-5 pt-3 pb-2">
        <View className="flex-row items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2.5">
          <Search size={16} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="선거구·후보자 이름 검색"
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-sm text-neutral-900"
          />
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 10 }}
          data={TYPE_FILTERS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const active = typeFilter === item.id;
            return (
              <Pressable
                onPress={() => setTypeFilter(item.id)}
                className={`rounded-full border px-3.5 py-1.5 ${
                  active
                    ? 'border-rose-500 bg-rose-500'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    active ? 'text-white' : 'text-neutral-600'
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : !data || data.races.length === 0 ? (
        <EmptyState title="검색 결과가 없습니다" description="필터 조건을 바꿔보세요" />
      ) : (
        <FlatList
          data={data.races}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16, gap: 8 }}
          ListHeaderComponent={
            <Text className="mb-2 text-xs text-neutral-500">총 {data.total}개 선거구</Text>
          }
          renderItem={({ item }) => (
            <PressableCard
              onPress={() => router.push(`/local-elections/${id}/races/${item.id}` as never)}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-[10px] font-semibold text-rose-500">
                    {TYPE_LABELS[item.electionType]}
                  </Text>
                  <Text className="mt-0.5 text-sm font-bold text-neutral-900">
                    {item.displayName}
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-neutral-500">
                    {item.sido}
                    {item.sigungu ? ` ${item.sigungu}` : ''}
                  </Text>
                  {item.topCandidates.length > 0 && (
                    <View className="mt-2 flex-row flex-wrap gap-1.5">
                      {item.topCandidates.map((c) => (
                        <View
                          key={c.id}
                          className="rounded-md bg-neutral-100 px-1.5 py-0.5"
                        >
                          <Text className="text-[10px] text-neutral-700">
                            {c.candidateNumber ? `${c.candidateNumber}. ` : ''}
                            {c.name}
                            {c.party ? ` (${c.party.shortName})` : ''}
                          </Text>
                        </View>
                      ))}
                      {item.candidateCount > item.topCandidates.length && (
                        <Text className="text-[10px] text-neutral-500">
                          +{item.candidateCount - item.topCandidates.length}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
                <ChevronRight size={18} color="#9CA3AF" />
              </View>
            </PressableCard>
          )}
        />
      )}
    </View>
  );
}
