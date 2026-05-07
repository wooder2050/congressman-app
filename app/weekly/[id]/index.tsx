import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getWeeklyArticle } from '@/api/weekly';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { Card, PressableCard } from '@/components/ui/Card';
import { useLawmakeQuery } from '@/hooks/useLawmakeQuery';
import type { FeaturedBill, WeeklyHighlight } from '@/types';

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

function VoteResultBar({ yes, no, abstain }: { yes: number; no: number; abstain: number }) {
  const total = yes + no + abstain;
  if (total === 0) return null;

  return (
    <View className="mt-lawmake-sm">
      <View className="flex-row gap-lawmake-md">
        <Text className="text-lawmake-footnote text-neutral-500">
          찬성 <Text className="font-bold text-success">{yes}</Text>
        </Text>
        <Text className="text-lawmake-footnote text-neutral-500">
          반대 <Text className="font-bold text-error">{no}</Text>
        </Text>
        <Text className="text-lawmake-footnote text-neutral-500">
          기권 <Text className="font-bold text-neutral-400">{abstain}</Text>
        </Text>
      </View>
      <View className="mt-lawmake-xs h-2 flex-row overflow-hidden rounded-full">
        <View style={{ width: `${(yes / total) * 100}%`, backgroundColor: '#16A34A' }} />
        <View style={{ width: `${(no / total) * 100}%`, backgroundColor: '#EF4444' }} />
        <View style={{ width: `${(abstain / total) * 100}%`, backgroundColor: '#D4D4D4' }} />
      </View>
    </View>
  );
}

function FeaturedBillCard({
  bill,
  weeklyId,
}: {
  bill: FeaturedBill;
  weeklyId: string;
}) {
  const router = useRouter();
  const status = BILL_STATUS_COLORS[bill.status];
  const hasArticle = !!(bill.slug && bill.article);

  const onPress = hasArticle
    ? () => router.push(`/weekly/${weeklyId}/${encodeURIComponent(bill.slug!)}`)
    : undefined;

  const Wrapper = onPress ? PressableCard : Card;

  return (
    <Wrapper className="mb-lawmake-sm" onPress={onPress}>
      <View className="flex-row items-start justify-between">
        <Text className="flex-1 text-lawmake-callout font-bold text-neutral-900" numberOfLines={2}>
          {bill.title}
        </Text>
        <Badge label={status.label} color={status.color} textColor={status.textColor} className="ml-lawmake-sm" />
      </View>

      {bill.proposer && (
        <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">{bill.proposer}</Text>
      )}

      <Text className="mt-lawmake-sm text-lawmake-footnote leading-5 text-neutral-600">
        {bill.description}
      </Text>

      {bill.voteResult && (
        <VoteResultBar
          yes={bill.voteResult.yes}
          no={bill.voteResult.no}
          abstain={bill.voteResult.abstain}
        />
      )}

      {hasArticle && (
        <View className="mt-lawmake-sm">
          <Text className="text-lawmake-footnote font-semibold text-primary">자세히 읽기 →</Text>
        </View>
      )}

      {!hasArticle && bill.sources && bill.sources.length > 0 && (
        <View className="mt-lawmake-sm border-t border-neutral-100 pt-lawmake-sm">
          {bill.sources.filter((s) => s.type === 'youtube').length > 0 && (
            <View className="mb-lawmake-sm">
              <Text className="mb-lawmake-xs text-lawmake-caption font-semibold text-neutral-400">관련 영상</Text>
              {bill.sources
                .filter((s) => s.type === 'youtube')
                .map((source, i) => (
                  <PressableCard
                    key={i}
                    className="mb-1 flex-row items-center gap-lawmake-xs border-0 p-1.5"
                    style={{ elevation: 0 }}
                    onPress={() => Linking.openURL(source.url)}
                  >
                    <Text className="text-lawmake-caption text-error">▶</Text>
                    <Text className="flex-1 text-lawmake-caption text-primary" numberOfLines={1}>
                      {source.title}
                    </Text>
                  </PressableCard>
                ))}
            </View>
          )}
          {bill.sources.filter((s) => s.type !== 'youtube').length > 0 && (
            <View>
              <Text className="mb-lawmake-xs text-lawmake-caption font-semibold text-neutral-400">관련 기사</Text>
              {bill.sources
                .filter((s) => s.type !== 'youtube')
                .map((source, i) => (
                  <PressableCard
                    key={i}
                    className="mb-1 border-0 p-1.5"
                    style={{ elevation: 0 }}
                    onPress={() => Linking.openURL(source.url)}
                  >
                    <Text className="text-lawmake-caption text-primary" numberOfLines={1}>
                      {source.title}
                    </Text>
                  </PressableCard>
                ))}
            </View>
          )}
        </View>
      )}
    </Wrapper>
  );
}

