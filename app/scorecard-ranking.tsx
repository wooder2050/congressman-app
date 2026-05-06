import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getScorecardRanking } from '@/api/scorecard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MemberPhoto } from '@/components/MemberPhoto';
import { PartyBadge } from '@/components/PartyBadge';
import { FilterChip } from '@/components/ui/FilterChip';
import { SCORECARD_GRADE_MAP } from '@/constants/maps';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import type { ScorecardGrade, ScorecardRankingItem } from '@/types';

const CURRENT_TERM = 22;

const GRADE_FILTERS: { label: string; value: ScorecardGrade | 'all' }[] = [
  { label: '전체', value: 'all' },
  { label: 'S', value: 'S' },
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'C', value: 'C' },
  { label: 'D', value: 'D' },
];

export default function ScorecardRankingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [gradeFilter, setGradeFilter] = useState<ScorecardGrade | 'all'>('all');

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useLawmakeQuery(getScorecardRanking, [CURRENT_TERM]);

  const filtered = useMemo(() => {
    if (!data?.rankings) return [];
    const ranked = data.rankings.map((m, i) => ({ ...m, overallRank: i + 1 }));
    if (gradeFilter === 'all') return ranked;
    return ranked.filter((m) => m.grade === gradeFilter);
  }, [data, gradeFilter]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!data?.rankings?.length) return <EmptyState title="랭킹 데이터가 없습니다" />;

  const renderItem = ({ item }: { item: ScorecardRankingItem & { overallRank: number } }) => {
    const grade = SCORECARD_GRADE_MAP[item.grade];
    return (
      <Pressable
        className="flex-row items-center gap-lawmake-sm border-b border-neutral-100 bg-surface-primary px-lawmake-lg py-lawmake-sm active:bg-neutral-50"
        onPress={() => router.push(`/members/${item.memberId}/scorecard`)}
      >
        <Text
          className="w-8 text-center text-lawmake-footnote font-bold text-neutral-400"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {item.overallRank}
        </Text>
        <MemberPhoto uri={item.photoUrl} size={40} partyColor={item.party.color} />
        <View className="flex-1">
          <View className="flex-row items-center gap-lawmake-xs">
            <Text className="text-lawmake-footnote font-semibold text-neutral-800">{item.name}</Text>
            <PartyBadge name={item.party.shortName} color={item.party.color} />
          </View>
          <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">{item.district}</Text>
        </View>
        <View className="items-end">
          <View
            className="h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: grade.bgColor }}
          >
            <Text className="text-lawmake-caption font-bold" style={{ color: grade.color }}>
              {item.grade}
            </Text>
          </View>
          <Text className="mt-lawmake-xs text-lawmake-caption font-medium text-neutral-500">
            {item.totalScore.toFixed(1)}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-surface-secondary">
      {/* Header Info */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-sm pt-lawmake-sm">
        <Text className="text-lawmake-caption text-neutral-400">
          출석률(30) + 표결참여(25) + 법안발의(25) + 통과율(20) = 100점
        </Text>
      </View>

      {/* Grade Filter */}
      <View className="flex-row gap-lawmake-sm bg-surface-primary px-lawmake-lg pb-lawmake-sm">
        {GRADE_FILTERS.map((f) => (
          <FilterChip
            key={f.value}
            label={f.label}
            selected={gradeFilter === f.value}
            onPress={() => setGradeFilter(f.value)}
          />
        ))}
      </View>

      {/* Results count */}
      <View className="px-lawmake-lg py-lawmake-sm">
        <Text className="text-lawmake-caption text-neutral-400">{filtered.length}명</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.memberId}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      />
    </View>
  );
}
