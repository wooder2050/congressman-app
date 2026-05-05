import { useRouter } from 'expo-router';
import { Bookmark, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getBill } from '@/api/bills';
import { getMember } from '@/api/members';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, PressableCard } from '@/components/ui/Card';
import { useUserPreferences } from '@/hooks/useBookmarks';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import { useAuth } from '@/lib/auth-context';

type Tab = 'members' | 'bills';

export default function BookmarksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('members');

  const { data: prefs, isLoading } = useUserPreferences();

  if (authLoading) return <LoadingSpinner />;

  if (!session) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-secondary p-lawmake-xl">
        <Bookmark size={48} color="#D1D5DB" />
        <Text className="mt-lawmake-md text-lawmake-callout font-bold text-neutral-900">로그인이 필요합니다</Text>
        <Text className="mt-lawmake-xs text-center text-lawmake-footnote text-neutral-500">
          즐겨찾기는 로그인 후 사용할 수 있습니다.
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

  if (isLoading) return <LoadingSpinner />;

  const memberIds = prefs?.bookmarkedMembers ?? [];
  const billIds = prefs?.bookmarkedBills ?? [];
  const ids = tab === 'members' ? memberIds : billIds;

  return (
    <View className="flex-1 bg-surface-secondary">
      <View className="flex-row gap-lawmake-sm border-b border-neutral-100 bg-surface-primary px-lawmake-lg pt-lawmake-sm pb-lawmake-sm">
        {(['members', 'bills'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            className={`rounded-full px-lawmake-md py-lawmake-sm ${
              tab === t ? 'bg-primary' : 'bg-neutral-100'
            }`}
          >
            <Text
              className={`text-lawmake-caption font-semibold ${
                tab === t ? 'text-white' : 'text-neutral-600'
              }`}
            >
              {t === 'members' ? `의원 ${memberIds.length}` : `법안 ${billIds.length}`}
            </Text>
          </Pressable>
        ))}
      </View>

      {ids.length === 0 ? (
        <View className="flex-1 items-center justify-center p-lawmake-xl">
          <Bookmark size={48} color="#D1D5DB" />
          <Text className="mt-lawmake-md text-lawmake-callout font-bold text-neutral-900">
            아직 즐겨찾기한 {tab === 'members' ? '의원' : '법안'}이 없습니다
          </Text>
          <Text className="mt-lawmake-xs text-center text-lawmake-footnote text-neutral-500">
            {tab === 'members' ? '의원 상세' : '법안 상세'} 화면의 북마크 버튼을 눌러보세요.
          </Text>
        </View>
      ) : (
        <FlatList
          data={ids}
          keyExtractor={(id) => id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16, gap: 8 }}
          renderItem={({ item }) =>
            tab === 'members' ? <MemberRow id={item} /> : <BillRow id={item} />
          }
        />
      )}
    </View>
  );
}

function MemberRow({ id }: { id: string }) {
  const router = useRouter();
  const { data: member, isLoading } = useLawmakeQuery(getMember, [id]);

  if (isLoading) {
    return (
      <Card>
        <ActivityIndicator />
      </Card>
    );
  }

  if (!member) {
    return (
      <Card>
        <Text className="text-lawmake-caption text-neutral-400">데이터를 찾을 수 없습니다 (ID: {id})</Text>
      </Card>
    );
  }

  return (
    <PressableCard onPress={() => router.push(`/members/${id}` as never)}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lawmake-footnote font-bold text-neutral-900">{member.name}</Text>
          <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-500">의원</Text>
        </View>
        <ChevronRight size={18} color="#9CA3AF" />
      </View>
    </PressableCard>
  );
}

function BillRow({ id }: { id: string }) {
  const router = useRouter();
  const { data: bill, isLoading } = useLawmakeQuery(getBill, [id]);

  if (isLoading) {
    return (
      <Card>
        <ActivityIndicator />
      </Card>
    );
  }

  if (!bill) {
    return (
      <Card>
        <Text className="text-lawmake-caption text-neutral-400">데이터를 찾을 수 없습니다 (ID: {id})</Text>
      </Card>
    );
  }

  return (
    <PressableCard onPress={() => router.push(`/bills/${id}` as never)}>
      <View className="flex-row items-start justify-between gap-lawmake-sm">
        <View className="flex-1">
          <Text className="text-lawmake-footnote font-bold text-neutral-900" numberOfLines={2}>
            {bill.title}
          </Text>
          <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-500">{bill.proposedDate}</Text>
        </View>
        <ChevronRight size={18} color="#9CA3AF" />
      </View>
    </PressableCard>
  );
}
