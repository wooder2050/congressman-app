import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getVoteMemberVotes } from '@/api/votes';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MemberPhoto } from '@/components/MemberPhoto';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { MEMBER_VOTE_RESULT_MAP, VOTE_RESULT_MAP } from '@/constants/maps';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { formatDate, formatNumber } from '@/lib/format';
import type { VoteMemberResult } from '@/types';
import { useCallback, useMemo, useState } from 'react';

const VOTE_FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'yes', label: '찬성' },
  { id: 'no', label: '반대' },
  { id: 'abstain', label: '기권' },
  { id: 'absent', label: '불참' },
];

export default function VoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('all');

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useLawmakeQuery(getVoteMemberVotes, [id]);

  const filteredMembers = useMemo(() => {
    if (!data?.memberVotes) return [];
    if (filter === 'all') return data.memberVotes;
    return data.memberVotes.filter((m) => m.result === filter);
  }, [data, filter]);

  const renderMember = useCallback(
    ({ item }: { item: VoteMemberResult }) => {
      const result = MEMBER_VOTE_RESULT_MAP[item.result];
      return (
        <Pressable
          className="flex-row items-center gap-3 border-b border-neutral-100 bg-white px-5 py-2.5"
          onPress={() => router.push(`/members/${item.memberId}`)}
        >
          <MemberPhoto
            uri={item.photoUrl}
            size={36}
            partyColor={item.partyColor}
          />
          <View className="flex-1">
            <Text className="text-sm font-medium text-neutral-800">
              {item.memberName}
            </Text>
            <Text className="text-[11px] text-neutral-400">
              {item.partyName} | {item.district}
            </Text>
          </View>
          <Badge
            label={result.label}
            color={result.color}
            textColor={result.textColor}
          />
        </Pressable>
      );
    },
    [router]
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!data) return <EmptyState title="표결 정보를 찾을 수 없습니다" />;

  const { vote, memberVotes } = data;
  const resultInfo = VOTE_RESULT_MAP[vote.resultCode];
  const total = vote.yesCount + vote.noCount + vote.abstainCount;

  // Group by party
  const partyVotes = memberVotes.reduce(
    (acc, m) => {
      if (!acc[m.partyName]) {
        acc[m.partyName] = { yes: 0, no: 0, abstain: 0, absent: 0, color: m.partyColor };
      }
      acc[m.partyName][m.result]++;
      return acc;
    },
    {} as Record<string, { yes: number; no: number; abstain: number; absent: number; color: string }>
  );

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-white px-5 pb-4 pt-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-sm text-primary">뒤로</Text>
        </Pressable>

        <View className="mt-2 flex-row items-start">
          <Badge
            label={resultInfo.label}
            color={resultInfo.color}
            textColor={resultInfo.textColor}
          />
        </View>
        <Text className="mt-2 text-base font-bold leading-5 text-neutral-900">
          {vote.billName}
        </Text>
        <Text className="mt-1.5 text-xs text-neutral-400">
          {formatDate(vote.procDate)} | 참석 {formatNumber(vote.voteTotal)}/
          {formatNumber(vote.memberTotal)}명
        </Text>
      </View>

      {/* Vote Summary */}
      <Card className="mx-5 mt-3">
        {/* Vote bar */}
        <View className="h-4 flex-row overflow-hidden rounded-full">
          <View
            className="items-center justify-center bg-green-500"
            style={{ width: `${total > 0 ? (vote.yesCount / total) * 100 : 0}%` }}
          >
            {vote.yesCount > 0 && (
              <Text className="text-[9px] font-bold text-white">{vote.yesCount}</Text>
            )}
          </View>
          <View
            className="items-center justify-center bg-red-500"
            style={{ width: `${total > 0 ? (vote.noCount / total) * 100 : 0}%` }}
          >
            {vote.noCount > 0 && (
              <Text className="text-[9px] font-bold text-white">{vote.noCount}</Text>
            )}
          </View>
          <View
            className="items-center justify-center bg-neutral-400"
            style={{ width: `${total > 0 ? (vote.abstainCount / total) * 100 : 0}%` }}
          >
            {vote.abstainCount > 0 && (
              <Text className="text-[9px] font-bold text-white">
                {vote.abstainCount}
              </Text>
            )}
          </View>
        </View>

        <View className="mt-3 flex-row justify-around">
          <View className="items-center">
            <Text className="text-lg font-bold text-green-600">{vote.yesCount}</Text>
            <Text className="text-[10px] text-neutral-400">찬성</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-red-600">{vote.noCount}</Text>
            <Text className="text-[10px] text-neutral-400">반대</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-neutral-500">
              {vote.abstainCount}
            </Text>
            <Text className="text-[10px] text-neutral-400">기권</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-neutral-300">
              {vote.memberTotal - vote.voteTotal}
            </Text>
            <Text className="text-[10px] text-neutral-400">불참</Text>
          </View>
        </View>
      </Card>

      {/* Party Breakdown */}
      <Card className="mx-5 mt-2">
        <Text className="mb-2 text-xs font-semibold text-neutral-500">
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
              <View key={party} className="mb-2">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <View
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: votes.color }}
                    />
                    <Text className="text-xs font-medium text-neutral-700">{party}</Text>
                  </View>
                  <Text className="text-[10px] text-neutral-400">{partyTotal}명</Text>
                </View>
                <View className="mt-1 h-2 flex-row overflow-hidden rounded-full bg-neutral-100">
                  <View
                    className="bg-green-500"
                    style={{
                      width: `${partyTotal > 0 ? (votes.yes / partyTotal) * 100 : 0}%`,
                    }}
                  />
                  <View
                    className="bg-red-500"
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

      {/* Filter */}
      <View className="mt-2 px-5">
        <FlatList
          data={VOTE_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 6, paddingVertical: 8 }}
          renderItem={({ item }) => {
            let count = 0;
            if (item.id === 'all') count = memberVotes.length;
            else if (item.id === 'yes') count = vote.yesCount;
            else if (item.id === 'no') count = vote.noCount;
            else if (item.id === 'abstain') count = vote.abstainCount;
            else count = vote.memberTotal - vote.voteTotal;

            return (
              <Pressable
                className={`rounded-full border px-3 py-1.5 ${
                  filter === item.id
                    ? 'border-primary bg-primary-light'
                    : 'border-neutral-200 bg-white'
                }`}
                onPress={() => setFilter(item.id)}
              >
                <Text
                  className={`text-xs font-medium ${
                    filter === item.id ? 'text-primary' : 'text-neutral-600'
                  }`}
                >
                  {item.label} {count}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Member List */}
      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.memberId}
        renderItem={renderMember}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      />
    </View>
  );
}
