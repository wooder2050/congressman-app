import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAttendance } from '@/api/attendance';
import { getBills } from '@/api/bills';
import { getMembers } from '@/api/members';
import { Card } from '@/components/ui/Card';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { formatPercent } from '@/lib/format';
import type { MemberWithTerm } from '@/types';

const CURRENT_TERM = 22;
const MAX_COMPARE = 4;

export default function CompareScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MemberWithTerm[]>([]);

  const { data: members } = useLawmakeQuery(getMembers, [CURRENT_TERM]);

  const searchResults = useMemo(() => {
    if (!members || !search.trim()) return [];
    const q = search.trim().toLowerCase();
    return members
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) &&
          !selected.some((s) => s.id === m.id)
      )
      .slice(0, 10);
  }, [members, search, selected]);

  const addMember = (member: MemberWithTerm) => {
    if (selected.length >= MAX_COMPARE) return;
    setSelected([...selected, member]);
    setSearch('');
  };

  const removeMember = (id: string) => {
    setSelected(selected.filter((m) => m.id !== id));
  };

  return (
    <ScrollView
      className="flex-1 bg-surface-secondary"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-md pt-lawmake-md">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-lawmake-footnote text-primary">뒤로</Text>
        </Pressable>
        <Text className="mt-lawmake-sm text-lawmake-title2 font-bold text-neutral-900">의원 비교</Text>
        <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">
          최대 {MAX_COMPARE}명까지 비교할 수 있습니다
        </Text>
      </View>

      {/* Selected Members */}
      {selected.length > 0 && (
        <View className="flex-row gap-lawmake-sm px-lawmake-lg py-lawmake-sm">
          {selected.map((m) => (
            <Pressable
              key={m.id}
              className="items-center"
              onPress={() => removeMember(m.id)}
            >
              <View className="relative">
                <View
                  className="h-12 w-12 overflow-hidden rounded-full bg-neutral-100"
                  style={{ borderWidth: 2, borderColor: m.term.party.color }}
                >
                  <Image
                    source={{ uri: m.photoUrl }}
                    style={{ width: 44, height: 44 }}
                    contentFit="cover"
                  />
                </View>
                <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-neutral-800">
                  <X size={12} color="white" />
                </View>
              </View>
              <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-600">{m.name}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Search */}
      {selected.length < MAX_COMPARE && (
        <View className="px-lawmake-lg">
          <View className="flex-row items-center rounded-lawmake-lg border border-neutral-200 bg-surface-primary px-lawmake-sm">
            <Search size={18} color="#a3a3a3" />
            <TextInput
              className="ml-lawmake-sm flex-1 py-lawmake-sm text-lawmake-footnote text-neutral-800"
              placeholder="의원명 검색"
              placeholderTextColor="#a3a3a3"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {searchResults.length > 0 && (
            <View className="mt-1 rounded-lawmake-lg border border-neutral-200 bg-surface-primary">
              {searchResults.map((m) => (
                <Pressable
                  key={m.id}
                  className="flex-row items-center gap-lawmake-sm border-b border-neutral-100 px-lawmake-md py-lawmake-sm active:bg-neutral-50"
                  onPress={() => addMember(m)}
                >
                  <View
                    className="h-8 w-8 overflow-hidden rounded-full bg-neutral-100"
                    style={{ borderWidth: 1.5, borderColor: m.term.party.color }}
                  >
                    <Image
                      source={{ uri: m.photoUrl }}
                      style={{ width: 28, height: 28 }}
                      contentFit="cover"
                    />
                  </View>
                  <Text className="text-lawmake-footnote text-neutral-800">{m.name}</Text>
                  <Text className="text-lawmake-caption text-neutral-400">
                    {m.term.party.shortName}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Comparison Cards */}
      {selected.length >= 2 && (
        <View className="mt-lawmake-md px-lawmake-lg">
          <ComparisonView members={selected} />
        </View>
      )}

      {selected.length < 2 && selected.length > 0 && (
        <View className="mt-lawmake-xl items-center px-lawmake-lg">
          <Text className="text-lawmake-footnote text-neutral-400">
            비교할 의원을 {2 - selected.length}명 더 선택해주세요
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function ComparisonView({ members }: { members: MemberWithTerm[] }) {
  return (
    <View className="gap-lawmake-sm">
      {members.map((m) => (
        <ComparisonCard key={m.id} member={m} />
      ))}
    </View>
  );
}

function ComparisonCard({ member }: { member: MemberWithTerm }) {
  const { data: attendance } = useLawmakeQuery(getAttendance, [
    { memberId: member.id, termId: CURRENT_TERM },
  ]);

  const { data: billsData } = useLawmakeQuery(getBills, [
    { termId: CURRENT_TERM, memberId: member.id, limit: 1 },
  ]);

  return (
    <Card>
      <View className="flex-row items-center gap-lawmake-sm">
        <View
          className="h-10 w-10 overflow-hidden rounded-full bg-neutral-100"
          style={{ borderWidth: 2, borderColor: member.term.party.color }}
        >
          <Image
            source={{ uri: member.photoUrl }}
            style={{ width: 36, height: 36 }}
            contentFit="cover"
          />
        </View>
        <View>
          <Text className="text-lawmake-footnote font-bold text-neutral-900">{member.name}</Text>
          <Text className="text-lawmake-caption text-neutral-400">
            {member.term.party.shortName} | {member.term.district}
          </Text>
        </View>
      </View>

      <View className="mt-lawmake-sm flex-row justify-around border-t border-neutral-100 pt-lawmake-sm">
        <View className="items-center">
          <Text className="text-lawmake-headline font-bold text-primary">
            {attendance ? formatPercent(attendance.rate) : '-'}
          </Text>
          <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">출석률</Text>
        </View>
        <View className="items-center">
          <Text className="text-lawmake-headline font-bold text-neutral-800">
            {billsData ? billsData.total : '-'}
          </Text>
          <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">발의 법안</Text>
        </View>
      </View>
    </Card>
  );
}
