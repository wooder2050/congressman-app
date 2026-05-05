import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { PressableCard } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BILL_STATUS_MAP } from '@/constants/maps';
import { formatDate } from '@/lib/format';
import type { Bill } from '@/types';

interface Props {
  bills: Bill[];
}

/**
 * 홈 화면 최근 발의 법안 섹션 (최대 5건).
 */
export function RecentBillsSection({ bills }: Props) {
  const router = useRouter();
  if (bills.length === 0) return null;

  return (
    <View className="mt-5 px-5">
      <SectionHeader title="최근 발의 법안" onMore={() => router.push('/(tabs)/bills')} />
      <View className="mt-3 gap-2">
        {bills.slice(0, 5).map((bill) => {
          const status = BILL_STATUS_MAP[bill.status];
          return (
            <PressableCard key={bill.id} onPress={() => router.push(`/bills/${bill.id}`)}>
              <View className="flex-row items-start justify-between">
                <Text
                  className="flex-1 text-sm font-semibold text-neutral-800"
                  numberOfLines={2}
                >
                  {bill.title}
                </Text>
                <Badge
                  label={status.label}
                  color={status.color}
                  textColor={status.textColor}
                  className="ml-2"
                />
              </View>
              <Text className="mt-1.5 text-xs text-neutral-400">
                {bill.proposerName} | {formatDate(bill.proposedDate)}
              </Text>
              {bill.simpleSummary && (
                <Text
                  className="mt-1.5 text-xs leading-4 text-neutral-500"
                  numberOfLines={2}
                >
                  {bill.simpleSummary}
                </Text>
              )}
            </PressableCard>
          );
        })}
      </View>
    </View>
  );
}
