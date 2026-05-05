import { FileText, TrendingUp, Users, Vote as VoteIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { formatNumber, formatPercent } from '@/lib/format';

interface Props {
  memberCount: number;
  billCount: number;
  voteCount: number;
  avgAttendanceRate: number;
}

/**
 * 홈 화면 2x2 통계 그리드.
 * v1.1까지 사용된 디자인 그대로 유지 (PR1 refactor: 디자인 변경 없음).
 * PR2에서 MetricCard로 교체 예정.
 */
export function HomeStatsGrid({ memberCount, billCount, voteCount, avgAttendanceRate }: Props) {
  return (
    <View className="flex-row flex-wrap px-4 pt-4">
      <View className="w-1/2 p-1">
        <Card className="items-center">
          <Users size={20} color="#2563EB" />
          <Text className="mt-1.5 text-xl font-bold text-neutral-900">
            {formatNumber(memberCount)}
          </Text>
          <Text className="text-xs text-neutral-400">의원 수</Text>
        </Card>
      </View>
      <View className="w-1/2 p-1">
        <Card className="items-center">
          <FileText size={20} color="#2563EB" />
          <Text className="mt-1.5 text-xl font-bold text-neutral-900">
            {formatNumber(billCount)}
          </Text>
          <Text className="text-xs text-neutral-400">발의 법안</Text>
        </Card>
      </View>
      <View className="w-1/2 p-1">
        <Card className="items-center">
          <VoteIcon size={20} color="#2563EB" />
          <Text className="mt-1.5 text-xl font-bold text-neutral-900">
            {formatNumber(voteCount)}
          </Text>
          <Text className="text-xs text-neutral-400">표결 수</Text>
        </Card>
      </View>
      <View className="w-1/2 p-1">
        <Card className="items-center">
          <TrendingUp size={20} color="#2563EB" />
          <Text className="mt-1.5 text-xl font-bold text-neutral-900">
            {formatPercent(avgAttendanceRate)}
          </Text>
          <Text className="text-xs text-neutral-400">평균 출석률</Text>
        </Card>
      </View>
    </View>
  );
}
