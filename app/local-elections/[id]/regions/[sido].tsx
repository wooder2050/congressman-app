import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown, ChevronRight, ChevronUp, MapPin, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLocalElectionRegion } from '@/api/local-elections';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PressableCard } from '@/components/ui/Card';
import {
  BALLOT_ORDER,
  ballotInfoFor,
  parseMemberDistrict,
  SIGUNGU_SCOPED_TYPES,
} from '@/constants/local-elections';
import { useUserPreferences } from '@/hooks/useBookmarks';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import type { LocalElectionType } from '@/types';

const TYPE_LABELS: Record<LocalElectionType, string> = {
  governor: '광역단체장',
  mayor: '기초단체장',
  superintendent: '교육감',
  'metro-council': '광역의원',
  'metro-proportional': '광역의원 비례',
  'local-council': '기초의원',
  'local-proportional': '기초의원 비례',
};

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
  const { data: prefs } = useUserPreferences();

  // my-district에서 추정한 시군구 (이 sido와 일치하는 경우만)
  const myDistrictSigungu = useMemo(() => {
    if (!prefs?.district) return undefined;
    const parsed = parseMemberDistrict(prefs.district);
    return parsed.sido === decodedSido ? parsed.sigungu : undefined;
  }, [prefs?.district, decodedSido]);

  // 시군구 chip 목록 — race 데이터에서 unique sigungu 추출 (자치구 단위까지 포함)
  const sigunguList = useMemo(() => {
    if (!data) return [] as string[];
    const set = new Set<string>();
    for (const r of data.races) {
      if (r.sigungu && SIGUNGU_SCOPED_TYPES.has(r.electionType)) set.add(r.sigungu);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'));
  }, [data]);

  // "내 시군구"가 chip 리스트에 존재하면 prefix 매칭한 값들 미리 계산
  const myMatchingSigungu = useMemo(() => {
    if (!myDistrictSigungu) return [] as string[];
    return sigunguList.filter((s) => s.startsWith(myDistrictSigungu));
  }, [myDistrictSigungu, sigunguList]);

  const [sigunguFilter, setSigunguFilter] = useState<string | 'mine' | undefined>(
    myMatchingSigungu.length > 0 ? 'mine' : undefined,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  /** 사용자가 명시적으로 펼친 그룹 (큰 그룹의 기본 접힘을 override) */
  const [expandedGroups, setExpandedGroups] = useState<Set<LocalElectionType>>(new Set());

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!data || data.races.length === 0)
    return <EmptyState title="이 지역에 등록된 선거구가 없습니다" />;

  // 활성 필터에 맞는 시군구 집합
  const activeSigungus =
    sigunguFilter === 'mine'
      ? new Set(myMatchingSigungu)
      : sigunguFilter
        ? new Set([sigunguFilter])
        : null;

  // 시군구 종속 race만 필터링 + 시도 공통은 그대로
  const filteredRaces = data.races.filter((r) => {
    if (!SIGUNGU_SCOPED_TYPES.has(r.electionType)) return true; // 시도 공통은 항상
    if (!activeSigungus) return true;
    return activeSigungus.has(r.sigungu);
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
  const isFiltered = activeSigungus !== null;
  const filteredLabel =
    sigunguFilter === 'mine'
      ? myDistrictSigungu
      : sigunguFilter;

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

      {/* 시군구 chip 가로 스크롤 (sticky 헤더 아래) */}
      <View className="bg-surface-primary pb-lawmake-sm">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}
          data={[
            { id: undefined as string | 'mine' | undefined, label: '전체' },
            ...(myMatchingSigungu.length > 0
              ? [{ id: 'mine' as const, label: `내 시군구 (${myDistrictSigungu})` }]
              : []),
            ...sigunguList.map((s) => ({ id: s, label: s })),
          ]}
          keyExtractor={(item) => String(item.id ?? 'all')}
          renderItem={({ item }) => {
            const active = sigunguFilter === item.id;
            const isMine = item.id === 'mine';
            return (
              <Pressable
                onPress={() => {
                  setSigunguFilter(item.id);
                  setExpandedGroups(new Set());
                }}
                className={`flex-row items-center gap-lawmake-xs rounded-full border px-lawmake-md py-1 ${
                  active
                    ? 'border-neutral-900 bg-neutral-900'
                    : isMine
                      ? 'border-primary bg-primary-light'
                      : 'border-neutral-200 bg-surface-primary'
                }`}
              >
                {isMine && <MapPin size={12} color={active ? '#FFFFFF' : '#2563EB'} />}
                <Text
                  className={`text-lawmake-caption font-medium ${
                    active
                      ? 'text-white'
                      : isMine
                        ? 'text-primary'
                        : 'text-neutral-600'
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
          ListFooterComponent={
            sigunguList.length > 8 ? (
              <Pressable
                onPress={() => setPickerOpen(true)}
                className="ml-lawmake-xs flex-row items-center gap-lawmake-xs rounded-full border border-neutral-300 bg-surface-primary px-lawmake-md py-1"
              >
                <Text className="text-lawmake-caption font-medium text-neutral-700">
                  전체 {sigunguList.length}개 +
                </Text>
              </Pressable>
            ) : null
          }
        />
      </View>

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
              {canNavigate && <ChevronRight size={16} color="#525252" />}
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
                      {isExpanded
                        ? '간단히 보기'
                        : `${hiddenCount}개 더 보기`}
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

      {/* 시군구 picker bottom sheet */}
      <Modal
        visible={pickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View
            className="rounded-t-lawmake-xl bg-surface-primary"
            style={{ maxHeight: '80%', paddingBottom: insets.bottom + 8 }}
          >
            <View className="flex-row items-center justify-between border-b border-neutral-100 px-lawmake-lg py-lawmake-md">
              <Text className="text-lawmake-headline font-bold text-neutral-900">
                시군구 선택
              </Text>
              <Pressable onPress={() => setPickerOpen(false)} hitSlop={8}>
                <X size={20} color="#525252" />
              </Pressable>
            </View>
            <FlatList
              data={[
                { id: undefined as string | 'mine' | undefined, label: '전체' },
                ...(myMatchingSigungu.length > 0
                  ? [
                      {
                        id: 'mine' as const,
                        label: `내 시군구 (${myDistrictSigungu})`,
                      },
                    ]
                  : []),
                ...sigunguList.map((s) => ({ id: s, label: s })),
              ]}
              keyExtractor={(item) => String(item.id ?? 'all')}
              contentContainerStyle={{ paddingVertical: 4 }}
              renderItem={({ item }) => {
                const active = sigunguFilter === item.id;
                const isMine = item.id === 'mine';
                return (
                  <Pressable
                    onPress={() => {
                      setSigunguFilter(item.id);
                      setExpandedGroups(new Set());
                      setPickerOpen(false);
                    }}
                    className={`flex-row items-center justify-between px-lawmake-lg py-lawmake-md active:bg-neutral-50 ${
                      active ? 'bg-primary-light' : ''
                    }`}
                  >
                    <View className="flex-row items-center gap-lawmake-sm">
                      {isMine && <MapPin size={14} color="#2563EB" />}
                      <Text
                        className={`text-lawmake-body ${
                          active
                            ? 'font-bold text-primary'
                            : 'text-neutral-900'
                        }`}
                      >
                        {item.label}
                      </Text>
                    </View>
                    {active && (
                      <Text className="text-lawmake-caption font-semibold text-primary">
                        선택됨
                      </Text>
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
