import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getElection } from '@/api/elections';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ELECTION_STATUS_MAP } from '@/constants/maps';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { formatDate } from '@/lib/format';
import type { ElectionDistrictInfo, ElectionCandidate } from '@/types';

const REGION_ORDER = [
  '서울', '인천', '경기', '부산', '대구', '광주', '대전', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
];

function getDDay(dateStr: string): string {
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return 'D-Day';
  return `D+${Math.abs(diff)}`;
}

function groupByRegion(districts: ElectionDistrictInfo[]) {
  const map = new Map<string, ElectionDistrictInfo[]>();
  for (const d of districts) {
    const region = d.region || '기타';
    if (!map.has(region)) map.set(region, []);
    map.get(region)!.push(d);
  }
  return [...map.entries()].sort(([a], [b]) => {
    const idxA = REGION_ORDER.indexOf(a);
    const idxB = REGION_ORDER.indexOf(b);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });
}

function CandidateCardComponent({ candidate }: { candidate: ElectionCandidate }) {
  const partyColor = candidate.party?.color ?? '#9ca3af';
  const careers = candidate.career?.split('\n').filter(Boolean) ?? [];

  return (
    <Card className="mt-2">
      <View className="flex-row gap-3">
        {candidate.photoUrl ? (
          <Image
            source={{ uri: candidate.photoUrl }}
            style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: partyColor }}
            contentFit="cover"
          />
        ) : (
          <View
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: partyColor }}
          >
            <Text className="text-base font-bold text-white">{candidate.name.slice(0, 2)}</Text>
          </View>
        )}
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            {candidate.candidateNumber && (
              <View
                className="h-5 w-5 items-center justify-center rounded-full"
                style={{ backgroundColor: partyColor }}
              >
                <Text className="text-[10px] font-bold text-white">{candidate.candidateNumber}</Text>
              </View>
            )}
            <Text className="text-base font-bold text-neutral-900">{candidate.name}</Text>
          </View>
          <View className="mt-0.5 flex-row items-center gap-1.5">
            <Badge label={candidate.party?.name ?? '무소속'} color={partyColor} textColor="#FFFFFF" />
            {candidate.birthDate && (
              <Text className="text-[10px] text-neutral-400">{candidate.birthDate}생</Text>
            )}
          </View>
          {candidate.slogan && (
            <Text className="mt-1 text-xs italic text-neutral-500" numberOfLines={2}>
              "{candidate.slogan}"
            </Text>
          )}
        </View>
      </View>

      {careers.length > 0 && (
        <View className="mt-3">
          <Text className="text-[10px] font-semibold text-neutral-400">주요 경력</Text>
          {careers.slice(0, 4).map((c) => (
            <Text key={c} className="mt-0.5 text-xs text-neutral-600">
              · {c}
            </Text>
          ))}
        </View>
      )}

      {candidate.education && (
        <View className="mt-2">
          <Text className="text-[10px] font-semibold text-neutral-400">학력</Text>
          <Text className="mt-0.5 text-xs text-neutral-600">{candidate.education}</Text>
        </View>
      )}

      {candidate.assets && (
        <View className="mt-2">
          <Text className="text-[10px] font-semibold text-neutral-400">재산</Text>
          <Text className="mt-0.5 text-xs text-neutral-600">{candidate.assets}</Text>
        </View>
      )}

      {candidate.pledges.length > 0 && (
        <View className="mt-3">
          <Text className="text-[10px] font-semibold text-neutral-400">핵심 공약</Text>
          {candidate.pledges.map((p) => (
            <View key={p.title} className="mt-1.5 rounded-lg bg-neutral-50 px-3 py-2">
              <View className="flex-row items-center gap-1.5">
                {p.category && (
                  <Text className="text-[10px] text-neutral-400">[{p.category}]</Text>
                )}
                <Text className="text-xs font-medium text-neutral-800">{p.title}</Text>
              </View>
              {p.description && (
                <Text className="mt-0.5 text-[11px] leading-4 text-neutral-500">
                  {p.description}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

export default function ElectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: election, isLoading, error, refetch } = useLawmakeQuery(getElection, [id]);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [expandedDistrict, setExpandedDistrict] = useState<number | null>(null);

  const regionGroups = useMemo(
    () => (election ? groupByRegion(election.districts) : []),
    [election]
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!election) return <EmptyState title="선거 정보를 찾을 수 없습니다" />;

  const status = ELECTION_STATUS_MAP[election.status];
  const dday = getDDay(election.electionDate);

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      {/* Header */}
      <View className="bg-white px-5 pb-5 pt-3">
        <View className="flex-row items-center gap-2">
          <Badge label={status.label} color={status.color} textColor="#FFFFFF" />
          <Badge label={dday} color="#DC2626" textColor="#FFFFFF" />
        </View>
        <Text className="mt-2 text-xl font-bold text-neutral-900">{election.name}</Text>
        <Text className="mt-1 text-sm text-neutral-500">
          투표일 {formatDate(election.electionDate)} · {election.districts.length}개 선거구
        </Text>
        {election.description && (
          <Text className="mt-2 text-xs leading-4 text-neutral-400">{election.description}</Text>
        )}
      </View>

      {/* Region Groups */}
      <View className="mt-3 gap-2 px-5">
        {regionGroups.map(([region, districts]) => {
          const isExpanded = expandedRegion === region;
          const totalCandidates = districts.reduce((s, d) => s + d.candidates.length, 0);

          return (
            <Card key={region} className="overflow-hidden p-0">
              {/* Region Header */}
              <Pressable
                className="flex-row items-center justify-between px-4 py-3 active:bg-neutral-50"
                onPress={() => {
                  setExpandedRegion(isExpanded ? null : region);
                  setExpandedDistrict(null);
                }}
              >
                <View className="flex-row items-center gap-2">
                  <View className="h-7 w-7 items-center justify-center rounded-lg bg-neutral-100">
                    <Text className="text-xs font-bold text-neutral-600">{region.slice(0, 1)}</Text>
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-neutral-800">{region}</Text>
                    <Text className="text-[10px] text-neutral-400">
                      {districts.length}개 선거구
                      {totalCandidates > 0 && ` · 후보 ${totalCandidates}명`}
                    </Text>
                  </View>
                </View>
                <ChevronDown
                  size={16}
                  color="#a3a3a3"
                  style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
                />
              </Pressable>

              {/* Districts */}
              {isExpanded &&
                districts.map((d) => {
                  const isDistrictExpanded = expandedDistrict === d.id;
                  const partyColor = d.previousMember?.party?.color ?? '#9ca3af';

                  return (
                    <View key={d.id} className="border-t border-neutral-100">
                      <Pressable
                        className="flex-row items-center gap-2 px-4 py-3 active:bg-neutral-50"
                        onPress={() => setExpandedDistrict(isDistrictExpanded ? null : d.id)}
                      >
                        <View
                          className="h-full w-1 self-stretch rounded-full"
                          style={{ backgroundColor: partyColor }}
                        />
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-neutral-800">
                            {d.district}
                          </Text>
                          <Text className="text-[10px] text-neutral-400">
                            {d.vacancyReason}
                            {d.previousMember && d.previousMember.name !== '공석'
                              ? ` · 전임 ${d.previousMember.name}`
                              : ''}
                          </Text>
                        </View>
                        {d.candidates.length > 0 && (
                          <Badge label={`${d.candidates.length}명`} color="#2563EB" textColor="#FFFFFF" />
                        )}
                        <ChevronDown
                          size={14}
                          color="#d4d4d4"
                          style={{ transform: [{ rotate: isDistrictExpanded ? '180deg' : '0deg' }] }}
                        />
                      </Pressable>

                      {isDistrictExpanded && (
                        <View className="bg-neutral-50 px-4 pb-3">
                          {/* Previous Member */}
                          {d.previousMember && d.previousMember.name !== '공석' && (
                            <Pressable
                              className="flex-row items-center gap-2 rounded-lg bg-white px-3 py-2"
                              onPress={() =>
                                d.previousMember?.id &&
                                router.push(`/members/${d.previousMember.id}`)
                              }
                            >
                              {d.previousMember.photoUrl ? (
                                <Image
                                  source={{ uri: d.previousMember.photoUrl }}
                                  style={{ width: 28, height: 28, borderRadius: 14 }}
                                  contentFit="cover"
                                />
                              ) : (
                                <View
                                  className="h-7 w-7 items-center justify-center rounded-full"
                                  style={{ backgroundColor: partyColor }}
                                >
                                  <Text className="text-[10px] font-bold text-white">
                                    {d.previousMember.name.slice(0, 1)}
                                  </Text>
                                </View>
                              )}
                              <Text className="text-xs text-neutral-600">
                                {d.previousMember.name}
                              </Text>
                              {d.previousMember.party && (
                                <Badge
                                  label={d.previousMember.party.shortName}
                                  color={d.previousMember.party.color}
                                  textColor="#FFFFFF"
                                />
                              )}
                              <Text className="text-[10px] text-neutral-400">전임</Text>
                            </Pressable>
                          )}

                          {/* Candidates */}
                          {d.candidates.length > 0 ? (
                            <View className="mt-2">
                              <Text className="text-xs font-semibold text-neutral-500">
                                등록 후보 {d.candidates.length}명
                              </Text>
                              {d.candidates.map((c) => (
                                <CandidateCardComponent key={c.id} candidate={c} />
                              ))}
                            </View>
                          ) : (
                            <View className="mt-2 items-center rounded-lg bg-white py-4">
                              <Text className="text-xs text-neutral-400">
                                아직 등록된 후보가 없습니다
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}
