import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight, Search } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLocalElectionRaces } from '@/api/local-elections';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PressableCard } from '@/components/ui/Card';
import { ballotInfoFor, SIDO_LIST, TYPE_LABELS } from '@/constants/local-elections';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { derivePartyChips } from '@/lib/local-elections-helpers';
import type { LocalElectionType } from '@/types';

const TYPE_FILTERS: { id: LocalElectionType | 'all'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'governor', label: '광역단체장' },
  { id: 'superintendent', label: '교육감' },
  { id: 'metro-council', label: '광역의원' },
  { id: 'metro-proportional', label: '광역의원 비례' },
  { id: 'mayor', label: '기초단체장' },
  { id: 'local-council', label: '기초의원' },
  { id: 'local-proportional', label: '기초의원 비례' },
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
  const [sidoFilter, setSidoFilter] = useState<string | undefined>(initialSido);
  const [search, setSearch] = useState('');

  const params = {
    id,
    type: typeFilter === 'all' ? undefined : typeFilter,
    sido: sidoFilter,
    q: search.trim() || undefined,
    limit: 50,
  };

  const { data, isLoading, error, refetch } = useLawmakeQuery(getLocalElectionRaces, [params]);

  return (
    <View className="flex-1 bg-surface-secondary">
      {/* Search + filters */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-sm pt-lawmake-md">
        <View className="flex-row items-center gap-lawmake-sm rounded-lawmake-md bg-neutral-100 px-lawmake-md py-lawmake-sm">
          <Search size={16} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="선거구·후보자 이름 검색"
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-lawmake-body text-neutral-900"
          />
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingTop: 12, paddingBottom: 4 }}
          data={TYPE_FILTERS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const active = typeFilter === item.id;
            return (
              <Pressable
                onPress={() => setTypeFilter(item.id)}
                className={`rounded-full border px-lawmake-md py-lawmake-sm ${
                  active
                    ? 'border-primary bg-primary'
                    : 'border-neutral-200 bg-surface-primary'
                }`}
              >
                <Text
                  className={`text-lawmake-footnote font-semibold ${
                    active ? 'text-white' : 'text-neutral-600'
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6, paddingTop: 4, paddingBottom: 8 }}
          data={[{ id: undefined as string | undefined, short: '전국' }, ...SIDO_LIST]}
          keyExtractor={(item) => item.id ?? 'all'}
          renderItem={({ item }) => {
            const active = sidoFilter === item.id;
            return (
              <Pressable
                onPress={() => setSidoFilter(item.id)}
                className={`rounded-full border px-lawmake-md py-1 ${
                  active
                    ? 'border-neutral-900 bg-neutral-900'
                    : 'border-neutral-200 bg-surface-primary'
                }`}
              >
                <Text
                  className={`text-lawmake-caption font-medium ${
                    active ? 'text-white' : 'text-neutral-600'
                  }`}
                >
                  {item.short}
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
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 16,
            gap: 8,
          }}
          ListHeaderComponent={
            <Text className="mb-lawmake-sm text-lawmake-footnote text-neutral-500">
              총 {data.total}개 선거구
            </Text>
          }
          renderItem={({ item }) => {
            const ballot = ballotInfoFor(item.electionType);
            const isProportional = ballot?.kind === 'party';
            const isNonPartisan = ballot?.kind === 'non-partisan';
            const isLocalPropEmpty =
              item.electionType === 'local-proportional' && item.candidateCount === 0;
            const partyChipsResult = isProportional
              ? derivePartyChips(item)
              : { chips: [], isFallback: false, hasMoreParties: false };
            const partyChips = partyChipsResult.chips;

            const stripeColor = isProportional
              ? '#1D4ED8'
              : isNonPartisan
                ? '#B45309'
                : '#737373';

            return (
              <PressableCard
                onPress={() => router.push(`/local-elections/${id}/races/${item.id}` as never)}
                className="p-0"
              >
                <View className="flex-row">
                  <View className="w-1 rounded-l-lawmake-lg" style={{ backgroundColor: stripeColor }} />
                  <View className="flex-1 flex-row items-start justify-between p-lawmake-md">
                    <View className="flex-1 pr-lawmake-sm">
                      <View className="flex-row items-center gap-lawmake-xs">
                        {ballot && (
                          <View className="h-5 w-5 items-center justify-center rounded-full bg-neutral-100">
                            <Text className="text-lawmake-caption font-bold text-neutral-700">
                              {ballot.number}
                            </Text>
                          </View>
                        )}
                        <Text className="text-lawmake-caption font-semibold text-neutral-600">
                          {TYPE_LABELS[item.electionType]}
                        </Text>
                        {isProportional && (
                          <Text className="rounded-lawmake-sm bg-info-light px-lawmake-xs py-0.5 text-lawmake-caption font-semibold text-info-dark">
                            정당투표
                          </Text>
                        )}
                      </View>
                      <Text className="mt-lawmake-xs text-lawmake-callout font-bold text-neutral-900">
                        {item.displayName}
                      </Text>
                      <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-500">
                        {item.sido}
                        {item.sigungu ? ` ${item.sigungu}` : ''}
                        {' · '}
                        {isProportional
                          ? `${item.candidateCount}명 명부`
                          : `${item.candidateCount}명 출마`}
                      </Text>

                      {isLocalPropEmpty ? (
                        <Text className="mt-lawmake-sm text-lawmake-caption text-warning-dark">
                          NEC Open API 미제공 — 상세에서 안내 보기
                        </Text>
                      ) : isProportional ? (
                        partyChips.length > 0 ? (
                          <View className="mt-lawmake-sm">
                            <View className="flex-row flex-wrap gap-lawmake-xs">
                              {partyChips.map((c) => (
                                <View
                                  key={c.key}
                                  className="flex-row items-center gap-lawmake-xs rounded-lawmake-sm bg-neutral-100 px-lawmake-sm py-0.5"
                                >
                                  <View
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: c.color }}
                                  />
                                  <Text className="text-lawmake-caption text-neutral-700">
                                    {c.label}
                                  </Text>
                                </View>
                              ))}
                            </View>
                            {partyChipsResult.isFallback && partyChipsResult.hasMoreParties && (
                              <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">
                                일부 정당만 표시 — 상세에서 전체 명부 확인
                              </Text>
                            )}
                          </View>
                        ) : (
                          <Text className="mt-lawmake-sm text-lawmake-caption text-neutral-400">
                            정당별 명부 집계 중
                          </Text>
                        )
                      ) : item.topCandidates.length > 0 ? (
                        <View className="mt-lawmake-sm flex-row flex-wrap gap-lawmake-xs">
                          {item.topCandidates.map((c) => (
                            <View
                              key={c.id}
                              className="rounded-lawmake-sm bg-neutral-100 px-lawmake-sm py-0.5"
                            >
                              <Text className="text-lawmake-caption text-neutral-700">
                                {c.candidateNumber ? `${c.candidateNumber}. ` : ''}
                                {c.name}
                                {c.party ? ` (${c.party.shortName})` : ''}
                              </Text>
                            </View>
                          ))}
                          {item.candidateCount > item.topCandidates.length && (
                            <Text className="text-lawmake-caption text-neutral-500">
                              +{item.candidateCount - item.topCandidates.length}
                            </Text>
                          )}
                        </View>
                      ) : null}
                    </View>
                    <View className="pt-0.5">
                      <ChevronRight size={18} color="#A3A3A3" />
                    </View>
                  </View>
                </View>
              </PressableCard>
            );
          }}
        />
      )}
    </View>
  );
}
