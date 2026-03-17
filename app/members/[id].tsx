import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAttendance, getAbsenceDetails } from '@/api/attendance';
import { getBills } from '@/api/bills';
import { getMember, getMemberTerms, getMemberVotes, getAssets } from '@/api/members';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PartyBadge } from '@/components/PartyBadge';
import { Badge } from '@/components/ui/Badge';
import { Card, PressableCard } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BILL_STATUS_MAP, MEMBER_VOTE_RESULT_MAP } from '@/constants/maps';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { formatDate, formatPercent, formatAmount } from '@/lib/format';

const CURRENT_TERM = 22;

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: member, isLoading, error, refetch } = useLawmakeQuery(getMember, [id]);
  const { data: terms } = useLawmakeQuery(getMemberTerms, [id]);
  const currentTerm = terms?.find((t) => t.termId === CURRENT_TERM);

  const { data: attendance } = useLawmakeQuery(
    getAttendance,
    [{ memberId: id, termId: CURRENT_TERM }],
    { enabled: !!member }
  );

  const { data: absence } = useLawmakeQuery(
    getAbsenceDetails,
    [{ memberId: id, termId: CURRENT_TERM }],
    { enabled: !!member }
  );

  const { data: billsData } = useLawmakeQuery(
    getBills,
    [{ termId: CURRENT_TERM, memberId: id, limit: 5 }],
    { enabled: !!member }
  );

  const { data: votesData } = useLawmakeQuery(
    getMemberVotes,
    [{ memberId: id, termId: CURRENT_TERM, limit: 5 }],
    { enabled: !!member }
  );

  const { data: assetsData } = useLawmakeQuery(getAssets, [id], {
    enabled: !!member,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!member) return <EmptyState title="의원 정보를 찾을 수 없습니다" />;

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      {/* Header */}
      <View className="items-center bg-white px-5 pb-6 pt-4">
        {/* Back button */}
        <Pressable
          className="absolute left-4 top-4 z-10"
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Text className="text-sm text-primary">뒤로</Text>
        </Pressable>

        <View
          className="h-24 w-24 overflow-hidden rounded-full bg-neutral-100"
          style={
            currentTerm
              ? { borderWidth: 3, borderColor: currentTerm.party.color }
              : undefined
          }
        >
          <Image
            source={{ uri: member.photoUrl }}
            style={{ width: 90, height: 90 }}
            contentFit="cover"
          />
        </View>
        <Text className="mt-3 text-xl font-bold text-neutral-900">{member.name}</Text>
        {currentTerm && (
          <>
            <PartyBadge
              name={currentTerm.party.name}
              color={currentTerm.party.color}
              size="md"
              className="mt-1"
            />
            <Text className="mt-1 text-xs text-neutral-400">
              {currentTerm.district} | {currentTerm.electedCount}선
            </Text>
            {currentTerm.committees.length > 0 && (
              <Text className="mt-1 text-xs text-neutral-400">
                {currentTerm.committees.join(', ')}
              </Text>
            )}
          </>
        )}
        {member.career && (
          <Text className="mt-2 text-center text-xs leading-4 text-neutral-400">
            {member.career}
          </Text>
        )}
      </View>

      {/* Attendance */}
      {attendance && (
        <View className="mt-3 px-5">
          <SectionHeader title="출석 현황" />
          <Card className="mt-2">
            <View className="items-center">
              <Text className="text-3xl font-bold text-primary">
                {formatPercent(attendance.rate)}
              </Text>
              <Text className="mt-0.5 text-xs text-neutral-400">출석률</Text>
            </View>

            {/* Progress bar */}
            <View className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-100">
              <View
                className="h-full rounded-full bg-primary"
                style={{ width: `${attendance.rate}%` }}
              />
            </View>

            <View className="mt-3 flex-row justify-around">
              <View className="items-center">
                <Text className="text-sm font-bold text-neutral-800">
                  {attendance.attended}
                </Text>
                <Text className="text-[10px] text-neutral-400">출석</Text>
              </View>
              <View className="items-center">
                <Text className="text-sm font-bold text-neutral-800">
                  {attendance.absent}
                </Text>
                <Text className="text-[10px] text-neutral-400">결석</Text>
              </View>
              <View className="items-center">
                <Text className="text-sm font-bold text-neutral-800">
                  {attendance.leave}
                </Text>
                <Text className="text-[10px] text-neutral-400">청가</Text>
              </View>
              <View className="items-center">
                <Text className="text-sm font-bold text-neutral-800">
                  {attendance.travel}
                </Text>
                <Text className="text-[10px] text-neutral-400">출장</Text>
              </View>
              <View className="items-center">
                <Text className="text-sm font-bold text-neutral-800">
                  {attendance.totalSessions}
                </Text>
                <Text className="text-[10px] text-neutral-400">전체</Text>
              </View>
            </View>

            {absence && absence.length > 0 && (
              <View className="mt-3 border-t border-neutral-100 pt-3">
                <Text className="mb-1.5 text-xs font-medium text-neutral-500">
                  결석 사유
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {absence.map((a) => (
                    <Badge key={a.type} label={`${a.type} ${a.count}회`} />
                  ))}
                </View>
              </View>
            )}
          </Card>
        </View>
      )}

      {/* Bills */}
      {billsData && billsData.bills.length > 0 && (
        <View className="mt-5 px-5">
          <SectionHeader
            title={`발의 법안 (${billsData.total})`}
            onMore={() =>
              router.push({
                pathname: '/(tabs)/bills',
                params: { memberId: id },
              })
            }
          />
          <View className="mt-2 gap-2">
            {billsData.bills.map((bill) => {
              const status = BILL_STATUS_MAP[bill.status];
              return (
                <PressableCard
                  key={bill.id}
                  onPress={() => router.push(`/bills/${bill.id}`)}
                >
                  <View className="flex-row items-start justify-between">
                    <Text
                      className="flex-1 text-sm font-medium text-neutral-800"
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
                  <Text className="mt-1 text-xs text-neutral-400">
                    {formatDate(bill.proposedDate)}
                  </Text>
                </PressableCard>
              );
            })}
          </View>
        </View>
      )}

      {/* Votes */}
      {votesData && votesData.votes.length > 0 && (
        <View className="mt-5 px-5">
          <SectionHeader title={`표결 참여 (${votesData.total})`} />
          <View className="mt-2 gap-2">
            {votesData.votes.map((vote) => {
              const result = MEMBER_VOTE_RESULT_MAP[vote.memberResult];
              return (
                <PressableCard
                  key={vote.voteId}
                  onPress={() => router.push(`/votes/${vote.voteId}`)}
                >
                  <View className="flex-row items-start justify-between">
                    <Text
                      className="flex-1 text-sm font-medium text-neutral-800"
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
                  <Text className="mt-1 text-xs text-neutral-400">
                    {formatDate(vote.procDate)} | {vote.procResult}
                  </Text>
                </PressableCard>
              );
            })}
          </View>
        </View>
      )}

      {/* Assets */}
      {assetsData && assetsData.years.length > 0 && (
        <View className="mt-5 px-5">
          <SectionHeader title="재산 신고" />
          <View className="mt-2 gap-2">
            {assetsData.years.map((year) => (
              <Card key={year.year}>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-neutral-800">
                    {year.year}년
                  </Text>
                  <Text className="text-sm font-bold text-primary">
                    {formatAmount(year.total)}원
                  </Text>
                </View>
                {year.categories.length > 0 && (
                  <View className="mt-2 gap-1">
                    {year.categories.slice(0, 4).map((cat) => (
                      <View
                        key={cat.category}
                        className="flex-row justify-between"
                      >
                        <Text className="text-xs text-neutral-500">{cat.category}</Text>
                        <Text className="text-xs text-neutral-600">
                          {formatAmount(cat.amount)}원
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            ))}
          </View>
        </View>
      )}

      {/* History link */}
      <View className="mt-5 px-5">
        <Pressable
          className="flex-row items-center justify-between rounded-xl bg-white px-4 py-3.5 active:bg-neutral-50"
          onPress={() => router.push(`/members/${id}/history`)}
        >
          <Text className="text-sm font-medium text-neutral-700">
            역대 활동 비교 보기
          </Text>
          <ChevronRight size={18} color="#a3a3a3" />
        </Pressable>
      </View>
    </ScrollView>
  );
}
