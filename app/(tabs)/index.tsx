import { useRouter } from 'expo-router';
import {
  CalendarDays,
  FileText,
  Newspaper,
  TrendingUp,
  Users,
  Vote as VoteIcon,
} from 'lucide-react-native';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAttendanceRanking } from '@/api/attendance';
import { getUpcomingSchedules } from '@/api/schedules';
import { getHomeStats } from '@/api/stats';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MemberPhoto } from '@/components/MemberPhoto';
import { PartyBadge } from '@/components/PartyBadge';
import { Badge } from '@/components/ui/Badge';
import { Card, PressableCard } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BILL_STATUS_MAP, VOTE_RESULT_MAP } from '@/constants/maps';
import { getLatestWeeklyArticle } from '@/data/weekly';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { formatDate, formatNumber, formatPercent } from '@/lib/format';

const CURRENT_TERM = 22;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    data: stats,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useLawmakeQuery(getHomeStats, [CURRENT_TERM]);

  const { data: schedules } = useLawmakeQuery(getUpcomingSchedules, [CURRENT_TERM]);

  const { data: ranking } = useLawmakeQuery(getAttendanceRanking, [CURRENT_TERM]);

  const latestWeekly = getLatestWeeklyArticle();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!stats) return <EmptyState title="데이터가 없습니다" />;

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563EB" />
      }
    >
      {/* Header */}
      <View className="bg-white px-5 pb-5 pt-2">
        <Text className="text-2xl font-bold text-neutral-900">제22대 국회</Text>
        <Text className="mt-1 text-sm text-neutral-400">국회 의정활동 한눈에 보기</Text>
      </View>

      {/* Latest Weekly News */}
      {latestWeekly && (
        <View className="mt-4 px-5">
          <SectionHeader
            title="주간뉴스"
            onMore={() => router.push('/weekly')}
          />
          <PressableCard
            className="mt-3"
            onPress={() => router.push(`/weekly/${latestWeekly.id}`)}
          >
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary-light">
                <Newspaper size={16} color="#2563EB" />
              </View>
              <Badge label="최신" color="#2563EB" textColor="#FFFFFF" />
              <Text className="text-xs text-neutral-400">{latestWeekly.period}</Text>
            </View>
            <Text className="mt-2 text-base font-bold text-neutral-900">
              {latestWeekly.title}
            </Text>
            <Text className="mt-1 text-sm leading-5 text-neutral-600" numberOfLines={2}>
              {latestWeekly.summary}
            </Text>
            {latestWeekly.tags.length > 0 && (
              <View className="mt-2 flex-row flex-wrap gap-1.5">
                {latestWeekly.tags.slice(0, 4).map((tag) => (
                  <Text key={tag} className="text-xs text-primary">
                    #{tag}
                  </Text>
                ))}
              </View>
            )}
          </PressableCard>
        </View>
      )}

      {/* Stats Grid */}
      <View className="flex-row flex-wrap px-4 pt-4">
        <View className="w-1/2 p-1">
          <Card className="items-center">
            <Users size={20} color="#2563EB" />
            <Text className="mt-1.5 text-xl font-bold text-neutral-900">
              {formatNumber(stats.memberCount)}
            </Text>
            <Text className="text-xs text-neutral-400">의원 수</Text>
          </Card>
        </View>
        <View className="w-1/2 p-1">
          <Card className="items-center">
            <FileText size={20} color="#2563EB" />
            <Text className="mt-1.5 text-xl font-bold text-neutral-900">
              {formatNumber(stats.billCount)}
            </Text>
            <Text className="text-xs text-neutral-400">발의 법안</Text>
          </Card>
        </View>
        <View className="w-1/2 p-1">
          <Card className="items-center">
            <VoteIcon size={20} color="#2563EB" />
            <Text className="mt-1.5 text-xl font-bold text-neutral-900">
              {formatNumber(stats.voteCount)}
            </Text>
            <Text className="text-xs text-neutral-400">표결 수</Text>
          </Card>
        </View>
        <View className="w-1/2 p-1">
          <Card className="items-center">
            <TrendingUp size={20} color="#2563EB" />
            <Text className="mt-1.5 text-xl font-bold text-neutral-900">
              {formatPercent(stats.avgAttendanceRate)}
            </Text>
            <Text className="text-xs text-neutral-400">평균 출석률</Text>
          </Card>
        </View>
      </View>

      {/* Upcoming Schedules */}
      {schedules && schedules.length > 0 && (
        <View className="mt-5 px-5">
          <SectionHeader
            title="다가오는 일정"
            onMore={() => router.push('/schedule')}
          />
          <View className="mt-3 gap-2">
            {schedules.slice(0, 3).map((s) => (
              <Card key={s.id} className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
                  <CalendarDays size={18} color="#2563EB" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold text-neutral-800"
                    numberOfLines={1}
                  >
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
      )}

      {/* Recent Bills */}
      {stats.recentBills.length > 0 && (
        <View className="mt-5 px-5">
          <SectionHeader
            title="최근 발의 법안"
            onMore={() => router.push('/(tabs)/bills')}
          />
          <View className="mt-3 gap-2">
            {stats.recentBills.slice(0, 5).map((bill) => {
              const status = BILL_STATUS_MAP[bill.status];
              return (
                <PressableCard
                  key={bill.id}
                  onPress={() => router.push(`/bills/${bill.id}`)}
                >
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
      )}

      {/* Recent Votes */}
      {stats.recentVotes.length > 0 && (
        <View className="mt-5 px-5">
          <SectionHeader
            title="최근 표결"
            onMore={() => router.push('/(tabs)/votes')}
          />
          <View className="mt-3 gap-2">
            {stats.recentVotes.slice(0, 5).map((vote) => {
              const result = VOTE_RESULT_MAP[vote.resultCode];
              return (
                <PressableCard
                  key={vote.id}
                  onPress={() => router.push(`/votes/${vote.id}`)}
                >
                  <View className="flex-row items-start justify-between">
                    <Text
                      className="flex-1 text-sm font-semibold text-neutral-800"
                      numberOfLines={2}
                    >
                      {vote.billName}
                    </Text>
                    <Badge
                      label={result.label}
                      color={result.color}
                      textColor={result.textColor}
                      className="ml-2"
                    />
                  </View>
                  <View className="mt-2 flex-row gap-3">
                    <Text className="text-xs text-green-600">
                      찬성 {vote.yesCount}
                    </Text>
                    <Text className="text-xs text-red-600">반대 {vote.noCount}</Text>
                    <Text className="text-xs text-neutral-400">
                      기권 {vote.abstainCount}
                    </Text>
                  </View>
                  <Text className="mt-1 text-xs text-neutral-400">
                    {formatDate(vote.procDate)}
                  </Text>
                </PressableCard>
              );
            })}
          </View>
        </View>
      )}

      {/* Top Proposers */}
      {stats.topProposers.length > 0 && (
        <View className="mt-5 px-5">
          <SectionHeader title="최다 발의 의원" />
          <View className="mt-3 gap-2">
            {stats.topProposers.slice(0, 5).map((proposer, i) => (
              <PressableCard
                key={proposer.memberId}
                className="flex-row items-center gap-3"
                onPress={() => router.push(`/members/${proposer.memberId}`)}
              >
                <Text className="w-5 text-center text-sm font-bold text-primary">
                  {i + 1}
                </Text>
                <MemberPhoto
                  uri={proposer.photoUrl}
                  size={40}
                  partyColor={proposer.party.color}
                />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-neutral-800">
                    {proposer.name}
                  </Text>
                  <PartyBadge
                    name={proposer.party.name}
                    color={proposer.party.color}
                  />
                </View>
                <Text className="text-sm font-bold text-primary">
                  {proposer.billCount}건
                </Text>
              </PressableCard>
            ))}
          </View>
        </View>
      )}

      {/* Attendance Ranking */}
      {ranking && (
        <View className="mt-5 px-5">
          <SectionHeader title="출석률 랭킹" />
          <View className="mt-3 gap-2">
            <Card>
              <Text className="mb-2 text-xs font-semibold text-green-600">
                출석률 TOP 5
              </Text>
              {ranking.top.slice(0, 5).map((m, i) => (
                <PressableCard
                  key={m.memberId}
                  className="mb-1.5 flex-row items-center gap-2 border-0 p-2"
                  style={{ elevation: 0 }}
                  onPress={() => router.push(`/members/${m.memberId}`)}
                >
                  <Text className="w-5 text-center text-xs font-bold text-green-600">
                    {i + 1}
                  </Text>
                  <MemberPhoto uri={m.photoUrl} size={32} partyColor={m.party.color} />
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-neutral-800">
                      {m.name}
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-green-600">
                    {formatPercent(m.rate)}
                  </Text>
                </PressableCard>
              ))}
            </Card>

            <Card>
              <Text className="mb-2 text-xs font-semibold text-red-500">
                출석률 하위 5
              </Text>
              {ranking.bottom.slice(0, 5).map((m, i) => (
                <PressableCard
                  key={m.memberId}
                  className="mb-1.5 flex-row items-center gap-2 border-0 p-2"
                  style={{ elevation: 0 }}
                  onPress={() => router.push(`/members/${m.memberId}`)}
                >
                  <Text className="w-5 text-center text-xs font-bold text-red-500">
                    {i + 1}
                  </Text>
                  <MemberPhoto uri={m.photoUrl} size={32} partyColor={m.party.color} />
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-neutral-800">
                      {m.name}
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-red-500">
                    {formatPercent(m.rate)}
                  </Text>
                </PressableCard>
              ))}
            </Card>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
