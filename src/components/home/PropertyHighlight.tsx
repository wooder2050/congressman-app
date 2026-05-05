import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { MemberPhoto } from '@/components/MemberPhoto';
import { Badge } from '@/components/ui/Badge';
import { Card, PressableCard } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { PropertyStatsResponse } from '@/types';

interface Props {
  data: PropertyStatsResponse | undefined;
}

/**
 * 홈 화면 부동산 보유 현황 섹션.
 * 다주택자 / 고가주택 / 과다보유 통계 + 다주택 TOP 3.
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

  return (
    <View className="mt-5 px-5">
      <SectionHeader title="부동산 보유 현황" onMore={() => router.push('/property')} />
      <View className="mt-3 flex-row gap-2">
        <PressableCard
          className="flex-1 items-center py-3"
          onPress={() => router.push('/property')}
        >
          <Text className="text-lg font-bold text-red-600">{multiHomeCount}</Text>
          <Text className="text-[10px] text-neutral-400">다주택자</Text>
        </PressableCard>
        <PressableCard
          className="flex-1 items-center py-3"
          onPress={() => router.push('/property')}
        >
          <Text className="text-lg font-bold text-amber-600">{expensiveCount}</Text>
          <Text className="text-[10px] text-neutral-400">고가주택</Text>
        </PressableCard>
        <PressableCard
          className="flex-1 items-center py-3"
          onPress={() => router.push('/property')}
        >
          <Text className="text-lg font-bold text-violet-600">{excessiveCount}</Text>
          <Text className="text-[10px] text-neutral-400">과다보유</Text>
        </PressableCard>
      </View>
      {topMultiHome.length > 0 && (
        <Card className="mt-2">
          <Text className="mb-2 text-xs font-semibold text-red-600">다주택 TOP 3</Text>
          {topMultiHome.slice(0, 3).map((m, i) => (
            <PressableCard
              key={m.memberId}
              className="mb-1.5 flex-row items-center gap-2 border-0 p-2"
              style={{ elevation: 0 }}
              onPress={() => router.push(`/members/${m.memberId}`)}
            >
              <Text className="w-5 text-center text-xs font-bold text-red-500">{i + 1}</Text>
              <MemberPhoto uri={m.photoUrl} size={32} partyColor={m.partyColor} />
              <View className="flex-1">
                <Text className="text-sm font-medium text-neutral-800">{m.name}</Text>
              </View>
              <Badge label={`${m.count}채`} color="#DC2626" textColor="#FFFFFF" />
            </PressableCard>
          ))}
        </Card>
      )}
    </View>
  );
}
