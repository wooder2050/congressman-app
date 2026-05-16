import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight, MapPin, Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLocalElectionRacesAll } from '@/api/local-elections';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LocalProportionalNotice } from '@/components/LocalProportionalNotice';
import { PressableCard } from '@/components/ui/Card';
import {
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

  // 잘못된 type 가드
  if (!ALL_TYPES.has(type as LocalElectionType)) {
    return <EmptyState title="잘못된 선거 종류입니다" />;
  }
  const electionType = type as LocalElectionType;

  const ballot = ballotInfoFor(electionType);
  const isProportional = ballot?.kind === 'party';
  const isNonPartisan = ballot?.kind === 'non-partisan';
  const accent = isProportional ? '#1D4ED8' : isNonPartisan ? '#B45309' : '#737373';
  const isSigunguScoped = SIGUNGU_SCOPED_TYPES.has(electionType);

  const { data: prefs } = useUserPreferences();

  // my-district 매칭
  const myDistrictSigungu = useMemo(() => {
    if (!prefs?.district) return undefined;
    const parsed = parseMemberDistrict(prefs.district);
    return parsed.sido === decodedSido ? parsed.sigungu : undefined;
  }, [prefs?.district, decodedSido]);

  const [search, setSearch] = useState('');
  const [sigunguFilter, setSigunguFilter] = useState<string | 'mine' | undefined>(undefined);
  const [pickerOpen, setPickerOpen] = useState(false);

  // 시군구 필터 적용 (시군구 종속 종류만 의미 있음)
  const apiParams = {
    id,
    type: electionType,
    sido: decodedSido,
    sigungu:
      isSigunguScoped && sigunguFilter && sigunguFilter !== 'mine'
        ? sigunguFilter
        : undefined,
    q: search.trim() || undefined,
  };

  const { data, isLoading, error, refetch } = useLawmakeQuery(getLocalElectionRacesAll, [
    apiParams,
  ]);

  // 시군구 chip 목록은 무필터 전체 응답에서 추출 (필터 적용해도 chip 옵션은 그대로 유지)
  const fullParams = {
    id,
    type: electionType,
    sido: decodedSido,
  };
  const { data: fullData } = useLawmakeQuery(getLocalElectionRacesAll, [fullParams], {
    enabled: isSigunguScoped,
  });

  const sigunguList = useMemo(() => {
    if (!fullData) return [] as string[];
    const set = new Set<string>();
    for (const r of fullData.races) {
      if (r.sigungu) set.add(r.sigungu);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'));
  }, [fullData]);

  const myMatchingSigungu = useMemo(() => {
    if (!myDistrictSigungu) return [] as string[];
    return sigunguList.filter((s) => s.startsWith(myDistrictSigungu));
  }, [myDistrictSigungu, sigunguList]);

  // "내 시군구" 필터 처리: prefix 매칭 (apiParams의 sigungu는 단일값 only이므로 client filter)
  const displayRaces = useMemo(() => {
    if (!data) return [];
    if (sigunguFilter === 'mine' && myMatchingSigungu.length > 0) {
      const set = new Set(myMatchingSigungu);
      return data.races.filter((r) => set.has(r.sigungu));
    }
    return data.races;
  }, [data, sigunguFilter, myMatchingSigungu]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!data) return <EmptyState title="데이터를 불러올 수 없습니다" />;

  return (
    <View className="flex-1 bg-surface-secondary">
      <Stack.Screen options={{ title: `${decodedSido} ${TYPE_LABELS[electionType]}` }} />

      {/* 페이지 내 헤더 (배지·번호·카운트 노출) */}
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

      {/* 검색바 (시군구 종속 종류만, 카드가 충분히 많을 때 의미 있음) */}
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

      {/* 시군구 chip */}
      {isSigunguScoped && sigunguList.length > 1 && (
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
                  onPress={() => setSigunguFilter(item.id)}
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
                      active ? 'text-white' : isMine ? 'text-primary' : 'text-neutral-600'
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
      )}

      {/* race 리스트 */}
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
          const partyGroups = item.partyGroups ?? [];
          const derivedPartyChips = isProportional
            ? partyGroups.length > 0
              ? partyGroups.map((g) => ({
                  key: g.partyId ?? g.partyShortName,
                  color: g.partyColor,
                  label: `${g.partyShortName} ${g.candidateCount}명`,
                }))
              : item.topCandidates
                  .filter((c) => c.party)
                  .map((c) => ({
                    key: c.party!.id,
                    color: c.party!.color,
                    label: c.party!.shortName,
                  }))
            : [];
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
                    ) : isProportional && derivedPartyChips.length > 0 ? (
                      <View className="mt-lawmake-sm flex-row flex-wrap gap-lawmake-xs">
                        {derivedPartyChips.map((c) => (
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
                          active ? 'font-bold text-primary' : 'text-neutral-900'
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
