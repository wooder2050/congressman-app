import { Stack, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getBreakingNews } from '@/api/breaking-news';
import { BookmarkButton } from '@/components/BookmarkButton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PressableCard } from '@/components/ui/Card';
import { StatusBadge, type StatusTone } from '@/components/ui/StatusBadge';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';

const CATEGORY_INFO: Record<string, { label: string; tone: StatusTone }> = {
  committee: { label: '국회', tone: 'neutral' },
  election: { label: '선거', tone: 'neutral' },
  legislation: { label: '입법', tone: 'neutral' },
  politics: { label: '정치', tone: 'neutral' },
};

function formatBreakingDate(date: string): string {
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return date;
  return `${parseInt(m[2], 10)}월 ${parseInt(m[3], 10)}일`;
}

export default function BreakingNewsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: items, isLoading, error, refetch } = useLawmakeQuery(getBreakingNews, []);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!items || items.length === 0) return <EmptyState title="속보가 없습니다" />;

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: '속보' }} />
      <ScrollView
        className="flex-1 bg-surface-secondary"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: insets.bottom + 16,
          gap: 12,
        }}
      >
        {items.map((item) => {
          const cat = CATEGORY_INFO[item.category] ?? CATEGORY_INFO.politics;
          return (
            <PressableCard
              key={item.id}
              onPress={() => item.linkUrl && router.push(item.linkUrl as never)}
            >
              <View className="flex-row items-center gap-lawmake-sm">
                <StatusBadge label={cat.label} tone={cat.tone} />
                <Text className="text-lawmake-caption text-neutral-400">
                  {formatBreakingDate(item.date)}
                </Text>
                <View className="ml-auto">
                  <BookmarkButton type="breaking-news" id={item.id} size={18} />
                </View>
              </View>
              <Text
                className="mt-lawmake-sm text-lawmake-headline leading-snug text-neutral-900"
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Text
                className="mt-lawmake-sm text-lawmake-footnote text-neutral-600"
                numberOfLines={3}
              >
                {item.description}
              </Text>
              {item.items && item.items.length > 0 && (
                <View className="mt-lawmake-md gap-lawmake-md border-l-2 border-neutral-100 pl-lawmake-md">
                  {item.items.slice(0, 3).map((detail) => (
                    <View key={detail.label} className="gap-1">
                      <Text className="text-lawmake-caption font-semibold text-neutral-500">
                        {detail.label}
                      </Text>
                      <Text className="text-lawmake-footnote leading-snug text-neutral-700">
                        {detail.value}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </PressableCard>
          );
        })}
      </ScrollView>
    </>
  );
}
