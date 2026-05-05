import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLocalElectionRace } from '@/api/local-elections';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import type { LocalElectionType } from '@/types';

const TYPE_LABELS: Record<LocalElectionType, string> = {
  governor: '광역단체장',
  mayor: '기초단체장',
  superintendent: '교육감',
  'metro-council': '광역의원',
  'local-council': '기초의원',
};

export default function LocalElectionRaceDetailScreen() {
  const { id, raceId } = useLocalSearchParams<{ id: string; raceId: string }>();
  const insets = useSafeAreaInsets();

  const params = { id, raceId: Number(raceId) };
  const { data: race, isLoading, error, refetch } = useLawmakeQuery(getLocalElectionRace, [
    params,
  ]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!race) return <EmptyState title="선거구 정보를 찾을 수 없습니다" />;

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      {/* Header */}
      <View className="bg-white px-5 py-5">
        <Text className="text-xs font-semibold text-rose-500">
          {TYPE_LABELS[race.electionType]}
        </Text>
        <Text className="mt-1 text-xl font-bold text-neutral-900">{race.displayName}</Text>
        <Text className="mt-1 text-xs text-neutral-500">
          {race.sido}
          {race.sigungu ? ` ${race.sigungu}` : ''}
          {race.district ? ` ${race.district}` : ''}
          {race.seatCount > 1 ? ` · ${race.seatCount}명 선출` : ''}
        </Text>
        <View className="mt-3 flex-row items-center gap-2">
          <View className="rounded-lg bg-neutral-100 px-2.5 py-1">
            <Text className="text-[11px] font-semibold text-neutral-700">
              후보자 {race.candidates.length}명
            </Text>
          </View>
        </View>
      </View>

      {/* Candidates */}
      <View className="mt-3 px-4 gap-2">
        {race.candidates.map((c) => {
          const partyColor = c.party?.color ?? '#9CA3AF';
          return (
            <Card key={c.id}>
              <View className="flex-row gap-3">
                <View
                  className="h-16 w-16 overflow-hidden rounded-full border-2"
                  style={{ borderColor: partyColor }}
                >
                  {c.photoUrl ? (
                    <Image source={{ uri: c.photoUrl }} className="h-full w-full" />
                  ) : (
                    <View
                      className="h-full w-full items-center justify-center"
                      style={{ backgroundColor: partyColor }}
                    >
                      <Text className="text-lg font-bold text-white">{c.name.slice(0, 1)}</Text>
                    </View>
                  )}
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    {c.candidateNumber != null && (
                      <View
                        className="h-6 w-6 items-center justify-center rounded-full"
                        style={{ backgroundColor: partyColor }}
                      >
                        <Text className="text-[11px] font-bold text-white">
                          {c.candidateNumber}
                        </Text>
                      </View>
                    )}
                    <Text className="text-base font-bold text-neutral-900">{c.name}</Text>
                    {c.isWinner && (
                      <View className="rounded bg-green-100 px-1.5 py-0.5">
                        <Text className="text-[10px] font-bold text-green-700">당선</Text>
                      </View>
                    )}
                  </View>
                  <Text className="mt-0.5 text-sm text-neutral-600">
                    {c.party?.name ?? '무소속'}
                  </Text>
                  {c.birthDate && (
                    <Text className="text-[11px] text-neutral-500">
                      {c.birthDate}생{c.gender ? ` · ${c.gender}` : ''}
                    </Text>
                  )}
                </View>
              </View>

              {c.voteCount != null && (
                <View className="mt-3 flex-row items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2">
                  <Text className="text-sm font-bold text-neutral-900">
                    {c.voteCount.toLocaleString()}표
                  </Text>
                  {c.voteRate != null && (
                    <Text className="text-xs text-neutral-600">({c.voteRate.toFixed(1)}%)</Text>
                  )}
                </View>
              )}

              {c.slogan && (
                <View className="mt-3 rounded-lg border-l-2 border-rose-300 bg-rose-50 px-3 py-2">
                  <Text className="text-xs leading-5 text-rose-900">{c.slogan}</Text>
                </View>
              )}

              {c.career && (
                <View className="mt-3">
                  <Text className="text-[11px] font-semibold text-neutral-700">경력</Text>
                  <Text className="mt-1 text-xs leading-5 text-neutral-600" numberOfLines={6}>
                    {c.career}
                  </Text>
                </View>
              )}

              {c.education && (
                <View className="mt-2">
                  <Text className="text-[11px] font-semibold text-neutral-700">학력</Text>
                  <Text className="mt-1 text-xs leading-5 text-neutral-600" numberOfLines={3}>
                    {c.education}
                  </Text>
                </View>
              )}

              {c.pledges && c.pledges.length > 0 && (
                <View className="mt-3 gap-1.5">
                  <Text className="text-[11px] font-semibold text-neutral-700">주요 공약</Text>
                  {c.pledges.slice(0, 5).map((p, i) => (
                    <View key={`${i}-${p.title}`} className="rounded-lg bg-neutral-50 px-3 py-2">
                      <Text className="text-[10px] font-semibold text-rose-500">{p.category}</Text>
                      <Text className="mt-0.5 text-xs font-semibold text-neutral-900">
                        {p.title}
                      </Text>
                      {p.description && (
                        <Text
                          className="mt-0.5 text-[11px] leading-4 text-neutral-600"
                          numberOfLines={3}
                        >
                          {p.description}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}
