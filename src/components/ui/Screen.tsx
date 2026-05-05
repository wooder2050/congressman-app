import { ScrollView, ScrollViewProps, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenProps = ScrollViewProps & {
  children: React.ReactNode;
  /** 콘텐츠 외곽 padding 적용 여부 (기본 true) */
  padded?: boolean;
  /** ScrollView 대신 단일 View로 렌더 */
  scrollable?: boolean;
  /** 하단 추가 padding (탭바, FAB 등 가릴 때) */
  bottomInsetExtra?: number;
};

/**
 * 화면 최상위 wrapper.
 * - safe area 자동 처리
 * - 페이지 background = neutral-50
 * - 하단 inset + 추가 padding 자동
 */
export function Screen({
  children,
  className,
  padded = false,
  scrollable = true,
  bottomInsetExtra = 16,
  contentContainerStyle,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const padding = padded ? 'px-lawmake-lg' : '';

  if (!scrollable) {
    return (
      <View className={`flex-1 bg-surface-secondary ${padding} ${className ?? ''}`}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      className={`flex-1 bg-surface-secondary ${className ?? ''}`}
      contentContainerStyle={[
        { paddingBottom: insets.bottom + bottomInsetExtra },
        contentContainerStyle,
      ]}
      {...props}
    >
      <View className={padding}>{children}</View>
    </ScrollView>
  );
}
