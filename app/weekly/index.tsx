import { useRouter } from 'expo-router';
import { Calendar, FileText, Vote as VoteIcon } from 'lucide-react-native';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/Badge';
import { PressableCard } from '@/components/ui/Card';
import { getAllWeeklyArticles } from '@/data/weekly';
import type { WeeklyArticle } from '@/types';

const BILL_STATUS_COLORS: Record<string, { color: string; textColor: string; label: string }> = {
  passed: { color: '#dcfce7', textColor: '#15803d', label: '통과' },
  pending: { color: '#f3f4f6', textColor: '#6b7280', label: '계류' },
  committee: { color: '#fef3c7', textColor: '#b45309', label: '위원회' },
  rejected: { color: '#fee2e2', textColor: '#b91c1c', label: '부결' },
};

function WeeklyCard({ article }: { article: WeeklyArticle }) {
  const router = useRouter();

  return (
    <PressableCard
      className="mx-lawmake-lg mb-lawmake-sm"
      onPress={() => router.push(`/weekly/${article.id}`)}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-lawmake-headline font-bold text-neutral-900">{article.title}</Text>
        <Text className="text-lawmake-caption text-neutral-400">{article.period}</Text>
      </View>

      <Text className="mt-lawmake-sm text-lawmake-footnote leading-5 text-neutral-600" numberOfLines={2}>
        {article.summary}
      </Text>

      {article.stats && (
        <View className="mt-lawmake-sm flex-row gap-lawmake-sm">
          {article.stats.billsPassed != null && (
            <View className="flex-row items-center gap-lawmake-xs">
              <FileText size={12} color="#2563EB" />
              <Text className="text-lawmake-caption text-neutral-500">
                통과 {article.stats.billsPassed}
              </Text>
            </View>
          )}
          {article.stats.votesHeld != null && (
            <View className="flex-row items-center gap-lawmake-xs">
              <VoteIcon size={12} color="#2563EB" />
              <Text className="text-lawmake-caption text-neutral-500">
                표결 {article.stats.votesHeld}
              </Text>
            </View>
          )}
          {article.stats.committeeMeetings != null && (
            <View className="flex-row items-center gap-lawmake-xs">
              <Calendar size={12} color="#2563EB" />
              <Text className="text-lawmake-caption text-neutral-500">
                위원회 {article.stats.committeeMeetings}
              </Text>
            </View>
          )}
        </View>
      )}

      {article.featuredBills.length > 0 && (
        <View className="mt-lawmake-sm gap-lawmake-xs">
          {article.featuredBills.slice(0, 3).map((bill, i) => {
            const status = BILL_STATUS_COLORS[bill.status];
            return (
              <View key={i} className="flex-row items-center gap-lawmake-sm">
                <Badge
                  label={status.label}
                  color={status.color}
                  textColor={status.textColor}
                />
                <Text className="flex-1 text-lawmake-caption text-neutral-700" numberOfLines={1}>
                  {bill.title}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {article.tags.length > 0 && (
        <View className="mt-lawmake-sm flex-row flex-wrap gap-lawmake-xs">
          {article.tags.slice(0, 4).map((tag) => (
            <Text key={tag} className="text-lawmake-caption text-primary">
              #{tag}
            </Text>
          ))}
        </View>
      )}
    </PressableCard>
  );
}

export default function WeeklyListScreen() {
  const insets = useSafeAreaInsets();
  const articles = getAllWeeklyArticles();

  return (
    <FlatList
      className="flex-1 bg-surface-secondary"
      data={articles}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <WeeklyCard article={item} />}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 16 }}
    />
  );
}
