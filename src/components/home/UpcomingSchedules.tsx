import { useRouter } from 'expo-router';
import { CalendarDays } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/format';
import type { Schedule } from '@/types';

interface Props {
  schedules: Schedule[] | undefined;
}

/**
 * 홈 화면 다가오는 일정 섹션 (최대 3건).
 *
 * 변경 (PR4):
 * - Section 컴포넌트 사용
 * - 본회의/위원회 라벨을 StatusBadge로 (semantic neutral/primary)
 * - 타이포/간격 토큰화
 */
export function UpcomingSchedulesSection({ schedules }: Props) {
  const router = useRouter();
  if (!schedules || schedules.length === 0) return null;

  return (
    <View className="mt-lawmake-md px-lawmake-lg">
      <Section title="다가오는 일정" onMore={() => router.push('/schedule')}>
        <View className="gap-lawmake-sm">
          {schedules.slice(0, 3).map((s) => (
            <Card key={s.id} className="flex-row items-center gap-lawmake-md">
              <View className="h-10 w-10 items-center justify-center rounded-lawmake-md bg-primary-light">
                <CalendarDays size={18} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-lawmake-callout font-semibold text-neutral-900" numberOfLines={1}>
                  {s.title || s.committeeName}
                </Text>
                <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
                  {formatDate(s.meetingDate)} {s.meetingTime}
                </Text>
              </View>
              <StatusBadge
                label={s.type === 'plenary' ? '본회의' : '위원회'}
                tone={s.type === 'plenary' ? 'primary' : 'neutral'}
              />
            </Card>
          ))}
        </View>
      </Section>
    </View>
  );
}
