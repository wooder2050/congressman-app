import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getMembers } from '@/api/members';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PartyBadge } from '@/components/PartyBadge';
import { FilterChip } from '@/components/ui/FilterChip';
import { SearchInput } from '@/components/ui/SearchInput';
import { PARTIES } from '@/constants/parties';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import type { MemberWithTerm } from '@/types';

const CURRENT_TERM = 22;

const PARTY_FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'democratic', label: '민주당' },
  { id: 'ppp', label: '국민의힘' },
  { id: 'rebuilding', label: '혁신당' },
  { id: 'reform', label: '개혁신당' },
  { id: 'independent', label: '무소속' },
];

export default function MembersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [partyFilter, setPartyFilter] = useState('all');

  const {
    data: members,
    isLoading,
    error,
    refetch,
  } = useLawmakeQuery(getMembers, [CURRENT_TERM]);

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    let list = members;

    if (partyFilter !== 'all') {
      const party = PARTIES[partyFilter];
      if (party) {
        list = list.filter((m) => m.term.party.name === party.name);
      }
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.term.district.toLowerCase().includes(q) ||
          m.term.party.name.toLowerCase().includes(q),
      );
    }

    return list;
  }, [members, partyFilter, search]);

  const renderMember = useCallback(
    ({ item }: { item: MemberWithTerm }) => (
      <Pressable
        className="flex-row items-center gap-lawmake-md border-b border-neutral-100 bg-surface-primary px-lawmake-lg py-lawmake-md active:bg-neutral-50"
        onPress={() => router.push(`/members/${item.id}`)}
      >
        <View
          className="h-12 w-12 overflow-hidden rounded-full bg-neutral-100"
          style={{ borderWidth: 2, borderColor: item.term.party.color }}
        >
          <Image
            source={{ uri: item.photoUrl }}
            style={{ width: 44, height: 44 }}
            contentFit="cover"
            transition={200}
          />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-lawmake-sm">
            <Text className="text-lawmake-body font-semibold text-neutral-900">{item.name}</Text>
            <PartyBadge name={item.term.party.shortName} color={item.term.party.color} />
          </View>
          <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
            {item.term.district} · {item.electedCount}선
          </Text>
        </View>
      </Pressable>
    ),
    [router],
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <View className="flex-1 bg-surface-secondary">
      {/* Large Title */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-md pt-lawmake-md">
        <Text className="text-lawmake-large text-neutral-900">의원</Text>
      </View>

      {/* Search */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-md">
        <SearchInput
          placeholder="의원명, 지역구, 정당 검색"
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
        />
      </View>

      {/* Party Filters */}
      <View className="bg-surface-primary pb-lawmake-md">
        <FlatList
          data={PARTY_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: 8,
          }}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              selected={partyFilter === item.id}
              onPress={() => setPartyFilter(item.id)}
            />
          )}
        />
      </View>

      {/* Count */}
      <View className="border-t border-neutral-100 bg-surface-secondary px-lawmake-lg py-lawmake-sm">
        <Text className="text-lawmake-footnote text-neutral-500">
          총 {filteredMembers.length}명
        </Text>
      </View>

      {/* Member List */}
      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        ListEmptyComponent={
          <EmptyState title="검색 결과가 없습니다" description="다른 검색어로 시도해보세요" />
        }
      />
    </View>
  );
}
