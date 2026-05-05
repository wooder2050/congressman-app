import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type HeaderProps = {
  /** 표시할 제목 */
  title?: string;
  /** "홈"같은 큰 타이틀 (largeTitle 스타일) */
  largeTitle?: string;
  /** 뒤로가기 버튼 표시 (default true) */
  showBack?: boolean;
  /** 우측 액션 (BookmarkButton 등) */
  rightAction?: React.ReactNode;
  /** 배경색 변경 (기본 surface-primary) */
  className?: string;
};

/**
 * 화면 상단 헤더.
 * - 좌측: 뒤로가기 (showBack=true일 때)
 * - 중앙: title (있을 때) — iOS 스타일은 보통 좌측 정렬
 * - 우측: rightAction
 *
 * largeTitle을 쓰면 헤더 줄 아래 큰 타이틀이 추가로 표시 (iOS Large Title 스타일).
 */
export function Header({
  title,
  largeTitle,
  showBack = true,
  rightAction,
  className,
}: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`bg-surface-primary ${className ?? ''}`}
      style={{ paddingTop: insets.top }}
    >
      {/* Top bar */}
      {(showBack || title || rightAction) && (
        <View className="flex-row items-center justify-between px-lawmake-sm" style={{ minHeight: 44 }}>
          <View className="flex-1 flex-row items-center">
            {showBack && (
              <Pressable
                onPress={() => router.back()}
                hitSlop={8}
                className="h-11 w-11 items-center justify-center"
              >
                <ChevronLeft size={26} color="#2563EB" />
              </Pressable>
            )}
          </View>
          {title && !largeTitle && (
            <Text
              className="text-lawmake-headline text-neutral-900"
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
          <View className="flex-1 flex-row items-center justify-end">
            {rightAction ?? null}
          </View>
        </View>
      )}

      {/* Large title (iOS HIG large title pattern) */}
      {largeTitle && (
        <View className="px-lawmake-lg pb-lawmake-md pt-lawmake-xs">
          <Text className="text-lawmake-large text-neutral-900">{largeTitle}</Text>
        </View>
      )}
    </View>
  );
}
