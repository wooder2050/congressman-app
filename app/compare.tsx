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
      className="flex-1 bg-neutral-50"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      <View className="bg-white px-5 pb-4 pt-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-sm text-primary">뒤로</Text>
        </Pressable>
        <Text className="mt-2 text-lg font-bold text-neutral-900">의원 비교</Text>
        <Text className="mt-0.5 text-xs text-neutral-400">
          최대 {MAX_COMPARE}명까지 비교할 수 있습니다
        </Text>
      </View>

      {/* Selected Members */}
      {selected.length > 0 && (
        <View className="flex-row gap-2 px-5 py-3">
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
              <Text className="mt-1 text-[10px] text-neutral-600">{m.name}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Search */}
      {selected.length < MAX_COMPARE && (
        <View className="px-5">
          <View className="flex-row items-center rounded-xl border border-neutral-200 bg-white px-3">
            <Search size={18} color="#a3a3a3" />
            <TextInput
              className="ml-2 flex-1 py-2.5 text-sm text-neutral-800"
              placeholder="의원명 검색"
              placeholderTextColor="#a3a3a3"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {searchResults.length > 0 && (
            <View className="mt-1 rounded-xl border border-neutral-200 bg-white">
              {searchResults.map((m) => (
                <Pressable
                  key={m.id}
                  className="flex-row items-center gap-3 border-b border-neutral-100 px-4 py-2.5 active:bg-neutral-50"
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
                  <Text className="text-sm text-neutral-800">{m.name}</Text>
                  <Text className="text-xs text-neutral-400">
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
        <View className="mt-4 px-5">
          <ComparisonView members={selected} />
        </View>
      )}

      {selected.length < 2 && selected.length > 0 && (
        <View className="mt-8 items-center px-5">
          <Text className="text-sm text-neutral-400">
            비교할 의원을 {2 - selected.length}명 더 선택해주세요
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function ComparisonView({ members }: { members: MemberWithTerm[] }) {
  return (
    <View className="gap-3">
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
      <View className="flex-row items-center gap-3">
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
          <Text className="text-sm font-bold text-neutral-900">{member.name}</Text>
          <Text className="text-xs text-neutral-400">
            {member.term.party.shortName} | {member.term.district}
          </Text>
        </View>
      </View>

      <View className="mt-3 flex-row justify-around border-t border-neutral-100 pt-3">
        <View className="items-center">
          <Text className="text-lg font-bold text-primary">
            {attendance ? formatPercent(attendance.rate) : '-'}
          </Text>
          <Text className="text-[10px] text-neutral-400">출석률</Text>
        </View>
        <View className="items-center">
          <Text className="text-lg font-bold text-neutral-800">
            {billsData ? billsData.total : '-'}
          </Text>
          <Text className="text-[10px] text-neutral-400">발의 법안</Text>
        </View>
      </View>
    </Card>
  );
}
