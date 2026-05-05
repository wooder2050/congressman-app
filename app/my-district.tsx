import { useRouter } from 'expo-router';
import { MapPin, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getMembers } from '@/api/members';
import { updateUserPreferences } from '@/api/user-preferences';
import { Card, PressableCard } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useUserPreferences } from '@/hooks/useBookmarks';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { useAuth } from '@/lib/auth-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserPreference, MemberWithTerm } from '@/types';

const CURRENT_TERM = 22;

export default function MyDistrictScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: prefs, isLoading: prefsLoading } = useUserPreferences();
  const { data: members, isLoading: membersLoading } = useLawmakeQuery(
    getMembers,
    [CURRENT_TERM],
    { enabled: !!session },
  );

  const updateMutation = useMutation({
    mutationFn: (district: string | null) => updateUserPreferences({ district }),
    onSuccess: (data) => {
      queryClient.setQueryData<UserPreference | null>(['userPreferences'], data);
    },
  });

  const localMembers = useMemo(
    () => (members ?? []).filter((m) => !m.term.proportional),
    [members],
  );

  // district 단위로 그룹핑된 옵션
  const districts = useMemo(() => {
    const map = new Map<string, MemberWithTerm>();
    for (const m of localMembers) {
      if (m.term.district) map.set(m.term.district, m);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b, 'ko'))
      .map(([district, member]) => ({ district, member }));
  }, [localMembers]);

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return districts;
    return districts.filter(
      ({ district, member }) => district.includes(q) || member.name.includes(q),
    );
  }, [districts, search]);

  if (authLoading) return <LoadingSpinner />;

  if (!session) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 p-8">
        <MapPin size={48} color="#D1D5DB" />
        <Text className="mt-4 text-base font-bold text-neutral-900">로그인이 필요합니다</Text>
        <Text className="mt-1 text-center text-sm text-neutral-500">
          내 지역구는 로그인 후 사용할 수 있습니다.
        </Text>
        <Pressable
          onPress={() => router.push('/sign-in' as never)}
          className="mt-6 rounded-xl bg-primary px-6 py-3 active:opacity-80"
        >
          <Text className="text-sm font-semibold text-white">로그인하기</Text>
        </Pressable>
      </View>
    );
  }

  if (prefsLoading || membersLoading) return <LoadingSpinner />;

  const savedDistrict = prefs?.district ?? null;
  const matchedMember = savedDistrict
    ? localMembers.find((m) => m.term.district === savedDistrict)
    : null;

  return (
    <View className="flex-1 bg-neutral-50">
      {/* 현재 선택된 지역구 */}
      {savedDistrict && matchedMember ? (
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
          <View className="bg-white px-5 py-4">
            <Text className="text-xs text-neutral-500">내 지역구</Text>
            <Text className="mt-0.5 text-lg font-bold text-neutral-900">{savedDistrict}</Text>
          </View>

          <View className="mt-3 px-4">
            <PressableCard
              onPress={() => router.push(`/members/${matchedMember.id}` as never)}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="h-12 w-12 overflow-hidden rounded-full"
                  style={{
                    borderWidth: 2,
                    borderColor: matchedMember.term.party.color,
                  }}
                />
                <View className="flex-1">
                  <Text className="text-base font-bold text-neutral-900">
                    {matchedMember.name}
                  </Text>
                  <Text className="mt-0.5 text-xs text-neutral-500">
                    {matchedMember.term.party.shortName}
                  </Text>
                </View>
                <Text className="text-xs font-medium text-primary">상세 →</Text>
              </View>
            </PressableCard>

            <Card className="mt-2">
              <Text className="text-xs text-neutral-500">
                의원 상세 화면에서 출석률, 법안, 표결 등 의정활동 상세를 확인할 수 있습니다.
              </Text>
            </Card>

            <Pressable
              className="mt-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 active:bg-neutral-50"
              onPress={() => updateMutation.mutate(null)}
              disabled={updateMutation.isPending}
            >
              <Text className="text-center text-xs text-neutral-600">
                {updateMutation.isPending ? '변경 중…' : '지역구 다시 선택하기'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <>
          {/* 지역구 선택 화면 */}
          <View className="bg-white px-5 pt-3 pb-2">
            <Text className="mb-2 text-sm font-bold text-neutral-900">
              내 지역구를 선택하세요
            </Text>
            <View className="flex-row items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2.5">
              <Search size={16} color="#9CA3AF" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="지역구 또는 의원명 검색"
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-sm text-neutral-900"
              />
            </View>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={({ district }) => district}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: insets.bottom + 16,
              gap: 6,
            }}
            renderItem={({ item }) => (
              <PressableCard
                onPress={() => updateMutation.mutate(item.district)}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-neutral-900">
                      {item.district}
                    </Text>
                    <Text className="mt-0.5 text-[11px] text-neutral-500">
                      {item.member.name} · {item.member.term.party.shortName}
                    </Text>
                  </View>
                  {updateMutation.isPending && updateMutation.variables === item.district ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Text className="text-xs text-primary">선택</Text>
                  )}
                </View>
              </PressableCard>
            )}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Text className="text-sm text-neutral-400">검색 결과가 없습니다</Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}
