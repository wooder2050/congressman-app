import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getPropertyStats } from '@/api/property';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MemberPhoto } from '@/components/MemberPhoto';
import { Badge } from '@/components/ui/Badge';
import { Card, PressableCard } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { formatAmount } from '@/lib/format';
import type { PropertyMember, PropertyAsset } from '@/types';

type Category = 'multi-home' | 'expensive-home' | 'excessive-property';

const CATEGORY_FILTERS: { label: string; value: Category }[] = [
  { label: '다주택자', value: 'multi-home' },
  { label: '고가주택', value: 'expensive-home' },
  { label: '부동산 과다보유', value: 'excessive-property' },
];

function groupMembersByCategory(
  members: PropertyMember[],
  assets: PropertyAsset[]
) {
  const memberMap = new Map(members.map((m) => [m.memberId, m]));
  const memberAssets = new Map<string, PropertyAsset[]>();
  for (const a of assets) {
    if (!memberAssets.has(a.memberId)) memberAssets.set(a.memberId, []);
    memberAssets.get(a.memberId)!.push(a);
  }

  const multiHome: { member: PropertyMember; count: number; totalAmount: number }[] = [];
  const expensiveHome: { member: PropertyMember; item: string; amount: number }[] = [];
  const excessiveProperty: { member: PropertyMember; totalAmount: number }[] = [];

  for (const [memberId, memberAssetList] of memberAssets) {
    const member = memberMap.get(memberId);
    if (!member) continue;

    const ownAssets = memberAssetList.filter(
      (a) => a.relation === '본인' || a.relation === '배우자'
    );
    const homeAssets = ownAssets.filter(
      (a) => a.category === '건물' && !a.item.includes('임차') && !a.item.includes('분양')
    );
    if (homeAssets.length >= 2) {
      multiHome.push({
        member,
        count: homeAssets.length,
        totalAmount: homeAssets.reduce((s, a) => s + a.amount, 0),
      });
    }

    for (const a of ownAssets) {
      if (a.category === '건물' && a.amount >= 1500000000) {
        expensiveHome.push({ member, item: a.item, amount: a.amount });
      }
    }

    const totalProperty = ownAssets
      .filter((a) => a.category === '건물' || a.category === '토지')
      .reduce((s, a) => s + a.amount, 0);
    if (totalProperty >= 3000000000) {
      excessiveProperty.push({ member, totalAmount: totalProperty });
    }
  }

  multiHome.sort((a, b) => b.count - a.count);
  expensiveHome.sort((a, b) => b.amount - a.amount);
  excessiveProperty.sort((a, b) => b.totalAmount - a.totalAmount);

  return { multiHome, expensiveHome, excessiveProperty };
}

