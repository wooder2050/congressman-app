import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { MemberPhoto } from '@/components/MemberPhoto';
import { PartyBadge } from '@/components/PartyBadge';
import { PressableCard } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { HomeStats } from '@/types';

interface Props {
  proposers: HomeStats['topProposers'];
}

/**
 * 홈 화면 최다 발의 의원 섹션 (TOP 5).
 */
export function TopProposersSection({ proposers }: Props) {
  const router = useRouter();
  if (proposers.length === 0) return null;

  return (
    <View className="mt-5 px-5">
      <SectionHeader title="최다 발의 의원" />
      <View className="mt-3 gap-2">
        {proposers.slice(0, 5).map((proposer, i) => (
          <PressableCard
            key={proposer.memberId}
            className="flex-row items-center gap-3"
            onPress={() => router.push(`/members/${proposer.memberId}`)}
          >
            <Text className="w-5 text-center text-sm font-bold text-primary">{i + 1}</Text>
            <MemberPhoto uri={proposer.photoUrl} size={40} partyColor={proposer.party.color} />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-neutral-800">{proposer.name}</Text>
              <PartyBadge name={proposer.party.name} color={proposer.party.color} />
            </View>
            <Text className="text-sm font-bold text-primary">{proposer.billCount}건</Text>
          </PressableCard>
        ))}
      </View>
    </View>
  );
}
