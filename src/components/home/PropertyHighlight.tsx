import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { MemberPhoto } from '@/components/MemberPhoto';
import { Section } from '@/components/ui/Section';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { tapLight } from '@/lib/haptics';
import type { PropertyStatsResponse } from '@/types';

interface Props {
  data: PropertyStatsResponse | undefined;
}

/**
 * 홈 화면 부동산 보유 현황 섹션.
 *
 * 변경 (PR4):
 * - 통계 3개를 PressableCard로 토큰화 (작은 폰트 → callout/title2)
 * - 다주택 TOP 3은 Card + Pressable row 패턴 (다른 랭킹과 일관)
 * - StatusBadge error tone
 */
export function PropertyHighlight({ data }: Props) {
  const router = useRouter();
  if (!data || data.members.length === 0) return null;

  const memberMap = new Map(data.members.map((m) => [m.memberId, m]));
  const memberAssets = new Map<string, typeof data.assets>();
  for (const a of data.assets) {
    if (!memberAssets.has(a.memberId)) memberAssets.set(a.memberId, []);
    memberAssets.get(a.memberId)!.push(a);
  }

  let multiHomeCount = 0;
  let expensiveCount = 0;
  let excessiveCount = 0;
  const topMultiHome: {
    name: string;
    memberId: string;
    photoUrl: string;
    partyColor: string;
    count: number;
  }[] = [];

  for (const [memberId, assets] of memberAssets) {
    const member = memberMap.get(memberId);
    if (!member) continue;
    const ownAssets = assets.filter((a) => a.relation === '본인' || a.relation === '배우자');
    const homes = ownAssets.filter(
      (a) => a.category === '건물' && !a.item.includes('임차') && !a.item.includes('분양'),
    );
    if (homes.length >= 2) {
      multiHomeCount++;
      topMultiHome.push({
        name: member.name,
        memberId,
        photoUrl: member.photoUrl,
        partyColor: member.partyColor,
        count: homes.length,
      });
    }
    if (ownAssets.some((a) => a.category === '건물' && a.amount >= 1500000000)) {
      expensiveCount++;
    }
    const totalProp = ownAssets
      .filter((a) => a.category === '건물' || a.category === '토지')
      .reduce((s, a) => s + a.amount, 0);
    if (totalProp >= 3000000000) excessiveCount++;
  }
  topMultiHome.sort((a, b) => b.count - a.count);

  const topItems = topMultiHome.slice(0, 3);

  return (
    <View className="mt-lawmake-sm bg-surface-primary px-lawmake-lg pt-lawmake-lg">
      <Section title="부동산 보유 현황" onMore={() => router.push('/property')}>
        <View className="flex-row gap-lawmake-md">
          <StatTile label="다주택자" value={multiHomeCount} colorClass="text-error" />
          <StatTile label="고가주택" value={expensiveCount} colorClass="text-warning-dark" />
          <StatTile label="과다보유" value={excessiveCount} colorClass="text-info-dark" />
        </View>
        {topItems.length > 0 && (
          <View className="mt-lawmake-md">
            <Text className="pb-lawmake-sm pt-lawmake-md text-lawmake-subhead font-semibold text-error">
              다주택 TOP 3
            </Text>
            {topItems.map((m, i) => {
              const isLast = i === topItems.length - 1;
              return (
                <Pressable
                  key={m.memberId}
                  onPress={() => {
                    tapLight();
                    router.push(`/members/${m.memberId}`);
                  }}
                  className={`flex-row items-center gap-lawmake-md py-lawmake-md active:bg-neutral-50 ${
                    isLast ? '' : 'border-b border-neutral-100'
                  }`}
                >
                  <Text
                    className="w-8 text-center text-lawmake-callout font-bold text-error"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {i + 1}
                  </Text>
                  <MemberPhoto uri={m.photoUrl} size={36} partyColor={m.partyColor} />
                  <Text className="flex-1 text-lawmake-body text-neutral-900">{m.name}</Text>
                  <StatusBadge label={`${m.count}채`} tone="error" />
                </Pressable>
              );
            })}
          </View>
        )}
      </Section>
    </View>
  );
}

function StatTile({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  const router = useRouter();
  return (
    <Pressable
      className="flex-1 items-center rounded-lawmake-md border border-neutral-100 py-lawmake-md active:bg-neutral-50"
      onPress={() => {
        tapLight();
        router.push('/property');
      }}
    >
      <Text className={`text-lawmake-title2 font-bold ${colorClass}`}>{value}</Text>
      <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-500">{label}</Text>
    </Pressable>
  );
}
