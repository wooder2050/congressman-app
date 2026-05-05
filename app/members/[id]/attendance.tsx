import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAttendance, getAbsenceDetails } from '@/api/attendance';
import { getMonthlyAttendance, getMemberVotes } from '@/api/members';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { MEMBER_VOTE_RESULT_MAP } from '@/constants/maps';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { formatDate, formatPercent } from '@/lib/format';

const CURRENT_TERM = 22;

function AttendanceDonut({ rate }: { rate: number }) {
  const pct = Math.min(rate, 100);
  return (
    <View className="items-center">
      <View className="h-28 w-28 items-center justify-center rounded-full bg-neutral-100">
        <View
          className="absolute h-28 w-28 rounded-full"
          style={{
            borderWidth: 8,
            borderColor: '#E5E5E5',
          }}
        />
        <View
          className="absolute h-28 w-28 rounded-full"
          style={{
            borderWidth: 8,
            borderColor: '#2563EB',
            borderTopColor: pct >= 25 ? '#2563EB' : 'transparent',
            borderRightColor: pct >= 50 ? '#2563EB' : 'transparent',
            borderBottomColor: pct >= 75 ? '#2563EB' : 'transparent',
            borderLeftColor: pct >= 100 ? '#2563EB' : 'transparent',
          }}
        />
        <Text className="text-lawmake-title1 font-bold text-primary">{formatPercent(rate)}</Text>
      </View>
    </View>
  );
}

export default function AttendanceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const { data: attendance, isLoading, error, refetch } = useLawmakeQuery(
    getAttendance,
    [{ memberId: id, termId: CURRENT_TERM }]
  );

  const { data: absence } = useLawmakeQuery(
    getAbsenceDetails,
    [{ memberId: id, termId: CURRENT_TERM }],
    { enabled: !!attendance }
  );

  const { data: monthly } = useLawmakeQuery(
    getMonthlyAttendance,
    [{ memberId: id, termId: CURRENT_TERM }],
    { enabled: !!attendance }
  );

  const { data: votesData } = useLawmakeQuery(
    getMemberVotes,
    [{ memberId: id, termId: CURRENT_TERM, limit: 20 }],
    { enabled: !!attendance }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!attendance) return <EmptyState title="출석 데이터가 없습니다" />;

  return (
    <ScrollView
      className="flex-1 bg-surface-secondary"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      {/* Attendance Summary */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-lg pt-lawmake-md">
        <AttendanceDonut rate={attendance.rate} />

        <View className="mt-lawmake-md flex-row justify-around">
          <View className="items-center">
            <Text className="text-lawmake-headline font-bold text-neutral-900">{attendance.attended}</Text>
            <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">출석</Text>
          </View>
          <View className="items-center">
            <Text className="text-lawmake-headline font-bold text-neutral-900">{attendance.absent}</Text>
            <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">결석</Text>
          </View>
          <View className="items-center">
            <Text className="text-lawmake-headline font-bold text-neutral-900">{attendance.leave}</Text>
            <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">청가</Text>
          </View>
          <View className="items-center">
            <Text className="text-lawmake-headline font-bold text-neutral-900">{attendance.travel}</Text>
            <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">출장</Text>
          </View>
          <View className="items-center">
            <Text className="text-lawmake-headline font-bold text-neutral-900">{attendance.totalSessions}</Text>
            <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">전체</Text>
          </View>
        </View>
      </View>

      {/* Absence Breakdown */}
      {absence && absence.length > 0 && (
        <View className="mt-lawmake-sm px-lawmake-lg">
          <Card>
            <Text className="text-lawmake-subhead font-semibold text-neutral-800">결석 사유 내역</Text>
            <View className="mt-lawmake-sm gap-lawmake-sm">
              {absence.map((a) => (
                <View key={a.type} className="flex-row items-center justify-between">
                  <Text className="text-lawmake-footnote text-neutral-600">{a.type}</Text>
                  <Text className="text-lawmake-footnote font-bold text-neutral-800">{a.count}회</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>
      )}

      {/* Monthly Attendance */}
      {monthly && monthly.length > 0 && (
        <View className="mt-lawmake-sm px-lawmake-lg">
          <Card>
            <Text className="text-lawmake-subhead font-semibold text-neutral-800">월별 출석 현황</Text>
            <View className="mt-lawmake-sm gap-lawmake-sm">
              {monthly.map((m) => {
                const total = m.attended + m.absent;
                const pct = total > 0 ? (m.attended / total) * 100 : 0;
                return (
                  <View key={m.month}>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-lawmake-caption text-neutral-500">{m.month}</Text>
                      <Text className="text-lawmake-caption text-neutral-500">
                        {m.attended}/{total} ({pct.toFixed(0)}%)
                      </Text>
                    </View>
                    <View className="mt-lawmake-xs h-2 overflow-hidden rounded-full bg-neutral-100">
                      <View
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        </View>
      )}

      {/* Recent Vote Records */}
      {votesData && votesData.votes.length > 0 && (
        <View className="mt-lawmake-sm px-lawmake-lg">
          <Card>
            <Text className="text-lawmake-subhead font-semibold text-neutral-800">
              최근 표결 참여 ({votesData.total}건)
            </Text>
            {/* Vote Summary */}
            {votesData.summary && (
              <View className="mt-lawmake-sm flex-row gap-lawmake-sm border-b border-neutral-100 pb-lawmake-sm">
                <Text className="text-lawmake-caption text-success">찬성 {votesData.summary.yes}</Text>
                <Text className="text-lawmake-caption text-error">반대 {votesData.summary.no}</Text>
                <Text className="text-lawmake-caption text-neutral-500">기권 {votesData.summary.abstain}</Text>
                <Text className="text-lawmake-caption text-neutral-400">불참 {votesData.summary.absent}</Text>
              </View>
            )}
            <View className="mt-lawmake-sm gap-lawmake-sm">
              {votesData.votes.slice(0, 20).map((v) => {
                const result = MEMBER_VOTE_RESULT_MAP[v.memberResult];
                return (
                  <View key={v.voteId} className="flex-row items-center justify-between">
                    <View className="flex-1 pr-lawmake-sm">
                      <Text className="text-lawmake-caption text-neutral-700" numberOfLines={1}>
                        {v.billName}
                      </Text>
                      <Text className="text-lawmake-caption text-neutral-400">
                        {formatDate(v.procDate)}
                      </Text>
                    </View>
                    <Badge
                      label={result.label}
                      color={result.color}
                      textColor={result.textColor}
                    />
                  </View>
                );
              })}
            </View>
          </Card>
        </View>
      )}
    </ScrollView>
  );
}
