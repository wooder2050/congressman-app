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
      <View className="flex-1 items-center justify-center bg-surface-secondary p-lawmake-xl">
        <MapPin size={48} color="#D1D5DB" />
        <Text className="mt-lawmake-md text-lawmake-callout font-bold text-neutral-900">로그인이 필요합니다</Text>
        <Text className="mt-lawmake-xs text-center text-lawmake-footnote text-neutral-500">
          내 지역구는 로그인 후 사용할 수 있습니다.
        </Text>
        <Pressable
          onPress={() => router.push('/sign-in' as never)}
          className="mt-lawmake-lg rounded-lawmake-lg bg-primary px-lawmake-lg py-lawmake-sm active:opacity-80"
        >
          <Text className="text-lawmake-footnote font-semibold text-white">로그인하기</Text>
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
    <View className="flex-1 bg-surface-secondary">
      {/* 현재 선택된 지역구 */}
      {savedDistrict && matchedMember ? (
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
          <View className="bg-surface-primary px-lawmake-lg py-lawmake-md">
            <Text className="text-lawmake-caption text-neutral-500">내 지역구</Text>
            <Text className="mt-lawmake-xs text-lawmake-headline font-bold text-neutral-900">{savedDistrict}</Text>
          </View>

          <View className="mt-lawmake-sm px-lawmake-md">
            <PressableCard
              onPress={() => router.push(`/members/${matchedMember.id}` as never)}
            >
              <View className="flex-row items-center gap-lawmake-sm">
                <View
                  className="h-12 w-12 overflow-hidden rounded-full"
                  style={{
                    borderWidth: 2,
                    borderColor: matchedMember.term.party.color,
                  }}
                />
                <View className="flex-1">
                  <Text className="text-lawmake-callout font-bold text-neutral-900">
                    {matchedMember.name}
                  </Text>
                  <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-500">
                    {matchedMember.term.party.shortName}
                  </Text>
                </View>
                <Text className="text-lawmake-caption font-medium text-primary">상세 →</Text>
              </View>
            </PressableCard>

            <Card className="mt-lawmake-sm">
              <Text className="text-lawmake-caption text-neutral-500">
                의원 상세 화면에서 출석률, 법안, 표결 등 의정활동 상세를 확인할 수 있습니다.
              </Text>
            </Card>

            <Pressable
              className="mt-lawmake-md rounded-lawmake-lg border border-neutral-200 bg-surface-primary px-lawmake-md py-lawmake-sm active:bg-neutral-50"
              onPress={() => updateMutation.mutate(null)}
              disabled={updateMutation.isPending}
            >
              <Text className="text-center text-lawmake-caption text-neutral-600">
                {updateMutation.isPending ? '변경 중…' : '지역구 다시 선택하기'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <>
          {/* 지역구 선택 화면 */}
          <View className="bg-surface-primary px-lawmake-lg pt-lawmake-sm pb-lawmake-sm">
            <Text className="mb-lawmake-sm text-lawmake-footnote font-bold text-neutral-900">
              내 지역구를 선택하세요
            </Text>
            <View className="flex-row items-center gap-lawmake-sm rounded-lawmake-md bg-neutral-100 px-lawmake-sm py-lawmake-sm">
              <Search size={16} color="#9CA3AF" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="지역구 또는 의원명 검색"
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-lawmake-footnote text-neutral-900"
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
                    <Text className="text-lawmake-footnote font-semibold text-neutral-900">
                      {item.district}
                    </Text>
                    <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-500">
                      {item.member.name} · {item.member.term.party.shortName}
                    </Text>
                  </View>
                  {updateMutation.isPending && updateMutation.variables === item.district ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Text className="text-lawmake-caption text-primary">선택</Text>
                  )}
                </View>
              </PressableCard>
            )}
            ListEmptyComponent={
              <View className="items-center py-lawmake-xl">
                <Text className="text-lawmake-footnote text-neutral-400">검색 결과가 없습니다</Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}
