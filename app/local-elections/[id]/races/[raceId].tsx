import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLocalElectionRace } from '@/api/local-elections';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
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
      className="flex-1 bg-surface-secondary"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      {/* Header */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-xl pt-lawmake-md">
        <Text className="text-lawmake-subhead font-semibold text-error">
          {TYPE_LABELS[race.electionType]}
        </Text>
        <Text className="mt-lawmake-xs text-lawmake-title1 text-neutral-900">
          {race.displayName}
        </Text>
        <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
          {race.sido}
          {race.sigungu ? ` ${race.sigungu}` : ''}
          {race.district ? ` ${race.district}` : ''}
          {race.seatCount > 1 ? ` · ${race.seatCount}명 선출` : ''}
        </Text>
        <View className="mt-lawmake-md">
          <StatusBadge label={`후보자 ${race.candidates.length}명`} tone="neutral" />
        </View>
      </View>

      {/* Candidates */}
      <View className="mt-lawmake-md gap-lawmake-sm px-lawmake-lg">
        {race.candidates.map((c) => {
          const partyColor = c.party?.color ?? '#9CA3AF';
          return (
            <Card key={c.id}>
              <View className="flex-row gap-lawmake-md">
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
                      <Text className="text-lawmake-headline font-bold text-white">
                        {c.name.slice(0, 1)}
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center gap-lawmake-sm">
                    {c.candidateNumber != null && (
                      <View
                        className="h-6 w-6 items-center justify-center rounded-full"
                        style={{ backgroundColor: partyColor }}
                      >
                        <Text className="text-lawmake-caption font-bold text-white">
                          {c.candidateNumber}
                        </Text>
                      </View>
                    )}
                    <Text className="text-lawmake-headline font-bold text-neutral-900">
                      {c.name}
                    </Text>
                    {c.isWinner && <StatusBadge label="당선" tone="success" />}
                  </View>
                  <Text className="mt-lawmake-xs text-lawmake-callout text-neutral-600">
                    {c.party?.name ?? '무소속'}
                  </Text>
                  {c.birthDate && (
                    <Text className="text-lawmake-caption text-neutral-500">
                      {c.birthDate}생{c.gender ? ` · ${c.gender}` : ''}
                    </Text>
                  )}
                </View>
              </View>

              {c.voteCount != null && (
                <View className="mt-lawmake-md flex-row items-center gap-lawmake-sm rounded-lawmake-md bg-neutral-100 px-lawmake-md py-lawmake-sm">
                  <Text className="text-lawmake-callout font-bold text-neutral-900">
                    {c.voteCount.toLocaleString()}표
                  </Text>
                  {c.voteRate != null && (
                    <Text className="text-lawmake-footnote text-neutral-600">
                      ({c.voteRate.toFixed(1)}%)
                    </Text>
                  )}
                </View>
              )}

              {c.slogan && (
                <View className="mt-lawmake-md rounded-lawmake-md border-l-2 border-error bg-error-light px-lawmake-md py-lawmake-sm">
                  <Text className="text-lawmake-footnote leading-5 text-error-dark">
                    {c.slogan}
                  </Text>
                </View>
              )}

              {c.career && (
                <View className="mt-lawmake-md">
                  <Text className="text-lawmake-subhead font-semibold text-neutral-700">경력</Text>
                  <Text
                    className="mt-lawmake-xs text-lawmake-footnote leading-5 text-neutral-600"
                    numberOfLines={6}
                  >
                    {c.career}
                  </Text>
                </View>
              )}

              {c.education && (
                <View className="mt-lawmake-sm">
                  <Text className="text-lawmake-subhead font-semibold text-neutral-700">학력</Text>
                  <Text
                    className="mt-lawmake-xs text-lawmake-footnote leading-5 text-neutral-600"
                    numberOfLines={3}
                  >
                    {c.education}
                  </Text>
                </View>
              )}

              {c.pledges && c.pledges.length > 0 && (
                <View className="mt-lawmake-md gap-lawmake-sm">
                  <Text className="text-lawmake-subhead font-semibold text-neutral-700">
                    주요 공약
                  </Text>
                  {c.pledges.slice(0, 5).map((p, i) => (
                    <View
                      key={`${i}-${p.title}`}
                      className="rounded-lawmake-md bg-surface-secondary px-lawmake-md py-lawmake-sm"
                    >
                      <Text className="text-lawmake-caption font-semibold text-error">
                        {p.category}
                      </Text>
                      <Text className="mt-lawmake-xs text-lawmake-footnote font-semibold text-neutral-900">
                        {p.title}
                      </Text>
                      {p.description && (
                        <Text
                          className="mt-lawmake-xs text-lawmake-footnote leading-4 text-neutral-600"
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