function HighlightCard({
  highlight,
  weeklyId,
}: {
  highlight: WeeklyHighlight;
  weeklyId: string;
}) {
  const router = useRouter();
  const cat = HIGHLIGHT_CATEGORY[highlight.category] ?? { emoji: '📋', label: highlight.category };
  const hasArticle = !!(highlight.slug && highlight.article);

  const onPress = hasArticle
    ? () => router.push(`/weekly/${weeklyId}/${encodeURIComponent(highlight.slug!)}`)
    : undefined;

  const Wrapper = onPress ? PressableCard : Card;

  return (
    <Wrapper className="mb-lawmake-sm" onPress={onPress}>
      <View className="flex-row items-center gap-lawmake-sm">
        <Text className="text-lawmake-headline">{cat.emoji}</Text>
        <Text
          className="flex-1 text-lawmake-footnote font-bold text-neutral-900"
          numberOfLines={2}
        >
          {highlight.title}
        </Text>
        <Badge label={cat.label} color="#E5E5E5" textColor="#595959" />
      </View>
      <Text className="mt-lawmake-xs text-lawmake-footnote leading-5 text-neutral-600">
        {highlight.description}
      </Text>
      {hasArticle && (
        <View className="mt-lawmake-sm">
          <Text className="text-lawmake-caption font-semibold text-primary">자세히 읽기 →</Text>
        </View>
      )}
    </Wrapper>
  );
}

export default function WeeklyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: article, isLoading, error, refetch } = useLawmakeQuery(
    getWeeklyArticle,
    [id],
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!article) return <EmptyState title="주간뉴스를 찾을 수 없습니다" />;

  return (
    <ScrollView
      className="flex-1 bg-surface-secondary"
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
    >
      {/* Header */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-lg pt-lawmake-sm">
        <Text className="text-lawmake-large font-bold text-neutral-900">
          {article.title} 주간 국회 뉴스
        </Text>
        <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-400">{article.period}</Text>
        <Text className="mt-lawmake-sm text-lawmake-footnote leading-5 text-neutral-600">{article.summary}</Text>

        {article.tags.length > 0 && (
          <View className="mt-lawmake-sm flex-row flex-wrap gap-lawmake-xs">
            {article.tags.map((tag) => (
              <View
                key={tag}
                className="rounded-full bg-neutral-100 px-lawmake-sm py-0.5"
              >
                <Text className="text-lawmake-caption text-neutral-500">{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Stats */}
      {article.stats && (
        <View className="flex-row px-lawmake-md pt-lawmake-md">
          {article.stats.billsPassed != null && (
            <Card className="mx-1 flex-1 items-center">
              <Text className="text-lawmake-title1 font-bold text-success">
                {article.stats.billsPassed}건
              </Text>
              <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">법안 통과</Text>
            </Card>
          )}
          {article.stats.votesHeld != null && (
            <Card className="mx-1 flex-1 items-center">
              <Text className="text-lawmake-title1 font-bold text-primary">
                {article.stats.votesHeld}건
              </Text>
              <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">본회의 표결</Text>
            </Card>
          )}
          {article.stats.committeeMeetings != null && (
            <Card className="mx-1 flex-1 items-center">
              <Text className="text-lawmake-title1 font-bold text-neutral-900">
                {article.stats.committeeMeetings}건
              </Text>
              <Text className="mt-lawmake-xs text-lawmake-caption text-neutral-400">위원회 회의</Text>
            </Card>
          )}
        </View>
      )}

      {/* Featured Bills */}
      {article.featuredBills.length > 0 && (
        <View className="mt-lawmake-lg px-lawmake-lg">
          <Text className="mb-lawmake-sm text-lawmake-title2 font-bold text-neutral-900">주목할 만한 법안</Text>
          {article.featuredBills.map((bill, i) => (
            <FeaturedBillCard key={i} bill={bill} weeklyId={article.id} />
          ))}
        </View>
      )}

      {/* Highlights */}
      {article.highlights.length > 0 && (
        <View className="mt-lawmake-lg px-lawmake-lg">
          <Text className="mb-lawmake-sm text-lawmake-title2 font-bold text-neutral-900">이번 주 하이라이트</Text>
          {article.highlights.map((h, i) => (
            <HighlightCard key={i} highlight={h} weeklyId={article.id} />
          ))}
        </View>
      )}

      {/* Analysis */}
      {article.analysis && (
        <View className="mt-lawmake-lg px-lawmake-lg">
          <Text className="mb-lawmake-sm text-lawmake-title2 font-bold text-neutral-900">이번 주 분석</Text>
          <Card>
            <Text className="text-lawmake-footnote leading-5 text-neutral-700">{article.analysis}</Text>
            <Text className="mt-lawmake-sm text-lawmake-caption text-neutral-400">
              위 분석은 해당 주의 입법 동향을 객관적으로 정리한 내용입니다.
            </Text>
          </Card>
        </View>
      )}
    </ScrollView>
  );
}
