import { useRouter } from 'expo-router';
import {
  CalendarDays,
  CheckSquare,
  FileText,
  Newspaper,
  TrendingUp,
  Users,
  Vote as VoteIcon,
} from 'lucide-react-native';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAttendanceRanking } from '@/api/attendance';
import { getBreakingNews } from '@/api/breaking-news';
import { getPropertyStats } from '@/api/property';
import { getScorecardRanking } from '@/api/scorecard';
import { getUpcomingSchedules } from '@/api/schedules';
import { getHomeStats } from '@/api/stats';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LocalElectionBanner } from '@/components/LocalElectionBanner';
import { MemberPhoto } from '@/components/MemberPhoto';
import { PartyBadge } from '@/components/PartyBadge';
import { Badge } from '@/components/ui/Badge';
import { Card, PressableCard } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BILL_STATUS_MAP, VOTE_RESULT_MAP, SCORECARD_GRADE_MAP } from '@/constants/maps';
import { getLatestWeeklyArticle } from '@/data/weekly';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { formatDate, formatNumber, formatPercent } from '@/lib/format';

const BREAKING_CATEGORY_STYLE: Record<string, { label: string; color: string }> = {
  committee: { label: '국회', color: '#F59E0B' },
  election: { label: '선거', color: '#F43F5E' },
  legislation: { label: '입법', color: '#3B82F6' },
  politics: { label: '정치', color: '#8B5CF6' },
};

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

  const { data: scorecardData } = useLawmakeQuery(getScorecardRanking, [CURRENT_TERM]);

  const { data: propertyData } = useLawmakeQuery(getPropertyStats, []);

  const { data: breakingNewsData } = useLawmakeQuery(getBreakingNews, []);
  const breakingNews = breakingNewsData ?? [];

  const latestWeekly = getLatestWeeklyArticle();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!stats) return <EmptyState title="데이터가 없습니다" />;

  return (
  <View className="flex-1">
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

      {/* 6·3 지방선거 배너 */}
      <View className="mt-4 px-5">
        <LocalElectionBanner />
      </View>

      {/* Breaking News */}
      {breakingNews.length > 0 && (
        <View className="mt-4 px-5 gap-3">
          <SectionHeader title="속보" />
          {breakingNews.map((item) => {
            const cat = BREAKING_CATEGORY_STYLE[item.category] ?? BREAKING_CATEGORY_STYLE.politics;
            return (
              <PressableCard
                key={item.id}
                className="border-amber-200 bg-amber-50"
                onPress={() => item.linkUrl && router.push(item.linkUrl as never)}
              >
                <View className="flex-row items-center gap-2">
                  <View className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <Badge label={cat.label} color={cat.color} textColor="#FFFFFF" />
                  <Text className="ml-auto text-[10px] text-amber-600">{item.date}</Text>
                </View>
                <Text className="mt-1.5 text-sm font-bold text-amber-900">
                  {item.title}
                </Text>
                <Text className="mt-1 text-xs leading-4 text-amber-800" numberOfLines={3}>
                  {item.description}
                </Text>
                {item.items && item.items.length > 0 && (
                  <View className="mt-2 gap-1.5">
                    {item.items.slice(0, 3).map((detail) => (
                      <View key={detail.label} className="rounded-lg bg-white/70 px-3 py-1.5">
                        <Text className="text-[10px] font-semibold text-amber-700">
                          {detail.label}
                        </Text>
                        <Text className="text-[11px] text-amber-900/70">{detail.value}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </PressableCard>
            );
          })}
        </View>
      )}

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

      {/* Close Votes */}
      {stats.closeVotes && stats.closeVotes.length > 0 && (
        <View className="mt-5 px-5">
          <SectionHeader title="접전 표결" />
          <View className="mt-3 gap-2">
            {stats.closeVotes.slice(0, 5).map((vote) => {
              const result = VOTE_RESULT_MAP[vote.resultCode];
              const total = vote.yesCount + vote.noCount + vote.abstainCount;
              const yesPct = total > 0 ? (vote.yesCount / total) * 100 : 0;
              const noPct = total > 0 ? (vote.noCount / total) * 100 : 0;
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
                  {/* Vote bar */}
                  <View className="mt-2 h-2 flex-row overflow-hidden rounded-full">
                    <View className="h-full bg-green-500" style={{ width: `${yesPct}%` }} />
                    <View className="h-full bg-red-500" style={{ width: `${noPct}%` }} />
                    <View className="h-full flex-1 bg-neutral-200" />
                  </View>
                  <View className="mt-1 flex-row gap-3">
                    <Text className="text-xs text-green-600">찬성 {vote.yesCount}</Text>
                    <Text className="text-xs text-red-600">반대 {vote.noCount}</Text>
                    <Text className="text-xs text-neutral-400">기권 {vote.abstainCount}</Text>
                  </View>
                </PressableCard>
              );
            })}
          </View>
        </View>
      )}

      {/* Rejected Votes */}
      {stats.rejectedVotes && stats.rejectedVotes.length > 0 && (
        <View className="mt-5 px-5">
          <SectionHeader title="부결된 표결" />
          <View className="mt-3 gap-2">
            {stats.rejectedVotes.slice(0, 5).map((vote) => (
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
                  <Badge label="부결" color="#DC2626" textColor="#FFFFFF" className="ml-2" />
                </View>
                <View className="mt-1 flex-row gap-3">
                  <Text className="text-xs text-green-600">찬성 {vote.yesCount}</Text>
                  <Text className="text-xs text-red-600">반대 {vote.noCount}</Text>
                  <Text className="text-xs text-neutral-400">기권 {vote.abstainCount}</Text>
                </View>
                <Text className="mt-0.5 text-xs text-neutral-400">
                  {formatDate(vote.procDate)}
                </Text>
              </PressableCard>
            ))}
          </View>
        </View>
      )}

      {/* Scorecard Highlight */}
      {scorecardData?.rankings && scorecardData.rankings.length > 0 && (
        <View className="mt-5 px-5">
          <SectionHeader
            title="의정활동 성적표"
            onMore={() => router.push('/scorecard-ranking')}
          />
          <View className="mt-3 gap-2">
            <Card>
              <Text className="mb-2 text-xs font-semibold text-primary">TOP 5</Text>
              {scorecardData.rankings.slice(0, 5).map((m, i) => {
                const grade = SCORECARD_GRADE_MAP[m.grade];
                return (
                  <PressableCard
                    key={m.memberId}
                    className="mb-1.5 flex-row items-center gap-2 border-0 p-2"
                    style={{ elevation: 0 }}
                    onPress={() => router.push(`/members/${m.memberId}/scorecard`)}
                  >
                    <Text className="w-5 text-center text-xs font-bold text-primary">
                      {i + 1}
                    </Text>
                    <MemberPhoto uri={m.photoUrl} size={32} partyColor={m.party.color} />
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-neutral-800">{m.name}</Text>
                    </View>
                    <View
                      className="h-6 w-6 items-center justify-center rounded-full"
                      style={{ backgroundColor: grade.bgColor }}
                    >
                      <Text className="text-[10px] font-bold" style={{ color: grade.color }}>
                        {m.grade}
                      </Text>
                    </View>
                    <Text className="w-10 text-right text-xs font-bold text-neutral-600">
                      {m.totalScore.toFixed(1)}
                    </Text>
                  </PressableCard>
                );
              })}
            </Card>

            <Card>
              <Text className="mb-2 text-xs font-semibold text-red-500">하위 5</Text>
              {scorecardData.rankings
                .slice(-5)
                .reverse()
                .map((m, i) => {
                  const grade = SCORECARD_GRADE_MAP[m.grade];
                  return (
                    <PressableCard
                      key={m.memberId}
                      className="mb-1.5 flex-row items-center gap-2 border-0 p-2"
                      style={{ elevation: 0 }}
                      onPress={() => router.push(`/members/${m.memberId}/scorecard`)}
                    >
                      <Text className="w-5 text-center text-xs font-bold text-red-500">
                        {scorecardData.rankings.length - i}
                      </Text>
                      <MemberPhoto uri={m.photoUrl} size={32} partyColor={m.party.color} />
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-neutral-800">{m.name}</Text>
                      </View>
                      <View
                        className="h-6 w-6 items-center justify-center rounded-full"
                        style={{ backgroundColor: grade.bgColor }}
                      >
                        <Text className="text-[10px] font-bold" style={{ color: grade.color }}>
                          {m.grade}
                        </Text>
                      </View>
                      <Text className="w-10 text-right text-xs font-bold text-neutral-600">
                        {m.totalScore.toFixed(1)}
                      </Text>
                    </PressableCard>
                  );
                })}
            </Card>
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

      {/* Property Highlight */}
      {propertyData && propertyData.members.length > 0 && (() => {
        const memberMap = new Map(propertyData.members.map((m) => [m.memberId, m]));
        const memberAssets = new Map<string, typeof propertyData.assets>();
        for (const a of propertyData.assets) {
          if (!memberAssets.has(a.memberId)) memberAssets.set(a.memberId, []);
          memberAssets.get(a.memberId)!.push(a);
        }

        let multiHomeCount = 0;
        let expensiveCount = 0;
        let excessiveCount = 0;
        const topMultiHome: { name: string; memberId: string; photoUrl: string; partyColor: string; count: number }[] = [];

        for (const [memberId, assets] of memberAssets) {
          const member = memberMap.get(memberId);
          if (!member) continue;
          const ownAssets = assets.filter((a) => a.relation === '본인' || a.relation === '배우자');
          const homes = ownAssets.filter((a) => a.category === '건물' && !a.item.includes('임차') && !a.item.includes('분양'));
          if (homes.length >= 2) {
            multiHomeCount++;
            topMultiHome.push({ name: member.name, memberId, photoUrl: member.photoUrl, partyColor: member.partyColor, count: homes.length });
          }
          if (ownAssets.some((a) => a.category === '건물' && a.amount >= 1500000000)) expensiveCount++;
          const totalProp = ownAssets.filter((a) => a.category === '건물' || a.category === '토지').reduce((s, a) => s + a.amount, 0);
          if (totalProp >= 3000000000) excessiveCount++;
        }
        topMultiHome.sort((a, b) => b.count - a.count);

        return (
          <View className="mt-5 px-5">
            <SectionHeader
              title="부동산 보유 현황"
              onMore={() => router.push('/property')}
            />
            <View className="mt-3 flex-row gap-2">
              <PressableCard className="flex-1 items-center py-3" onPress={() => router.push('/property')}>
                <Text className="text-lg font-bold text-red-600">{multiHomeCount}</Text>
                <Text className="text-[10px] text-neutral-400">다주택자</Text>
              </PressableCard>
              <PressableCard className="flex-1 items-center py-3" onPress={() => router.push('/property')}>
                <Text className="text-lg font-bold text-amber-600">{expensiveCount}</Text>
                <Text className="text-[10px] text-neutral-400">고가주택</Text>
              </PressableCard>
              <PressableCard className="flex-1 items-center py-3" onPress={() => router.push('/property')}>
                <Text className="text-lg font-bold text-violet-600">{excessiveCount}</Text>
                <Text className="text-[10px] text-neutral-400">과다보유</Text>
              </PressableCard>
            </View>
            {topMultiHome.length > 0 && (
              <Card className="mt-2">
                <Text className="mb-2 text-xs font-semibold text-red-600">다주택 TOP 3</Text>
                {topMultiHome.slice(0, 3).map((m, i) => (
                  <PressableCard
                    key={m.memberId}
                    className="mb-1.5 flex-row items-center gap-2 border-0 p-2"
                    style={{ elevation: 0 }}
                    onPress={() => router.push(`/members/${m.memberId}`)}
                  >
                    <Text className="w-5 text-center text-xs font-bold text-red-500">{i + 1}</Text>
                    <MemberPhoto uri={m.photoUrl} size={32} partyColor={m.partyColor} />
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-neutral-800">{m.name}</Text>
                    </View>
                    <Badge label={`${m.count}채`} color="#DC2626" textColor="#FFFFFF" />
                  </PressableCard>
                ))}
              </Card>
            )}
          </View>
        );
      })()}
    </ScrollView>

    {/* Election FAB */}
    <Pressable
      className="absolute right-5 flex-row items-center gap-2 rounded-full bg-rose-500 px-4 py-3 shadow-lg active:bg-rose-600"
      style={{ bottom: insets.bottom }}
      onPress={() => router.push('/elections/2026-06-03')}
    >
      <CheckSquare size={18} color="#FFFFFF" />
      <Text className="text-sm font-semibold text-white">6·3 재보궐</Text>
    </Pressable>
  </View>
  );
}
