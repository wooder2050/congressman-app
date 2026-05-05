import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { PressableCard } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { BreakingNewsItem } from '@/api/breaking-news';

const BREAKING_CATEGORY_STYLE: Record<string, { label: string; color: string }> = {
  committee: { label: '국회', color: '#F59E0B' },
  election: { label: '선거', color: '#F43F5E' },
  legislation: { label: '입법', color: '#3B82F6' },
  politics: { label: '정치', color: '#8B5CF6' },
};

interface Props {
  items: BreakingNewsItem[];
}

/**
 * 홈 화면 속보 섹션 (정치/선거/입법/국회 카테고리).
 * v1.1까지 사용된 디자인 그대로 유지 (PR1 refactor: 디자인 변경 없음).
 */
export function BreakingNewsList({ items }: Props) {
  const router = useRouter();
  if (items.length === 0) return null;

  return (
    <View className="mt-4 px-5 gap-3">
      <SectionHeader title="속보" />
      {items.map((item) => {
        const cat = BREAKING_CATEGORY_STYLE[item.category] ?? BREAKING_CATEGORY_STYLE.politics;
        return (
          <PressableCard
            key={item.id}
            className="border-amber-200 bg-amber-50"
            onPress={() => item.linkUrl && router.push(item.linkUrl as never)}
          >
            <View className="flex-row items-center gap-2">
              <View className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <Badge label={cat.label} color={cat.color} textColor="#FFFFFF" />
              <Text className="ml-auto text-[10px] text-amber-600">{item.date}</Text>
            </View>
            <Text className="mt-1.5 text-sm font-bold text-amber-900">{item.title}</Text>
            <Text className="mt-1 text-xs leading-4 text-amber-800" numberOfLines={3}>
              {item.description}
            </Text>
            {item.items && item.items.length > 0 && (
              <View className="mt-2 gap-1.5">
                {item.items.slice(0, 3).map((detail) => (
                  <View key={detail.label} className="rounded-lg bg-white/70 px-3 py-1.5">
                    <Text className="text-[10px] font-semibold text-amber-700">
                      {detail.label}
                    </Text>
                    <Text className="text-[11px] text-amber-900/70">{detail.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </PressableCard>
        );
      })}
    </View>
  );
}
