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
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import type { LocalElectionType } from '@/types';

const ELECTION_TYPES: { id: LocalElectionType; label: string }[] = [
  { id: 'governor', label: '광역단체장' },
  { id: 'mayor', label: '기초단체장' },
  { id: 'superintendent', label: '교육감' },
  { id: 'metro-council', label: '광역의원' },
  { id: 'local-council', label: '기초의원' },
];

const STATUS_TONE: Record<string, { label: string; tone: StatusTone }> = {
  upcoming: { label: '예정', tone: 'info' },
  active: { label: '진행 중', tone: 'success' },
  completed: { label: '완료', tone: 'neutral' },
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
      {/* Header block */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-xl pt-lawmake-md">
        <View className="flex-row items-center gap-lawmake-sm">
          <StatusBadge label={status.label} tone={status.tone} />
          <Text className="text-lawmake-footnote text-neutral-500">
            {election.electionDate}
          </Text>
        </View>
        <Text className="mt-lawmake-md text-lawmake-title1 text-neutral-900">
          {election.name}
        </Text>
        <Text className="mt-lawmake-sm text-lawmake-body leading-6 text-neutral-600">
          {election.description}
        </Text>

        <View className="mt-lawmake-lg flex-row gap-lawmake-md">
          <View className="flex-1 rounded-lawmake-lg bg-error-light p-lawmake-md">
            <Text className="text-lawmake-caption font-medium text-error-dark">총 선거구</Text>
            <Text className="mt-lawmake-xs text-lawmake-title2 font-bold text-error-dark">
              {totalRaces}
            </Text>
          </View>
          <View className="flex-1 rounded-lawmake-lg bg-info-light p-lawmake-md">
            <Text className="text-lawmake-caption font-medium text-info-dark">총 후보자</Text>
            <Text className="mt-lawmake-xs text-lawmake-title2 font-bold text-info-dark">
              {election.totalCandidates}
            </Text>
          </View>
        </View>
      </View>

      {/* 선거 유형 */}
      <View className="mt-lawmake-md px-lawmake-lg">
        <Section title="선거 유형">
          <Card className="p-0">
            {ELECTION_TYPES.map((t, i) => {
              const count = election.raceCounts[t.id] ?? 0;
              const isLast = i === ELECTION_TYPES.length - 1;
              return (
                <Pressable
                  key={t.id}
                  onPress={() =>
                    router.push(`/local-elections/${id}/races?type=${t.id}` as never)
                  }
                  className={`flex-row items-center justify-between px-lawmake-lg py-lawmake-md active:bg-neutral-50 ${
                    !isLast ? 'border-b border-neutral-100' : ''
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-lawmake-body font-semibold text-neutral-900">
                      {t.label}
                    </Text>
                    <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
                      {count}개 선거구
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
                  {region.sidoShort}
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
              <Text className="text-lawmake-body font-semibold text-neutral-900">
                투표 안내
              </Text>
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