export default function PropertyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<Category>('multi-home');

  const { data, isLoading, error, refetch } = useLawmakeQuery(getPropertyStats, []);

  const grouped = useMemo(
    () =>
      data ? groupMembersByCategory(data.members, data.assets) : null,
    [data]
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!grouped) return <EmptyState title="데이터가 없습니다" />;

  const renderMultiHome = () => (
    <FlatList
      data={grouped.multiHome}
      keyExtractor={(item) => item.member.memberId}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, gap: 8 }}
      ListHeaderComponent={
        <Text className="py-2 text-xs text-neutral-400">
          본인/배우자 명의 주거용 건물 2채 이상 ({grouped.multiHome.length}명)
        </Text>
      }
      renderItem={({ item }) => (
        <PressableCard
          className="flex-row items-center gap-3"
          onPress={() => router.push(`/members/${item.member.memberId}`)}
        >
          <MemberPhoto uri={item.member.photoUrl} size={40} partyColor={item.member.partyColor} />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-neutral-800">{item.member.name}</Text>
            <Text className="text-xs text-neutral-400">{item.member.district}</Text>
          </View>
          <View className="items-end">
            <Badge label={`${item.count}채`} color="#DC2626" textColor="#FFFFFF" />
            <Text className="mt-0.5 text-xs text-neutral-400">{formatAmount(item.totalAmount)}원</Text>
          </View>
        </PressableCard>
      )}
    />
  );

  const renderExpensiveHome = () => (
    <FlatList
      data={grouped.expensiveHome}
      keyExtractor={(item, i) => `${item.member.memberId}-${i}`}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, gap: 8 }}
      ListHeaderComponent={
        <Text className="py-2 text-xs text-neutral-400">
          단일 주택 신고가액 15억원 이상 ({grouped.expensiveHome.length}건)
        </Text>
      }
      renderItem={({ item }) => (
        <PressableCard
          className="flex-row items-center gap-3"
          onPress={() => router.push(`/members/${item.member.memberId}`)}
        >
          <MemberPhoto uri={item.member.photoUrl} size={40} partyColor={item.member.partyColor} />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-neutral-800">{item.member.name}</Text>
            <Text className="mt-0.5 text-xs text-neutral-400" numberOfLines={1}>
              {item.item}
            </Text>
          </View>
          <Text className="text-sm font-bold text-primary">{formatAmount(item.amount)}원</Text>
        </PressableCard>
      )}
    />
  );

  const renderExcessiveProperty = () => (
    <FlatList
      data={grouped.excessiveProperty}
      keyExtractor={(item) => item.member.memberId}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, gap: 8 }}
      ListHeaderComponent={
        <Text className="py-2 text-xs text-neutral-400">
          부동산(건물+토지) 총 30억원 이상 ({grouped.excessiveProperty.length}명)
        </Text>
      }
      renderItem={({ item }) => (
        <PressableCard
          className="flex-row items-center gap-3"
          onPress={() => router.push(`/members/${item.member.memberId}`)}
        >
          <MemberPhoto uri={item.member.photoUrl} size={40} partyColor={item.member.partyColor} />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-neutral-800">{item.member.name}</Text>
            <Text className="text-xs text-neutral-400">{item.member.district}</Text>
          </View>
          <Text className="text-sm font-bold text-primary">{formatAmount(item.totalAmount)}원</Text>
        </PressableCard>
      )}
    />
  );

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Summary */}
      <View className="bg-white px-5 pb-3 pt-2">
        <Text className="text-xs leading-4 text-neutral-400">
          2024년 재산신고 공개자료 기반. 재산신고 가액은 공시가격 기준이며 시세와 다를 수 있습니다.
        </Text>
      </View>

      {/* Summary Stats */}
      <View className="flex-row gap-2 bg-white px-5 pb-4">
        <Card className="flex-1 items-center py-3">
          <Text className="text-lg font-bold text-neutral-900">{grouped.multiHome.length}</Text>
          <Text className="text-[10px] text-neutral-400">다주택자</Text>
        </Card>
        <Card className="flex-1 items-center py-3">
          <Text className="text-lg font-bold text-neutral-900">{grouped.expensiveHome.length}</Text>
          <Text className="text-[10px] text-neutral-400">고가주택</Text>
        </Card>
        <Card className="flex-1 items-center py-3">
          <Text className="text-lg font-bold text-neutral-900">{grouped.excessiveProperty.length}</Text>
          <Text className="text-[10px] text-neutral-400">과다보유</Text>
        </Card>
      </View>

      {/* Category Filter */}
      <View className="flex-row gap-2 px-5 py-3">
        {CATEGORY_FILTERS.map((f) => (
          <FilterChip
            key={f.value}
            label={f.label}
            selected={category === f.value}
            onPress={() => setCategory(f.value)}
          />
        ))}
      </View>

      {/* List */}
      {category === 'multi-home' && renderMultiHome()}
      {category === 'expensive-home' && renderExpensiveHome()}
      {category === 'excessive-property' && renderExcessiveProperty()}
    </View>
  );
}
