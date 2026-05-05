import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { PressableCard } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { StatusBadge, type StatusTone } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/format';
import type { Bill } from '@/types';

const BILL_STATUS_TONE: Record<Bill['status'], { label: string; tone: StatusTone }> = {
  passed: { label: '가결', tone: 'success' },
  pending: { label: '계류', tone: 'neutral' },
  discarded: { label: '폐기', tone: 'error' },
  committee: { label: '위원회', tone: 'info' },
};

interface Props {
  bills: Bill[];
}

/**
 * 홈 화면 최근 발의 법안 섹션 (최대 5건).
 *
 * 변경 (PR4):
 * - Section 컴포넌트 사용
 * - status를 StatusBadge (semantic tone)
 * - 본문 lawmake-body 가독성
 */
export function RecentBillsSection({ bills }: Props) {
  const router = useRouter();
  if (bills.length === 0) return null;

  return (
    <View className="mt-lawmake-xl px-lawmake-lg">
      <Section title="최근 발의 법안" onMore={() => router.push('/(tabs)/bills')}>
        <View className="gap-lawmake-sm">
          {bills.slice(0, 5).map((bill) => {
            const status = BILL_STATUS_TONE[bill.status] ?? BILL_STATUS_TONE.pending;
            return (
              <PressableCard key={bill.id} onPress={() => router.push(`/bills/${bill.id}`)}>
                <View className="flex-row items-start justify-between gap-lawmake-sm">
                  <Text
                    className="flex-1 text-lawmake-callout font-semibold text-neutral-900"
                    numberOfLines={2}
                  >
                    {bill.title}
                  </Text>
                  <StatusBadge label={status.label} tone={status.tone} />
                </View>
                <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
                  {bill.proposerName} · {formatDate(bill.proposedDate)}
                </Text>
                {bill.simpleSummary && (
                  <Text
                    className="mt-lawmake-sm text-lawmake-footnote text-neutral-600"
                    numberOfLines={2}
                  >
                    {bill.simpleSummary}
                  </Text>
                )}
              </PressableCard>
            );
          })}
        </View>
      </Section>
    </View>
  );
}
