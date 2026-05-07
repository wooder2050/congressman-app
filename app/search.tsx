import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getBills } from '@/api/bills';
import { getMembers } from '@/api/members';
import { getVotes } from '@/api/votes';
import { PartyBadge } from '@/components/PartyBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { tapLight } from '@/lib/haptics';

const CURRENT_TERM = 22;

type ResultRow =
  | { kind: 'member'; id: string; name: string; party: string; partyColor: string; district: string; photoUrl: string }
  | { kind: 'bill'; id: string; title: string; proposer: string; status: string }
  | { kind: 'vote'; id: string; billName: string; resultLabel: string };

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');

  const trimmed = q.trim();
  const enabled = trimmed.length >= 1;

  // 의원: client-side filter (전체 명단 캐시 활용)
  const { data: allMembers } = useLawmakeQuery(getMembers, [CURRENT_TERM]);

  // 법안: 서버 검색
  const { data: billsData, isLoading: billsLoading } = useLawmakeQuery(
    getBills,
    [{ termId: CURRENT_TERM, search: trimmed, limit: 20 }],
    { enabled },
  );

  // 표결: 서버 검색
  const { data: votesData, isLoading: votesLoading } = useLawmakeQuery(
    getVotes,
    [{ termId: CURRENT_TERM, search: trimmed, limit: 20 }],
    { enabled },
  );

  const memberHits = useMemo<ResultRow[]>(() => {
    if (!enabled || !allMembers) return [];
    const lower = trimmed.toLowerCase();
    return allMembers
      .filter(
        (m) =>
          m.name.toLowerCase().includes(lower) ||
          m.term.district.toLowerCase().includes(lower) ||
          m.term.party.name.toLowerCase().includes(lower),
      )
      .slice(0, 10)
      .map((m) => ({
        kind: 'member' as const,
        id: m.id,
        name: m.name,
        party: m.term.party.shortName,
        partyColor: m.term.party.color,
        district: m.term.district,
        photoUrl: m.photoUrl,
      }));
  }, [allMembers, trimmed, enabled]);

  const billHits = useMemo<ResultRow[]>(
    () =>
      (billsData?.bills ?? []).slice(0, 10).map((b) => ({
        kind: 'bill' as const,
        id: b.id,
        title: b.title,
        proposer: b.proposerName,
        status: b.status,
      })),
    [billsData],
  );

  const voteHits = useMemo<ResultRow[]>(
    () =>
      (votesData?.votes ?? []).slice(0, 10).map((v) => ({
        kind: 'vote' as const,
        id: v.id,
        billName: v.billName,
        resultLabel: v.procResult,
      })),
    [votesData],
  );

  const isLoading = enabled && (billsLoading || votesLoading);
  const hasAnyHit = memberHits.length + billHits.length + voteHits.length > 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: '검색' }} />
      <View className="flex-1 bg-surface-secondary">
        <View className="bg-surface-primary px-lawmake-lg py-lawmake-md">
          <SearchInput
            placeholder="의원, 법안, 표결 검색"
            value={q}
            onChangeText={setQ}
            onClear={() => setQ('')}
            autoFocus
          />
        </View>

        {!enabled && (
          <View className="flex-1 items-center justify-center px-lawmake-lg">
            <Text className="text-center text-lawmake-footnote text-neutral-500">
              검색어를 입력해주세요
            </Text>
          </View>
        )}

        {enabled && (
          <FlatList
            data={[...memberHits, ...billHits, ...voteHits]}
            keyExtractor={(item) => `${item.kind}-${item.id}`}
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
            ListEmptyComponent={
              isLoading ? (
                <View className="py-lawmake-xxxl items-center">
                  <ActivityIndicator color="#2563EB" />
                </View>
              ) : hasAnyHit ? null : (
                <View className="px-lawmake-lg py-lawmake-xxxl items-center">
                  <Text className="text-lawmake-footnote text-neutral-500">
                    검색 결과가 없습니다
                  </Text>
                </View>
              )
            }
            ListHeaderComponent={
              memberHits.length > 0 ? (
                <SectionHeader label={`의원 (${memberHits.length})`} />
              ) : null
            }
            renderItem={({ item, index }) => {
              const prev = index > 0 ? [...memberHits, ...billHits, ...voteHits][index - 1] : null;
              const showHeader = !prev || prev.kind !== item.kind;
              const headerLabel =
                item.kind === 'member'
                  ? `의원 (${memberHits.length})`
                  : item.kind === 'bill'
                  ? `법안 (${billHits.length})`
                  : `표결 (${voteHits.length})`;
              return (
                <View>
                  {showHeader && index > 0 && <SectionHeader label={headerLabel} />}
                  <Pressable
                    onPress={() => {
                      tapLight();
                      if (item.kind === 'member') router.push(`/members/${item.id}`);
                      else if (item.kind === 'bill') router.push(`/bills/${item.id}`);
                      else router.push(`/votes/${item.id}`);
                    }}
                    className="flex-row items-center gap-lawmake-md border-b border-neutral-100 bg-surface-primary px-lawmake-lg py-lawmake-md active:bg-neutral-50"
                  >
                    {item.kind === 'member' ? (
                      <View
                        className="h-10 w-10 overflow-hidden rounded-full bg-neutral-100"
                        style={{ borderWidth: 2, borderColor: item.partyColor }}
                      >
                        <Image
                          source={{ uri: item.photoUrl }}
                          style={{ width: 36, height: 36 }}
                          contentFit="cover"
                        />
                      </View>
                    ) : null}

                    <View className="flex-1">
                      {item.kind === 'member' && (
                        <>
                          <View className="flex-row items-center gap-lawmake-sm">
                            <Text className="text-lawmake-body font-semibold text-neutral-900">
                              {item.name}
                            </Text>
                            <PartyBadge name={item.party} color={item.partyColor} />
                          </View>
                          <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
                            {item.district}
                          </Text>
                        </>
                      )}
                      {item.kind === 'bill' && (
                        <>
                          <Text
                            className="text-lawmake-callout font-semibold text-neutral-900"
                            numberOfLines={2}
                          >
                            {item.title}
                          </Text>
                          <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
                            {item.proposer} · {item.status}
                          </Text>
                        </>
                      )}
                      {item.kind === 'vote' && (
                        <>
                          <Text
                            className="text-lawmake-callout font-semibold text-neutral-900"
                            numberOfLines={2}
                          >
                            {item.billName}
                          </Text>
                          <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
                            {item.resultLabel}
                          </Text>
                        </>
                      )}
                    </View>
                  </Pressable>
                </View>
              );
            }}
          />
        )}
      </View>
    </>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <View className="bg-surface-secondary px-lawmake-lg py-lawmake-sm">
      <Text className="text-lawmake-caption font-semibold text-neutral-500">
        {label}
      </Text>
    </View>
  );
}
