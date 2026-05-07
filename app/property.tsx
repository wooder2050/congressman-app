import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getPropertyStats } from '@/api/property';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MemberPhoto } from '@/components/MemberPhoto';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { tapLight } from '@/lib/haptics';
import {
  buildProfiles,
  formatPropertyAmount,
  type MemberPropertyProfile,
  type PropertyCategory,
} from '@/lib/property-utils';

const CATEGORY_FILTERS: { label: string; value: PropertyCategory }[] = [
  { label: '다주택자', value: 'multi-home' },
  { label: '고가주택', value: 'expensive-home' },
  { label: '과다보유', value: 'excessive-property' },
];

const SORT_DEFAULTS: Record<PropertyCategory, 'count' | 'max' | 'total' | 'name'> = {
  'multi-home': 'count',
  'expensive-home': 'max',
  'excessive-property': 'total',
  none: 'name',
};

function sortProfiles(
  profiles: MemberPropertyProfile[],
  sort: 'count' | 'max' | 'total' | 'name',
): MemberPropertyProfile[] {
  return [...profiles].sort((a, b) => {
    switch (sort) {
      case 'count':
        return (
          b.housingCount - a.housingCount ||
          b.housingTotalAmount - a.housingTotalAmount
        );
      case 'max':
        return b.maxSingleHousingAmount - a.maxSingleHousingAmount;
      case 'total':
        return b.totalRealEstateAmount - a.totalRealEstateAmount;
      case 'name':
        return a.name.localeCompare(b.name, 'ko');
      default:
        return 0;
    }
  });
}

export default function PropertyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<PropertyCategory>('multi-home');

  const { data, isLoading, error, refetch } = useLawmakeQuery(getPropertyStats, []);

  const profiles = useMemo(
    () => (data ? buildProfiles(data.members, data.assets) : []),
    [data],
  );

  // 카테고리별 인원수
  const counts = useMemo(() => {
    const c: Record<PropertyCategory, number> = {
      'multi-home': 0,
      'expensive-home': 0,
      'excessive-property': 0,
      none: 0,
    };
    for (const p of profiles) {
      for (const cat of p.categories) c[cat]++;
    }
    return c;
  }, [profiles]);

  // 활성 카테고리에 속한 의원 정렬
  const filtered = useMemo(() => {
    const list = profiles.filter((p) => p.categories.includes(category));
    return sortProfiles(list, SORT_DEFAULTS[category]);
  }, [profiles, category]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!data) return <EmptyState title="데이터가 없습니다" />;

  const renderItem = ({ item }: { item: MemberPropertyProfile }) => {
    const onPress = () => {
      tapLight();
      router.push(`/members/${item.memberId}`);
    };

    return (
      <Pressable
        onPress={onPress}
        className="flex-row items-center gap-lawmake-md border-b border-neutral-100 bg-surface-primary px-lawmake-lg py-lawmake-md active:bg-neutral-50"
      >
        <MemberPhoto uri={item.photoUrl} size={40} partyColor={item.partyColor} />
        <View className="flex-1">
          <View className="flex-row items-center gap-lawmake-sm">
            <Text className="text-lawmake-body font-semibold text-neutral-900">
              {item.name}
            </Text>
            <Text className="text-lawmake-caption text-neutral-500">{item.party}</Text>
          </View>
          <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500" numberOfLines={1}>
            {item.district}
          </Text>
        </View>
        <View className="items-end">
          {category === 'multi-home' && (
            <>
              <Text className="text-lawmake-headline font-bold text-error">
                {item.housingCount}채
              </Text>
              <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-500">
                {formatPropertyAmount(item.housingTotalAmount)}
              </Text>
            </>
          )}
          {category === 'expensive-home' && (
            <Text className="text-lawmake-headline font-bold text-primary">
              {formatPropertyAmount(item.maxSingleHousingAmount)}
            </Text>
          )}
          {category === 'excessive-property' && (
            <Text className="text-lawmake-headline font-bold text-primary">
              {formatPropertyAmount(item.totalRealEstateAmount)}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  const ListHeader = (
    <View>
      {/* Disclaimer */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-sm pt-lawmake-sm">
        <Text className="text-lawmake-caption leading-4 text-neutral-400">
          2024년 재산신고 공개자료 기반. 가액은 공시가격 기준이며 시세와 다를 수 있습니다.
        </Text>
      </View>

      {/* Summary Stats */}
      <View className="flex-row gap-lawmake-sm bg-surface-primary px-lawmake-lg pb-lawmake-md">
        {(['multi-home', 'expensive-home', 'excessive-property'] as PropertyCategory[]).map((c) => {
          const label =
            c === 'multi-home'
              ? '다주택자'
              : c === 'expensive-home'
              ? '고가주택'
              : '과다보유';
          const active = category === c;
          return (
            <Pressable
              key={c}
              onPress={() => {
                tapLight();
                setCategory(c);
              }}
              className={`flex-1 items-center rounded-lawmake-lg border py-lawmake-md active:opacity-70 ${
                active ? 'border-primary bg-primary-light' : 'border-neutral-100 bg-surface-primary'
              }`}
            >
              <Text
                className={`text-lawmake-title2 font-bold ${
                  active ? 'text-primary' : 'text-neutral-900'
                }`}
              >
                {counts[c]}
              </Text>
              <Text
                className={`mt-lawmake-xs text-lawmake-caption ${
                  active ? 'text-primary' : 'text-neutral-500'
                }`}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* List subtitle */}
      <View className="bg-surface-secondary px-lawmake-lg py-lawmake-sm">
        <Text className="text-lawmake-caption text-neutral-500">
          {category === 'multi-home' && '본인/배우자 명의 주거용 건물 2채 이상'}
          {category === 'expensive-home' && '단일 주택 신고가액 15억원 이상'}
          {category === 'excessive-property' && '부동산(건물+토지) 총 30억원 이상'}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-surface-secondary">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.memberId}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState title="해당 조건의 의원이 없습니다" />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      />
    </View>
  );
}
