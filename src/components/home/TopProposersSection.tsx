import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { MemberPhoto } from '@/components/MemberPhoto';
import { PartyBadge } from '@/components/PartyBadge';
import { Section } from '@/components/ui/Section';
import { tapLight } from '@/lib/haptics';
import type { HomeStats } from '@/types';

interface Props {
  proposers: HomeStats['topProposers'];
}

/**
 * 홈 화면 최다 발의 의원 섹션 (TOP 5).
 *
 * 변경 (PR4):
 * - Section + Card 안의 Pressable rows 패턴 (PR3 ranking과 일관)
 * - hairline border (border-b border-neutral-100)
 * - 의원 사진 40 → 36 (다른 ranking 카드와 통일)
 * - 토큰화
 */
export function TopProposersSection({ proposers }: Props) {
  const router = useRouter();
  if (proposers.length === 0) return null;

  const items = proposers.slice(0, 3);

  return (
    <View className="mt-lawmake-sm bg-surface-primary px-lawmake-lg pt-lawmake-lg">
      <Section title="최다 발의 의원">
        <View>
          {items.map((p, i) => {
            const isLast = i === items.length - 1;
            return (
              <Pressable
                key={p.memberId}
                onPress={() => {
                  tapLight();
                  router.push(`/members/${p.memberId}`);
                }}
                className={`flex-row items-center gap-lawmake-md py-lawmake-md active:bg-neutral-50 ${
                  isLast ? '' : 'border-b border-neutral-100'
                }`}
              >
                <Text
                  className="w-8 text-center text-lawmake-callout font-bold text-primary"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {i + 1}
                </Text>
                <MemberPhoto uri={p.photoUrl} size={36} partyColor={p.party.color} />
                <View className="flex-1">
                  <Text className="text-lawmake-body text-neutral-900">{p.name}</Text>
                  <View className="mt-lawmake-xs">
                    <PartyBadge name={p.party.name} color={p.party.color} />
                  </View>
                </View>
                <Text className="text-lawmake-callout font-semibold text-primary">
                  {p.billCount}건
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>
    </View>
  );
}
