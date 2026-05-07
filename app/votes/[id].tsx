import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getVoteMemberVotes } from '@/api/votes';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MemberPhoto } from '@/components/MemberPhoto';
import { Card } from '@/components/ui/Card';
import { StatusBadge, type StatusTone } from '@/components/ui/StatusBadge';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { formatDate, formatNumber } from '@/lib/format';
import type { VoteMemberResult } from '@/types';

const VOTE_FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'yes', label: '찬성' },
  { id: 'no', label: '반대' },
  { id: 'abstain', label: '기권' },
  { id: 'absent', label: '불참' },
];

const VOTE_RESULT_TONE: Record<string, { label: string; tone: StatusTone }> = {
  passed: { label: '원안가결', tone: 'success' },
  amended: { label: '수정가결', tone: 'info' },
  rejected: { label: '부결', tone: 'error' },
  discarded: { label: '폐기', tone: 'neutral' },
  other: { label: '기타', tone: 'neutral' },
};

const MEMBER_VOTE_TONE: Record<string, { label: string; tone: StatusTone }> = {
  yes: { label: '찬성', tone: 'success' },
  no: { label: '반대', tone: 'error' },
  abstain: { label: '기권', tone: 'warning' },
  absent: { label: '불참', tone: 'neutral' },
};

