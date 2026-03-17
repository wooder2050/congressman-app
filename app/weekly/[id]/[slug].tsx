import { useLocalSearchParams } from 'expo-router';
import { Linking, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Card, PressableCard } from '@/components/ui/Card';
import { getWeeklyArticle } from '@/data/weekly';

const BILL_STATUS_COLORS: Record<string, { color: string; textColor: string; label: string }> = {
  passed: { color: '#0F766E', textColor: '#FFFFFF', label: '가결' },
  pending: { color: '#737373', textColor: '#FFFFFF', label: '계류' },
  committee: { color: '#111111', textColor: '#FFFFFF', label: '위원회 심사' },
  rejected: { color: '#DC2626', textColor: '#FFFFFF', label: '부결' },
};

const HIGHLIGHT_CATEGORY: Record<string, { emoji: string; label: string }> = {
  vote: { emoji: '🗳️', label: '표결' },
  bill: { emoji: '📋', label: '법안' },
  committee: { emoji: '🏛️', label: '위원회' },
  politics: { emoji: '⚡', label: '정치' },
  economy: { emoji: '📈', label: '경제' },
};

export default function WeeklyArticleScreen() {
  const { id, slug } = useLocalSearchParams<{ id: string; slug: string }>();
  const insets = useSafeAreaInsets();
  const weekly = getWeeklyArticle(id);

  if (!weekly) return <EmptyState title="주간뉴스를 찾을 수 없습니다" />;

  const decodedSlug = decodeURIComponent(slug);

  // featuredBills에서 찾기
  const bill = weekly.featuredBills.find((b) => b.slug === decodedSlug);
  if (bill && bill.article) {
    const status = BILL_STATUS_COLORS[bill.status];
    return (
      <ScrollView
        className="flex-1 bg-neutral-50"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        {/* Header */}
        <View className="bg-white px-5 pb-5 pt-2">
          <Badge label={status.label} color={status.color} textColor={status.textColor} />
          <Text className="mt-2 text-2xl font-bold text-neutral-900">{bill.title}</Text>
          <Text className="mt-1 text-xs text-neutral-400">{weekly.period}</Text>
          {bill.proposer && (
            <Text className="mt-1 text-xs text-neutral-500">{bill.proposer}</Text>
          )}
          <Text className="mt-3 text-sm leading-5 text-neutral-600">{bill.description}</Text>

          {bill.voteResult && (
            <View className="mt-4">
              <View className="flex-row gap-4">
                <Text className="text-sm text-neutral-500">
                  찬성 <Text className="font-bold text-green-600">{bill.voteResult.yes}</Text>
                </Text>
                <Text className="text-sm text-neutral-500">
                  반대 <Text className="font-bold text-red-600">{bill.voteResult.no}</Text>
                </Text>
                <Text className="text-sm text-neutral-500">
                  기권{' '}
                  <Text className="font-bold text-neutral-400">{bill.voteResult.abstain}</Text>
                </Text>
              </View>
              <View className="mt-1.5 h-2.5 flex-row overflow-hidden rounded-full">
                {(() => {
                  const total =
                    bill.voteResult.yes + bill.voteResult.no + bill.voteResult.abstain;
                  return (
                    <>
                      <View
                        style={{
                          width: `${(bill.voteResult.yes / total) * 100}%`,
                          backgroundColor: '#16A34A',
                        }}
                      />
                      <View
                        style={{
                          width: `${(bill.voteResult.no / total) * 100}%`,
                          backgroundColor: '#EF4444',
                        }}
                      />
                      <View
                        style={{
                          width: `${(bill.voteResult.abstain / total) * 100}%`,
                          backgroundColor: '#D4D4D4',
                        }}
                      />
                    </>
                  );
                })()}
              </View>
            </View>
          )}
        </View>

        {/* Article Body */}
        <View className="mt-4 px-5">
          {bill.article.map((section, i) => (
            <Card key={i} className="mb-3">
              <Text className="text-base font-bold text-neutral-900">{section.heading}</Text>
              <Text className="mt-2 text-sm leading-6 text-neutral-600">{section.body}</Text>
            </Card>
          ))}
        </View>

        {/* Sources */}
        {bill.sources && bill.sources.length > 0 && (
          <View className="mt-2 px-5">
            <Text className="mb-2 text-base font-bold text-neutral-900">관련 자료</Text>
            {bill.sources
              .filter((s) => s.type === 'youtube')
              .map((source, i) => (
                <PressableCard
                  key={`yt-${i}`}
                  className="mb-2 flex-row items-center gap-2"
                  onPress={() => Linking.openURL(source.url)}
                >
                  <Text className="text-red-500">▶</Text>
                  <Text className="flex-1 text-sm text-primary" numberOfLines={2}>
                    {source.title}
                  </Text>
                </PressableCard>
              ))}
            {bill.sources
              .filter((s) => s.type !== 'youtube')
              .map((source, i) => (
                <PressableCard
                  key={`a-${i}`}
                  className="mb-2"
                  onPress={() => Linking.openURL(source.url)}
                >
                  <Text className="text-sm text-primary" numberOfLines={2}>
                    {source.title}
                  </Text>
                </PressableCard>
              ))}
          </View>
        )}
      </ScrollView>
    );
  }

  // highlights에서 찾기
  const highlight = weekly.highlights.find((h) => h.slug === decodedSlug);
  if (highlight && highlight.article) {
    const cat = HIGHLIGHT_CATEGORY[highlight.category] ?? {
      emoji: '📋',
      label: highlight.category,
    };
    return (
      <ScrollView
        className="flex-1 bg-neutral-50"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        {/* Header */}
        <View className="bg-white px-5 pb-5 pt-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg">{cat.emoji}</Text>
            <Badge label={cat.label} color="#E5E5E5" textColor="#595959" />
          </View>
          <Text className="mt-2 text-2xl font-bold text-neutral-900">{highlight.title}</Text>
          <Text className="mt-1 text-xs text-neutral-400">{weekly.period}</Text>
          <Text className="mt-3 text-sm leading-5 text-neutral-600">
            {highlight.description}
          </Text>
        </View>

        {/* Article Body */}
        <View className="mt-4 px-5">
          {highlight.article.map((section, i) => (
            <Card key={i} className="mb-3">
              <Text className="text-base font-bold text-neutral-900">{section.heading}</Text>
              <Text className="mt-2 text-sm leading-6 text-neutral-600">{section.body}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    );
  }

  return <EmptyState title="기사를 찾을 수 없습니다" />;
}
