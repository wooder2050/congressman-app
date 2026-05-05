import { useRouter } from 'expo-router';
import { CalendarDays } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { formatDate } from '@/lib/format';
import type { Schedule } from '@/types';

interface Props {
  schedules: Schedule[] | undefined;
}

/**
 * 홈 화면 다가오는 일정 섹션 (최대 3건).
 */
export function UpcomingSchedulesSection({ schedules }: Props) {
  const router = useRouter();
  if (!schedules || schedules.length === 0) return null;

  return (
    <View className="mt-5 px-5">
      <SectionHeader title="다가오는 일정" onMore={() => router.push('/schedule')} />
      <View className="mt-3 gap-2">
        {schedules.slice(0, 3).map((s) => (
          <Card key={s.id} className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
              <CalendarDays size={18} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-neutral-800" numberOfLines={1}>
                {s.title || s.committeeName}
              </Text>
              <Text className="mt-0.5 text-xs text-neutral-400">
                {formatDate(s.meetingDate)} {s.meetingTime}
              </Text>
            </View>
            <Badge
              label={s.type === 'plenary' ? '본회의' : '위원회'}
              color={s.type === 'plenary' ? '#111111' : '#E5E5E5'}
              textColor={s.type === 'plenary' ? '#FFFFFF' : '#595959'}
            />
          </Card>
        ))}
      </View>
    </View>
  );
}
