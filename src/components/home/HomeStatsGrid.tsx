import { FileText, TrendingUp, Users, Vote as VoteIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { MetricCard } from '@/components/ui/MetricCard';
import { formatNumber, formatPercent } from '@/lib/format';

interface Props {
  memberCount: number;
  billCount: number;
  voteCount: number;
  avgAttendanceRate: number;
}

/**
 * 홈 화면 2x2 통계 그리드.
 *
 * 변경 (PR2):
 * - Card → MetricCard (Toss 스타일: 좌측 정렬 라벨/숫자, hint)
 * - 아이콘 + UPPERCASE 라벨 + 큰 숫자 (title1, 22pt)
 * - 패딩/간격 토큰화
 */
export function HomeStatsGrid({ memberCount, billCount, voteCount, avgAttendanceRate }: Props) {
  return (
    <View className="mt-lawmake-lg gap-lawmake-md px-lawmake-lg">
      <View className="flex-row gap-lawmake-md">
        <MetricCard
          className="flex-1"
          icon={<Users size={14} color="#2563EB" />}
          label="의원"
          value={formatNumber(memberCount)}
          hint="제22대"
          accentColor="#2563EB"
        />
        <MetricCard
          className="flex-1"
          icon={<FileText size={14} color="#2563EB" />}
          label="법안"
          value={formatNumber(billCount)}
          hint="발의 누적"
          accentColor="#2563EB"
        />
      </View>
      <View className="flex-row gap-lawmake-md">
        <MetricCard
          className="flex-1"
          icon={<VoteIcon size={14} color="#2563EB" />}
          label="표결"
          value={formatNumber(voteCount)}
          hint="본회의"
          accentColor="#2563EB"
        />
        <MetricCard
          className="flex-1"
          icon={<TrendingUp size={14} color="#16A34A" />}
          label="평균 출석률"
          value={formatPercent(avgAttendanceRate)}
          hint="대수 기준"
          accentColor="#16A34A"
        />
      </View>
    </View>
  );
}
