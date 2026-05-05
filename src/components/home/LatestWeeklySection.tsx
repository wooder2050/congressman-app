import { useRouter } from 'expo-router';
import { Newspaper } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { PressableCard } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface WeeklyArticle {
  id: string;
  title: string;
  summary: string;
  period: string;
  tags: string[];
}

interface Props {
  article: WeeklyArticle | null | undefined;
}

/**
 * 홈 화면 주간뉴스 섹션 (최신 1건).
 *
 * 변경 (PR4):
 * - Section 컴포넌트 사용
 * - "최신" 표시는 StatusBadge primary tone
 * - 타이포 토큰화 (headline + body + caption)
 */
export function LatestWeeklySection({ article }: Props) {
  const router = useRouter();
  if (!article) return null;

  return (
    <View className="mt-lawmake-xl px-lawmake-lg">
      <Section title="주간뉴스" onMore={() => router.push('/weekly')}>
        <PressableCard onPress={() => router.push(`/weekly/${article.id}`)}>
          <View className="flex-row items-center gap-lawmake-sm">
            <View className="h-9 w-9 items-center justify-center rounded-lawmake-md bg-primary-light">
              <Newspaper size={16} color="#2563EB" />
            </View>
            <StatusBadge label="최신" tone="primary" />
            <Text className="ml-auto text-lawmake-caption text-neutral-500">
              {article.period}
            </Text>
          </View>
          <Text className="mt-lawmake-md text-lawmake-headline text-neutral-900">
            {article.title}
          </Text>
          <Text className="mt-lawmake-xs text-lawmake-body text-neutral-600" numberOfLines={2}>
            {article.summary}
          </Text>
          {article.tags.length > 0 && (
            <View className="mt-lawmake-md flex-row flex-wrap gap-lawmake-sm">
              {article.tags.slice(0, 4).map((tag) => (
                <Text key={tag} className="text-lawmake-footnote text-primary">
                  #{tag}
                </Text>
              ))}
            </View>
          )}
        </PressableCard>
      </Section>
    </View>
  );
}
