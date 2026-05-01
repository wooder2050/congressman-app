import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getElections } from '@/api/elections';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { PressableCard } from '@/components/ui/Card';
import { ELECTION_STATUS_MAP } from '@/constants/maps';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { formatDate } from '@/lib/format';

export default function ElectionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: elections, isLoading, error, refetch } = useLawmakeQuery(getElections, []);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!elections?.length) return <EmptyState title="선거 정보가 없습니다" />;

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 16, gap: 12 }}
    >
      {elections.map((election) => {
        const status = ELECTION_STATUS_MAP[election.status];
        return (
          <PressableCard
            key={election.id}
            onPress={() => router.push(`/elections/${election.id}`)}
          >
            <View className="flex-row items-center gap-2">
              <Badge label={status.label} color={status.color} textColor="#FFFFFF" />
              <Text className="text-xs text-neutral-400">
                {formatDate(election.electionDate)}
              </Text>
            </View>
            <Text className="mt-2 text-base font-bold text-neutral-900">
              {election.name}
            </Text>
            <Text className="mt-1 text-xs text-neutral-400">
              {election.districtCount}개 선거구
            </Text>
          </PressableCard>
        );
      })}
    </ScrollView>
  );
}
