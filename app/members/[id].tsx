import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAttendance, getAbsenceDetails } from '@/api/attendance';
import { getBills } from '@/api/bills';
import { getMember, getMemberTerms, getMemberVotes, getAssets } from '@/api/members';
import { getMemberScorecard } from '@/api/scorecard';
import { BookmarkButton } from '@/components/BookmarkButton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PartyBadge } from '@/components/PartyBadge';
import { Badge } from '@/components/ui/Badge';
import { Card, PressableCard } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { StatusBadge, type StatusTone } from '@/components/ui/StatusBadge';
import { SCORECARD_GRADE_MAP } from '@/constants/maps';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { useAuth } from '@/lib/auth-context';
import { formatAmount, formatDate, formatPercent } from '@/lib/format';
import type { Bill } from '@/types';

const CURRENT_TERM = 22;

const BILL_STATUS_TONE: Record<Bill['status'], { label: string; tone: StatusTone }> = {
  passed: { label: '가결', tone: 'success' },
  pending: { label: '계류', tone: 'neutral' },
  discarded: { label: '폐기', tone: 'error' },
  committee: { label: '위원회', tone: 'info' },
};

const MEMBER_VOTE_TONE: Record<string, { label: string; tone: StatusTone }> = {
  yes: { label: '찬성', tone: 'success' },
  no: { label: '반대', tone: 'error' },
  abstain: { label: '기권', tone: 'warning' },
  absent: { label: '불참', tone: 'neutral' },
};

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  const { data: member, isLoading, error, refetch } = useLawmakeQuery(getMember, [id]);
  const { data: terms } = useLawmakeQuery(getMemberTerms, [id]);
  const currentTerm = terms?.find((t) => t.termId === CURRENT_TERM);

  const { data: attendance } = useLawmakeQuery(
    getAttendance,
    [{ memberId: id, termId: CURRENT_TERM }],
    { enabled: !!member },
  );

  const { data: absence } = useLawmakeQuery(
    getAbsenceDetails,
    [{ memberId: id, termId: CURRENT_TERM }],
    { enabled: !!member },
  );

  const { data: billsData } = useLawmakeQuery(
    getBills,
    [{ termId: CURRENT_TERM, memberId: id, limit: 5 }],
    { enabled: !!member },
  );

  const { data: votesData } = useLawmakeQuery(
    getMemberVotes,
    [{ memberId: id, termId: CURRENT_TERM, limit: 5 }],
    { enabled: !!member },
  );

  const { data: assetsData } = useLawmakeQuery(getAssets, [id], {
    enabled: !!member,
  });

  const { data: scorecard } = useLawmakeQuery(
    getMemberScorecard,
    [{ memberId: id, termId: CURRENT_TERM }],
    { enabled: !!member },
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!member) return <EmptyState title="의원 정보를 찾을 수 없습니다" />;

  return (
    <View className="flex-1 bg-surface-secondary">
      {session && (
        <Stack.Screen
          options={{ headerRight: () => <BookmarkButton type="member" id={id} /> }}
        />
      )}
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {/* Profile */}
        <View className="items-center bg-surface-primary px-lawmake-lg pb-lawmake-xl pt-lawmake-sm">
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
          <Text className="mt-lawmake-md text-lawmake-title1 text-neutral-900">{member.name}</Text>
          {currentTerm && (
            <>
              <View className="mt-lawmake-xs">
                <PartyBadge
                  name={currentTerm.party.name}
                  color={currentTerm.party.color}
                  size="md"
                />
              </View>
              <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
                {currentTerm.district} · {currentTerm.electedCount}선
              </Text>
              {currentTerm.committees.length > 0 && (
                <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
                  {currentTerm.committees.join(', ')}
                </Text>
              )}
            </>
          )}
        </View>

        {/* Career */}
        {member.career && <CareerSection raw={member.career} />}

        {/* Attendance */}
        {attendance && (
          <View className="mt-lawmake-md px-lawmake-lg">
            <Section
              title="출석 현황"
              onMore={() => router.push(`/members/${id}/attendance`)}
            >
              <Card>
                <View className="items-center">
                  <Text className="text-lawmake-large text-primary">
                    {formatPercent(attendance.rate)}
                  </Text>
                  <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-500">
                    출석률
                  </Text>
                </View>

                <View className="mt-lawmake-md h-2 overflow-hidden rounded-full bg-neutral-100">
                  <View
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${attendance.rate}%` }}
                  />
                </View>

                <View className="mt-lawmake-md flex-row justify-around">
                  <AttendanceStat label="출석" value={attendance.attended} />
                  <AttendanceStat label="결석" value={attendance.absent} />
                  <AttendanceStat label="청가" value={attendance.leave} />
                  <AttendanceStat label="출장" value={attendance.travel} />
                  <AttendanceStat label="전체" value={attendance.totalSessions} />
                </View>

                {absence && absence.length > 0 && (
                  <View className="mt-lawmake-md border-t border-neutral-100 pt-lawmake-md">
                    <Text className="mb-lawmake-sm text-lawmake-subhead font-medium text-neutral-700">
                      결석 사유
                    </Text>
                    <View className="flex-row flex-wrap gap-lawmake-sm">
                      {absence.map((a) => (
                        <Badge key={a.type} label={`${a.type} ${a.count}회`} />
                      ))}
                    </View>
                  </View>
                )}
              </Card>
            </Section>
          </View>
        )}

        {/* Scorecard */}
        {scorecard && (
          <View className="mt-lawmake-xl px-lawmake-lg">
            <Section
              title="의정활동 성적표"
              onMore={() => router.push(`/members/${id}/scorecard`)}
            >
              <PressableCard onPress={() => router.push(`/members/${id}/scorecard`)}>
                <View className="flex-row items-center gap-lawmake-md">
                  <View
                    className="h-14 w-14 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: SCORECARD_GRADE_MAP[scorecard.grade].bgColor,
                    }}
                  >
                    <Text
                      className="text-lawmake-title1 font-bold"
                      style={{ color: SCORECARD_GRADE_MAP[scorecard.grade].color }}
                    >
                      {scorecard.grade}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-lawmake-title2 text-neutral-900">
                      {scorecard.totalScore.toFixed(1)}점
                    </Text>
                    <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
                      전체 {scorecard.overallRank}위
                    </Text>
                  </View>
                </View>
                <View className="mt-lawmake-md flex-row justify-around border-t border-neutral-100 pt-lawmake-md">
                  <ScorecardStat label="출석" value={scorecard.attendance.score} />
                  <ScorecardStat label="표결" value={scorecard.voteParticipation.score} />
                  <ScorecardStat label="발의" value={scorecard.billProposal.score} />
                  <ScorecardStat label="통과" value={scorecard.billPassRate.score} />
                </View>
              </PressableCard>
            </Section>
          </View>
        )}

        {/* Bills */}
        {billsData && billsData.bills.length > 0 && (
          <View className="mt-lawmake-xl px-lawmake-lg">
            <Section
              title={`발의 법안 ${billsData.total}`}
              onMore={() =>
                router.push({
                  pathname: '/(tabs)/bills',
                  params: { memberId: id },
                })
              }
            >
              <View className="gap-lawmake-sm">
                {billsData.bills.map((bill) => {
                  const status = BILL_STATUS_TONE[bill.status] ?? BILL_STATUS_TONE.pending;
                  return (
                    <PressableCard
                      key={bill.id}
                      onPress={() => router.push(`/bills/${bill.id}`)}
                    >
                      <View className="flex-row items-start justify-between gap-lawmake-sm">
                        <Text
                          className="flex-1 text-lawmake-callout font-semibold text-neutral-900"
                          numberOfLines={2}
                        >
                          {bill.title}
                        </Text>
                        <StatusBadge label={status.label} tone={status.tone} />
                      </View>
                      <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
                        {formatDate(bill.proposedDate)}
                      </Text>
                    </PressableCard>
                  );
                })}
              </View>
            </Section>
          </View>
        )}

        {/* Votes */}
        {votesData && votesData.votes.length > 0 && (
          <View className="mt-lawmake-xl px-lawmake-lg">
            <Section title={`표결 참여 ${votesData.total}`}>
              <View className="gap-lawmake-sm">
                {votesData.votes.map((vote) => {
                  const result =
                    MEMBER_VOTE_TONE[vote.memberResult] ?? MEMBER_VOTE_TONE.absent;
                  return (
                    <PressableCard
                      key={vote.voteId}
                      onPress={() => router.push(`/votes/${vote.voteId}`)}
                    >
                      <View className="flex-row items-start justify-between gap-lawmake-sm">
                        <Text
                          className="flex-1 text-lawmake-callout font-semibold text-neutral-900"
                          numberOfLines={2}
                        >
                          {vote.billName}
                        </Text>
                        <StatusBadge label={result.label} tone={result.tone} />
                      </View>
                      <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
                        {formatDate(vote.procDate)} · {vote.procResult}
                      </Text>
                    </PressableCard>
                  );
                })}
              </View>
            </Section>
          </View>
        )}

        {/* Assets */}
        {assetsData && assetsData.years.length > 0 && (
          <View className="mt-lawmake-xl px-lawmake-lg">
            <Section title="재산 신고">
              <View className="gap-lawmake-sm">
                {assetsData.years.map((year) => (
                  <Card key={year.year}>
                    <View className="flex-row items-baseline justify-between gap-lawmake-sm">
                      <Text
                        className="shrink-0 text-lawmake-body font-semibold text-neutral-900"
                      >
                        {year.year}년
                      </Text>
                      <Text
                        className="flex-1 text-right text-lawmake-body font-bold text-primary"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                      >
                        {formatAmount(year.total)}원
                      </Text>
                    </View>
                    {year.categories.length > 0 && (
                      <View className="mt-lawmake-md gap-lawmake-xs">
                        {year.categories.slice(0, 4).map((cat) => (
                          <View
                            key={cat.category}
                            className="flex-row items-baseline justify-between gap-lawmake-sm"
                          >
                            <Text
                              className="shrink text-lawmake-footnote text-neutral-500"
                              numberOfLines={1}
                            >
                              {cat.category}
                            </Text>
                            <Text
                              className="shrink-0 text-right text-lawmake-footnote text-neutral-700"
                              numberOfLines={1}
                            >
                              {formatAmount(cat.amount)}원
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </Card>
                ))}
              </View>
            </Section>
          </View>
        )}

        {/* Navigation links */}
        <View className="mt-lawmake-xl gap-lawmake-xs px-lawmake-lg">
          <NavLink
            label="출석 상세 보기"
            onPress={() => router.push(`/members/${id}/attendance`)}
          />
          <NavLink
            label="의정활동 성적표 보기"
            onPress={() => router.push(`/members/${id}/scorecard`)}
          />
          <NavLink
            label="역대 활동 비교 보기"
            onPress={() => router.push(`/members/${id}/history`)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function AttendanceStat({ label, value }: { label: string; value: number }) {
  return (
    <View className="items-center">
      <Text className="text-lawmake-callout font-bold text-neutral-900">{value}</Text>
      <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-500">{label}</Text>
    </View>
  );
}

function ScorecardStat({ label, value }: { label: string; value: number }) {
  return (
    <View className="items-center">
      <Text className="text-lawmake-subhead font-bold text-neutral-700">
        {value.toFixed(0)}
      </Text>
      <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-500">{label}</Text>
    </View>
  );
}

function NavLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-lawmake-lg bg-surface-primary px-lawmake-lg py-lawmake-md active:bg-neutral-50"
    >
      <Text className="text-lawmake-body font-medium text-neutral-700">{label}</Text>
      <ChevronRight size={18} color="#A3A3A3" />
    </Pressable>
  );
}

/**
 * Career raw text 파싱:
 * - HTML entity 디코딩 (&middot; 등)
 * - [학력] / [경력] 섹션으로 분리
 * - 각 줄을 list item으로 렌더, 한국어 가독성 위해 leading-relaxed
 */
function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&middot;/g, '·')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function parseCareer(raw: string): { education: string[]; career: string[]; rest: string[] } {
  const decoded = decodeHtmlEntities(raw);
  // 줄 단위 분리, 빈 줄 제거
  const lines = decoded
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let section: 'education' | 'career' | 'rest' = 'rest';
  const education: string[] = [];
  const career: string[] = [];
  const rest: string[] = [];

  for (const line of lines) {
    if (/^\[학력\]/.test(line)) {
      section = 'education';
      continue;
    }
    if (/^\[경력\]/.test(line)) {
      section = 'career';
      continue;
    }
    if (/^\[/.test(line)) {
      // 다른 [섹션] 헤더는 rest로 떨어뜨림
      section = 'rest';
      rest.push(line);
      continue;
    }
    if (section === 'education') education.push(line);
    else if (section === 'career') career.push(line);
    else rest.push(line);
  }

  return { education, career, rest };
}

function CareerSection({ raw }: { raw: string }) {
  const { education, career, rest } = parseCareer(raw);
  if (!education.length && !career.length && !rest.length) return null;

  return (
    <View className="mt-lawmake-md bg-surface-primary px-lawmake-lg pt-lawmake-lg pb-lawmake-lg">
      {education.length > 0 && (
        <CareerGroup title="학력" items={education} />
      )}
      {career.length > 0 && (
        <View className={education.length > 0 ? 'mt-lawmake-lg' : ''}>
          <CareerGroup title="경력" items={career} />
        </View>
      )}
      {rest.length > 0 && (
        <View className={(education.length > 0 || career.length > 0) ? 'mt-lawmake-lg' : ''}>
          <CareerGroup title="기타" items={rest} />
        </View>
      )}
    </View>
  );
}

function CareerGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <View>
      <Text className="mb-lawmake-sm text-lawmake-subhead font-semibold text-neutral-900">
        {title}
      </Text>
      <View className="gap-lawmake-xs">
        {items.map((line, i) => (
          <CareerLine key={i} line={line} />
        ))}
      </View>
    </View>
  );
}

function CareerLine({ line }: { line: string }) {
  // "현) ..." or "전) ..." 같은 prefix를 별도 톤으로
  const prefixMatch = line.match(/^(현\)|전\)|前\)|現\))\s*(.*)$/);
  if (prefixMatch) {
    const isPresent = /현|現/.test(prefixMatch[1]);
    return (
      <View className="flex-row gap-lawmake-sm">
        <Text
          className={`shrink-0 text-lawmake-footnote font-semibold ${
            isPresent ? 'text-primary' : 'text-neutral-400'
          }`}
        >
          {prefixMatch[1]}
        </Text>
        <Text className="flex-1 text-lawmake-footnote leading-relaxed text-neutral-700">
          {prefixMatch[2]}
        </Text>
      </View>
    );
  }
  return (
    <Text className="text-lawmake-footnote leading-relaxed text-neutral-700">
      {line}
    </Text>
  );
}
