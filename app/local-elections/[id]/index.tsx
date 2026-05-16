import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight, MapPin, Vote } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLocalElection } from '@/api/local-elections';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, PressableCard } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { StatusBadge, type StatusTone } from '@/components/ui/StatusBadge';
import { BALLOT_ORDER, sidoToShort } from '@/constants/local-elections';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';

const STATUS_TONE: Record<string, { label: string; tone: StatusTone }> = {
  upcoming: { label: '예정', tone: 'info' },
  active: { label: '진행 중', tone: 'success' },
  completed: { label: '완료', tone: 'neutral' },
};

const KIND_META: Record<
  'person' | 'party' | 'non-partisan',
  { label: string; bg: string; text: string; accent: string }
> = {
  person: { label: '인물투표', bg: 'bg-neutral-100', text: 'text-neutral-700', accent: '#737373' },
  party: { label: '정당투표', bg: 'bg-info-light', text: 'text-info-dark', accent: '#1D4ED8' },
  'non-partisan': {
    label: '정당·기호 없음',
    bg: 'bg-warning-light',
    text: 'text-warning-dark',
    accent: '#B45309',
  },
};

export default function LocalElectionOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: election, isLoading, error, refetch } = useLawmakeQuery(getLocalElection, [id]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!election) return <EmptyState title="선거 정보를 찾을 수 없습니다" />;

  const status = STATUS_TONE[election.status] ?? STATUS_TONE.upcoming;
  const totalRaces = Object.values(election.raceCounts).reduce((a, b) => a + b, 0);

  return (
    <ScrollView
      className="flex-1 bg-surface-secondary"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      {/* Header block — meta line compressed */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-lg pt-lawmake-md">
        <View className="flex-row items-center gap-lawmake-sm">
          <StatusBadge label={status.label} tone={status.tone} />
          <Text className="text-lawmake-footnote text-neutral-500">{election.electionDate}</Text>
        </View>
        <Text className="mt-lawmake-md text-lawmake-title1 text-neutral-900">{election.name}</Text>
        <Text className="mt-lawmake-sm text-lawmake-callout leading-6 text-neutral-600">
          {election.description}
        </Text>
        <Text className="mt-lawmake-md text-lawmake-footnote text-neutral-500">
          총 {totalRaces.toLocaleString()}개 선거구 · 후보자{' '}
          {election.totalCandidates.toLocaleString()}명
        </Text>
      </View>

      {/* 투표용지 7장 */}
      <View className="mt-lawmake-md px-lawmake-lg">
        <Section
          title="내가 받을 투표용지 7장"
          subtitle="투표소에서 받는 종이 순서와 동일합니다"
        >
          <Card className="p-0">
            {BALLOT_ORDER.map((b, i) => {
              const count = election.raceCounts[b.type] ?? 0;
              const isLast = i === BALLOT_ORDER.length - 1;
              const kind = KIND_META[b.kind];
              return (
                <Pressable
                  key={b.type}
                  onPress={() =>
                    router.push(`/local-elections/${id}/races?type=${b.type}` as never)
                  }
                  className={`flex-row items-center px-lawmake-md py-lawmake-md active:bg-neutral-50 ${
                    !isLast ? 'border-b border-neutral-100' : ''
                  }`}
                >
                  {/* 좌측 stripe + 번호 */}
                  <View className="flex-row items-center gap-lawmake-md">
                    <View
                      className="h-12 w-1 rounded-full"
                      style={{ backgroundColor: kind.accent }}
                    />
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
                      <Text className="text-lawmake-callout font-bold text-neutral-700">
                        {b.number}
                      </Text>
                    </View>
                  </View>

                  {/* 라벨 */}
                  <View className="ml-lawmake-md flex-1">
                    <View className="flex-row items-center gap-lawmake-xs">
                      <Text
                        className={`rounded-lawmake-sm px-lawmake-xs py-0.5 text-lawmake-caption font-semibold ${kind.bg} ${kind.text}`}
                      >
                        {kind.label}
                      </Text>
                    </View>
                    <Text className="mt-lawmake-xs text-lawmake-body font-semibold text-neutral-900">
                      {b.label}
                    </Text>
                    <Text className="text-lawmake-caption text-neutral-500">
                      {count.toLocaleString()}개 선거구
                      {b.type === 'local-proportional' && count === 0
                        ? ' · NEC API 미제공'
                        : ''}
                    </Text>
                  </View>

                  <ChevronRight size={18} color="#A3A3A3" />
                </Pressable>
              );
            })}
          </Card>
        </Section>
      </View>

      {/* 지역별 현황 */}
      <View className="mt-lawmake-xl px-lawmake-lg">
        <Section title="지역별 현황">
          <View className="flex-row flex-wrap gap-lawmake-sm">
            {election.regionSummary.map((region) => (
              <Pressable
                key={region.sido}
                onPress={() =>
                  router.push(
                    `/local-elections/${id}/regions/${encodeURIComponent(region.sido)}` as never,
                  )
                }
                className="min-w-[30%] flex-1 rounded-lawmake-lg border border-neutral-100 bg-surface-primary p-lawmake-md active:bg-neutral-50"
              >
                <Text className="text-lawmake-callout font-bold text-neutral-900">
                  {sidoToShort(region.sido)}
                </Text>
                <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-500">
                  {Object.values(region.raceCounts).reduce((a, b) => a + b, 0)}개 선거구
                </Text>
                <Text className="text-lawmake-caption text-neutral-500">
                  {region.totalCandidates}명 출마
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>
      </View>

      {/* 안내 */}
      <View className="mt-lawmake-xl gap-lawmake-sm px-lawmake-lg">
        <PressableCard onPress={() => router.push(`/local-elections/${id}/vote` as never)}>
          <View className="flex-row items-center gap-lawmake-md">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-error-light">
              <Vote size={20} color="#B91C1C" />
            </View>
            <View className="flex-1">
              <Text className="text-lawmake-body font-semibold text-neutral-900">투표 안내</Text>
              <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
                사전투표 5/29~30 · 본투표 6/3
              </Text>
            </View>
            <ChevronRight size={18} color="#A3A3A3" />
          </View>
        </PressableCard>

        <PressableCard onPress={() => router.push('/elections/2026-06-03' as never)}>
          <View className="flex-row items-center gap-lawmake-md">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-info-light">
              <MapPin size={20} color="#1D4ED8" />
            </View>
            <View className="flex-1">
              <Text className="text-lawmake-body font-semibold text-neutral-900">
                6·3 재보궐선거
              </Text>
              <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
                국회의원 재보궐선거도 동시 실시
              </Text>
            </View>
            <ChevronRight size={18} color="#A3A3A3" />
          </View>
        </PressableCard>
      </View>
    </ScrollView>
  );
}
