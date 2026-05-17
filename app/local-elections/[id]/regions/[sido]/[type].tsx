import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLocalElectionRacesAll } from '@/api/local-elections';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LocalProportionalNotice } from '@/components/LocalProportionalNotice';
import { SigunguPicker } from '@/components/SigunguPicker';
import { PressableCard } from '@/components/ui/Card';
import {
  ballotInfoFor,
  SIGUNGU_SCOPED_TYPES,
  TYPE_LABELS,
} from '@/constants/local-elections';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { useSigunguFilter } from '@/hooks/useSigunguFilter';
import { derivePartyChips } from '@/lib/local-elections-helpers';
import type { LocalElectionType } from '@/types';

const ALL_TYPES = new Set<LocalElectionType>([
  'governor',
  'mayor',
  'superintendent',
  'metro-council',
  'metro-proportional',
  'local-council',
  'local-proportional',
]);

export default function LocalElectionTypeInSidoScreen() {
  const { id, sido, type } = useLocalSearchParams<{
    id: string;
    sido: string;
    type: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const decodedSido = decodeURIComponent(sido);

  if (!ALL_TYPES.has(type as LocalElectionType)) {
    return <EmptyState title="잘못된 선거 종류입니다" />;
  }
  const electionType = type as LocalElectionType;

  const ballot = ballotInfoFor(electionType);
  const isProportional = ballot?.kind === 'party';
  const isNonPartisan = ballot?.kind === 'non-partisan';
  const accent = isProportional ? '#1D4ED8' : isNonPartisan ? '#B45309' : '#737373';
  const isSigunguScoped = SIGUNGU_SCOPED_TYPES.has(electionType);

  const [search, setSearch] = useState('');

  // 무필터 전체 응답 (시군구 chip 목록 + 전체 카운트용)
  const fullParams = { id, type: electionType, sido: decodedSido };
  const { data: fullData } = useLawmakeQuery(getLocalElectionRacesAll, [fullParams], {
    enabled: isSigunguScoped,
  });

  // 시군구 chip 목록 — 전체 응답에서 추출
  const sigunguList = useMemo(() => {
    if (!fullData) return [] as string[];
    const set = new Set<string>();
    for (const r of fullData.races) {
      if (r.sigungu) set.add(r.sigungu);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'));
  }, [fullData]);

  const sigunguFilter = useSigunguFilter({
    sido: decodedSido,
    sigunguList,
    isReady: !!fullData,
  });

  // 단일 sigungu 필터를 backend에 전달 (특정 시군구 chip 선택 시만)
  const backendSigunguFilter =
    isSigunguScoped &&
    sigunguFilter.filter &&
    sigunguFilter.filter !== 'mine'
      ? sigunguFilter.filter
      : undefined;

  const apiParams = {
    id,
    type: electionType,
    sido: decodedSido,
    sigungu: backendSigunguFilter,
    q: search.trim() || undefined,
  };

  const { data, isLoading, error, refetch } = useLawmakeQuery(getLocalElectionRacesAll, [
    apiParams,
  ]);

  // 'mine' 선택 시는 client-side filter (prefix 매칭이 여러 sigungu)
  const displayRaces = useMemo(() => {
    if (!data) return [];
    if (sigunguFilter.filter === 'mine' && sigunguFilter.matchedSigunguSet) {
      const set = sigunguFilter.matchedSigunguSet;
      return data.races.filter((r) => set.has(r.sigungu));
    }
    return data.races;
  }, [data, sigunguFilter.filter, sigunguFilter.matchedSigunguSet]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!data) return <EmptyState title="데이터를 불러올 수 없습니다" />;

  return (
    <View className="flex-1 bg-surface-secondary">
      <Stack.Screen options={{ title: `${decodedSido} ${TYPE_LABELS[electionType]}` }} />

      {/* 페이지 내 헤더 */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-sm pt-lawmake-md">
        <View className="flex-row items-center gap-lawmake-sm">
          {ballot && (
            <View
              className="h-6 w-6 items-center justify-center rounded-full"
              style={{ backgroundColor: accent }}
            >
              <Text className="text-lawmake-caption font-bold text-white">{ballot.number}</Text>
            </View>
          )}
          <Text className="text-lawmake-body font-bold text-neutral-900">
            {TYPE_LABELS[electionType]}
          </Text>
          {isProportional && (
            <Text className="rounded-lawmake-sm bg-info-light px-lawmake-sm py-0.5 text-lawmake-caption font-semibold text-info-dark">
              정당투표
            </Text>
          )}
        </View>
        <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
          {displayRaces.length === data.total
            ? `${data.total}개 선거구`
            : `${displayRaces.length}개 · 전체 ${data.total}개`}
        </Text>
      </View>

      {/* 검색바 — race가 충분히 많을 때 의미 있음 */}
      {isSigunguScoped && data.total > 8 && (
        <View className="bg-surface-primary px-lawmake-lg pb-lawmake-sm">
          <View className="flex-row items-center gap-lawmake-sm rounded-lawmake-md bg-neutral-100 px-lawmake-md py-lawmake-sm">
            <Search size={16} color="#9CA3AF" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="선거구·후보자 이름 검색"
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-lawmake-footnote text-neutral-900"
              returnKeyType="search"
            />
          </View>
        </View>
      )}

      {isSigunguScoped && sigunguList.length > 1 && (
        <SigunguPicker
          sigunguList={sigunguList}
          filter={sigunguFilter.filter}
          onChange={sigunguFilter.setFilter}
          hasMine={sigunguFilter.hasMine}
          myDistrictLabel={sigunguFilter.myDistrictLabel}
        />
      )}

      {electionType === 'local-proportional' && displayRaces.length === 0 && (
        <View className="px-lawmake-lg pt-lawmake-md">
          <LocalProportionalNotice sido={decodedSido} />
        </View>
      )}

      <FlatList
        data={displayRaces}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 16,
          gap: 8,
        }}
        ListEmptyComponent={
          electionType !== 'local-proportional' ? (
            <EmptyState
              title="조건에 맞는 선거구가 없습니다"
              description="시군구 필터 또는 검색어를 바꿔보세요"
            />
          ) : null
        }
        renderItem={({ item }) => {
          const partyChipsResult = isProportional
            ? derivePartyChips(item)
            : { chips: [], isFallback: false, hasMoreParties: false };
          const partyChips = partyChipsResult.chips;
          const isLocalPropEmpty =
            item.electionType === 'local-proportional' && item.candidateCount === 0;

          return (
            <PressableCard
              onPress={() => router.push(`/local-elections/${id}/races/${item.id}` as never)}
              className="p-0"
            >
              <View className="flex-row">
                <View
                  className="w-1 rounded-l-lawmake-lg"
                  style={{ backgroundColor: accent }}
                />
                <View className="flex-1 flex-row items-start justify-between p-lawmake-md">
                  <View className="flex-1 pr-lawmake-sm">
                    <Text className="text-lawmake-callout font-bold text-neutral-900">
                      {item.displayName}
                    </Text>
                    <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-500">
                      {item.sigungu ? `${item.sigungu} · ` : ''}
                      {isProportional
                        ? `${item.candidateCount}명 명부`
                        : `${item.candidateCount}명 출마`}
                      {item.seatCount > 1 ? ` · ${item.seatCount}명 선출` : ''}
                    </Text>

                    {isLocalPropEmpty ? (
                      <Text className="mt-lawmake-sm text-lawmake-caption text-warning-dark">
                        NEC Open API 미제공 — 상세에서 안내 보기
                      </Text>
                    ) : isProportional && partyChips.length > 0 ? (
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
                    ) : !isProportional && item.topCandidates.length > 0 ? (
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
    </View>
  );
}
