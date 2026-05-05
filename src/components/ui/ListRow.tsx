import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

type ListRowProps = {
  /** 메인 텍스트 */
  title: string;
  /** 보조 텍스트 (한 줄, title 아래) */
  subtitle?: string;
  /** 좌측 아이콘/이미지 */
  leading?: React.ReactNode;
  /** 우측 표시 (chevron 외 다른 것 — Badge 등) */
  trailing?: React.ReactNode;
  /** chevron 표시 (기본 true) */
  showChevron?: boolean;
  /** 탭 핸들러. 없으면 정적 row. */
  onPress?: () => void;
  /** 첫/마지막 row 구분용 (group의 경우) */
  isFirst?: boolean;
  isLast?: boolean;
  className?: string;
};

/**
 * iOS 스타일 list row.
 * - 높이 최소 44pt (touch target)
 * - 좌측: leading icon (선택)
 * - 중앙: title + subtitle
 * - 우측: trailing 또는 chevron
 *
 * 그룹화된 list (Card 안에 여러 row)에서 isFirst/isLast로 첫/마지막 row 표시.
 */
export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  showChevron = true,
  onPress,
  className,
}: ListRowProps) {
  const Container = onPress ? Pressable : View;
  const props = onPress ? { onPress } : {};

  return (
    <Container
      {...props}
      className={`flex-row items-center gap-lawmake-md bg-surface-primary px-lawmake-lg active:bg-neutral-50 ${className ?? ''}`}
      style={{ minHeight: 56 }}
    >
      {leading && <View>{leading}</View>}
      <View className="flex-1 py-lawmake-md">
        <Text className="text-lawmake-body text-neutral-900" numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing}
      {!trailing && showChevron && onPress && <ChevronRight size={18} color="#A3A3A3" />}
    </Container>
  );
}
