import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLocalElectionRegion } from '@/api/local-elections';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PressableCard } from '@/components/ui/Card';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import type { LocalElectionType } from '@/types';

const TYPE_LABELS: Record<LocalElectionType, string> = {
  governor: '광역단체장',
  mayor: '기초단체장',
  superintendent: '교육감',
  'metro-council': '광역의원',
  'local-council': '기초의원',
};

export default function LocalElectionRegionScreen() {
  const { id, sido } = useLocalSearchParams<{ id: string; sido: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const decodedSido = decodeURIComponent(sido);
  const params = { id, sido: decodedSido };

  const { data, isLoading, error, refetch } = useLawmakeQuery(getLocalElectionRegion, [params]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!data || data.races.length === 0)
    return <EmptyState title="이 지역에 등록된 선거구가 없습니다" />;

  // electionType 별로 그룹핑
  const grouped = data.races.reduce<Record<string, typeof data.races>>((acc, race) => {
    if (!acc[race.electionType]) acc[race.electionType] = [];
    acc[race.electionType].push(race);
    return acc;
  }, {});

  return (
    <View className="flex-1 bg-surface-secondary">
      <View className="bg-surface-primary px-lawmake-lg py-lawmake-md">
        <Text className="text-lawmake-title2 text-neutral-900">{decodedSido}</Text>
        <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
          총 {data.races.length}개 선거구
        </Text>
      </View>

      <FlatList
        data={Object.entries(grouped) as [LocalElectionType, typeof data.races][]}
        keyExtractor={([type]) => type}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 16,
          gap: 20,
        }}
        renderItem={({ item: [type, races] }) => (
          <View className="gap-lawmake-sm">
            <Text className="text-lawmake-subhead font-bold text-neutral-700">
              {TYPE_LABELS[type]} · {races.length}개
            </Text>
            {races.map((race) => (
              <PressableCard
                key={race.id}
                onPress={() => router.push(`/local-elections/${id}/races/${race.id}` as never)}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-lawmake-sm">
                    <Text className="text-lawmake-callout font-bold text-neutral-900">
                      {race.displayName}
                    </Text>
                    <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-500">
                      후보자 {race.candidateCount}명
                      {race.seatCount > 1 ? ` · ${race.seatCount}명 선출` : ''}
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#A3A3A3" />
                </View>
              </PressableCard>
            ))}
          </View>
        )}
      />
    </View>
  );
}
