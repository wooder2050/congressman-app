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
        className="flex-1 bg-surface-secondary"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        {/* Header */}
        <View className="bg-surface-primary px-lawmake-lg pb-lawmake-lg pt-lawmake-sm">
          <Badge label={status.label} color={status.color} textColor={status.textColor} />
          <Text className="mt-lawmake-sm text-lawmake-large font-bold text-neutral-900">{bill.title}</Text>
          <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">{weekly.period}</Text>
          {bill.proposer && (
            <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-500">{bill.proposer}</Text>
          )}
          <Text className="mt-lawmake-sm text-lawmake-footnote leading-5 text-neutral-600">{bill.description}</Text>

          {bill.voteResult && (
            <View className="mt-lawmake-md">
              <View className="flex-row gap-lawmake-md">
                <Text className="text-lawmake-footnote text-neutral-500">
                  찬성 <Text className="font-bold text-success">{bill.voteResult.yes}</Text>
                </Text>
                <Text className="text-lawmake-footnote text-neutral-500">
                  반대 <Text className="font-bold text-error">{bill.voteResult.no}</Text>
                </Text>
                <Text className="text-lawmake-footnote text-neutral-500">
                  기권{' '}
                  <Text className="font-bold text-neutral-400">{bill.voteResult.abstain}</Text>
                </Text>
              </View>
              <View className="mt-lawmake-xs h-2.5 flex-row overflow-hidden rounded-full">
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
        <View className="mt-lawmake-md px-lawmake-lg">
          {bill.article.map((section, i) => (
            <Card key={i} className="mb-lawmake-sm">
              <Text className="text-lawmake-callout font-bold text-neutral-900">{section.heading}</Text>
              <Text className="mt-lawmake-sm text-lawmake-footnote leading-6 text-neutral-600">{section.body}</Text>
            </Card>
          ))}
        </View>

        {/* Sources */}
        {bill.sources && bill.sources.length > 0 && (
          <View className="mt-lawmake-sm px-lawmake-lg">
            <Text className="mb-lawmake-sm text-lawmake-callout font-bold text-neutral-900">관련 자료</Text>
            {bill.sources
              .filter((s) => s.type === 'youtube')
              .map((source, i) => (
                <PressableCard
                  key={`yt-${i}`}
                  className="mb-lawmake-sm flex-row items-center gap-lawmake-sm"
                  onPress={() => Linking.openURL(source.url)}
                >
                  <Text className="text-error">▶</Text>
                  <Text className="flex-1 text-lawmake-footnote text-primary" numberOfLines={2}>
                    {source.title}
                  </Text>
                </PressableCard>
              ))}
            {bill.sources
              .filter((s) => s.type !== 'youtube')
              .map((source, i) => (
                <PressableCard
                  key={`a-${i}`}
                  className="mb-lawmake-sm"
                  onPress={() => Linking.openURL(source.url)}
                >
                  <Text className="text-lawmake-footnote text-primary" numberOfLines={2}>
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
        className="flex-1 bg-surface-secondary"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        {/* Header */}
        <View className="bg-surface-primary px-lawmake-lg pb-lawmake-lg pt-lawmake-sm">
          <View className="flex-row items-center gap-lawmake-sm">
            <Text className="text-lawmake-headline">{cat.emoji}</Text>
            <Badge label={cat.label} color="#E5E5E5" textColor="#595959" />
          </View>
          <Text className="mt-lawmake-sm text-lawmake-large font-bold text-neutral-900">{highlight.title}</Text>
          <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">{weekly.period}</Text>
          <Text className="mt-lawmake-sm text-lawmake-footnote leading-5 text-neutral-600">
            {highlight.description}
          </Text>
        </View>

        {/* Article Body */}
        <View className="mt-lawmake-md px-lawmake-lg">
          {highlight.article.map((section, i) => (
            <Card key={i} className="mb-lawmake-sm">
              <Text className="text-lawmake-callout font-bold text-neutral-900">{section.heading}</Text>
              <Text className="mt-lawmake-sm text-lawmake-footnote leading-6 text-neutral-600">{section.body}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    );
  }

  return <EmptyState title="기사를 찾을 수 없습니다" />;
}
