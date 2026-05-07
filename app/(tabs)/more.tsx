import { useRouter } from 'expo-router';
import {
  Award,
  BookMarked,
  BookOpen,
  Bookmark,
  Building2,
  CalendarDays,
  CheckSquare,
  ChevronRight,
  GitCompare,
  Home as HomeIcon,
  Info,
  LogIn,
  LogOut,
  MapPin,
  type LucideIcon,
  Newspaper,
  User,
} from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth-context';
import { tapLight } from '@/lib/haptics';

type MenuItem = {
  icon: LucideIcon;
  label: string;
  description: string;
  route: string;
};

const MENU_ITEMS: MenuItem[] = [
  { icon: Newspaper, label: '주간뉴스', description: '매주 국회 소식 한눈에', route: '/weekly' },
  { icon: Award, label: '의정활동 성적표', description: '의원 성적 랭킹 (S~D등급)', route: '/scorecard-ranking' },
  { icon: HomeIcon, label: '부동산 보유 현황', description: '다주택자·고가주택·과다보유', route: '/property' },
  { icon: CheckSquare, label: '재보궐선거', description: '선거구·후보 정보', route: '/elections' },
  { icon: Building2, label: '위원회', description: '17개 상임위원회 현황', route: '/committees' },
  { icon: CalendarDays, label: '일정', description: '본회의, 위원회 일정', route: '/schedule' },
  { icon: GitCompare, label: '의원 비교', description: '최대 4명 의원 비교', route: '/compare' },
  { icon: BookOpen, label: '입법 가이드', description: '국회 입법 과정 안내', route: '/guide' },
  { icon: BookMarked, label: '용어 사전', description: '국회 용어 설명', route: '/glossary' },
  { icon: Info, label: '앱 정보', description: 'lawmake.kr', route: '/about' },
];

export default function MoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, signOut } = useAuth();
  const userEmail = session?.user?.email ?? null;

  const handleSignOut = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 bg-surface-secondary"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
    >
      {/* Large Title */}
      <View className="bg-surface-primary px-lawmake-lg pb-lawmake-sm pt-lawmake-sm">
        <Text className="text-lawmake-large text-neutral-900">더보기</Text>
      </View>

      {/* 계정 영역 */}
      <View className="mt-lawmake-md border-y border-neutral-100 bg-surface-primary">
        {session ? (
          <View className="flex-row items-center gap-lawmake-md px-lawmake-lg py-lawmake-md">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-light">
              <User size={18} color="#2563EB" strokeWidth={1.75} />
            </View>
            <View className="flex-1">
              <Text className="text-lawmake-body font-semibold text-neutral-900" numberOfLines={1}>
                {userEmail ?? '로그인됨'}
              </Text>
              <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">
                Google 계정
              </Text>
            </View>
            <Pressable onPress={handleSignOut} hitSlop={8} className="p-2">
              <LogOut size={18} color="#9CA3AF" strokeWidth={1.75} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => {
              tapLight();
              router.push('/sign-in' as never);
            }}
            className="flex-row items-center gap-lawmake-md bg-primary px-lawmake-lg py-lawmake-md active:bg-primary-dark"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <LogIn size={20} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-lawmake-body font-semibold text-white">
                로그인
              </Text>
              <Text className="mt-lawmake-xs text-lawmake-footnote text-white/80">
                즐겨찾기 · 내 지역구 활동 보기
              </Text>
            </View>
            <ChevronRight size={18} color="#FFFFFF" strokeWidth={2} />
          </Pressable>
        )}
      </View>

      {/* 개인 메뉴 (로그인 시) */}
      {session && (
        <View className="mt-lawmake-md border-y border-neutral-100 bg-surface-primary">
          <MenuRow
            icon={Bookmark}
            label="즐겨찾기"
            description="의원 · 법안 즐겨찾기 모아보기"
            onPress={() => router.push('/bookmarks' as never)}
            withDivider
          />
          <MenuRow
            icon={MapPin}
            label="내 지역구"
            description="내 지역 의원의 의정활동"
            onPress={() => router.push('/my-district' as never)}
          />
        </View>
      )}

      {/* 일반 메뉴 */}
      <View className="mt-lawmake-md border-y border-neutral-100 bg-surface-primary">
        {MENU_ITEMS.map((item, i) => (
          <MenuRow
            key={item.route}
            icon={item.icon}
            label={item.label}
            description={item.description}
            onPress={() => router.push(item.route as never)}
            withDivider={i < MENU_ITEMS.length - 1}
          />
        ))}
      </View>

      <View className="mt-lawmake-xxxl items-center">
        <Text className="text-lawmake-caption text-neutral-400">lawmake v1.4.0</Text>
      </View>
    </ScrollView>
  );
}

function MenuRow({
  icon: Icon,
  label,
  description,
  onPress,
  withDivider,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  onPress: () => void;
  withDivider?: boolean;
}) {
  return (
    <Pressable
      onPress={() => {
        tapLight();
        onPress();
      }}
      className={`flex-row items-center gap-lawmake-md px-lawmake-lg py-lawmake-md active:bg-neutral-50 ${
        withDivider ? 'border-b border-neutral-100' : ''
      }`}
    >
      <View className="h-10 w-10 items-center justify-center rounded-lawmake-md bg-primary-light">
        <Icon size={20} color="#2563EB" strokeWidth={1.75} />
      </View>
      <View className="flex-1">
        <Text className="text-lawmake-body font-semibold text-neutral-900">{label}</Text>
        <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">{description}</Text>
      </View>
      <ChevronRight size={18} color="#A3A3A3" strokeWidth={1.75} />
    </Pressable>
  );
}
