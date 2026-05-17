import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLocalElectionRegion } from '@/api/local-elections';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SigunguPicker } from '@/components/SigunguPicker';
import { PressableCard } from '@/components/ui/Card';
import {
  BALLOT_ORDER,
  ballotInfoFor,
  SIGUNGU_SCOPED_TYPES,
  TYPE_LABELS,
} from '@/constants/local-elections';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { useSigunguFilter } from '@/hooks/useSigunguFilter';
import type { LocalElectionType } from '@/types';

const TYPE_ORDER: LocalElectionType[] = BALLOT_ORDER.map((b) => b.type);

/** 그룹이 이 개수를 초과하면 기본 접힘 (큰 시도에서 묻히는 그룹 보호) */
const COLLAPSE_THRESHOLD = 8;
/** 접힌 그룹에서 미리 보여주는 카드 개수 */
const COLLAPSED_PREVIEW = 5;

export default function LocalElectionRegionScreen() {
  const { id, sido } = useLocalSearchParams<{ id: string; sido: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const decodedSido = decodeURIComponent(sido);
  const params = { id, sido: decodedSido };

  const { data, isLoading, error, refetch } = useLawmakeQuery(getLocalElectionRegion, [params]);

  // 시군구 chip 목록 — race 데이터에서 unique sigungu 추출 (자치구 단위까지 포함)
  const sigunguList = useMemo(() => {
    if (!data) return [] as string[];
    const set = new Set<string>();
    for (const r of data.races) {
      if (r.sigungu && SIGUNGU_SCOPED_TYPES.has(r.electionType)) set.add(r.sigungu);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'));
  }, [data]);

  const sigunguFilter = useSigunguFilter({
    sido: decodedSido,
    sigunguList,
    isReady: !!data,
  });

  /** 사용자가 명시적으로 펼친 그룹 (큰 그룹의 기본 접힘을 override) */
  const [expandedGroups, setExpandedGroups] = useState<Set<LocalElectionType>>(new Set());

  // 시군구 필터 변경 시 펼침 상태 리셋
  useEffect(() => {
    setExpandedGroups(new Set());
  }, [sigunguFilter.filter]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!data || data.races.length === 0)
    return <EmptyState title="이 지역에 등록된 선거구가 없습니다" />;

  // 시군구 종속 race만 필터링 + 시도 공통은 그대로
  const filteredRaces = data.races.filter((r) => {
    if (!SIGUNGU_SCOPED_TYPES.has(r.electionType)) return true;
    if (!sigunguFilter.matchedSigunguSet) return true;
    return sigunguFilter.matchedSigunguSet.has(r.sigungu);
  });

  const grouped = filteredRaces.reduce<Record<string, typeof data.races>>((acc, race) => {
    if (!acc[race.electionType]) acc[race.electionType] = [];
    acc[race.electionType].push(race);
    return acc;
  }, {});
  const orderedEntries = TYPE_ORDER.filter((t) => grouped[t]).map(
    (t) => [t, grouped[t]] as [LocalElectionType, typeof data.races],
  );

  const totalFiltered = filteredRaces.length;
  const isFiltered = sigunguFilter.matchedSigunguSet !== null;
  const filteredLabel =
    sigunguFilter.filter === 'mine'
      ? sigunguFilter.myDistrictLabel
      : sigunguFilter.filter;

  return (
    <View className="flex-1 bg-surface-secondary">
      {/* 헤더: 시도명 + 카운트 */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-xs pt-lawmake-md">
        <Text className="text-lawmake-title2 text-neutral-900">{decodedSido}</Text>
        {isFiltered ? (
          <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
            <Text className="font-bold text-neutral-900">{filteredLabel}</Text> · {totalFiltered}개
            선거구
            <Text className="text-neutral-400"> · 전체 {data.races.length}개</Text>
          </Text>
        ) : (
          <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
            시군구를 선택하면 내 지역만 볼 수 있어요
            <Text className="text-neutral-400"> · 전체 {data.races.length}개</Text>
          </Text>
        )}
      </View>

      <SigunguPicker
        sigunguList={sigunguList}
        filter={sigunguFilter.filter}
        onChange={sigunguFilter.setFilter}
        hasMine={sigunguFilter.hasMine}
        myDistrictLabel={sigunguFilter.myDistrictLabel}
      />

      <FlatList
        data={orderedEntries}
        keyExtractor={([type]) => type}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 16,
          gap: 16,
        }}
        ListEmptyComponent={
          <EmptyState
            title="선택한 시군구에 해당하는 선거구가 없습니다"
            description="다른 시군구를 선택하거나 전체 보기로 돌아가세요"
          />
        }
        renderItem={({ item: [type, races] }) => {
          const ballot = ballotInfoFor(type);
          const isProportional = ballot?.kind === 'party';
          const isNonPartisan = ballot?.kind === 'non-partisan';
          const isSidoWide = !SIGUNGU_SCOPED_TYPES.has(type);
          const accent = isProportional ? '#1D4ED8' : isNonPartisan ? '#B45309' : '#737373';

          const isCollapsible = races.length > COLLAPSE_THRESHOLD;
          const isExpanded = expandedGroups.has(type);
          const visibleRaces =
            isCollapsible && !isExpanded ? races.slice(0, COLLAPSED_PREVIEW) : races;
          const hiddenCount = races.length - visibleRaces.length;

          const toggleGroup = () =>
            setExpandedGroups((prev) => {
              const next = new Set(prev);
              if (next.has(type)) next.delete(type);
              else next.add(type);
              return next;
            });

          const canNavigate = races.length >= 6;
          const goToTypePage = () =>
            router.push(
              `/local-elections/${id}/regions/${encodeURIComponent(decodedSido)}/${type}` as never,
            );

          const HeaderInner = (
            <>
              {ballot && (
                <View
                  className="h-6 w-6 items-center justify-center rounded-full"
                  style={{ backgroundColor: accent }}
                >
                  <Text className="text-lawmake-caption font-bold text-white">
                    {ballot.number}
                  </Text>
                </View>
              )}
              <View className="flex-1">
                <Text className="text-lawmake-subhead font-bold text-neutral-900">
                  {TYPE_LABELS[type]}
                  <Text className="text-lawmake-footnote font-normal text-neutral-500">
                    {' · '}
                    {races.length}개
                  </Text>
                </Text>
              </View>
              {isSidoWide && isFiltered && (
                <Text className="text-lawmake-caption text-neutral-500">시도 공통</Text>
              )}
              {isProportional && (
                <Text className="rounded-lawmake-sm bg-info-light px-lawmake-sm py-0.5 text-lawmake-caption font-semibold text-info-dark">
                  정당투표
                </Text>
              )}
              {canNavigate && (
                <>
                  <Text className="text-lawmake-caption font-semibold text-neutral-600">
                    전체 보기
                  </Text>
                  <ChevronRight size={14} color="#525252" />
                </>
              )}
            </>
          );

          return (
            <View>
              {/* 그룹 헤더 — race가 많으면 페이지 이동 */}
              {canNavigate ? (
                <Pressable
                  onPress={goToTypePage}
                  className="flex-row items-center gap-lawmake-sm rounded-lawmake-md bg-neutral-100 px-lawmake-md py-lawmake-sm active:bg-neutral-200"
                >
                  {HeaderInner}
                </Pressable>
              ) : (
                <View className="flex-row items-center gap-lawmake-sm rounded-lawmake-md bg-neutral-100 px-lawmake-md py-lawmake-sm">
                  {HeaderInner}
                </View>
              )}

              <View className="mt-lawmake-sm gap-lawmake-sm">
                {visibleRaces.map((race) => (
                  <PressableCard
                    key={race.id}
                    onPress={() =>
                      router.push(`/local-elections/${id}/races/${race.id}` as never)
                    }
                    className="p-0"
                  >
                    <View className="flex-row">
                      <View
                        className="w-1 rounded-l-lawmake-lg"
                        style={{ backgroundColor: accent }}
                      />
                      <View className="flex-1 flex-row items-center justify-between p-lawmake-md">
                        <View className="flex-1 pr-lawmake-sm">
                          <Text className="text-lawmake-callout font-bold text-neutral-900">
                            {race.displayName}
                          </Text>
                          <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-500">
                            {isProportional
                              ? `${race.candidateCount}명 명부`
                              : `후보자 ${race.candidateCount}명`}
                            {race.seatCount > 1 ? ` · ${race.seatCount}명 선출` : ''}
                          </Text>
                        </View>
                        <ChevronRight size={18} color="#A3A3A3" />
                      </View>
                    </View>
                  </PressableCard>
                ))}

                {isCollapsible && (
                  <Pressable
                    onPress={toggleGroup}
                    className="flex-row items-center justify-center gap-lawmake-xs rounded-lawmake-md border border-neutral-200 bg-surface-primary py-lawmake-sm active:bg-neutral-50"
                  >
                    <Text className="text-lawmake-footnote font-semibold text-neutral-700">
                      {isExpanded ? '간단히 보기' : `${hiddenCount}개 더 보기`}
                    </Text>
                    {isExpanded ? (
                      <ChevronUp size={14} color="#404040" />
                    ) : (
                      <ChevronDown size={14} color="#404040" />
                    )}
                  </Pressable>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
