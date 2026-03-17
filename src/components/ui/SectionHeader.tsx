import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

type SectionHeaderProps = {
  title: string;
  onMore?: () => void;
  className?: string;
};

export function SectionHeader({ title, onMore, className }: SectionHeaderProps) {
  return (
    <View className={`flex-row items-center justify-between ${className ?? ''}`}>
      <Text className="text-base font-bold text-neutral-900">{title}</Text>
      {onMore && (
        <Pressable onPress={onMore} className="flex-row items-center" hitSlop={8}>
          <Text className="text-xs text-neutral-400">더보기</Text>
          <ChevronRight size={14} color="#a3a3a3" />
        </Pressable>
      )}
    </View>
  );
}
