import { useRouter } from 'expo-router';
import {
  Award,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronRight,
  GitCompare,
  Home,
  Info,
  type LucideIcon,
  Newspaper,
  Vote,
} from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MenuItem = {
  icon: LucideIcon;
  label: string;
  description: string;
  route: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    icon: Newspaper,
    label: '주간뉴스',
    description: '매주 국회 소식 한눈에',
    route: '/weekly',
  },
  {
    icon: Award,
    label: '의정활동 성적표',
    description: '의원 성적 랭킹 (S~D등급)',
    route: '/scorecard-ranking',
  },
  {
    icon: Home,
    label: '부동산 보유 현황',
    description: '다주택자·고가주택·과다보유',
    route: '/property',
  },
  {
    icon: Vote,
    label: '재보궐선거',
    description: '선거구·후보 정보',
    route: '/elections',
  },
  {
    icon: Building2,
    label: '위원회',
    description: '17개 상임위원회 현황',
    route: '/committees',
  },
  {
    icon: CalendarDays,
    label: '일정',
    description: '본회의, 위원회 일정',
    route: '/schedule',
  },
  {
    icon: GitCompare,
    label: '의원 비교',
    description: '최대 4명 의원 비교',
    route: '/compare',
  },
  {
    icon: BookOpen,
    label: '입법 가이드',
    description: '국회 입법 과정 안내',
    route: '/guide',
  },
  {
    icon: BookOpen,
    label: '용어 사전',
    description: '국회 용어 설명',
    route: '/glossary',
  },
  {
    icon: Info,
    label: '앱 정보',
    description: 'lawmake.kr',
    route: '/about',
  },
];

export default function MoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
    >
      <View className="mt-2">
        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.route}
            className="flex-row items-center gap-4 border-b border-neutral-100 bg-white px-5 py-4 active:bg-neutral-50"
            onPress={() => router.push(item.route as never)}
          >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
              <item.icon size={20} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-neutral-800">{item.label}</Text>
              <Text className="mt-0.5 text-xs text-neutral-400">{item.description}</Text>
            </View>
            <ChevronRight size={18} color="#d4d4d4" />
          </Pressable>
        ))}
      </View>

      <View className="mt-8 items-center">
        <Text className="text-xs text-neutral-300">lawmake v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
