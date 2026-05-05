import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { PressableCard } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { StatusBadge, type StatusTone } from '@/components/ui/StatusBadge';
import type { BreakingNewsItem } from '@/api/breaking-news';

const CATEGORY_INFO: Record<
  string,
  { label: string; tone: StatusTone }
> = {
  committee: { label: '국회', tone: 'warning' },
  election: { label: '선거', tone: 'error' },
  legislation: { label: '입법', tone: 'info' },
  politics: { label: '정치', tone: 'primary' },
};

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
export function BreakingNewsList({ items }: Props) {
  const router = useRouter();
  if (items.length === 0) return null;

  return (
    <View className="mt-lawmake-xl px-lawmake-lg">
      <Section title="속보">
        <View className="gap-lawmake-md">
          {items.map((item) => {
            const cat = CATEGORY_INFO[item.category] ?? CATEGORY_INFO.politics;
            return (
              <PressableCard
                key={item.id}
                onPress={() => item.linkUrl && router.push(item.linkUrl as never)}
              >
                <View className="flex-row items-center gap-lawmake-sm">
                  <StatusBadge label={cat.label} tone={cat.tone} />
                  <Text className="ml-auto text-lawmake-caption text-neutral-400">
                    {item.date}
                  </Text>
                </View>
                <Text
                  className="mt-lawmake-sm text-lawmake-headline text-neutral-900"
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <Text
                  className="mt-lawmake-xs text-lawmake-body text-neutral-600"
                  numberOfLines={3}
                >
                  {item.description}
                </Text>
                {item.items && item.items.length > 0 && (
                  <View className="mt-lawmake-md gap-lawmake-sm">
                    {item.items.slice(0, 3).map((detail) => (
                      <View
                        key={detail.label}
                        className="flex-row gap-lawmake-sm"
                      >
                        <Text className="text-lawmake-footnote font-semibold text-neutral-500">
                          {detail.label}
                        </Text>
                        <Text
                          className="flex-1 text-lawmake-footnote text-neutral-700"
                          numberOfLines={2}
                        >
                          {detail.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </PressableCard>
            );
          })}
        </View>
      </Section>
    </View>
  );
}
