import { useRouter } from 'expo-router';
import { Newspaper } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { PressableCard } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';

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
 */
export function LatestWeeklySection({ article }: Props) {
  const router = useRouter();
  if (!article) return null;

  return (
    <View className="mt-4 px-5">
      <SectionHeader title="주간뉴스" onMore={() => router.push('/weekly')} />
      <PressableCard
        className="mt-3"
        onPress={() => router.push(`/weekly/${article.id}`)}
      >
        <View className="flex-row items-center gap-2">
          <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary-light">
            <Newspaper size={16} color="#2563EB" />
          </View>
          <Badge label="최신" color="#2563EB" textColor="#FFFFFF" />
          <Text className="text-xs text-neutral-400">{article.period}</Text>
        </View>
        <Text className="mt-2 text-base font-bold text-neutral-900">{article.title}</Text>
        <Text className="mt-1 text-sm leading-5 text-neutral-600" numberOfLines={2}>
          {article.summary}
        </Text>
        {article.tags.length > 0 && (
          <View className="mt-2 flex-row flex-wrap gap-1.5">
            {article.tags.slice(0, 4).map((tag) => (
              <Text key={tag} className="text-xs text-primary">
                #{tag}
              </Text>
            ))}
          </View>
        )}
      </PressableCard>
    </View>
  );
}
