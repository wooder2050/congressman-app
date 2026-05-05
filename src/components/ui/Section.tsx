import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

type SectionProps = {
  /** 섹션 타이틀 */
  title: string;
  /** 섹션 부제 (선택) */
  subtitle?: string;
  /** "더보기" 액션 (선택) */
  onMore?: () => void;
  moreLabel?: string;
  children?: React.ReactNode;
  className?: string;
};

/**
 * 화면 안의 섹션 컨테이너.
 * - 타이틀: title2 (19/24, bold)
 * - 부제: subhead (13/18, neutral-500)
 * - 본문 콘텐츠는 children으로
 */
export function Section({
  title,
  subtitle,
  onMore,
  moreLabel = '더보기',
  children,
  className,
}: SectionProps) {
  return (
    <View className={`gap-lawmake-md ${className ?? ''}`}>
      <View className="flex-row items-end justify-between">
        <View className="flex-1 pr-lawmake-sm">
          <Text className="text-lawmake-title2 text-neutral-900">{title}</Text>
          {subtitle && (
            <Text className="mt-lawmake-xs text-lawmake-subhead text-neutral-500">{subtitle}</Text>
          )}
        </View>
        {onMore && (
          <Pressable onPress={onMore} hitSlop={8} className="flex-row items-center">
            <Text className="text-lawmake-subhead text-neutral-500">{moreLabel}</Text>
            <ChevronRight size={16} color="#737373" />
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}