export default function VoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('all');

  const { data, isLoading, error, refetch } = useLawmakeQuery(getVoteMemberVotes, [id]);

  const filteredMembers = useMemo(() => {
    if (!data?.memberVotes) return [];
    if (filter === 'all') return data.memberVotes;
    return data.memberVotes.filter((m) => m.result === filter);
  }, [data, filter]);

  const renderMember = useCallback(
    ({ item }: { item: VoteMemberResult }) => {
      const result = MEMBER_VOTE_TONE[item.result] ?? MEMBER_VOTE_TONE.absent;
      return (
        <Pressable
          className="flex-row items-center gap-lawmake-md border-b border-neutral-100 bg-surface-primary px-lawmake-lg py-lawmake-md active:bg-neutral-50"
          onPress={() => router.push(`/members/${item.memberId}`)}
        >
          <MemberPhoto uri={item.photoUrl} size={36} partyColor={item.partyColor} />
          <View className="flex-1">
            <Text className="text-lawmake-body text-neutral-900">{item.memberName}</Text>
            <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
              {item.partyName} · {item.district}
            </Text>
          </View>
          <StatusBadge label={result.label} tone={result.tone} />
        </Pressable>
      );
    },
    [router],
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!data) return <EmptyState title="표결 정보를 찾을 수 없습니다" />;

  const { vote, memberVotes } = data;
  const result = VOTE_RESULT_TONE[vote.resultCode] ?? VOTE_RESULT_TONE.other;
  const total = vote.yesCount + vote.noCount + vote.abstainCount;

  // Group by party
  const partyVotes = memberVotes.reduce(
    (acc, m) => {
      if (!acc[m.partyName]) {
        acc[m.partyName] = {
          yes: 0,
          no: 0,
          abstain: 0,
          absent: 0,
          color: m.partyColor,
        };
      }
      acc[m.partyName][m.result]++;
      return acc;
    },
    {} as Record<
      string,
      { yes: number; no: number; abstain: number; absent: number; color: string }
    >,
  );

  // Static header (Title + Vote summary + Party breakdown). Filter chips는 sticky 위해 별도 row item으로.
  type Row =
    | { kind: 'header' }
    | { kind: 'filter' }
    | { kind: 'member'; member: VoteMemberResult };

  const rows: Row[] = [
    { kind: 'header' },
    { kind: 'filter' },
    ...filteredMembers.map((m) => ({ kind: 'member' as const, member: m })),
  ];

  const renderRow = ({ item }: { item: Row }) => {
    if (item.kind === 'header') {
      return (
        <View>
          {/* Title block */}
          <View className="bg-surface-primary px-lawmake-lg pb-lawmake-lg pt-lawmake-sm">
            <StatusBadge label={result.label} tone={result.tone} />
            <Text className="mt-lawmake-md text-lawmake-title2 leading-7 text-neutral-900">
              {vote.billName}
            </Text>
            <Text className="mt-lawmake-sm text-lawmake-footnote text-neutral-500">
              {formatDate(vote.procDate)} · 참석 {formatNumber(vote.voteTotal)}/
              {formatNumber(vote.memberTotal)}명
            </Text>
          </View>

          {/* Vote summary */}
          <Card className="mx-lawmake-lg mt-lawmake-md">
            <View className="h-3 flex-row overflow-hidden rounded-full bg-neutral-100">
              <View
                className="h-full bg-success"
                style={{ width: `${total > 0 ? (vote.yesCount / total) * 100 : 0}%` }}
              />
              <View
                className="h-full bg-error"
                style={{ width: `${total > 0 ? (vote.noCount / total) * 100 : 0}%` }}
              />
              <View
                className="h-full bg-neutral-400"
                style={{ width: `${total > 0 ? (vote.abstainCount / total) * 100 : 0}%` }}
              />
            </View>

            <View className="mt-lawmake-md flex-row justify-around">
              <SummaryStat label="찬성" value={vote.yesCount} colorClass="text-success" />
              <SummaryStat label="반대" value={vote.noCount} colorClass="text-error" />
              <SummaryStat
                label="기권"
                value={vote.abstainCount}
                colorClass="text-warning-dark"
              />
              <SummaryStat
                label="불참"
                value={vote.memberTotal - vote.voteTotal}
                colorClass="text-neutral-400"
              />
            </View>
          </Card>

          {/* Party breakdown */}
          <Card className="mx-lawmake-lg mb-lawmake-md mt-lawmake-sm">
            <Text className="mb-lawmake-sm text-lawmake-subhead font-semibold text-neutral-700">
              정당별 투표 현황
            </Text>
            {Object.entries(partyVotes)
              .sort((a, b) => {
                const totalA = a[1].yes + a[1].no + a[1].abstain + a[1].absent;
                const totalB = b[1].yes + b[1].no + b[1].abstain + b[1].absent;
                return totalB - totalA;
              })
              .map(([party, votes]) => {
                const partyTotal = votes.yes + votes.no + votes.abstain + votes.absent;
                return (
                  <View key={party} className="mb-lawmake-sm">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-lawmake-sm">
                        <View
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: votes.color }}
                        />
                        <Text className="text-lawmake-footnote font-medium text-neutral-700">
                          {party}
                        </Text>
                      </View>
                      <Text className="text-lawmake-caption text-neutral-500">
                        {partyTotal}명
                      </Text>
                    </View>
                    <View className="mt-lawmake-xs h-1.5 flex-row overflow-hidden rounded-full bg-neutral-100">
                      <View
                        className="bg-success"
                        style={{
                          width: `${partyTotal > 0 ? (votes.yes / partyTotal) * 100 : 0}%`,
                        }}
                      />
                      <View
                        className="bg-error"
                        style={{
                          width: `${partyTotal > 0 ? (votes.no / partyTotal) * 100 : 0}%`,
                        }}
                      />
                      <View
                        className="bg-neutral-300"
                        style={{
                          width: `${partyTotal > 0 ? (votes.abstain / partyTotal) * 100 : 0}%`,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
          </Card>
        </View>
      );
    }
    if (item.kind === 'filter') {
      return (
        <View className="border-b border-neutral-100 bg-surface-secondary pb-lawmake-md pt-lawmake-sm">
          <FlatList
            data={VOTE_FILTERS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(f) => f.id}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            renderItem={({ item: f }) => {
              let count = 0;
              if (f.id === 'all') count = memberVotes.length;
              else if (f.id === 'yes') count = vote.yesCount;
              else if (f.id === 'no') count = vote.noCount;
              else if (f.id === 'abstain') count = vote.abstainCount;
              else count = vote.memberTotal - vote.voteTotal;

              const active = filter === f.id;
              return (
                <Pressable
                  className={`rounded-full border px-lawmake-md py-lawmake-sm ${
                    active
                      ? 'border-primary bg-primary-light'
                      : 'border-neutral-200 bg-surface-primary'
                  }`}
                  onPress={() => setFilter(f.id)}
                >
                  <Text
                    className={`text-lawmake-footnote font-medium ${
                      active ? 'text-primary' : 'text-neutral-600'
                    }`}
                  >
                    {f.label} {count}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      );
    }
    return renderMember({ item: item.member });
  };

  return (
    <View className="flex-1 bg-surface-secondary">
      <FlatList
        data={rows}
        keyExtractor={(item, i) =>
          item.kind === 'member' ? item.member.memberId : `${item.kind}-${i}`
        }
        renderItem={renderRow}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 16,
        }}
        removeClippedSubviews={false}
      />
    </View>
  );
}

function SummaryStat({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <View className="items-center">
      <Text className={`text-lawmake-title2 font-bold ${colorClass}`}>{value}</Text>
      <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-500">{label}</Text>
    </View>
  );
}
