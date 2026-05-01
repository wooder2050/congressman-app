import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getMemberScorecard } from '@/api/scorecard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MemberPhoto } from '@/components/MemberPhoto';
import { PartyBadge } from '@/components/PartyBadge';
import { Card } from '@/components/ui/Card';
import { SCORECARD_GRADE_MAP } from '@/constants/maps';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { formatPercent } from '@/lib/format';

const CURRENT_TERM = 22;

function ScoreBar({ score, maxScore, color }: { score: number; maxScore: number; color: string }) {
  const pct = Math.min((score / maxScore) * 100, 100);
  return (
    <View className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-100">
      <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
    </View>
  );
}

export default function MemberScorecardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const {
    data: scorecard,
    isLoading,
    error,
    refetch,
  } = useLawmakeQuery(getMemberScorecard, [{ memberId: id, termId: CURRENT_TERM }]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!scorecard) return <EmptyState title="성적표 데이터가 없습니다" />;

  const grade = SCORECARD_GRADE_MAP[scorecard.grade];

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      {/* Profile + Grade */}
      <View className="items-center bg-white px-5 pb-6 pt-4">
        <MemberPhoto uri={scorecard.photoUrl} size={72} partyColor={scorecard.party.color} />
        <Text className="mt-2 text-lg font-bold text-neutral-900">{scorecard.name}</Text>
        <PartyBadge name={scorecard.party.name} color={scorecard.party.color} />
        <Text className="mt-0.5 text-xs text-neutral-400">{scorecard.district}</Text>

        <View
          className="mt-4 h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: grade.bgColor }}
        >
          <Text className="text-3xl font-bold" style={{ color: grade.color }}>
            {scorecard.grade}
          </Text>
        </View>
        <Text className="mt-2 text-2xl font-bold text-neutral-900">
          {scorecard.totalScore.toFixed(1)}점
        </Text>
        <Text className="mt-0.5 text-xs text-neutral-400">
          전체 {scorecard.overallRank}위
        </Text>
      </View>

      {/* Score Breakdown */}
      <View className="mt-3 px-5 gap-2">
        {/* Attendance */}
        <Card>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-neutral-800">출석률</Text>
            <Text className="text-sm font-bold text-primary">
              {scorecard.attendance.score.toFixed(1)} / 30
            </Text>
          </View>
          <ScoreBar score={scorecard.attendance.score} maxScore={30} color="#2563EB" />
          <View className="mt-2 flex-row justify-between">
            <Text className="text-xs text-neutral-400">
              {formatPercent(scorecard.attendance.rate)}
            </Text>
            <Text className="text-xs text-neutral-400">
              {scorecard.attendance.rank}위 / {scorecard.attendance.totalMembers}명
            </Text>
          </View>
        </Card>

        {/* Vote Participation */}
        <Card>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-neutral-800">표결 참여율</Text>
            <Text className="text-sm font-bold text-primary">
              {scorecard.voteParticipation.score.toFixed(1)} / 25
            </Text>
          </View>
          <ScoreBar score={scorecard.voteParticipation.score} maxScore={25} color="#16A34A" />
          <View className="mt-2 flex-row justify-between">
            <Text className="text-xs text-neutral-400">
              {formatPercent(scorecard.voteParticipation.rate)}
            </Text>
            <Text className="text-xs text-neutral-400">
              {scorecard.voteParticipation.rank}위 / {scorecard.voteParticipation.totalMembers}명
            </Text>
          </View>
          <View className="mt-2 flex-row gap-3 border-t border-neutral-100 pt-2">
            <Text className="text-xs text-green-600">찬성 {scorecard.voteParticipation.yes}</Text>
            <Text className="text-xs text-red-600">반대 {scorecard.voteParticipation.no}</Text>
            <Text className="text-xs text-neutral-500">기권 {scorecard.voteParticipation.abstain}</Text>
            <Text className="text-xs text-neutral-400">불참 {scorecard.voteParticipation.absent}</Text>
          </View>
        </Card>

        {/* Bill Proposal */}
        <Card>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-neutral-800">법안 발의</Text>
            <Text className="text-sm font-bold text-primary">
              {scorecard.billProposal.score.toFixed(1)} / 25
            </Text>
          </View>
          <ScoreBar score={scorecard.billProposal.score} maxScore={25} color="#CA8A04" />
          <View className="mt-2 flex-row justify-between">
            <Text className="text-xs text-neutral-400">
              대표 {scorecard.billProposal.representativeCount}건 / 공동 {scorecard.billProposal.coCount}건
            </Text>
            <Text className="text-xs text-neutral-400">
              {scorecard.billProposal.rank}위 / {scorecard.billProposal.totalMembers}명
            </Text>
          </View>
        </Card>

        {/* Bill Pass Rate */}
        <Card>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-neutral-800">법안 통과율</Text>
            <Text className="text-sm font-bold text-primary">
              {scorecard.billPassRate.score.toFixed(1)} / 20
            </Text>
          </View>
          <ScoreBar score={scorecard.billPassRate.score} maxScore={20} color="#EA580C" />
          <View className="mt-2 flex-row justify-between">
            <Text className="text-xs text-neutral-400">
              {scorecard.billPassRate.passedCount}/{scorecard.billPassRate.totalRepresentative}건 ({formatPercent(scorecard.billPassRate.rate)})
            </Text>
            <Text className="text-xs text-neutral-400">
              {scorecard.billPassRate.rank}위 / {scorecard.billPassRate.totalMembers}명
            </Text>
          </View>
        </Card>

        {/* Recent Activity */}
        <Card>
          <Text className="text-sm font-semibold text-neutral-800">최근 30일 활동</Text>
          <View className="mt-3 flex-row justify-around">
            <View className="items-center">
              <Text className="text-lg font-bold text-neutral-900">
                {scorecard.recentActivity.last30Days.bills}
              </Text>
              <Text className="text-[10px] text-neutral-400">법안 발의</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-neutral-900">
                {scorecard.recentActivity.last30Days.votesAttended}
              </Text>
              <Text className="text-[10px] text-neutral-400">표결 참여</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-neutral-900">
                {scorecard.recentActivity.last30Days.votes}
              </Text>
              <Text className="text-[10px] text-neutral-400">표결 전체</Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
