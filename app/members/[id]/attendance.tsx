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
        <Text className="text-2xl font-bold text-primary">{formatPercent(rate)}</Text>
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
      className="flex-1 bg-neutral-50"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      {/* Attendance Summary */}
      <View className="bg-white px-5 pb-5 pt-4">
        <AttendanceDonut rate={attendance.rate} />

        <View className="mt-4 flex-row justify-around">
          <View className="items-center">
            <Text className="text-lg font-bold text-neutral-900">{attendance.attended}</Text>
            <Text className="text-[10px] text-neutral-400">출석</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-neutral-900">{attendance.absent}</Text>
            <Text className="text-[10px] text-neutral-400">결석</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-neutral-900">{attendance.leave}</Text>
            <Text className="text-[10px] text-neutral-400">청가</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-neutral-900">{attendance.travel}</Text>
            <Text className="text-[10px] text-neutral-400">출장</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-neutral-900">{attendance.totalSessions}</Text>
            <Text className="text-[10px] text-neutral-400">전체</Text>
          </View>
        </View>
      </View>

      {/* Absence Breakdown */}
      {absence && absence.length > 0 && (
        <View className="mt-3 px-5">
          <Card>
            <Text className="text-sm font-semibold text-neutral-800">결석 사유 내역</Text>
            <View className="mt-3 gap-2">
              {absence.map((a) => (
                <View key={a.type} className="flex-row items-center justify-between">
                  <Text className="text-sm text-neutral-600">{a.type}</Text>
                  <Text className="text-sm font-bold text-neutral-800">{a.count}회</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>
      )}

      {/* Monthly Attendance */}
      {monthly && monthly.length > 0 && (
        <View className="mt-3 px-5">
          <Card>
            <Text className="text-sm font-semibold text-neutral-800">월별 출석 현황</Text>
            <View className="mt-3 gap-2">
              {monthly.map((m) => {
                const total = m.attended + m.absent;
                const pct = total > 0 ? (m.attended / total) * 100 : 0;
                return (
                  <View key={m.month}>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-neutral-500">{m.month}</Text>
                      <Text className="text-xs text-neutral-500">
                        {m.attended}/{total} ({pct.toFixed(0)}%)
                      </Text>
                    </View>
                    <View className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
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
        <View className="mt-3 px-5">
          <Card>
            <Text className="text-sm font-semibold text-neutral-800">
              최근 표결 참여 ({votesData.total}건)
            </Text>
            {/* Vote Summary */}
            {votesData.summary && (
              <View className="mt-2 flex-row gap-3 border-b border-neutral-100 pb-2">
                <Text className="text-xs text-green-600">찬성 {votesData.summary.yes}</Text>
                <Text className="text-xs text-red-600">반대 {votesData.summary.no}</Text>
                <Text className="text-xs text-neutral-500">기권 {votesData.summary.abstain}</Text>
                <Text className="text-xs text-neutral-400">불참 {votesData.summary.absent}</Text>
              </View>
            )}
            <View className="mt-2 gap-2">
              {votesData.votes.slice(0, 20).map((v) => {
                const result = MEMBER_VOTE_RESULT_MAP[v.memberResult];
                return (
                  <View key={v.voteId} className="flex-row items-center justify-between">
                    <View className="flex-1 pr-2">
                      <Text className="text-xs text-neutral-700" numberOfLines={1}>
                        {v.billName}
                      </Text>
                      <Text className="text-[10px] text-neutral-400">
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
