import { useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLocalElectionRace } from '@/api/local-elections';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LocalProportionalNotice } from '@/components/LocalProportionalNotice';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ballotInfoFor, TYPE_LABELS } from '@/constants/local-elections';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import type { LocalElectionCandidateDetail } from '@/types';

function CandidateCard({ c }: { c: LocalElectionCandidateDetail }) {
  const [expanded, setExpanded] = useState(false);
  const partyColor = c.party?.color ?? '#9CA3AF';
  const hasMore = Boolean(c.career || c.education || (c.pledges && c.pledges.length > 0));

  return (
    <Card className="p-0 overflow-hidden">
      {/* 기본 정보 (always visible) */}
      <View className="p-lawmake-lg">
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
              <Text className="text-lawmake-headline font-bold text-neutral-900">{c.name}</Text>
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
            <Text className="text-lawmake-footnote leading-5 text-error-dark">{c.slogan}</Text>
          </View>
        )}
      </View>

      {/* 확장 가능한 상세 정보 (탭하여 펼침) */}
      {hasMore && (
        <>
          {expanded && (
            <View className="gap-lawmake-md border-t border-neutral-100 bg-surface-secondary px-lawmake-lg py-lawmake-md">
              {c.career && (
                <View>
                  <Text className="text-lawmake-caption font-bold uppercase tracking-wider text-neutral-500">
                    경력
                  </Text>
                  <Text className="mt-lawmake-xs text-lawmake-footnote leading-6 text-neutral-700">
                    {c.career}
                  </Text>
                </View>
              )}

              {c.education && (
                <View>
                  <Text className="text-lawmake-caption font-bold uppercase tracking-wider text-neutral-500">
                    학력
                  </Text>
                  <Text className="mt-lawmake-xs text-lawmake-footnote leading-6 text-neutral-700">
                    {c.education}
                  </Text>
                </View>
              )}

              {c.pledges && c.pledges.length > 0 && (
                <View>
                  <Text className="text-lawmake-caption font-bold uppercase tracking-wider text-neutral-500">
                    주요 공약
                  </Text>
                  <View className="mt-lawmake-sm gap-lawmake-sm">
                    {c.pledges.slice(0, 5).map((p, i) => (
                      <View
                        key={`${i}-${p.title}`}
                        className="rounded-lawmake-md bg-surface-primary px-lawmake-md py-lawmake-sm"
                      >
                        {p.category && (
                          <Text className="text-lawmake-caption font-semibold text-error">
                            {p.category}
                          </Text>
                        )}
                        <Text className="mt-lawmake-xs text-lawmake-footnote font-semibold text-neutral-900">
                          {p.title}
                        </Text>
                        {p.description && (
                          <Text
                            className="mt-lawmake-xs text-lawmake-footnote leading-5 text-neutral-600"
                            numberOfLines={4}
                          >
                            {p.description}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          <Pressable
            onPress={() => setExpanded((v) => !v)}
            className="flex-row items-center justify-center gap-lawmake-xs border-t border-neutral-100 bg-surface-secondary py-lawmake-sm active:bg-neutral-100"
          >
            <Text className="text-lawmake-caption font-semibold text-neutral-600">
              {expanded ? '간단히 보기' : '경력·학력·공약 보기'}
            </Text>
            {expanded ? (
              <ChevronUp size={14} color="#525252" />
            ) : (
              <ChevronDown size={14} color="#525252" />
            )}
          </Pressable>
        </>
      )}
    </Card>
  );
}

export default function LocalElectionRaceDetailScreen() {
  const { id, raceId } = useLocalSearchParams<{ id: string; raceId: string }>();
  const insets = useSafeAreaInsets();

  const params = { id, raceId: Number(raceId) };
  const { data: race, isLoading, error, refetch } = useLawmakeQuery(getLocalElectionRace, [params]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!race) return <EmptyState title="선거구 정보를 찾을 수 없습니다" />;

  const ballot = ballotInfoFor(race.electionType);
  const isProportional = ballot?.kind === 'party';

  return (
    <ScrollView
      className="flex-1 bg-surface-secondary"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      {/* Header */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-xl pt-lawmake-md">
        <View className="flex-row items-center gap-lawmake-sm">
          {ballot && (
            <View className="h-6 w-6 items-center justify-center rounded-full bg-neutral-100">
              <Text className="text-lawmake-caption font-bold text-neutral-700">
                {ballot.number}
              </Text>
            </View>
          )}
          <Text className="text-lawmake-subhead font-semibold text-neutral-700">
            {TYPE_LABELS[race.electionType]}
          </Text>
          {isProportional && <StatusBadge label="정당투표" tone="info" />}
        </View>
        <Text className="mt-lawmake-sm text-lawmake-title1 text-neutral-900">
          {race.displayName}
        </Text>
        <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
          {race.sido}
          {race.sigungu ? ` ${race.sigungu}` : ''}
          {race.district ? ` ${race.district}` : ''}
          {race.seatCount > 1 ? ` · ${race.seatCount}명 선출` : ''}
        </Text>
        <View className="mt-lawmake-md">
          <StatusBadge
            label={`${isProportional ? '명부' : '후보자'} ${race.candidates.length}명`}
            tone="neutral"
          />
        </View>
      </View>

      {/* Candidates */}
      <View className="mt-lawmake-md gap-lawmake-sm px-lawmake-lg">
        {race.electionType === 'local-proportional' && race.candidates.length === 0 && (
          <LocalProportionalNotice sido={race.sido} />
        )}
        {race.candidates.map((c) => (
          <CandidateCard key={c.id} c={c} />
        ))}
      </View>
    </ScrollView>
  );
}
