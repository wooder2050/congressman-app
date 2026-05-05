import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight, MapPin, Vote } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLocalElection } from '@/api/local-elections';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, PressableCard } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import type { LocalElectionType } from '@/types';

const ELECTION_TYPES: { id: LocalElectionType; label: string; route: string }[] = [
  { id: 'governor', label: '광역단체장', route: 'governor' },
  { id: 'mayor', label: '기초단체장', route: 'mayor' },
  { id: 'superintendent', label: '교육감', route: 'superintendent' },
  { id: 'metro-council', label: '광역의원', route: 'metro-council' },
  { id: 'local-council', label: '기초의원', route: 'local-council' },
];

export default function LocalElectionOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: election, isLoading, error, refetch } = useLawmakeQuery(getLocalElection, [id]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!election) return <EmptyState title="선거 정보를 찾을 수 없습니다" />;

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      {/* Header */}
      <View className="bg-white px-5 py-5">
        <Text className="text-xs font-medium text-rose-500">
          {election.electionDate} · {election.status === 'upcoming' ? '예정' : election.status === 'active' ? '진행 중' : '완료'}
        </Text>
        <Text className="mt-1 text-2xl font-bold text-neutral-900">{election.name}</Text>
        <Text className="mt-2 text-sm leading-5 text-neutral-600">{election.description}</Text>

        <View className="mt-4 flex-row gap-4">
          <View className="flex-1 rounded-lg bg-rose-50 p-3">
            <Text className="text-[11px] text-rose-700">총 선거구</Text>
            <Text className="mt-0.5 text-xl font-bold text-rose-900">
              {Object.values(election.raceCounts).reduce((a, b) => a + b, 0)}
            </Text>
          </View>
          <View className="flex-1 rounded-lg bg-blue-50 p-3">
            <Text className="text-[11px] text-blue-700">총 후보자</Text>
            <Text className="mt-0.5 text-xl font-bold text-blue-900">
              {election.totalCandidates}
            </Text>
          </View>
        </View>
      </View>

      {/* 선거 유형 */}
      <View className="mt-4 px-5">
        <SectionHeader title="선거 유형" />
        <View className="mt-3 gap-2">
          {ELECTION_TYPES.map((t) => {
            const count = election.raceCounts[t.id] ?? 0;
            return (
              <PressableCard
                key={t.id}
                onPress={() =>
                  router.push(`/local-elections/${id}/races?type=${t.id}` as never)
                }
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-neutral-900">{t.label}</Text>
                    <Text className="mt-0.5 text-xs text-neutral-500">{count}개 선거구</Text>
                  </View>
                  <ChevronRight size={18} color="#9CA3AF" />
                </View>
              </PressableCard>
            );
          })}
        </View>
      </View>

      {/* 지역별 현황 */}
      <View className="mt-6 px-5">
        <SectionHeader title="지역별 현황" />
        <View className="mt-3 flex-row flex-wrap gap-2">
          {election.regionSummary.map((region) => (
            <Pressable
              key={region.sido}
              onPress={() =>
                router.push(
                  `/local-elections/${id}/regions/${encodeURIComponent(region.sido)}` as never,
                )
              }
              className="min-w-[30%] flex-1 rounded-xl border border-neutral-100 bg-white p-3 active:bg-neutral-50"
            >
              <Text className="text-xs font-bold text-neutral-900">{region.sidoShort}</Text>
              <Text className="mt-1 text-[10px] text-neutral-500">
                {Object.values(region.raceCounts).reduce((a, b) => a + b, 0)}개 선거구
              </Text>
              <Text className="text-[10px] text-neutral-500">
                {region.totalCandidates}명 출마
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* 안내 */}
      <View className="mt-6 px-5 gap-2">
        <PressableCard onPress={() => router.push(`/local-elections/${id}/vote` as never)}>
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-rose-100">
              <Vote size={20} color="#F43F5E" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-neutral-900">투표 안내</Text>
              <Text className="mt-0.5 text-xs text-neutral-500">
                사전투표 5/29~30 · 본투표 6/3
              </Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </View>
        </PressableCard>

        <PressableCard onPress={() => router.push('/elections/2026-06-03' as never)}>
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <MapPin size={20} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-neutral-900">6·3 재보궐선거</Text>
              <Text className="mt-0.5 text-xs text-neutral-500">
                국회의원 재보궐선거도 동시 실시
              </Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </View>
        </PressableCard>
      </View>
    </ScrollView>
  );
}
