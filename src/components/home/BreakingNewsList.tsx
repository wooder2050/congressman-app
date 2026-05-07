import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { BookmarkButton } from '@/components/BookmarkButton';
import { Section } from '@/components/ui/Section';
import { StatusBadge, type StatusTone } from '@/components/ui/StatusBadge';
import { tapLight } from '@/lib/haptics';
import type { BreakingNewsItem } from '@/api/breaking-news';

const CATEGORY_INFO: Record<
  string,
  { label: string; tone: StatusTone }
> = {
  committee: { label: '국회', tone: 'neutral' },
  election: { label: '선거', tone: 'neutral' },
  legislation: { label: '입법', tone: 'neutral' },
  politics: { label: '정치', tone: 'neutral' },
};

function formatBreakingDate(date: string): string {
  // "2026-05-07" → "5월 7일"
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return date;
  return `${parseInt(m[2], 10)}월 ${parseInt(m[3], 10)}일`;
}

interface Props {
  items: BreakingNewsItem[];
}

/**
 * 홈 화면 속보 섹션.
 *
 * 변경 (PR3):
 * - amber 배경/border/텍스트 과다 → 차분한 흰 카드
 * - 카테고리 색상은 StatusBadge로 위임 (semantic tone)
 * - 좌측 verticle 라이브 indicator로 "속보" 시각화 (절제된 강조)
 * - 타이포 토큰화 (headline, body, caption)
 */
const HOME_PREVIEW_COUNT = 2;

export function BreakingNewsList({ items }: Props) {
  const router = useRouter();
  if (items.length === 0) return null;

  const preview = items.slice(0, HOME_PREVIEW_COUNT);
  const hasMore = items.length > HOME_PREVIEW_COUNT;

  return (
    <View className="mt-lawmake-md bg-surface-primary px-lawmake-lg pt-lawmake-lg">
      <Section
        title="속보"
        onMore={hasMore ? () => router.push('/breaking-news' as never) : undefined}
        moreLabel="전체보기"
      >
        <View>
          {preview.map((item, i) => {
            const cat = CATEGORY_INFO[item.category] ?? CATEGORY_INFO.politics;
            const isLast = i === preview.length - 1;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  tapLight();
                  if (item.linkUrl) router.push(item.linkUrl as never);
                }}
                className={`py-lawmake-md active:bg-neutral-50 ${
                  isLast ? '' : 'border-b border-neutral-100'
                }`}
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
                  numberOfLines={1}
                >
                  {item.description}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>
    </View>
  );
}
