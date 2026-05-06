import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAttendanceRanking } from '@/api/attendance';
import { getBreakingNews } from '@/api/breaking-news';
import { getPropertyStats } from '@/api/property';
import { getScorecardRanking } from '@/api/scorecard';
import { getUpcomingSchedules } from '@/api/schedules';
import { getHomeStats } from '@/api/stats';
import { getWeeklyList } from '@/api/weekly';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LocalElectionBanner } from '@/components/LocalElectionBanner';
import { AttendanceRankingSection } from '@/components/home/AttendanceRanking';
import { BreakingNewsList } from '@/components/home/BreakingNewsList';
import { CloseVotesSection } from '@/components/home/CloseVotesSection';
import { ElectionFAB } from '@/components/home/ElectionFAB';
import { HomeHeader } from '@/components/home/HomeHeader';
import { HomeStatsGrid } from '@/components/home/HomeStatsGrid';
import { LatestWeeklySection } from '@/components/home/LatestWeeklySection';
import { PropertyHighlight } from '@/components/home/PropertyHighlight';
import { RecentBillsSection } from '@/components/home/RecentBillsSection';
import { RecentVotesSection } from '@/components/home/RecentVotesSection';
import { RejectedVotesSection } from '@/components/home/RejectedVotesSection';
import { ScorecardHighlight } from '@/components/home/ScorecardHighlight';
import { TopProposersSection } from '@/components/home/TopProposersSection';
import { UpcomingSchedulesSection } from '@/components/home/UpcomingSchedules';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';

const CURRENT_TERM = 22;

export default function HomeScreen() {
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
  const { data: weeklyList } = useLawmakeQuery(getWeeklyList, []);
  const latestWeekly = weeklyList?.[0];

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
        <HomeHeader />

        <View className="mt-4 px-5">
          <LocalElectionBanner />
        </View>

        <BreakingNewsList items={breakingNews} />

        <LatestWeeklySection article={latestWeekly} />

        <HomeStatsGrid
          memberCount={stats.memberCount}
          billCount={stats.billCount}
          voteCount={stats.voteCount}
          avgAttendanceRate={stats.avgAttendanceRate}
        />

        <UpcomingSchedulesSection schedules={schedules} />

        <RecentBillsSection bills={stats.recentBills} />

        <RecentVotesSection votes={stats.recentVotes} />

        <TopProposersSection proposers={stats.topProposers} />

        <CloseVotesSection votes={stats.closeVotes} />

        <RejectedVotesSection votes={stats.rejectedVotes} />

        <ScorecardHighlight data={scorecardData} />

        <AttendanceRankingSection data={ranking} />

        <PropertyHighlight data={propertyData} />
      </ScrollView>

      <ElectionFAB />
    </View>
  );
}
