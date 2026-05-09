import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { MemberPhoto } from '@/components/MemberPhoto';
import { Section } from '@/components/ui/Section';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { tapLight } from '@/lib/haptics';
import { buildProfiles } from '@/lib/property-utils';
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

  // /property 화면과 동일한 산식을 사용해 카운트가 일치하도록 한다.
  const profiles = useMemo(
    () => (data ? buildProfiles(data.members, data.assets) : []),
    [data],
  );

  if (!data || data.members.length === 0) return null;

  let multiHomeCount = 0;
  let expensiveCount = 0;
  let excessiveCount = 0;
  for (const p of profiles) {
    if (p.categories.includes('multi-home')) multiHomeCount++;
    if (p.categories.includes('expensive-home')) expensiveCount++;
    if (p.categories.includes('excessive-property')) excessiveCount++;
  }

  const topItems = profiles
    .filter((p) => p.categories.includes('multi-home'))
    .sort(
      (a, b) =>
        b.housingCount - a.housingCount ||
        b.housingTotalAmount - a.housingTotalAmount,
    )
    .slice(0, 3);

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
                  <StatusBadge label={`${m.housingCount}채`} tone="error" />
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
